import fs from "fs";
import tmp from "tmp";
import logger from "./logger";

import { Client } from "pg";
import { Readable } from "stream";
import { spawnSync } from 'child_process';
import { GetObjectCommand, GetObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";


function runPsqlCopy(copyCommand: string) {
    const result = spawnSync('psql', [
        '-h', 'localhost',
        '-p', '5432',
        '-U', 'postgres',
        '-d', 'my_test_db_spotify',
        '-c', copyCommand
    ], {
        env: { ...process.env, PGPASSWORD: 'qqqqqqqq' },
        stdio: 'inherit'
    });

    if (result.error) {
        logger.error("Error executing psql:", result.error);
    } else {
        logger.log("psql copy command executed.");
    }
}

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET_NAME = 'my-spotify-transformed-data-bucket';

const pgClient = new Client({
    host: 'localhost',
    port: 5432,
    database: 'my_test_db_spotify',
    user: 'postgres',
    password: 'qqqqqqqq',
});

const createTables = `
    CREATE TABLE staging_artists (
        artist_id VARCHAR(255) PRIMARY KEY,
        followers NUMERIC,
        genres VARCHAR(1000) NOT NULL,
        name VARCHAR(255) NOT NULL,
        popularity NUMERIC NOT NULL
    );

    CREATE TABLE staging_tracks (
        id                 VARCHAR(255) PRIMARY KEY,
        name               VARCHAR(1000) NOT NULL,
        popularity         NUMERIC NOT NULL,
        duration_ms        NUMERIC NOT NULL,
        explicit           NUMERIC NOT NULL,
        artists            VARCHAR(2000) NOT NULL,
        id_artists         VARCHAR(2000) NOT NULL,
        danceability       VARCHAR(255) NOT NULL,
        energy             NUMERIC NOT NULL,
        key                NUMERIC NOT NULL,
        loudness           NUMERIC NOT NULL,
        mode               NUMERIC NOT NULL,
        speechiness        NUMERIC NOT NULL,
        acousticness       NUMERIC NOT NULL,
        instrumentalness   NUMERIC NOT NULL,
        liveness           NUMERIC NOT NULL,
        valence            NUMERIC NOT NULL,
        tempo              NUMERIC NOT NULL,
        time_signature     NUMERIC NOT NULL,
        release_year       NUMERIC NOT NULL,
        release_month      NUMERIC,
        release_day        NUMERIC
    );
`;

const createMaterializedViews = `
    CREATE materialized VIEW track_artists AS
    SELECT
        t.id as track_id,
        json_array_elements_text(replace(t.id_artists, '''', '"')::json) AS artist_id
    FROM staging_tracks t
    WHERE t.id IS NOT NULL 
    AND t.id_artists IS NOT NULL;


    create materialized view artists_and_tracks_names_with_non_zero_followers as
    select 
        staging_artists.artist_id,
        staging_artists.name as artist_name, 
        staging_tracks.id as track_id,
        staging_tracks.name as track_name
    from
        staging_artists
    inner join track_artists
    on
        staging_artists.artist_id = track_artists.artist_id
    inner join staging_tracks 
    on
        staging_tracks.id = track_artists.track_id
    where
        not staging_artists.popularity = 0;


    create materialized view most_energized_of_the_year as
    select
        release_year,
        id,
        name,
        energy
    from
        (
        select
            release_year,
            id,
            name,
            energy,
            rank() over (
                partition by release_year
        order by
                energy desc 
            ) as rank_number
        from
            staging_tracks
    ) ranked
    where
        rank_number = 1;

    create materialized view track_info_and_sum_of_followers as
    select 
        staging_tracks.id as track_id,
        staging_tracks.name,
        staging_tracks.popularity,
        staging_tracks.energy,
        staging_tracks.danceability,
        SUM(staging_artists.followers) as artists_followers_sum
    from
        (
            staging_tracks
    join
            track_artists
        on
            staging_tracks.id = track_artists.track_id
    join 
            staging_artists
        on
            staging_artists.artist_id = track_artists.artist_id
    ) group by staging_tracks.id;
`

const deleteViewsAndTables = `
    DROP MATERIALIZED VIEW IF EXISTS artists_and_tracks_names_with_non_zero_followers;
    DROP MATERIALIZED VIEW IF EXISTS most_energized_of_the_year;
    DROP MATERIALIZED VIEW IF EXISTS track_info_and_sum_of_followers;
    DROP MATERIALIZED VIEW IF EXISTS track_artists;
    DROP TABLE IF EXISTS staging_tracks;
    DROP TABLE IF EXISTS staging_artists;
`;

export const asStream = (response: GetObjectCommandOutput) => {
    return response.Body as Readable;
};

async function downloadFile(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    const response = await s3.send(command);

    if (!response.Body) {
        throw new Error("No response body returned from S3");
    }

    const stream = asStream(response);

    const chunks: Buffer[] = [];
    return new Promise<string>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            // Create a temporary file synchronously
            const tmpFile = tmp.fileSync({ postfix: ".csv" });
            fs.writeFileSync(tmpFile.name, buffer);
            resolve(tmpFile.name);
        });
    });
}

const queryAsync = (query: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        pgClient.query(query, (err) => {
            if (err) {
                logger.error(`Error executing query: ${query}`, err);
                reject(err);
            } else {
                logger.log(`Query executed successfully: ${query}`);
                resolve();
            }
        });
    });
};

async function main() {
    try {
        const tracksFilePath = await downloadFile("transformedTracks.csv");
        const artistsFilePath = await downloadFile("transformedArtists.csv");

        await pgClient.connect();

        await queryAsync(deleteViewsAndTables);
        await queryAsync(createTables);

        runPsqlCopy(`\\copy staging_tracks FROM '${tracksFilePath}' WITH(FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8'); `);
        runPsqlCopy(`\\copy staging_artists FROM '${artistsFilePath}' WITH(FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8'); `);

        await queryAsync(createMaterializedViews);

        logger.log('Data loaded into PostgreSQL!');
    } catch (err) {
        logger.error(err);
    } finally {
        await pgClient.end();
    }
}

main();
