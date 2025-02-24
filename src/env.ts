import * as dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['AWS_REGION', 'S3_BUCKET_NAME'] as const;

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

export const env = {
    AWS_REGION: process.env.AWS_REGION as string,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME as string,
};