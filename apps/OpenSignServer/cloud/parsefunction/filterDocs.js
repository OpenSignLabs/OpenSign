/**
 * Escapes special characters in a string so it can safely be used in a RegExp.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fetches contracts_Document objects whose Name matches searchTerm
 * and whose CreatedBy pointer is the current user.
 *
 * @param {Parse.User} user            – the logged-in Parse.User (e.g. request.user)
 * @param {string}     searchTerm      – substring (or full name) to match
 * @param {object}     [options]
 * @param {number}     [options.limit=100] – max results
 * @param {number}     [options.skip=0]    – offset for pagination
 * @param {boolean}    [options.caseSensitive=false] – regex case sensitivity
 */
async function fetchDocumentsByName(
  user,
  searchTerm,
  { limit = 300, skip = 0, caseSensitive = false } = {}
) {
  const query = new Parse.Query('contracts_Document');

  // 1) Filter by Name substring (case-insensitive by default)
  if (searchTerm) {
    const escaped = escapeRegExp(searchTerm);
    const pattern = `.*${escaped}.*`;
    query.matches('Name', pattern, caseSensitive ? undefined : 'i');
  }

  // 2) Filter by CreatedBy pointer
  query.equalTo('CreatedBy', user);

  // 3) Pagination & sorting
  query.limit(limit);
  query.skip(skip);
  // query.ascending('Name'); //sort alphabetically:
  query.include('ExtUserPtr');
  query.include('ExtUserPtr.TenantId');
  query.include('Signers');
  query.notEqualTo('IsArchive', true);
  query.descending('updatedAt');
  query.exclude('AuditTrail');
  query.notEqualTo('Type', 'Folder');
  try {
    return await query.find({ useMasterKey: true });
  } catch (err) {
    console.error('Error fetching contracts_Document by Name:', err);
    // Wrap low-level or network errors in a script-level error
    throw new Parse.Error(
      Parse.Error.SCRIPT_FAILED,
      'Unable to retrieve your documents at this time'
    );
  }
}

export default async function filterDocs(request) {
  const { searchTerm = '', limit, skip, caseSensitive } = request.params;
  if (!request.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  if (typeof searchTerm !== 'string') {
    throw new Parse.Error(Parse.Error.INVALID_PARAMETER, 'searchTerm must be a string');
  }

  try {
    const docs = await fetchDocumentsByName(request.user, searchTerm, {
      limit,
      skip,
      caseSensitive,
    });
    return docs;
  } catch (error) {
    // handle error
    console.log('err while filtering doc', error);
    throw error;
  }
}
