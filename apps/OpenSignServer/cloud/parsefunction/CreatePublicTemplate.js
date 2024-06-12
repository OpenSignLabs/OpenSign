export default async function CreatePublicTemplate(request) {
  const templateid = request.params.templateid;
  const ispublic = request.params.ispublic;
  const publicrole = request.params.publicrole;
  try {
    if (!request?.user) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
    } else {
      const userId = request?.user && request?.user?.id;
      if (templateid) {
        const updateTemplate = new Parse.Object('contracts_Template');
        updateTemplate.id = templateid;
        if (ispublic) {
          updateTemplate.set('PublicRole', publicrole);
        }
        updateTemplate.set('IsPublic', ispublic);
        const Acl = new Parse.ACL();
        if (ispublic) {
          Acl.setPublicReadAccess(true);
        }
        Acl.setReadAccess(userId, true);
        Acl.setWriteAccess(userId, true);
        updateTemplate.setACL(Acl);
        const savedObject = await updateTemplate.save(null, { useMasterKey: true });
        const res = savedObject.toJSON();
        if (res) {
          return {
            status: 'success',
          };
        }
      } else {
        throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Please provide required parameters!');
      }
    }
  } catch (err) {
    const code = err.code || 400;
    const msg = err.message;
    const error = new Parse.Error(code, msg);
    throw error;
  }
}
