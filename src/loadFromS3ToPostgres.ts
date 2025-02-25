import fs from "fs";
import path from "path";
import { Client } from "pg";
import logger from "./logger";
import { env } from "./env";
import { downloadFile } from "./s3/filesTransfer";
import { TRANSFORMED_ARTISTS_FILE_NAME, TRANSFORMED_TRACKS_FILE_NAME } from "./types";
import { spawnSync } from "child_process";

const DELETE_VIEWS_AND_TABLES_FILE_PATH = path.join(__dirname, "sql", "delete_views_and_tables.sql");
const CREATE_STAGING_TABLES_FILE_PATH = path.join(__dirname, "sql", "create_staging_tables.sql");
const CREATE_LINKING_TABLE_FILE_PATH = path.join(__dirname, "sql", "create_linking_table.sql");

const ARTISTS_AND_TRACKS_WITH_FOLLOWERS_VIEW_PATH = path.join(__dirname, "sql", "views", "artists_and_tracks_with_followers.sql");
const MOST_ENERGIZED_OF_THE_YEAR_VIEW_PATH = path.join(__dirname, "sql", "views", "most_energized_of_the_year.sql");
const TRACK_INFO_AND_FOLLOWERS_VIEW_PATH = path.join(__dirname, "sql", "views", "track_info_and_sum_of_followers.sql");

function runPsqlCmd(cmd: string): void {
    const result = spawnSync("psql", ["-d", env.PG_CONNECTION_URL, "-c", cmd]);

    if (result.error) {
        logger.error(`Error executing cmd: ${cmd}`, result.error);
        throw result.error;
    } else {
        logger.info(`psql cmd executed successfully: ${cmd}`);
    }
}

async function main() {
    const pgClient = new Client({
        connectionString: env.PG_CONNECTION_URL,
    });

    let tracksTempFile;
    let artistsTempFile;

    try {
        logger.info("Downloading data from S3...");
        tracksTempFile = await downloadFile(TRANSFORMED_TRACKS_FILE_NAME);
        artistsTempFile = await downloadFile(TRANSFORMED_ARTISTS_FILE_NAME);

        await pgClient.connect();

        const deleteViewsAndTables = fs.readFileSync(DELETE_VIEWS_AND_TABLES_FILE_PATH).toString();
        await pgClient.query(deleteViewsAndTables);

        const createStagingTables = fs.readFileSync(CREATE_STAGING_TABLES_FILE_PATH).toString();
        await pgClient.query(createStagingTables);

        const createLinkingTable = fs.readFileSync(CREATE_LINKING_TABLE_FILE_PATH).toString();
        await pgClient.query(createLinkingTable);

        logger.info("Loading data to SQL...");
        runPsqlCmd(`\\copy staging_tracks FROM '${tracksTempFile.name}' WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8');`);
        runPsqlCmd(`\\copy staging_artists FROM '${artistsTempFile.name}' WITH (FORMAT csv, HEADER true, DELIMITER ',', ENCODING 'UTF8');`);

        const viewFiles = [
            ARTISTS_AND_TRACKS_WITH_FOLLOWERS_VIEW_PATH,
            MOST_ENERGIZED_OF_THE_YEAR_VIEW_PATH,
            TRACK_INFO_AND_FOLLOWERS_VIEW_PATH
        ];

        await Promise.all(
            viewFiles.map(async (file) => {
                const viewQuery = fs
                    .readFileSync(file)
                    .toString();

                logger.info("Creating SQL view...");

                await pgClient.query(viewQuery);
            })
        );

        logger.info("Data loaded into PostgreSQL successfully!");
    } catch (err) {
        logger.error("Error in loading data:", err);
    } finally {
        logger.debug("Closing postgres connection...");
        await pgClient.end();
        if (tracksTempFile) {
            logger.debug("Cleaning up temporary files...");
            tracksTempFile.removeCallback();
        }
        if (artistsTempFile) {
            logger.debug("Cleaning up temporary files...");
            artistsTempFile.removeCallback();
        }
    }
}

main();
