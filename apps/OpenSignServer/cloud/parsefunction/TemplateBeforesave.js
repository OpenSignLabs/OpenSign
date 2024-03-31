async function TemplateBeforeSave(request) {
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
          const ContractsUsers = Parse.Object.extend('contracts_users');
          const newContractUser = new ContractsUsers();
          newContractUser.set('TemplateCount', 1);
          await newContractUser.save(null, { useMasterKey: true });
        }
      } catch (error) {
        console.log('Error updating template count in contracts_users: ' + error.message);
      }
    }
  } catch (err) {
    console.log('err in template beforesave', err.message);
  }
}
export default TemplateBeforeSave;
