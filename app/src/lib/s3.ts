import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT || 'http://storage:9000'; 
const region = process.env.S3_REGION || 'auto';
const accessKeyId = process.env.S3_ACCESS_KEY!;
const secretAccessKey = process.env.S3_SECRET_KEY!;

const s3Client = new S3Client({
endpoint: endpoint,
  region: region, 
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true,
});

export { s3Client };