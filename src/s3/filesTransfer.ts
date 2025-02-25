import fs from "fs";
import tmp, { FileResult } from "tmp";
import { env } from '../env';
import logger from "../logger";
import { stringify } from 'csv-stringify/sync';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: env.AWS_REGION });

export function uploadAsCSVFileToS3<T>(data: T[], fileName: string) {
    const putObjectCmd = new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(stringify(data, { header: true }), 'utf8'),
        ContentType: 'text/csv',
    });

    return s3.send(putObjectCmd);
}

export async function downloadFile(key: string): Promise<FileResult> {
    const command = new GetObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
    });
    const response = await s3.send(command);

    if (!response.Body) {
        throw new Error("No response body returned from S3");
    }

    const tmpFile = tmp.fileSync({ postfix: ".csv" });
    const buffer = await response.Body.transformToByteArray();
    fs.writeFileSync(tmpFile.name, buffer);
    logger.info(`Downloaded file saved to temporary path: ${tmpFile.name}`);
    return tmpFile;
}
