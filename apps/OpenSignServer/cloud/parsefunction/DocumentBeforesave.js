import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, MAX_NOTE_LENGTH } from '../../Utils.js';

async function DocumentBeforesave(request) {
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
      // Update count in contracts_Users class
      const query = new Parse.Query('contracts_Users');
      query.equalTo('objectId', oldDocument.get('ExtUserPtr').id);

      try {
        const contractUser = await query.first({ useMasterKey: true });
        if (contractUser) {
          contractUser.increment('DocumentCount', 1);
          await contractUser.save(null, { useMasterKey: true });
        } else {
          // Create new entry if not found
          const ContractsUsers = Parse.Object.extend('contracts_Users');
          const newContractUser = new ContractsUsers();
          newContractUser.set('DocumentCount', 1);
          await newContractUser.save(null, { useMasterKey: true });
        }
      } catch (error) {
        console.log('Error updating document count in contracts_Users: ' + error.message);
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
