import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { generateId } from '../Utils.js';
dotenv.config({ quiet: true });

export default async function createContactIndex() {
  // Provide the complete MongoDB connection URL with the database name
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev'; // Replace with your MongoDB URI
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();

    const migrationCollection = database.collection('Migrationdb');
    const migrationName = 'contactIndex_1';

    // Check if the migration has already been executed
    const migrationExists = await migrationCollection.findOne({ name: migrationName });

    if (migrationExists) {
      console.log(' INFO  The unqiue index for contracts_Contactbook is already present.');
      return;
    }

    const collection = database.collection('contracts_Contactbook');

    // Create the unique index, but only on documents where IsImported is true
    const query = {
      IsImported: { $eq: true },
      $or: [{ IsDeleted: false }, { IsDeleted: { $eq: false } }],
    }; // Include documents with IsImported: true and IsDeleted not true
    await collection.createIndex(
      { _p_CreatedBy: 1, Email: 1, IsImported: 1 },
      { unique: true, partialFilterExpression: query }
    );

    // Save the migration record in the migrationdb collection
    await migrationCollection.insertOne({
      _id: generateId(10),
      name: migrationName,
      _created_at: new Date(),
      _updated_at: new Date(),
      executedAt: new Date(),
      details: 'Created unique index on CreatedBy, IsImported, Email',
    });

    const migrationdb = database.collection('_SCHEMA');
    // create migrationdb SCHEM migrationdb

    // Document to be inserted
    const schemaDocument = {
      _id: 'Migrationdb',
      objectId: 'string',
      name: 'string',
      updatedAt: 'date',
      createdAt: 'date',
      executedAt: 'date',
      details: 'string',
    };

    // Insert the document
    await migrationdb.insertOne(schemaDocument);
    console.log(' SUCCESS  The unqiue index for contracts_Contactbook is already created.');
  } catch (error) {
    console.log(' ERROR  Running unqiue index for contracts_Contactbook migration:', error);
  } finally {
    await client.close();
  }
}
