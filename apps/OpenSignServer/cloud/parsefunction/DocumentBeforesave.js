import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, MAX_NOTE_LENGTH } from '../../Utils.js';
import { setDocumentCount } from '../../utils/CountUtils.js';

// Server-managed signing state (utils/appendOnlyPdf.js). VladSignatures makes a
// document append-only; a client that could clear it could get a desktop
// signature rewritten away. SignRevision orders concurrent signings. Seal and
// CertificateSeal record how OpenSign sealed the files (utils/seal.js).
const SERVER_ONLY_FIELDS = ['VladSignatures', 'SignRevision', 'Seal', 'CertificateSeal'];

async function DocumentBeforesave(request) {
  if (!request.master) {
    for (const field of SERVER_ONLY_FIELDS) {
      // A new object has no id yet in beforeSave, and dirty() is true for
      // every field of an object without an id, so check creates with has().
      const set = request.original ? request.object.dirty(field) : request.object.has(field);
      if (set) {
        throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, `${field} is set by the server.`);
      }
    }
  }
  if (!request.original) {
    const validations = [
      { field: 'Name', max: MAX_NAME_LENGTH },
      { field: 'Note', max: MAX_NOTE_LENGTH },
      { field: 'Description', max: MAX_DESCRIPTION_LENGTH },
    ];

    for (const { field, max } of validations) {
      const value = request?.object?.get(field);
      if (value && value.length > max) {
        throw new Parse.Error(
          Parse.Error.VALIDATION_ERROR,
          `The "${field}" field must be at most ${max} characters long.`
        );
      }
    }

    const TimeToCompleteDays = request?.object?.get('TimeToCompleteDays') || 15;
    const RemindOnceInEvery = request?.object?.get('RemindOnceInEvery') || 5;
    const AutoReminder = request?.object?.get('AutomaticReminders') || false;
    const reminderCount = TimeToCompleteDays / RemindOnceInEvery;
    if (AutoReminder && reminderCount > 15) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'only 15 reminder allowed');
    }
  }
  try {
    // below code is used to update document when user sent document or self signed
    const document = request.object;
    const oldDocument = request.original;

    // Check if SignedUrl field has been added (transition from undefined to defined)
    if (oldDocument && !oldDocument?.get('SignedUrl') && document?.get('SignedUrl')) {
      if (oldDocument?.get('ExtUserPtr')?.id) {
        setDocumentCount(oldDocument?.get('ExtUserPtr')?.id);
      }
      if (document?.get('Signers') && document.get('Signers').length > 0) {
        document.set('DocSentAt', new Date());
      }
    }
  } catch (err) {
    console.log('err in document beforesave', err.message);
  }
}
export default DocumentBeforesave;
