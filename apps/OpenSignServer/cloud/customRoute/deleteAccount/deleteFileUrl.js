import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs/promises';
import pLimit from 'p-limit';
import { serverAppId } from '../../../Utils.js';

// === Configuration ===
const serverHost = new URL(process.env.SERVER_URL).hostname;
const LOCAL_HOSTS = ['localhost', '127.0.0.1', serverHost];
const CONCURRENCY_LIMIT = 5;

// === S3 Client Setup ===
function createS3Client({ region, accessKeyId, secretAccessKey, endpoint = null }) {
  const config = {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };

  // Only set custom endpoint if not using AWS
  if (endpoint && !endpoint.includes('amazonaws.com')) {
    config.endpoint = `https://${endpoint}`;
  }

  return new S3Client(config);
}

const s3 = createS3Client({
  region: process.env.DO_REGION,
  endpoint: process.env.DO_ENDPOINT,
  accessKeyId: process.env.DO_ACCESS_KEY_ID,
  secretAccessKey: process.env.DO_SECRET_ACCESS_KEY,
});

// === Helpers ===
function getS3ParamsFromUrl(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const Bucket = url.hostname.split('.')[0];
    const Key = decodeURIComponent(url.pathname.slice(1));
    return { Bucket, Key };
  } catch {
    return null;
  }
}

async function deleteS3File(fileUrl) {
  const params = getS3ParamsFromUrl(fileUrl);
  if (!params) return;

  try {
    await s3.send(new DeleteObjectCommand(params));
    // console.log(`✅ Deleted from S3: ${params.Key}`);
  } catch (err) {
    console.error(`❌ S3 delete failed: ${params.Key}:`, err.message);
  }
}

async function deleteLocalFile(fileUrl) {
  try {
    const url = new URL(fileUrl);
    const filePath = decodeURIComponent(url.pathname);
    if (!filePath.includes('files')) return;

    const localPath = url?.pathname?.split(`/files/${serverAppId}/`)?.pop();

    if (localPath) {
      await fs.unlink(`./files/files/${localPath}`);
    }
    // console.log(`🗑️ Deleted local file: ${localPath}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn('⚠️ Local file not found:', fileUrl);
    } else {
      console.error('❌ Local delete failed:', err.message);
    }
  }
}

async function deleteFileByUrl(fileUrl) {
  if (!fileUrl) return;
  try {
    const url = new URL(fileUrl);
    if (LOCAL_HOSTS.includes(url.hostname)) {
      return deleteLocalFile(fileUrl);
    } else {
      return deleteS3File(fileUrl);
    }
  } catch {
    console.warn('⚠️ Invalid URL, skipping:', fileUrl);
  }
}

// === Main Batch Deletion Function ===
export async function deleteInBatches(className, userPointer) {
  let hasMore = true;
  const limit = 1000;
  const limiter = pLimit(CONCURRENCY_LIMIT);

  while (hasMore) {
    const query = new Parse.Query(className);
    query.equalTo('CreatedBy', userPointer);
    query.limit(limit);
    query.ascending('objectId');

    const results = await query.find({ useMasterKey: true });

    // Step 1: Concurrent file deletions with controlled concurrency
    const fileDeletePromises = [];

    for (const obj of results) {
      const urls = ['URL', 'SignedUrl', 'certificateUrl']
        .map(field => obj.get(field))
        .filter(Boolean);

      for (const fileUrl of urls) {
        fileDeletePromises.push(limiter(() => deleteFileByUrl(fileUrl)));
      }
    }

    await Promise.all(fileDeletePromises);

    // Step 2: Delete Parse objects
    if (results.length > 0) {
      await Parse.Object.destroyAll(results, { useMasterKey: true });
      console.log(`🧹 Deleted ${results.length} Parse objects from ${className}`);
    }

    hasMore = results.length === limit;
  }

  console.log(`✅ Finished deletion from ${className} for user: ${userPointer.objectId}`);
}

export async function deleteDataFiles(className, userPointer) {
  let hasMore = true;
  const limit = 1000;
  const limiter = pLimit(CONCURRENCY_LIMIT);

  while (hasMore) {
    const query = new Parse.Query(className);
    query.equalTo('UserId', userPointer);
    query.limit(limit);
    query.ascending('objectId');

    const results = await query.find({ useMasterKey: true });

    // Step 1: Concurrent file deletions with controlled concurrency
    const fileDeletePromises = [];

    for (const obj of results) {
      const urls = ['FileUrl'].map(field => obj.get(field)).filter(Boolean);
      for (const fileUrl of urls) {
        fileDeletePromises.push(limiter(() => deleteFileByUrl(fileUrl)));
      }
    }

    await Promise.all(fileDeletePromises);

    // Step 2: Delete Parse objects
    if (results.length > 0) {
      await Parse.Object.destroyAll(results, { useMasterKey: true });
      console.log(`🧹 Deleted ${results.length} Parse objects from ${className}`);
    }

    hasMore = results.length === limit;
  }

  console.log(`✅ Finished deletion from ${className} for user: ${userPointer.objectId}`);
}

export async function deleteContactsInBatch(className, userPointer) {
  let hasMore = true;
  const limit = 1000;

  while (hasMore) {
    const query = new Parse.Query(className);
    query.equalTo('CreatedBy', userPointer);
    query.limit(limit);
    query.ascending('objectId');
    const results = await query.find({ useMasterKey: true });
    if (results?.length > 0) {
      await Parse.Object.destroyAll(results, { useMasterKey: true });
      console.log(`🧹 Deleted ${results.length} Parse objects from ${className}`);
    }

    hasMore = results.length === limit;
  }

  console.log(`✅ Finished deletion from ${className} for user: ${userPointer.objectId}`);
}
