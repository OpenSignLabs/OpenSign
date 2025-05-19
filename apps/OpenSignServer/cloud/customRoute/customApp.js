import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadFile from './uploadFile.js';

export const app = express();

dotenv.config();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/file_upload', uploadFile);

