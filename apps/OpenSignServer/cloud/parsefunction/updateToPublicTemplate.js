import { parseJwt } from '../../Utils.js';
import jwt from 'jsonwebtoken';

async function updateTemplate(template, isJwt = false) {
  try {
    if (template?.Id) {
      const updateTemplate = new Parse.Object('contracts_Template');
      updateTemplate.id = template.Id;

      const isPublic = template?.IsPublic !== undefined ? template?.IsPublic : false;
      if (template?.IsPublic !== undefined) {
        updateTemplate.set('IsPublic', isPublic);
        updateTemplate.set('PublicRole', template.PublicRole);
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
export default async function updateToPublicTemplate(request) {
  const jwttoken = request.headers.jwttoken || '';
  const Role = request.params.Role;
  if (!Role) {
    throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Please provide public role.');
  }
  const PublicRole = [Role];
  const template = {
    Id: request.params.templateId,
    IsPublic: request.params?.IsPublic,
    PublicRole: PublicRole,
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
