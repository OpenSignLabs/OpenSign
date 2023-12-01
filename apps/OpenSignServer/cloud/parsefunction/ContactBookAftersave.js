async function ContactbookAftersave(request) {
  /* In beforesave or aftersave if you want to check if an object is being inserted or updated 
    you can check as follows */
  if (!request.original) {
    const user = request.user;
    const object = request.object;

    // Retrieve the current ACL
    const acl = new Parse.ACL();

    // Ensure the current user has read access
    if (acl) {
      acl.setReadAccess(user, true);
      acl.setWriteAccess(user, true);
      acl.setReadAccess(object.get('UserId'), true);
      acl.setWriteAccess(object.get('UserId'), true);

      object.setACL(acl);
      object.set('IsDeleted', false)
      // Continue saving the object
      return object.save(null, { useMasterKey: true });
    }
  } else {
    console.log('Object being update');
  }
}
export default ContactbookAftersave;
