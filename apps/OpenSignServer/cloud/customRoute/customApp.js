//--npm modules
import express from 'express';
import cors from 'cors';
export const app = express();
import dotenv from 'dotenv';
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import uploadFile from './uploadFile.js';

app.post('/file_upload', uploadFile);
