export default async function setWidgetPreferences(request) {
  if (!request?.user) {
    throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'User is not authenticated.');
  }
  const dateWidgetParams = request?.params?.dateWidget;
  if (!dateWidgetParams || Object.keys(dateWidgetParams).length === 0) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide parameters.');
  }
  try {
    const orgQuery = new Parse.Query('contracts_Users');
    orgQuery.equalTo('UserId', request.user);
    const userObj = await orgQuery.first({ useMasterKey: true });
    if (!userObj) {
      throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Permission denied.');
    }

    const widgetPreferencesRaw = userObj?.get('WidgetPreferences');
    const widgetPreferences = Array.isArray(widgetPreferencesRaw) ? widgetPreferencesRaw : [];

    // Normalize booleans (simple + safe)
    const dateWidget = {
      type: 'date',
      isSigningDate: !!dateWidgetParams.isSigningDate,
      isReadOnly: !!dateWidgetParams.isReadOnly,
      date: dateWidgetParams?.isSigningDate ? '' : dateWidgetParams?.date || '',
      format: dateWidgetParams.format || 'MM/dd/yyyy',
    };

    // Upsert: replace if exists, otherwise append
    const updatedWidgetPreferences =
      widgetPreferences?.length > 0
        ? widgetPreferences.map(w => (w.type === 'date' ? dateWidget : w))
        : [...widgetPreferences, dateWidget];

    userObj.set('WidgetPreferences', updatedWidgetPreferences);
    const saved = await userObj.save(null, { useMasterKey: true });
    if (saved) {
      const response = typeof saved.toJSON === 'function' ? saved.toJSON() : saved;
      return {
        WidgetPreferences: response.WidgetPreferences,
        updatedAt: response.updatedAt,
        createdAt: response.createdAt,
      };
    }
  } catch (err) {
    console.log('set widget preferences error:', err);
    throw new Parse.Error(err?.code || 400, err?.message || 'Something went wrong.');
  }
}
