import { env } from './env';

import { S3Client } from "@aws-sdk/client-s3";
import { stringify } from 'csv-stringify/sync';
import { PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: env.AWS_REGION });
const BUCKET_NAME = env.S3_BUCKET_NAME;

function uploadAsCSVFileToS3<T>(data: T[], fileName: string) {
    const putObjectCmd = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(stringify(data, { header: true }), 'utf8'),
        ContentType: 'text/csv',
    });

    s3.send(putObjectCmd);
}

export { uploadAsCSVFileToS3 };