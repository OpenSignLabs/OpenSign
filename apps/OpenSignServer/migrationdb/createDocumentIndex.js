import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { generateId } from '../Utils.js';
dotenv.config({ quiet: true });

export default async function createDocumentIndex() {
  // Provide the complete MongoDB connection URL with the database name
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev'; // Replace with your MongoDB URI
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();

    const migrationCollection = database.collection('Migrationdb');
    const docMigration = 'documentIndex_1';

    // Check if the migration has already been executed
    const docMigrationExists = await migrationCollection.findOne({ name: docMigration });

    if (docMigrationExists) {
      console.log(' INFO  The completed report index for contracts_document is already present.');
      return;
    }

    const docCollection = database.collection('contracts_Document');

    await docCollection.createIndex(
      { _p_CreatedBy: 1, _updated_at: -1 },
      {
        name: 'idx_docs_by_creator_recent_completed',
        partialFilterExpression: { IsCompleted: true },
      }
    );

    await docCollection.createIndex(
      { Signers: 1, _updated_at: -1 },
      {
        name: 'idx_docs_by_signer_recent_completed',
        partialFilterExpression: { IsCompleted: true },
      }
    );

    // Save the migration record in the migrationdb collection
    await migrationCollection.insertOne({
      _id: generateId(10),
      name: docMigration,
      _created_at: new Date(),
      _updated_at: new Date(),
      executedAt: new Date(),
      details: 'Created unique index on CreatedBy, IsImported, Email',
    });

    console.log(' SUCCESS  The completed report index for contracts_document is created.');
  } catch (error) {
    console.log(' ERROR  Running completed report index for contracts_document migration:', error);
  } finally {
    await client.close();
  }
}
