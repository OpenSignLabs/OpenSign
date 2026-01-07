async function DocumentAftersave(request) {
  try {
    if (!request.original) {
      console.log('new entry is insert in contracts_Document');
      const obj = request.object;
      const objId = obj?.id;
      const createdAt = obj?.get?.('createdAt');
      const folder = obj?.get?.('Type');
      const ip = request?.headers?.['x-real-ip'] || '';
      const originIp = obj?.get?.('OriginIp') || '';
      if (createdAt) {
        await updateDocumentMeta({ objId, createdAt, folder, ip, originIp });
      }

      const signers = obj?.get?.('Signers');
      const hasSigners = Array.isArray(signers) && signers.length > 0;
      // update acl of New Document If There are signers present in array
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
    console.log('err in aftersave of contracts_Document');
    console.log(err);
  }

  async function updateDocumentMeta({ objId, createdAt, folder, ip, originIp }) {
    const documentQuery = new Parse.Query('contracts_Document');
    documentQuery.include('ExtUserPtr.TenantId');

    const doc = await documentQuery.get(objId, { useMasterKey: true });
    if (folder === undefined || folder === 'AIDoc') {
      // ExpiryDate
      const timeToCompleteDays =
        folder === undefined
          ? doc.get('TimeToCompleteDays') || 15 // keep your default=15 only for "undefined folder"
          : doc.get('TimeToCompleteDays'); // keep original behavior for AIDoc (no forced default)

      if (typeof timeToCompleteDays === 'number' && createdAt) {
        const expiryDate = new Date(createdAt);
        expiryDate.setDate(expiryDate.getDate() + timeToCompleteDays);
        doc.set('ExpiryDate', expiryDate);
      }

      // OriginIp
      if (!originIp) {
        doc.set('OriginIp', ip);
      }

      // Automatic reminders
      const autoReminder = doc.get('AutomaticReminders') || false;
      if (autoReminder && createdAt) {
        const remindOnceInEvery = doc.get('RemindOnceInEvery') || 5;
        const reminderDate = new Date(createdAt);
        reminderDate.setDate(reminderDate.getDate() + remindOnceInEvery);
        doc.set('NextReminderDate', reminderDate);
      }
    }

    await doc.save(null, { useMasterKey: true });
  }

  async function updateAclDoc(objId) {
    const Query = new Parse.Query('contracts_Document');
    Query.include('Signers');
    Query.include('ExtUserPtr.TenantId');
    Query.include('CreatedBy');
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
    const Query = new Parse.Query('contracts_Document');
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

export default DocumentAftersave;
