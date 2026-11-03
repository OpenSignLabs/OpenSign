export const isAuthenticated = async sessionUser => {
  try {
    if (!sessionUser) return false;
    // Require a concrete user identity, not just a truthy object.
    return Boolean(sessionUser.objectId || sessionUser.id);
  } catch (err) {
    console.log(`authentication error ${err?.message}`);
    return false;
  }
};
