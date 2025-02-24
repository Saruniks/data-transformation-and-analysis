import fs from 'fs';
import axios from 'axios';
import AdmZip from 'adm-zip';
import tmp, { DirResult } from 'tmp';

import logger from './logger';
import { env } from './env';

async function downloadDataset(dataset: string) {
    const url = `https://www.kaggle.com/api/v1/datasets/download/${dataset}`;
    const auth = Buffer.from(`${env.KAGGLE_USERNAME}:${env.KAGGLE_KEY}`).toString('base64');

    logger.info('Starting download...');
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Basic ${auth}` },
    });

    const tmpFile = tmp.fileSync({ keep: false });
    fs.writeFileSync(tmpFile.name, response.data);
    logger.info('Dataset downloaded successfully.');
    return tmpFile;
}

function extractCSVFiles(tmpFile: tmp.FileResult): DirResult {
    logger.info('Extracting CSV files...');
    const tmpDir = tmp.dirSync({ unsafeCleanup: true });
    const zip = new AdmZip(tmpFile.name);
    zip.extractAllTo(tmpDir.name, true);

    return tmpDir;
}

export async function downloadSpotifyDataset(): Promise<DirResult> {
    const dataset = await downloadDataset('yamaerenay/spotify-dataset-19212020-600k-tracks');
    return await extractCSVFiles(dataset);
}
