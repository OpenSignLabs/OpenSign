export default async function TemplateAfterSave(request) {
  try {
    if (!request.original) {
      console.log('new entry is insert in contracts_Template');
      const obj = request.object;
      const objId = obj?.id;
      const ip = request?.headers?.['x-real-ip'] || '';
      const originIp = obj?.get?.('OriginIp') || '';
      const createdAt = obj?.get?.('createdAt');

      // update acl of New template If There are signers present in array
      const signers = obj?.get('Signers');
      const hasSigners = Array.isArray(signers) && signers.length > 0;
      updateTemplateMeta({ objId, createdAt, ip, originIp });
      if (hasSigners) {
        await updateAclDoc(objId);
      } else if (objId && request?.user) {
        await updateSelfDoc(objId);
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

  async function updateTemplateMeta({ objId, createdAt, ip, originIp }) {
    const templateQuery = new Parse.Query('contracts_Template');
    templateQuery.include('ExtUserPtr.TenantId');

    const obj = await templateQuery.get(objId, { useMasterKey: true });

    // Automatic reminders
    const AutoReminder = obj?.get('AutomaticReminders') || false;
    if (AutoReminder) {
      const RemindOnceInEvery = obj?.get('RemindOnceInEvery') || 5;
      const ReminderDate = new Date(createdAt);
      ReminderDate.setDate(ReminderDate.getDate() + RemindOnceInEvery);
      obj.set('NextReminderDate', ReminderDate);
    }
    if (!originIp) {
      obj.set('OriginIp', ip);
    }

    await obj.save(null, { useMasterKey: true });
  }
  async function updateAclDoc(objId) {
    const Query = new Parse.Query('contracts_Template');
    Query.include('Signers');
    Query.include('CreatedBy');
    Query.include('ExtUserPtr.TenantId');
    const updateACL = await Query.get(objId, { useMasterKey: true });
    const res = JSON.parse(JSON.stringify(updateACL));
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
    const Query = new Parse.Query('contracts_Template');
    Query.include('CreatedBy');
    Query.include('ExtUserPtr.TenantId');
    const updateACL = await Query.get(objId, { useMasterKey: true });
    const res = JSON.parse(JSON.stringify(updateACL));
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
