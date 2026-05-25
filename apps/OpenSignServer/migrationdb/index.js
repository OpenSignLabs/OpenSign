import createContactIndex from './createContactIndex.js';
import createDocumentIndex from './createDocumentIndex.js';

export default async function runDbMigrations() {
  await createContactIndex();
  await createDocumentIndex();
}
