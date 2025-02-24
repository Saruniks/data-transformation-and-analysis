import logger from './logger';
import { parseCSVFile } from './parseCSVFile';
import { uploadAsCSVFileToS3 } from './uploadToS3';
import { downloadSpotifyDataset } from './downloadFromKaggle';
import { filterArtists, filterTracks, transformTracks } from './transform';

async function main() {
    let tmpFiles;
    try {
        tmpFiles = await downloadSpotifyDataset();
        
        const [artists, tracks] = await Promise.all([
            parseCSVFile(`${tmpFiles.name}/artists.csv`),
            parseCSVFile(`${tmpFiles.name}/tracks.csv`)
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

        logger.info('Data uploaded to S3 successfully');
    } catch (err) {
        logger.error(err);
    } finally {
        tmpFiles?.removeCallback();
    }
}

main();
