# Spotify Data Transformation and Analysis

Ingestion, transformation, and analysis of Spotify sample datasets from Kaggle. Using a Node.js script to clean up and organise these datasets and SQL for data analysis.

## Configuration

This project uses a `.env` file for configuration. Copy the provided [.env.sample](.env.sample) file to `.env` and update the required values.

### Required Configuration

- **Kaggle credentials:** Set your Kaggle API credentials.
- **S3 bucket name:** Provide the name of your S3 bucket.
- **AWS region:** Specify AWS region.
- **PostgreSQL:** Connection URI.

## Prerequisites

Before running the project, ensure you have the following installed and configured:

- **PostgreSQL & psql:** Installed locally.
- **AWS credentials:** Configured on your local machine.

## How to Run

### Transform and Load Data to S3

Run the following command to transform your data and load it to S3:

    npx ts-node src/transformAndLoadToS3.ts

### Load Data from S3 to PostgreSQL

After data is in S3, load it into your PostgreSQL database by running:

    npx ts-node src/loadFromS3ToPostgres.ts

## Running Tests

To run the tests for this project, execute:

    npm test
