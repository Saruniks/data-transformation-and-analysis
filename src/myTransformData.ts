import fs from 'fs';
import path from 'path';
import log4js from 'log4js';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const tracksFilePath = path.resolve(__dirname, '../data/tracks.csv');
const artistsFilePath = path.resolve(__dirname, '../data/artists.csv');

log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: 'debug' } },
});

const logger = log4js.getLogger();

function parseCSVFile(filePath: string) {
    const file = fs.readFileSync(filePath, 'utf8');
    logger.debug('Path: ', filePath, '.Length: ', file.length);

    return parse(file, {
        trim: false,
        skip_empty_lines: false,
        columns: true
    });
}

interface Track {
    name: string;
    // [key: string]: unknown;
}


function main() {
    try {
        const artists = parseCSVFile(artistsFilePath);
        logger.debug('Example artists row:', artists[0]);

        const tracks: Track[] = parseCSVFile(tracksFilePath);
        logger.debug('Example tracks row:', tracks[0]);


        // Simplicity over memory usage and performance
        const filteredTracks = tracks.filter((t) => {
            if (!t.name) return false;
            return true;
        });

        const tracksCopy = path.resolve(__dirname, '../data/tracksCopy.csv');
        const artistsCopy = path.resolve(__dirname, '../data/artistsCopy.csv');
        fs.writeFileSync(tracksCopy, stringify(filteredTracks, { header: true }));
        fs.writeFileSync(artistsCopy, stringify(artists, { header: true }));
    } catch (err) {
        logger.error(err);
    }
}

main();

// test nr 1: test if has no name for example
// test nr 2: proper duration filtering
