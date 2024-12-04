import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'node:crypto';
async function uploadFileToS3(buffer, fileName, mimeType, adapter) {
  const bucketName = adapter?.bucketName;
  let client;
  if (adapter?.fileAdapter === 'digitalocean') {
    client = new S3Client({
      endpoint: adapter?.endpoint,
      region: adapter?.region,
      credentials: { accessKeyId: adapter?.accessKeyId, secretAccessKey: adapter?.secretAccessKey },
    });
  } else {
    client = new S3Client({
      region: adapter?.region,
      credentials: { accessKeyId: adapter?.accessKeyId, secretAccessKey: adapter?.secretAccessKey },
      signatureVersion: "v4" 
    });
  }
  const prefixId = crypto.randomBytes(16).toString('hex');
  const fileKey = `${prefixId}_${fileName}`;
  const uploadParams = { Bucket: bucketName, Key: fileKey, Body: buffer, ContentType: mimeType };

  try {
    // Upload the buffer to the Space
    const command = new PutObjectCommand(uploadParams);
    await client.send(command);
    const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: fileKey });

    // Generate a presigned URL for the uploaded file
    const presignedUrl = await getSignedUrl(client, getCommand, { expiresIn: 900 }); // URL expiration time in seconds (e.g., 15 min)
    return presignedUrl;
  } catch (error) {
    console.error('Error uploading file to aws:', error?.message);
    throw error;
  }
}

export default uploadFileToS3;
