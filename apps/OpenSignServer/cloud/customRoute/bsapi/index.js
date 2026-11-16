// /api/v1: OpenSign's API for the BetterSign desktop app, authenticated by the
// identity's own signature (auth.js), not by bs-id. Design and the desktop
// side of the protocol: docs/BetterSignAPI.md (repo root).
//
// Express 5 passes rejected promises from async handlers to the error handler.

import express from 'express';
import { createChallenge, issueToken, logout, requireToken, apiError } from './auth.js';
import { me, listDocuments, getDocument, getDocumentFile } from './documents.js';
import { uploadSignature } from './signatures.js';
import { authRateLimit } from './rateLimit.js';

export const router = express.Router();

router.post('/auth/challenge', authRateLimit('challenge'), createChallenge);
router.post('/auth/token', authRateLimit('token'), issueToken);

router.use(requireToken);
router.post('/auth/logout', logout);
router.get('/me', me);
router.get('/documents', listDocuments);
router.get('/documents/:id', getDocument);
router.get('/documents/:id/file', getDocumentFile);
router.post('/documents/:id/signatures', uploadSignature);

router.use((req, res) => apiError(res, 404, 'not_found', 'No such endpoint.'));
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  console.log('bsapi: error', req.method, req.path, err?.message);
  return apiError(res, 500, 'internal', 'Something went wrong.');
});
