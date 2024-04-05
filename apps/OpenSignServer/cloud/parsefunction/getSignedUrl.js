import AWS from 'aws-sdk';
const credentials = {
  accessKeyId: process.env.DO_ACCESS_KEY_ID,
  secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
};
AWS.config.update({ credentials: credentials, region: process.env.DO_REGION });
const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT);

const s3 = new AWS.S3({ endpoint: spacesEndpoint });

export default function getPresignedUrl(url) {
  // Create a new URL object
  const parsedUrl = new URL(url);
  // Get the pathname of the URL
  const pathname = parsedUrl.pathname;
  // Extract the filename from the pathname
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1);

  // presignedGETURL return presignedUrl with expires time
  const presignedGETURL = s3.getSignedUrl('getObject', {
    Bucket: process.env.DO_SPACE,
    Key: filename, //filename
    Expires: 160, //time to expire in seconds
  });
  return presignedGETURL;
}
