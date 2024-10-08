//--npm modules
import express from 'express';
import cors from 'cors';
export const app = express();
import dotenv from 'dotenv';
import getUser from './routes/getUser.js';
import getDocumentList from './routes/getDocumentList.js';
import getDocument from './routes/getDocument.js';
import getContact from './routes/getContact.js';
import deleteContact from './routes/deleteContact.js';
import getContactList from './routes/getContactList.js';
import draftDocument from './routes/draftDocument.js';
import getTemplate from './routes/getTemplate.js';
import deletedTemplate from './routes/deleteTemplate.js';
import getTemplatetList from './routes/getTemplateList.js';
import updateTemplate from './routes/updateTemplate.js';
import createContact from './routes/createContact.js';
import multer from 'multer';
import updateDocument from './routes/updateDocument.js';
import deleteDocument from './routes/deleteDocument.js';
import createDocumentWithTemplate from './routes/CreateDocumentWithTemplate.js';
import saveWebhook from './routes/saveWebhook.js';
import deleteWebhook from './routes/deleteWebhook.js';
import getWebhook from './routes/getWebhook.js';
import createDocumentwithCoordinate from './routes/createDocumentwithCoordinate.js';
import createTemplatewithCoordinate from './routes/createTemplatewithCoordinate.js';
import resendMail from './routes/resendMail.js';
import getFolder from './routes/getFolder.js';
import createFolder from './routes/createFolder.js';
import updateFolder from './routes/updateFolder.js';
import getFolderList from './routes/getFolderList.js';
import deleteFolder from './routes/deleteFolder.js';
dotenv.config();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// get user details whose api token used
app.get('/getuser', getUser);

// get contact on the basis of id
app.post('/createcontact', createContact);

// get contact on the basis of id
app.get('/contact/:contact_id', getContact);

// soft delete contact
app.delete('/contact/:contact_id', deleteContact);

//  get list of contacts
app.get('/contactlist', getContactList);

// create Document
app.post('/createdocumentwithbinary', upload.array('file', 1), createDocumentwithCoordinate);

// create Document with co-ordinate
app.post('/createdocument', createDocumentwithCoordinate);

// create Document with base64 without placeholder
app.post('/draftdocument', draftDocument);

// create Document with templateId
app.post('/createdocument/:template_id', createDocumentWithTemplate);

// get Document on the basis of id
app.get('/document/:document_id', getDocument);

// get document on the basis of id
app.put('/document/:document_id', updateDocument);

// get document on the basis of id
app.delete('/document/:document_id', deleteDocument);

// get all types of documents on the basis of doctype
app.get('/documentlist/:doctype', getDocumentList);

// create Template with co-ordinate
app.post('/createtemplate', createTemplatewithCoordinate);

// create Template with binary
app.post('/createtemplatewithbinary', upload.array('file', 1), createTemplatewithCoordinate);

// get template on the basis of id
app.get('/template/:template_id', getTemplate);

// get template on the basis of id
app.put('/template/:template_id', updateTemplate);

// get template on the basis of id
app.delete('/template/:template_id', deletedTemplate);

// get all types of documents on the basis of doctype
app.get('/templatelist', getTemplatetList);

// set and update webhook
app.get('/webhook', getWebhook);

// set and update webhook
app.post('/webhook', saveWebhook);

// set and update webhook
app.delete('/webhook', deleteWebhook);

// resend mail
app.post('/resendmail', resendMail);

// create folder
app.post('/createfolder', createFolder);

// update folder
app.put('/folder/:folder_id', updateFolder);

// get folder list
app.delete('/folder/:folder_id', deleteFolder);

// get folder
app.get('/folder/:folder_id', getFolder);

// get folder list
app.get('/folderlist', getFolderList);
