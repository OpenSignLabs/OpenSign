export default async function getDocument(request, response) {
  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    tokenQuery.include('userId');
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      const parseUser = JSON.parse(JSON.stringify(token));
      const userPtr = {
        __type: 'Pointer',
        className: '_User',
        objectId: parseUser.userId.objectId,
      };
      const Document = new Parse.Query('contracts_Document');
      Document.equalTo('objectId', request.params.document_id);
      Document.equalTo('CreatedBy', userPtr);
      Document.notEqualTo('IsArchive', true);
      Document.include('Signers');
      Document.include('Folder');
      Document.include('ExtUserPtr');
      Document.include('Placeholders.signerPtr');
      const res = await Document.first({ useMasterKey: true });
      if (res) {
        const document = JSON.parse(JSON.stringify(res));
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_document',
            properties: { response_code: 200 },
          });
        }
        return response.json({
          objectId: document.objectId,
          title: document.Name,
          note: document.Note || '',
          folder: { objectId: document?.Folder?.objectId, name: document?.Folder?.Name } || '',
          file: document?.SignedUrl || document.URL,
          certificate: document?.CertificateUrl || '',
          owner: document?.ExtUserPtr?.Name,
          signers:
            document?.Placeholders?.map(y => ({
              role: y.Role,
              name: y?.signerPtr?.Name || '',
              email: y?.signerPtr?.Email || '',
              phone: y?.signerPtr?.Phone || '',
              widgets: y.placeHolder?.flatMap(x =>
                x?.pos.map(w => ({
                  type: w?.type ? w.type : w.isStamp ? 'stamp' : 'signature',
                  x: w.xPosition,
                  y: w.yPosition,
                  w: w?.Width || 150,
                  h: w?.Height || 60,
                  page: x?.pageNumber,
                }))
              ),
            })) ||
            document?.Signers?.map(y => ({ name: y?.Name, email: y?.Email, phone: y?.Phone })) ||
            [],
          sendInOrder: document?.SendinOrder || false,
          enableOTP: document?.IsEnableOTP || false,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        });
      } else {
        if (request.posthog) {
          request.posthog?.capture({
            distinctId: parseUser.userId.email,
            event: 'api_get_document',
            properties: { response_code: 404 },
          });
        }
        return response.status(404).json({ error: 'Document not found!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong, please try again later!' });
  }
}
