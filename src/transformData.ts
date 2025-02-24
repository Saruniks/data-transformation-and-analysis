import path from 'path';
import logger from './logger';
import { Artist, Track } from './types';
import { parseCSVFile } from './parseCSVFile';
import { uploadAsCSVFileToS3 } from './uploadToS3';

const tracksFilePath = path.resolve(__dirname, '../data/tracks.csv');
const artistsFilePath = path.resolve(__dirname, '../data/artists.csv');

function filterTracks(tracks: Track[]): Track[] {
    return tracks.filter((t) => {
        if (!t.name) return false;
        if (t.duration_ms < 60000) return false;
        return true;
    });
}

function transformTracks(tracks: Track[]) /* TODO: use type */ {
    return tracks.map((t) => {
        logger.trace('Release date:', t.release_date);

        const { release_date, ...rest } = t;
        const dateParts = t.release_date.split('-');
        const release_year = parseInt(dateParts[0], 10);
        const release_month = dateParts[1] ? parseInt(dateParts[1], 10) : null;
        const release_day = dateParts[2] ? parseInt(dateParts[2], 10) : null;

        logger.trace('Parsed date:', release_year, release_month, release_day);

        logger.trace('Danceability:', t.danceability);

        let danceability: string;
        if (t.danceability < 0.5) {
            danceability = 'Low';
        } else if (t.danceability <= 0.6) {
            danceability = 'Medium';
        } else if (t.danceability <= 1) {
            danceability = 'High';
        } else {
            throw new Error('Danceability is out of range');
        }

        logger.trace('Danceability:', danceability);

        return {
            ...rest,
            release_year,
            release_month,
            release_day,
            danceability,
        };
    })
}

function filterArtists(artists: Artist[], tracks: Track[]): Artist[] {
    const artistsSet = new Set();
    tracks.forEach((t) => {
        logger.trace('id_artists:', t.id_artists);
        const artistsIds = JSON.parse(t.id_artists.replace(/'/g, '"'));
        logger.trace('Parsed id_artists:', artistsIds);

        artistsIds.forEach((id: string) => {
            logger.trace('id: ', id);
            artistsSet.add(id);
        });
    });
    return artists.filter((a) => artistsSet.has(a.id));
}

function main() {
    try {
        const artists: Artist[] = parseCSVFile(artistsFilePath);
        logger.trace('Example artists row:', artists[0]);

        const tracks: Track[] = parseCSVFile(tracksFilePath);
        logger.trace('Example tracks row:', tracks[0]);

        const filteredTracks = filterTracks(tracks);

        const filteredArtists = filterArtists(artists, filteredTracks);

        const transformedFilteredTracks = transformTracks(filteredTracks);

        uploadAsCSVFileToS3(transformedFilteredTracks, 'transformedTracks.csv');
        uploadAsCSVFileToS3(filteredArtists, 'transformedArtists.csv');
    } catch (err) {
        logger.error(err);
    }
}

main();

// test nr 1: test if has no name for example
// test nr 2: proper duration filtering
// test nr 3: are array of artists_id parsed correctly
// test nr 4: proper artist id filtering? So many filtered out...
// test nr 5: if date was parsed correctly, date + 0, month + 1?
// test nr 6: check danceability on interval ends