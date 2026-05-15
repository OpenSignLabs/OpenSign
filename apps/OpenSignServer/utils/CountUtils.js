export const setDocumentCount = async (extUserId, docsCount) => {
  if (extUserId) {
    try {
      // Update count in contracts_Users class
      const extQuery = new Parse.Query('contracts_Users');
      extQuery.equalTo('objectId', extUserId);
      const contractUser = await extQuery.first({ useMasterKey: true });
      if (contractUser) {
        if (docsCount) {
          const count = contractUser.get('DocumentCount')
            ? contractUser.get('DocumentCount') + Number(docsCount)
            : 0 + Number(docsCount);
          contractUser.set('DocumentCount', count);
        } else {
          contractUser.increment('DocumentCount', 1);
        }
        await contractUser.save(null, { useMasterKey: true });
      }
    } catch (error) {
      console.log('Error updating document count in contracts_Users: ' + error.message);
    }
  }
};
export const setTemplateCount = async extUserId => {
  if (extUserId) {
    try {
      // Update count in contracts_Users class
      const extQuery = new Parse.Query('contracts_Users');
      extQuery.equalTo('objectId', extUserId);
      const contractUser = await extQuery.first({ useMasterKey: true });
      if (contractUser) {
        contractUser.increment('TemplateCount', 1);
        await contractUser.save(null, { useMasterKey: true });
      }
    } catch (error) {
      console.log('Error updating template count in contracts_Users: ' + error.message);
    }
  }
};
