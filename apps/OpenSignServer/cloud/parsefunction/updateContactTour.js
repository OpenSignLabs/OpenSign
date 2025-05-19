export default async function updateContactTour(request) {
  const contactId = request.params.contactId;
  try {
    const contactCls = new Parse.Query('contracts_Contactbook');
    const contactRes = await contactCls.get(contactId, { useMasterKey: true });
    if (contactRes) {
      const _contactRes = JSON.parse(JSON.stringify(contactRes));
      const tourStatus = _contactRes?.TourStatus?.length > 0 ? _contactRes.TourStatus : [];
      let updatedTourStatus = [];
      if (tourStatus.length > 0) {
        updatedTourStatus = [...tourStatus];
        const requestSignIndex = tourStatus.findIndex(
          obj => obj['requestSign'] === false || obj['requestSign'] === true
        );
        if (requestSignIndex !== -1) {
          updatedTourStatus[requestSignIndex] = { requestSign: true };
        } else {
          updatedTourStatus.push({ requestSign: true });
        }
      } else {
        updatedTourStatus = [{ requestSign: true }];
      }
      contactRes.set('TourStatus', updatedTourStatus);
      const updateRes = await contactRes.save(null, { useMasterKey: true });
      return updateRes;
    } else {
      throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, 'contact not found.');
    }
  } catch (err) {
    console.log('Err in contracts_Contactbook class ', err);
    throw err;
  }
}
