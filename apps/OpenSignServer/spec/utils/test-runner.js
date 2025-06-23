import http from 'http';
import { ParseServer, FileSystemAdapter } from 'parse-server';
import { app, config } from '../../index.js';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

export const dropDB = async () => {
  await Parse.User.logOut();
  return await Parse.Server.database.deleteEverything(true);
};
let parseServerState = {};

/**
 * Starts the ParseServer instance
 * @param {Object} parseServerOptions Used for creating the `ParseServer`
 * @return {Promise} Runner state
 */
export async function startParseServer() {
  delete config.databaseAdapter;
  const parseServerOptions = Object.assign(config, {
    databaseURI: 'mongodb://localhost:27017/parse-test',
    masterKey: 'test',
    javascriptKey: 'test',
    appId: 'test',
    port: 30001,
    mountPath: '/test',
    serverURL: `http://localhost:30001/test`,
    logLevel: 'error',
    silent: true,
  });
  const parseServer = new ParseServer(parseServerOptions);
  await parseServer.start();
  app.use(parseServerOptions.mountPath, parseServer.app);
  const httpServer = http.createServer(app);
  await new Promise(resolve => httpServer.listen(parseServerOptions.port, resolve));
  Object.assign(parseServerState, {
    parseServer,
    httpServer,
    parseServerOptions,
  });
  return parseServerOptions;
}

/**
 * Stops the ParseServer instance
 * @return {Promise}
 */
export async function stopParseServer() {
  await new Promise(resolve => parseServerState.httpServer.close(resolve));
  parseServerState = {};
}

export default class AzureBlobFilesAdapter extends FileSystemAdapter {
  constructor(options) {
    super();
    this.accountName = options.accountName;
    this.accountKey = options.accountKey;
    this.containerName = options.containerName;
    this.baseUrl = options.baseUrl || `https://${options.accountName}.blob.core.windows.net`;

    const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
    this.blobServiceClient = new BlobServiceClient(this.baseUrl, sharedKeyCredential);
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  /**
   * Create a file in Azure Blob Storage
   */
  async createFile(filename, data, contentType) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: contentType || 'application/octet-stream' },
    });
    return `${this.baseUrl}/${this.containerName}/${filename}`;
  }

  /**
   * Delete a file in Azure Blob Storage
   */
  async deleteFile(filename) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    await blockBlobClient.deleteIfExists();
  }

  /**
   * Get file data
   */
  async getFileData(filename) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    const downloadResponse = await blockBlobClient.download();
    return downloadResponse.readableStreamBody;
  }

  /**
   * Generate a presigned URL for accessing a file
   */
  async getPresignedUrl(filename, expiresInSeconds = 900) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filename);
    const expiryTime = new Date(new Date().valueOf() + expiresInSeconds * 1000);
    const sasUrl = await blockBlobClient.generateSasUrl({
      startsOn: new Date(),
      expiresOn: expiryTime,
      permissions: 'r', // Read-only
    });
    return sasUrl;
  }
}
