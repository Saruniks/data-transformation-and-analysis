import logger from './logger';
import { parse } from 'csv-parse/sync';

export async function parseCSVBuffer(buffer: Buffer) {
  logger.info('Parsing CSV buffer, length:', buffer.length);
  return parse(buffer, {
    trim: false,
    skip_empty_lines: false,
    columns: true
  });
}
