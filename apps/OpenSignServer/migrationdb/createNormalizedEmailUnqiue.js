import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { generateId } from '../Utils.js';
dotenv.config({ quiet: true });

export default async function createNormalizedEmailUnique() {
  // Provide the complete MongoDB connection URL with the database name
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dev'; // Replace with your MongoDB URI
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db();

    const migrationCollection = database.collection('Migrationdb');
    const migrationName = 'normalizedEmailUnique_1';

    // Check if the migration has already been executed
    const migrationExists = await migrationCollection.findOne({ name: migrationName });

    if (migrationExists) {
      console.log(' INFO  The unqiue index for normalizedEmail is already present.');
      return;
    }

    const collection = database.collection('_User');

    // Create the unique index, but only on documents where NormalizedEmail exists
    await collection.createIndex({ normalizedEmail: 1 }, { unique: true, sparse: true });

    // Save the migration record in the migrationdb collection
    await migrationCollection.insertOne({
      _id: generateId(10),
      name: migrationName,
      _created_at: new Date(),
      _updated_at: new Date(),
      executedAt: new Date(),
      details: 'Created unique index on NormalizedEmail',
    });

    console.log(' SUCCESS  The unqiue index for normalizedEmail is already created.');
  } catch (error) {
    console.log(' ERROR  Running unqiue index for normalizedEmail migration:', error);
  } finally {
    await client.close();
  }
}
