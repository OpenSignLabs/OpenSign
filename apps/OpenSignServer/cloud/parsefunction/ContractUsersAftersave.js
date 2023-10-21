async function ContractUsersAftersave(request) {
  console.log('In contracts_Users aftersave');

  if (!request.original) {
    const shareWithTeam = request.object.get('ShareWithTeam');
    const newACL = new Parse.ACL();
    const contactbook = new Parse.Object('contracts_Contactbook');
    contactbook.set('Name', request.object.get('Name'));
    contactbook.set('Email', request.object.get('Email'));
    contactbook.set('ExtUserPtr', request.object.get('objectId'));
    contactbook.set('Phone', request.object.get('Phone'));
    contactbook.set('ExtUserPtr', {
      __type: 'Pointer',
      className: 'contracts_Users',
      objectId: request.object.id,
    });
    contactbook.set('UserId', request.object.get('UserId'));

    // newACL.setPublicReadAccess(false);
    // newACL.setPublicWriteAccess(false);
    const tenant_Id = request.object.get('TenantId');
    if (shareWithTeam) {
      if (tenant_Id) {
        newACL.setReadAccess('tenant_' + tenant_Id.id, true);
        newACL.setWriteAccess('tenant_' + tenant_Id.id, true);
      }
      newACL.setReadAccess(request.user, true);
      newACL.setWriteAccess(request.user, true);
    } else {
      newACL.setReadAccess(request.user, true);
      newACL.setWriteAccess(request.user, true);
    }

    contactbook.setACL(newACL);
    contactbook.save(null, { useMasterkey: true });
  }
}
export default ContractUsersAftersave;
