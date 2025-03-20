async function TemplateBeforeSave(request) {
  if (!request.original) {
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

      // Update count in contracts_Users class
      const query = new Parse.Query('contracts_Users');
      query.equalTo('objectId', template.get('ExtUserPtr').id);

      try {
        const contractUser = await query.first({ useMasterKey: true });
        if (contractUser) {
          contractUser.increment('TemplateCount', 1);
          await contractUser.save(null, { useMasterKey: true });
        } else {
          // Create new entry if not found
          const ContractsUsers = Parse.Object.extend('contracts_Users');
          const newContractUser = new ContractsUsers();
          newContractUser.set('TemplateCount', 1);
          await newContractUser.save(null, { useMasterKey: true });
        }
      } catch (error) {
        console.log('Error updating template count in contracts_Users: ' + error.message);
      }
    }
  } catch (err) {
    console.log('err in template beforesave', err.message);
  }
}
export default TemplateBeforeSave;
