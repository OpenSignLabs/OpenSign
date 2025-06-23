import { db } from '../../config/db.js';

async function getDocStatus(request) {
  try {
    const query = 'SELECT status FROM policies WHERE docId = ?';
    const params = [request.params.docId];
    const [result] = await db.execute(query, params);

    if (result.length === 0) {
      return null; // or throw an error if preferred
    }
    return result[0].status;
  } catch (err) {
    console.log('err', err);
    return err;
  }
}
export default getDocStatus;
