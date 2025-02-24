import fs from 'fs';
import logger from './logger';
import { parse } from 'csv-parse/sync';

function parseCSVFile(filePath: string) {
    const file = fs.readFileSync(filePath, 'utf8');
    logger.debug('Path:', filePath, 'Length:', file.length);

    return parse(file, {
        trim: false,
        skip_empty_lines: false,
        columns: true
    });
}

export { parseCSVFile };