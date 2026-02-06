export const isAuthenticated = async sessionUser => {
  try {
    return sessionUser ? true : false;
  } catch (err) {
    console.log(`authentication error ${err?.message}`);
    return false;
  }
};
