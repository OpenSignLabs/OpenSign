async function DocumentAftersave(request) {
  try {
    if (!request.original) {
      console.log('new entry is insert in contracts_Document');
      const createdAt = request.object.get('createdAt');
      const Folder = request.object.get('Type');
      // console.log("createdAt")
      // console.log(createdAt)
      // console.log("Folder")
      // console.log(Folder)
      // console.log("before If condition")
      if (createdAt && Folder === undefined) {
        // console.log("IN If condition")
        const TimeToCompleteDays = request.object.get('TimeToCompleteDays');
        const ExpiryDate = new Date(createdAt);
        // console.log("ExpiryDate")
        // console.log(ExpiryDate)
        ExpiryDate.setDate(ExpiryDate.getDate() + TimeToCompleteDays);
        // console.log("ExpiryDate date after update")
        // console.log(ExpiryDate)
        const documentQuery = new Parse.Query('contracts_Document');
        const updateQuery = await documentQuery.get(request.object.id, { useMasterKey: true });
        updateQuery.set('ExpiryDate', ExpiryDate);
        await updateQuery.save(null, { useMasterKey: true });
      } else if (createdAt && Folder === 'AIDoc') {
        const TimeToCompleteDays = request.object.get('TimeToCompleteDays');
        const ExpiryDate = new Date(createdAt);
        // console.log("ExpiryDate")
        // console.log(ExpiryDate)
        ExpiryDate.setDate(ExpiryDate.getDate() + TimeToCompleteDays);
        // console.log("ExpiryDate date after update")
        // console.log(ExpiryDate)
        const documentQuery = new Parse.Query('contracts_Document');
        const updateQuery = await documentQuery.get(request.object.id, { useMasterKey: true });
        updateQuery.set('ExpiryDate', ExpiryDate);
        await updateQuery.save(null, { useMasterKey: true });
      }

      const signers = request.object.get('Signers');
      // console.log("Signers")
      // console.log(signers.length)
      // update acl of New Document If There are signers present in array
      if (signers && signers.length > 0) {
        await updateAclDoc(request.object.id);
      } else {
        if (request?.object?.id && request.user) {
          await updateSelfDoc(request.object.id);
        }
      }
    } else {
      if (request.user) {
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
    newACL.setReadAccess(request.user, true);
    newACL.setWriteAccess(request.user, true);

    UsersPtr.forEach(x => {
      newACL.setReadAccess(x.objectId, true);
      newACL.setWriteAccess(x.objectId, true);
    });

    updateACL.setACL(newACL);
    updateACL.save(null, { useMasterKey: true });
  }

  async function updateSelfDoc(objId) {
    // console.log("In side updateSelfDoc func")
    // console.log(objId)
    const Query = new Parse.Query('contracts_Document');
    const updateACL = await Query.get(objId, { useMasterKey: true });
    const res = JSON.parse(JSON.stringify(updateACL));
    // console.log("res");
    // console.log(JSON.stringify(res));
    const newACL = new Parse.ACL();
    newACL.setPublicReadAccess(false);
    newACL.setPublicWriteAccess(false);
    newACL.setReadAccess(request.user, true);
    newACL.setWriteAccess(request.user, true);
    updateACL.setACL(newACL);
    updateACL.save(null, { useMasterKey: true });
  }
}

export default DocumentAftersave;
