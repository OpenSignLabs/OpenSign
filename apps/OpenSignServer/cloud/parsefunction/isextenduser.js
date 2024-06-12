/**
 * Checks if a user exists in the extended class 'contracts_Users' based on the provided email.
 * @param email - The request contains parameters, such as the user's email.
 * @returns {Object} - Returns an object indicating whether the user exists.
 */
export default async function isextenduser(request) {
  try {
    // Query the 'contracts_Users' class in the database based on the provided email
    const userQuery = new Parse.Query('contracts_Users');
    userQuery.equalTo('Email', request.params.email);

    // Execute the query
    const res = await userQuery.first({ useMasterKey: true });

    // Check if a user was found
    if (res) {
      // If user exists, return object with 'isUserExist' set to true
      return { isUserExist: true };
    } else {
      // If user does not exist, return object with 'isUserExist' set to false
      return { isUserExist: false };
    }
  } catch (err) {
    // Handle errors
    console.log('Error in userexist', err);
    const code = err?.code || 400;
    const message = err?.message || 'Something went wrong.';
    throw new Parse.Error(code, message);
  }
}
