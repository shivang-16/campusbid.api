import { S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

const S3 = new S3Client({
  region: process.env.CAMPUSBID_AWS_REGION,
  credentials: {
    accessKeyId: process.env.CAMPUSBID_AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.CAMPUSBID_AWS_SECRET_KEY || '',
  },
});

export default S3;
