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
app.post('/createdocument', createDocument);

// get template on the basis of id
app.put('/template/:document_id', updateTemplate);

// get Document on the basis of id
app.get('/document/:document_id', getDocument);

// get all types of documents on the basis of doctype
app.get('/documentlist/:doctype', getDocumentList);

// create Template
app.post('/createtemplate', createTemplate);

// get template on the basis of id
app.get('/template/:template_id', getTemplate);

// get template on the basis of id
app.put('/template/:template_id', updateTemplate);

// get template on the basis of id
app.delete('/template/:template_id', deletedTemplate);

// get all types of documents on the basis of doctype
app.get('/templatelist', getTemplatetList);

app.post('/tempupload', upload.single('file'), async (req, res) => {
  const name = req.body.name;
  const note = req.body.note;
  const description = req.body.description;
  const fileFormat = req.body.fileFormat; // 'binary' or 'base64'
  const filePath = req.body.filePath; // Path to the file

  let fileData;

  if (fileFormat === 'binary') {
    // Read file content if the file is in binary format
    fileData = fs.readFileSync(filePath);
  } else if (fileFormat === 'base64') {
    // Convert base64 data to binary
    fileData = req.file ? req.file.buffer : null;
  } else {
    return res.status(400).json({ error: 'Invalid file format' });
  }

  // Create a Parse.File object
  const file = new Parse.File('myfile', { base64: fileData.toString('base64') });

  // Save the file to Parse Server
  try {
    await file.save();
  } catch (error) {
    console.error('Error saving file to Parse Server:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  // Perform any desired processing with the received data

  // Respond to the client with the file URL
  res.json({
    name: name,
    note: note,
    description: description,
    fileUrl: file.url(),
  });
});
