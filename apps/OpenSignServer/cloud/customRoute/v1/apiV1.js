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
import createDocument from './routes/createDocument.js';
import createTemplate from './routes/createTemplate.js';
import getTemplate from './routes/getTemplate.js';
import deletedTemplate from './routes/deleteTemplate.js';
import getTemplatetList from './routes/getTemplateList.js';
import updateTemplate from './routes/updateTemplate.js';
import createContact from './routes/createContact.js';
import multer from 'multer';
import fs from 'node:fs';
import updateDocument from './routes/updateDocument.js';
import deleteDocument from './routes/deleteDocument.js';

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
app.post('/createdocument', upload.array('file', 1), createDocument);

// get Document on the basis of id
app.get('/document/:document_id', getDocument);

// get document on the basis of id
app.put('/document/:document_id', updateDocument);

// get document on the basis of id
app.delete('/document/:document_id', deleteDocument);

// get all types of documents on the basis of doctype
app.get('/documentlist/:doctype', getDocumentList);

// create Template
app.post('/createtemplate',upload.array('file', 1), createTemplate);

// get template on the basis of id
app.get('/template/:template_id', getTemplate);

// get template on the basis of id
app.put('/template/:template_id', updateTemplate);

// get template on the basis of id
app.delete('/template/:template_id', deletedTemplate);

// get all types of documents on the basis of doctype
app.get('/templatelist', getTemplatetList);

