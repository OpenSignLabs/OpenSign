export default async function resetPassword(request) {
  const userId = request.params.userId;
  const newPassword = request.params.password;

  if (!userId || !newPassword) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide required parameters.');
  }

  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }

  if (request.user.id === userId) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Unauthorized to reset your own password.');
  }

  try {
    // 1. Get Admin User TenantId
    const adminUserQuery = new Parse.Query('contracts_Users');
    adminUserQuery.equalTo('UserId', request.user);
    const adminUser = await adminUserQuery.first({ useMasterKey: true });

    const tenantId = adminUser?.get('TenantId');
    if (!tenantId) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'Admin user tenant not found.');
    }
    const isAdmin =
      adminUser.get('UserRole') === 'contracts_Admin' ||
      adminUser.get('UserRole') === 'contracts_OrgAdmin';
    if (!isAdmin) {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Unauthorized.');
    }

    // 2. Verify the user belongs to the same tenant and is not an admin
    const targetUserQuery = new Parse.Query('contracts_Users');
    targetUserQuery.equalTo('UserId', { __type: 'Pointer', className: '_User', objectId: userId });
    targetUserQuery.equalTo('TenantId', tenantId);
    targetUserQuery.notEqualTo('UserRole', 'contracts_Admin');
    const targetUser = await targetUserQuery.first({ useMasterKey: true });

    if (!targetUser) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found or not allowed.');
    }

    // 3. Update user's password
    const userQuery = new Parse.Query(Parse.User);
    userQuery.equalTo('objectId', userId);
    const user = await userQuery.first({ useMasterKey: true });

    if (!user) {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'User not found.');
    }

    user.set('password', newPassword);
    await user.save(null, { useMasterKey: true });

    return { status: 'success', message: 'Password has been reset.' };
  } catch (error) {
    console.error('Error while resetting password:', error);
    throw error;
  }
}
