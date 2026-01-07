import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH, MAX_NOTE_LENGTH } from '../../Utils.js';
import { setTemplateCount } from '../../utils/CountUtils.js';

async function TemplateBeforeSave(request) {
  if (!request.original) {
    const validations = [
      { field: 'Name', max: MAX_NAME_LENGTH },
      { field: 'Note', max: MAX_NOTE_LENGTH },
      { field: 'Description', max: MAX_DESCRIPTION_LENGTH },
    ];

    for (const { field, max } of validations) {
      const value = request.object?.get(field);
      if (value && value.length > max) {
        throw new Parse.Error(
          Parse.Error.VALIDATION_ERROR,
          `The "${field}" field must be at most ${max} characters long.`
        );
      }
    }

    const TimeToCompleteDays = request.object.get('TimeToCompleteDays') || 15;
    const RemindOnceInEvery = request?.object?.get('RemindOnceInEvery') || 5;
    const AutoReminder = request?.object?.get('AutomaticReminders') || false;
    const reminderCount = TimeToCompleteDays / RemindOnceInEvery;
    if (AutoReminder && reminderCount > 15) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'only 15 reminder allowed');
    }
  }
  try {
    if (!request.original) {
      // below code is used to update template when user sent template or self signed
      const template = request.object;

      if (template?.get('ExtUserPtr')?.id) {
        setTemplateCount(template?.get('ExtUserPtr')?.id);
      }
    }
  } catch (err) {
    console.log('err in template beforesave', err.message);
  }
}
export default TemplateBeforeSave;
