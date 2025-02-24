import fs from 'fs/promises';
import logger from './logger';
import { parse } from 'csv-parse/sync';

async function parseCSVFile(filePath: string) {
    const file = await fs.readFile(filePath, 'utf8');
    logger.info('Parsing file:', filePath, 'File length:', file.length);

    return parse(file, {
        trim: false,
        skip_empty_lines: false,
        columns: true
    });
}

export { parseCSVFile };
