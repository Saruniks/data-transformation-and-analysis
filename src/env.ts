import * as dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['AWS_REGION', 'S3_BUCKET_NAME', 'KAGGLE_USERNAME', 'KAGGLE_KEY'] as const;

requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

export const env = {
    AWS_REGION: process.env.AWS_REGION as string,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME as string,
    KAGGLE_USERNAME: process.env.KAGGLE_USERNAME as string,
    KAGGLE_KEY: process.env.KAGGLE_KEY as string,
};
