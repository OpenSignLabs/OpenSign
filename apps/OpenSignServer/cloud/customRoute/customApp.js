import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadFile from './uploadFile.js';

import docxtopdf, { upload as docxUpload } from './docxtopdf.js';
import decryptpdf, { upload as decryptUpload } from './decryptpdf.js';
import { deleteUserByAdmin, deleteUserPost } from './deleteAccount/deleteUser.js';
import { deleteUserGet } from './deleteAccount/deleteUserGet.js';
import { deleteUserOtp } from './deleteAccount/deleteUserOtp.js';

export const app = express();

dotenv.config({ quiet: true });
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/file_upload', uploadFile);
app.post('/docxtopdf', docxUpload.single('file'), docxtopdf);
app.post('/decryptpdf', decryptUpload.single('file'), decryptpdf);
app.get('/delete-account/:userId', deleteUserGet);
app.post('/delete-account/:userId/otp', deleteUserOtp);
app.post('/delete-account/:userId', deleteUserPost);
app.post('/deleteuser/:userId', deleteUserByAdmin);
