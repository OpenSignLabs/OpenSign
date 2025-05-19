export default async function TemplateAfterSave(request) {
  try {
    if (!request.original) {
      console.log('new entry is insert in contracts_Template');
      // update acl of New Document If There are signers present in array
      const signers = request.object.get('Signers');
      const AutoReminder = request?.object?.get('AutomaticReminders') || false;
      const ip = request?.headers?.['x-real-ip'] || '';
      const originIp = request?.object?.get('OriginIp') || '';
      if (AutoReminder) {
        const RemindOnceInEvery = request?.object?.get('RemindOnceInEvery') || 5;
        const ReminderDate = new Date(request?.object?.get('createdAt'));
        ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
        request.object.set('NextReminderDate', ReminderDate);
      }
      if (!originIp) {
        request.object.set('OriginIp', ip);
      }
      await request.object.save(null, { useMasterKey: true });
      if (signers && signers.length > 0) {
        await updateAclDoc(request.object.id);
      } else {
        if (request?.object?.id && request?.user) {
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
    console.log('err in aftersave of contracts_Template');
    console.log(err);
  }

  async function updateAclDoc(objId) {
    // console.log("In side updateAclDoc func")
    // console.log(objId)
    const Query = new Parse.Query('contracts_Template');
    Query.include('Signers');
    Query.include('CreatedBy');
    Query.include('ExtUserPtr.TenantId');
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
    // console.log("Inside updateSelfDoc func")

    const Query = new Parse.Query('contracts_Template');
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
