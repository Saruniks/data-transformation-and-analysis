import { Readable } from 'stream';
import { parse } from 'csv-parse';
import logger from './logger';

async function parseCSVBuffer(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    // Configure CSV parser options
    const parser = parse({
      columns: true,
      trim: false,
      skip_empty_lines: false
    });

    // Gather records as they are parsed
    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', (err) => {
      logger.error('Error parsing CSV buffer:', err);
      reject(err);
    });

    parser.on('end', () => {
      logger.info('Parsed CSV buffer, total records:', records.length);
      resolve(records);
    });

    // Create a stream from the buffer and pipe it to the CSV parser
    Readable.from(buffer.toString('utf8')).pipe(parser);
  });
}

export { parseCSVBuffer };
