import axios from 'axios';
import { color, customAPIurl } from '../../../../Utils.js';

const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createTemplatewithCoordinate(request, response) {
  const name = request.body.title;
  const note = request.body.note;
  const description = request.body.description;
  const signers = request.body.signers;
  const folderId = request.body.folderId;
  const base64File = request.body.file;
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
  // console.log('fileData ', fileData);
  const protocol = customAPIurl();

  try {
    const reqToken = request.headers['x-api-token'];
    if (!reqToken) {
      return response.status(400).json({ error: 'Please Provide API Token' });
    }
    const tokenQuery = new Parse.Query('appToken');
    tokenQuery.equalTo('token', reqToken);
    const token = await tokenQuery.first({ useMasterKey: true });
    if (token !== undefined) {
      // Valid Token then proceed request
      if (signers && signers.length > 0) {
        const userPtr = token.get('userId');
        let fileUrl;
        if (request.files?.[0]) {
          const file = new Parse.File(request.files?.[0]?.originalname, {
            base64: fileData?.toString('base64'),
          });
          await file.save({ useMasterKey: true });
          fileUrl = file.url();
        } else {
          const file = new Parse.File(`${name}.pdf`, {
            base64: base64File,
          });
          await file.save({ useMasterKey: true });
          fileUrl = file.url();
        }
        const contractsUser = new Parse.Query('contracts_Users');
        contractsUser.equalTo('UserId', userPtr);
        const extUser = await contractsUser.first({ useMasterKey: true });
        const extUserPtr = {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extUser.id,
        };

        const object = new Parse.Object('contracts_Template');
        object.set('Name', name);

        if (note) {
          object.set('Note', note);
        }
        if (description) {
          object.set('Description', description);
        }
        object.set('URL', fileUrl);
        object.set('CreatedBy', userPtr);
        object.set('ExtUserPtr', extUserPtr);
        let contact = [];
        if (signers && signers.length > 0) {
          let parseSigners;
          if (base64File) {
            parseSigners = signers;
          } else {
            parseSigners = JSON.parse(signers);
          }
          let createContactUrl = protocol + '/v1/createcontact';

          for (const [index, element] of parseSigners.entries()) {
            if (element?.name && element.phone && element?.email) {
              const body = {
                name: element?.name || '',
                email: element?.email || '',
                phone: element?.phone || '',
              };
              try {
                const res = await axios.post(createContactUrl, body, {
                  headers: { 'Content-Type': 'application/json', 'x-api-token': reqToken },
                });
                // console.log('res ', res.data);
                const contactPtr = {
                  __type: 'Pointer',
                  className: 'contracts_Contactbook',
                  objectId: res.data?.objectId,
                };
                const newObj = { ...element, contactPtr: contactPtr, index: index };
                contact.push(newObj);
              } catch (err) {
                // console.log('err ', err.response);
                if (err?.response?.data?.objectId) {
                  const contactPtr = {
                    __type: 'Pointer',
                    className: 'contracts_Contactbook',
                    objectId: err.response.data?.objectId,
                  };
                  const newObj = { ...element, contactPtr: contactPtr, index: index };
                  contact.push(newObj);
                }
              }
            } else {
              const newObj = { ...element, contactPtr: {}, index: index };
              contact.push(newObj);
            }
          }
          const updatedSigners = contact?.filter(x => x.contactPtr && x.contactPtr.objectId);
          if (updatedSigners && updatedSigners.length > 0) {
            object.set(
              'Signers',
              updatedSigners?.map(x => x.contactPtr)
            );
          }
          let updatePlaceholders = contact.map((signer, index) => {
            const placeHolder = [];

            for (const widget of signer.widgets) {
              const pageNumber = widget.page;
              const page = placeHolder.find(page => page.pageNumber === pageNumber);

              const widgetData = {
                xPosition: widget.x,
                yPosition: widget.y,
                isStamp: widget.type === 'stamp',
                key: Math.floor(Math.random() * 10000),
                isDrag: false,
                firstXPos: widget.x,
                firstYPos: widget.y,
                yBottom: 0,
                scale: 1,
                isMobile: false,
                zIndex: 1,
                type: widget.type,
                widgetValue: '',
                Width: widget.w,
                Height: widget.h,
              };

              if (page) {
                page.pos.push(widgetData);
              } else {
                placeHolder.push({
                  pageNumber,
                  pos: [widgetData],
                });
              }
            }

            return {
              signerObjId: signer?.contactPtr?.objectId,
              signerPtr: signer?.contactPtr,
              Role: signer.role,
              Id: 3000 + index * 1000,
              blockColor: color[signer?.index],
              placeHolder,
            };
          });
          object.set('Placeholders', updatePlaceholders);
        }
        if (folderId) {
          object.set('Folder', {
            __type: 'Pointer',
            className: 'contracts_Template',
            objectId: folderId,
          });
        }
        const newACL = new Parse.ACL();
        newACL.setPublicReadAccess(false);
        newACL.setPublicWriteAccess(false);
        newACL.setReadAccess(userPtr.id, true);
        newACL.setWriteAccess(userPtr.id, true);
        object.setACL(newACL);
        const res = await object.save(null, { useMasterKey: true });

        return response.json({
          objectId: res.id,
          message: 'Template created successfully!',
        });
      } else {
        return response.status(400).json({ error: 'Please provide signers!' });
      }
    } else {
      return response.status(405).json({ error: 'Invalid API Token!' });
    }
  } catch (err) {
    console.log('err ', err);
    return response.status(400).json({ error: 'Something went wrong!' });
  }
}
