import axios from 'axios';
import AdmZip from 'adm-zip';

import logger from './logger';
import { env } from './env';

export async function downloadAndExtractDataset(dataset: string): Promise<Record<string, Buffer>> {
    const url = `https://www.kaggle.com/api/v1/datasets/download/${dataset}`;
    const auth = Buffer.from(`${env.KAGGLE_USERNAME}:${env.KAGGLE_KEY}`).toString('base64');

    logger.info('Starting download...');
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: { Authorization: `Basic ${auth}` },
    });

    logger.info('Download completed. Extracting...');

    const zip = new AdmZip(response.data);
    const entries = zip.getEntries();

    const files: Record<string, Buffer> = {};
    for (const entry of entries) {
        if (!entry.isDirectory) {
            files[entry.entryName] = entry.getData();
        }
    }

    logger.info('Dataset extracted in memory');
    return files;
}
