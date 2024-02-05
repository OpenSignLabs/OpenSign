import axios from 'axios';
import { color, customAPIurl } from '../../../../Utils.js';

const randomId = () => Math.floor(1000 + Math.random() * 9000);
export default async function createDocumentwithCoordinate(request, response) {
  const name = request.body.title;
  const note = request.body.note;
  const description = request.body.description;
  const signers = request.body.signers;
  const folderId = request.body.folderId;
  const base64File = request.body.file;
  const fileData = request.files?.[0] ? request.files[0].buffer : null;
  // console.log('fileData ', fileData);
  const protocol = customAPIurl();
  const baseUrl = new URL(process.env.SERVER_URL);

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
        const parseExtUser = JSON.parse(JSON.stringify(extUser));

        const extUserPtr = {
          __type: 'Pointer',
          className: 'contracts_Users',
          objectId: extUser.id,
        };

        const object = new Parse.Object('contracts_Document');
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
          }
          object.set(
            'Signers',
            contact?.map(x => x.contactPtr)
          );
          let updatePlaceholders = contact.map((signer, index) => {
            const placeHolder = [];

            for (const widget of signer.widgets) {
              const pageNumber = widget.page;
              const page = placeHolder.find(page => page.pageNumber === pageNumber);

              const widgetData = {
                xPosition: widget.x,
                yPosition: widget.y,
                isStamp: widget.type === 'stamp',
                key: randomId(),
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
              Id: randomId(),
              blockColor: color[signer?.index],
              placeHolder,
            };
          });
          object.set('Placeholders', updatePlaceholders);
        }
        if (folderId) {
          object.set('Folder', {
            __type: 'Pointer',
            className: 'contracts_Document',
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

        const newDate = new Date();
        newDate.setDate(newDate.getDate() + 15);
        const localExpireDate = newDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        let sender = parseExtUser.Email;
        let sendMail;
        const serverUrl = process.env.SERVER_URL;
        const newServer = serverUrl.replaceAll('/', '%2F');
        const serverParams = `${newServer}%2F&${process.env.APP_ID}&contracts`;

        for (let i = 0; i < contact.length; i++) {
          try {
            const imgPng = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
            let url = `${process.env.SERVER_URL}/functions/sendmailv3/`;
            const headers = {
              'Content-Type': 'application/json',
              'X-Parse-Application-Id': process.env.APP_ID,
              'X-Parse-Master-Key': process.env.MASTER_KEY,
            };

            const objectId = contact[i].contactPtr.objectId;

            const hostUrl = baseUrl.origin + '/loadmf/signmicroapp';
            let signPdf = `${hostUrl}/login/${res.id}/${contact[i].email}/${objectId}/${serverParams}`;
            const openSignUrl = 'https://www.opensignlabs.com/contact-us';
            const orgName = parseExtUser.Company ? parseExtUser.Company : '';
            const themeBGcolor = '#47a3ad';
            let params = {
              recipient: contact[i].email,
              subject: `${parseExtUser.Name} has requested you to sign ${parseExtUser.Name}`,
              from: sender,
              html:
                "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> </head>   <body> <div style='background-color: #f5f5f5; padding: 20px'=> <div   style=' box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;background: white;padding-bottom: 20px;'> <div style='padding:10px 10px 0 10px'><img src=" +
                imgPng +
                " height='50' style='padding: 20px,width:170px,height:40px' /></div>  <div  style=' padding: 2px;font-family: system-ui;background-color:" +
                themeBGcolor +
                ";'><p style='font-size: 20px;font-weight: 400;color: white;padding-left: 20px;' > Digital Signature Request</p></div><div><p style='padding: 20px;font-family: system-ui;font-size: 14px;   margin-bottom: 10px;'> " +
                parseExtUser.Name +
                ' has requested you to review and sign <strong> ' +
                name +
                "</strong>.</p><div style='padding: 5px 0px 5px 25px;display: flex;flex-direction: row;justify-content: space-around;'><table> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td> <td> </td> <td  style='color:#626363;font-weight:bold'>" +
                sender +
                "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td> <td> </td><td style='color:#626363;font-weight:bold'> " +
                orgName +
                "</td></tr> <tr> <td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expire on</td><td> </td> <td style='color:#626363;font-weight:bold'>" +
                localExpireDate +
                "</td></tr><tr> <td></td> <td> </td></tr></table> </div> <div style='margin-left:70px'><a href=" +
                signPdf +
                "> <button style='padding: 12px 12px 12px 12px;background-color: #d46b0f;color: white;  border: 0px;box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px,rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;font-weight:bold;margin-top:30px'>Sign here</button></a> </div> <div style='display: flex; justify-content: center;margin-top: 10px;'> </div></div></div><div><p> This is an automated email from OpenSign™. For any queries regarding this email, please contact the sender " +
                sender +
                ' directly.If you think this email is inappropriate or spam, you may file a complaint with OpenSign™   <a href= ' +
                openSignUrl +
                ' target=_blank>here</a>.</p> </div></div></body> </html>',
            };
            sendMail = await axios.post(url, params, { headers: headers });
          } catch (error) {
            console.log('error', error);
          }
        }

        if (sendMail.data.result.status === 'success') {
          return response.json({
            objectId: res.id,
            signurl: contact.map(x => ({
              email: x.email,
              url: `${baseUrl.origin}/loadmf/signmicroapp/login/${res.id}/${x.email}/${x.contactPtr.objectId}/${serverParams}`,
            })),
            message: 'Document sent successfully!',
          });
        }
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
