//--npm modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadFile from './uploadFile.js';
import saveSubscription from './saveSubscription.js';
import saveInvoice from './saveInvoice.js';
import savePayments from './savePayments.js';
import gooogleauth from './googleauth.js';
import autoReminder from './autoReminder.js';
import validateSmtp from './validateSmtp.js';
export const app = express();

dotenv.config();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/file_upload', uploadFile);

app.post('/savesubscription', saveSubscription);
app.post('/saveinvoice', saveInvoice);
app.post('/savepayment', savePayments);
app.post('/googleauth', gooogleauth);
app.post('/sendreminder', autoReminder);
app.post('/validatesmtp', validateSmtp);
