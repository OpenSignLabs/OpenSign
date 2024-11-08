import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

async function updateTemplate(template, isJwt = false) {
  try {
    if (template?.Id) {
      const updateTemplate = new Parse.Object('contracts_Template');
      updateTemplate.id = template.Id;
      if (template?.URL) {
        updateTemplate.set('URL', template.URL);
      }
      if (template?.Name) {
        updateTemplate.set('Name', template.Name);
      }
      if (template?.Note) {
        updateTemplate.set('Note', template.Note);
      }
      if (template?.Description) {
        updateTemplate.set('Description', template.Description);
      }
      if (template?.SendinOrder) {
        updateTemplate.set('SendinOrder', template.SendinOrder);
      }
      if (template?.AutomaticReminders) {
        updateTemplate.set('AutomaticReminders', template.AutomaticReminders);
      }
      if (template?.RemindOnceInEvery) {
        updateTemplate.set('RemindOnceInEvery', template.RemindOnceInEvery);
      }
      if (template?.NextReminderDate) {
        updateTemplate.set('NextReminderDate', new Date(template.NextReminderDate));
      }
      if (template?.IsEnableOTP) {
        updateTemplate.set('IsEnableOTP', template.IsEnableOTP);
      }
      if (template?.IsTourEnabled) {
        updateTemplate.set('IsTourEnabled', template.IsTourEnabled);
      }
      const isPublic = template?.IsPublic !== undefined ? template?.IsPublic : false;
      if (template?.IsPublic !== undefined) {
        updateTemplate.set('IsPublic', isPublic);
      }
      updateTemplate.set('Placeholders', template.Placeholders);
      updateTemplate.set('Signers', template.Signers);
      if (template?.SignatureType?.length > 0) {
        updateTemplate.set('SignatureType', template.SignatureType);
      }

      let updateTemplateRes;
      if (isJwt) {
        updateTemplateRes = await updateTemplate.save(null, { useMasterKey: true });
      } else {
        updateTemplateRes = await updateTemplate.save();
      }
      return updateTemplateRes;
    } else {
      throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide Id.');
    }
  } catch (err) {
    console.log('err in update template', err);
    throw err;
  }
}
export default async function saveTemplate(request) {
  const jwttoken = request.headers.jwttoken || '';
  const template = {
    Id: request.params?.templateId,
    URL: request.params?.URL || '',
    Name: request.params?.Name,
    Note: request.params?.Note,
    Description: request.params?.Description,
    Placeholders: request.params?.Placeholders,
    Signers: request.params?.Signers,
    SendMail: request.params?.SendMail || false,
    SendinOrder: request.params?.SendinOrder || true,
    AutomaticReminders: request.params?.AutomaticReminders,
    RemindOnceInEvery: parseInt(request.params.RemindOnceInEvery) || 15,
    NextReminderDate: request.params?.NextReminderDate,
    IsEnableOTP: request.params?.IsEnableOTP === true ? true : false,
    IsTourEnabled: request.params?.IsTourEnabled === true ? true : false,
    IsPublic: request.params?.IsPublic,
    SignatureType: request.params?.SignatureType || [],
  };

  try {
    if (request.user) {
      return await updateTemplate(template);
    } else if (jwttoken) {
      const jwtDecode = parseJwt(jwttoken);
      const userCls = new Parse.Query(Parse.User);
      userCls.equalTo('email', jwtDecode?.user_email);
      const userRes = await userCls.first({ useMasterKey: true });
      const userId = userRes?.id;
      const tokenQuery = new Parse.Query('appToken');
      tokenQuery.equalTo('userId', {
        __type: 'Pointer',
        className: '_User',
        objectId: userId,
      });
      const appRes = await tokenQuery.first({ useMasterKey: true });
      const decoded = jwt.verify(jwttoken, appRes?.get('token'));
      if (decoded?.user_email) {
        return await updateTemplate(template, true);
      } else {
        throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid token');
      }
    } else {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Invalid session token');
    }
  } catch (err) {
    console.log('err in get signers', err);
    throw err;
  }
}
