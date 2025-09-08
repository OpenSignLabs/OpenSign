// Function to escape special characters in the search string
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
}

async function getContacts(searchObj, isJWT) {
  try {
    const escapedSearch = escapeRegExp(searchObj.search); // Escape the search input
    const searchRegex = new RegExp(escapedSearch, 'i'); // Create regex once to reuse
    const contactNameQuery = new Parse.Query('contracts_Contactbook');
    contactNameQuery.matches('Name', searchRegex);

    const conatctEmailQuery = new Parse.Query('contracts_Contactbook');
    conatctEmailQuery.matches('Email', searchRegex);

    // Combine the two queries with OR
    const mainQuery = Parse.Query.or(contactNameQuery, conatctEmailQuery);

    // Add the common condition for 'CreatedBy'
    mainQuery.equalTo('CreatedBy', searchObj.CreatedBy);
    mainQuery.notEqualTo('IsDeleted', true);
    const findOpt = isJWT ? { useMasterKey: true } : { sessionToken: searchObj.sessionToken };
    const contactRes = await mainQuery.find(findOpt);
    const _contactRes = JSON.parse(JSON.stringify(contactRes));
    return _contactRes;
  } catch (err) {
    console.log('err while fetch contacts', err);
    throw err;
  }
}
export default async function getSigners(request) {
  const searchObj = { search: request.params.search || '', sessionToken: '' };
  try {
    if (request.user) {
      searchObj.CreatedBy = { __type: 'Pointer', className: '_User', objectId: request?.user?.id };
      searchObj.sessionToken = request.user.getSessionToken();
      return await getContacts(searchObj);
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token');
    }
  } catch (err) {
    console.log('err in get signers', err);
    throw err;
  }
}
