import logger from '../logger';
import { parse } from 'csv-parse/sync';

export async function parseCSVBuffer(buffer: Buffer) {
  const sizeInMB = (buffer.length / (1024 * 1024)).toFixed(2);
  logger.info(`Parsing CSV content, size: ${sizeInMB}MB`);
  return parse(buffer, {
    trim: true,
    skip_empty_lines: false,
    columns: true
  });
}
