import logger from './logger';
import { parseCSVBuffer } from './parseCSVBuffer';
import { uploadAsCSVFileToS3 } from './uploadToS3';
import { downloadAndExtractDataset } from './downloadFromKaggle';
import { filterArtists, filterTracks, transformTracks } from './transform';

async function main() {
    try {
        const files = await downloadAndExtractDataset('yamaerenay/spotify-dataset-19212020-600k-tracks');

        if (!files['artists.csv'] || !files['tracks.csv']) {
            throw new Error("Required CSV files (artists.csv and tracks.csv) not found in the dataset.");
        }

        // Parse the CSV buffers concurrently
        const [artists, tracks] = await Promise.all([
            parseCSVBuffer(files['artists.csv']),
            parseCSVBuffer(files['tracks.csv'])
        ]);

        logger.trace('Example artists row:', artists[0]);
        logger.trace('Example tracks row:', tracks[0]);

        logger.info('Transforming data...');
        const filteredTracks = filterTracks(tracks);
        const filteredArtists = filterArtists(artists, filteredTracks);
        const transformedFilteredTracks = transformTracks(filteredTracks);

        logger.info('Uploading data to S3...');
        await Promise.all([
            uploadAsCSVFileToS3(transformedFilteredTracks, 'transformedTracks.csv'),
            uploadAsCSVFileToS3(filteredArtists, 'transformedArtists.csv')
        ]);

        logger.info('Data uploaded to S3 successfully!');
    } catch (err) {
        logger.error(err);
    }
}

main();
