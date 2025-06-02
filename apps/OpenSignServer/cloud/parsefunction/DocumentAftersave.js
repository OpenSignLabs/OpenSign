async function DocumentAftersave(request) {
  try {
    if (!request.original) {
      console.log('new entry is insert in contracts_Document');
      const createdAt = request.object.get('createdAt');
      const Folder = request.object.get('Type');
      const ip = request?.headers?.['x-real-ip'] || '';
      const originIp = request?.object?.get('OriginIp') || '';
      if (createdAt && Folder === undefined) {
        // console.log("IN If condition")
        const TimeToCompleteDays = request.object.get('TimeToCompleteDays') || 15;
        const ExpiryDate = new Date(createdAt);
        ExpiryDate.setDate(ExpiryDate.getDate() + TimeToCompleteDays);
        const documentQuery = new Parse.Query('contracts_Document');
        documentQuery.include('ExtUserPtr.TenantId');
        const updateQuery = await documentQuery.get(request.object.id, { useMasterKey: true });
        updateQuery.set('ExpiryDate', ExpiryDate);
        if (!originIp) {
          updateQuery.set('OriginIp', ip);
        }
        const AutoReminder = request?.object?.get('AutomaticReminders') || false;
        if (AutoReminder) {
          const RemindOnceInEvery = request?.object?.get('RemindOnceInEvery') || 5;
          const ReminderDate = new Date(createdAt);
          ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
          updateQuery.set('NextReminderDate', ReminderDate);
        }
        await updateQuery.save(null, { useMasterKey: true });
      } else if (createdAt && Folder === 'AIDoc') {
        const TimeToCompleteDays = request.object.get('TimeToCompleteDays');
        const ExpiryDate = new Date(createdAt);
        ExpiryDate.setDate(ExpiryDate.getDate() + TimeToCompleteDays);
        const documentQuery = new Parse.Query('contracts_Document');
        documentQuery.include('ExtUserPtr.TenantId');
        const updateQuery = await documentQuery.get(request.object.id, { useMasterKey: true });
        updateQuery.set('ExpiryDate', ExpiryDate);
        if (!originIp) {
          updateQuery.set('OriginIp', ip);
        }
        const AutoReminder = request?.object?.get('AutomaticReminders') || false;
        if (AutoReminder) {
          const RemindOnceInEvery = request?.object?.get('RemindOnceInEvery') || 5;
          const ReminderDate = new Date(createdAt);
          ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
          updateQuery.set('NextReminderDate', ReminderDate);
        }
        await updateQuery.save(null, { useMasterKey: true });
      }

      const signers = request.object.get('Signers');
      // update acl of New Document If There are signers present in array
      if (signers && signers.length > 0) {
        await updateAclDoc(request.object.id);
      } else {
        if (request?.object?.id && request.user) {
          await updateSelfDoc(request.object.id);
        }
      }
    } else {
      if (request?.user) {
        const signers = request.object.get('Signers');
        if (signers && signers.length > 0) {
          await updateAclDoc(request.object.id);
        } else {
          if (request?.object?.id) {
            await updateSelfDoc(request.object.id);
          }
        }
      }
    }
  } catch (err) {
    console.log('err in aftersave of contracts_Document');
    console.log(err);
  }

  async function updateAclDoc(objId) {
    // console.log("In side updateAclDoc func")
    // console.log(objId)
    const Query = new Parse.Query('contracts_Document');
    Query.include('Signers');
    Query.include('ExtUserPtr.TenantId');
    Query.include('CreatedBy');
    const updateACL = await Query.get(objId, { useMasterKey: true });
    const res = JSON.parse(JSON.stringify(updateACL));
    // console.log("res");
    // console.log(JSON.stringify(res));
    const UsersPtr = res.Signers.map(item => item.UserId);

    if (res.Signers[0].ExtUserPtr) {
      const ExtUserSigners = res.Signers.map(item => {
        return {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: item.ExtUserPtr.objectId,
        };
      });
      updateACL.set('Signers', ExtUserSigners);
    }

    // console.log("UsersPtr")
    // console.log(JSON.stringify(UsersPtr))
    const newACL = new Parse.ACL();
    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    if (res?.CreatedBy) {
      newACL.setReadAccess(res?.CreatedBy?.objectId, true);
      newACL.setWriteAccess(res?.CreatedBy?.objectId, true);
    }
    UsersPtr.forEach(x => {
      newACL.setReadAccess(x.objectId, true);
      newACL.setWriteAccess(x.objectId, true);
    });

    updateACL.setACL(newACL);
    updateACL.save(null, { useMasterKey: true });
  }

  async function updateSelfDoc(objId) {
    // console.log(objId)
    const Query = new Parse.Query('contracts_Document');
    Query.include('CreatedBy');
    Query.include('ExtUserPtr.TenantId');
    const updateACL = await Query.get(objId, { useMasterKey: true });
    const res = JSON.parse(JSON.stringify(updateACL));
    // console.log("res");
    // console.log(JSON.stringify(res));
    const newACL = new Parse.ACL();
    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    if (res?.CreatedBy) {
      newACL.setReadAccess(res?.CreatedBy?.objectId, true);
      newACL.setWriteAccess(res?.CreatedBy?.objectId, true);
    }
    updateACL.setACL(newACL);
    updateACL.save(null, { useMasterKey: true });
  }
}

export default DocumentAftersave;
