// OpenSign's seal: the signature the server adds to a completed document and
// to its completion certificate. The only place that knows how a PDF is
// sealed (plan: docs/BsServiceIdentitySealing.md).
//
// Two backends:
//   bs-service-identity  docsign's BetterSign identity (BetterSignApps
//                        server/bs-service-identity), a PAdES seal by its
//                        document-signing log, plus a `.sig` proof that
//                        BetterSign verification needs
//   p12                  @signpdf with a PKCS#12: a tenant's own PfxFile, or
//                        PFX_BASE64 / PASS_PHRASE (the demo certificate)
//
// A tenant that uploaded its own certificate is always sealed with it. Others
// use SEAL_BACKEND (`bs-service-identity` or `p12`, the default).
//
// Environment:
//   SEAL_BACKEND               p12 | bs-service-identity
//   SEAL_FALLBACK              p12: seal with the PFX when the service fails
//                              (rollout only); otherwise a failure fails the signing
//   BS_SERVICE_IDENTITY_URL    e.g. http://bs-service-identity.internal:8789
//   BS_SERVICE_IDENTITY_TOKEN  the service's BS_SERVICE_TOKEN

import axios from 'axios';
import { PDFDocument } from 'pdf-lib';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { Placeholder } from '../cloud/parsefunction/pdf/Placeholder.js';
import { extendsPdf, sealAppendOnly } from './appendOnlyPdf.js';
import { parseUploadFile } from './fileUtils.js';
import { getSecureUrl } from '../Utils.js';

export const BS_SERVICE_IDENTITY = 'bs-service-identity';
export const P12 = 'p12';

const eSignName = 'OpenSign';
const eSigncontact = 'hello@opensignlabs.com';

// The certificate to seal `doc` with on the p12 backend, and whether the
// tenant chose it.
export function pfxFor(doc) {
  const tenantPfx = doc?.ExtUserPtr?.TenantId?.PfxFile;
  if (tenantPfx?.base64) {
    return { base64: tenantPfx.base64, passphrase: tenantPfx.password, tenant: true };
  }
  return { base64: process.env.PFX_BASE64, passphrase: process.env.PASS_PHRASE, tenant: false };
}

function serviceConfig() {
  const url = (process.env.BS_SERVICE_IDENTITY_URL || '').replace(/\/$/, '');
  const token = process.env.BS_SERVICE_IDENTITY_TOKEN || '';
  if (!url || !token) {
    throw new Error('SEAL_BACKEND=bs-service-identity needs BS_SERVICE_IDENTITY_URL and _TOKEN');
  }
  return { url, token };
}

// A field name no earlier field has: the service refuses '.' in a name, so
// no milliseconds. `attempt` disambiguates a retry within the same second.
export function sealFieldName(now = new Date(), attempt = 0) {
  const base = `OpenSign seal ${now.toISOString().replace(/\.\d{3}Z$/, 'Z')}`;
  return attempt ? `${base} ${attempt + 1}` : base;
}

const MAX_ATTEMPTS = 3;

async function sealWithService({ pdfBytes, appendOnly, filename }) {
  const { url, token } = serviceConfig();
  for (let attempt = 0; ; attempt++) {
    const fieldName = sealFieldName(new Date(), attempt);
    const params = { format: 'json', field_name: fieldName };
    // A rewrite would break an earlier BetterSign signature. Otherwise let
    // the service repair a malformed file if it has to.
    if (appendOnly) params.append_only = 'true';
    if (filename) params.filename = filename;
    let res;
    try {
      res = await axios.post(`${url}/v1/pades/sign`, pdfBytes, {
        params,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/pdf' },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000,
      });
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      // abandoned: the signing log moved mid-seal and nothing was signed.
      // field_exists: another seal took this name in the same second.
      if (
        status === 409 &&
        ['abandoned', 'field_exists'].includes(code) &&
        attempt + 1 < MAX_ATTEMPTS
      ) {
        continue;
      }
      const detail = err?.response?.data?.error || err?.message;
      throw Object.assign(
        new Error(`bs-service-identity seal failed: ${status || ''} ${code || ''} ${detail}`),
        {
          status,
          code,
        }
      );
    }
    const d = res.data;
    const pdf = Buffer.from(d.pdf, 'base64');
    const sig = Buffer.from(d.sig, 'base64');
    if (appendOnly && !extendsPdf(pdfBytes, pdf)) {
      throw new Error('bs-service-identity seal rewrote earlier bytes');
    }
    return {
      pdf,
      sig,
      seal: {
        backend: BS_SERVICE_IDENTITY,
        recordId: d.record_id,
        logId: d.log_id,
        plogVlad: d.plog_vlad,
        verificationKey: d.verification_key,
        fieldName,
        // The `.sig` verifies only these bytes; anything appended later must
        // be cut off before verifying.
        sealedLength: pdf.length,
        sealedAt: new Date().toISOString(),
      },
    };
  }
}

async function sealWithP12({ pdfBytes, appendOnly, reason, certificate, pfx }) {
  const p12Signer = new P12Signer(Buffer.from(pfx.base64, 'base64'), {
    passphrase: pfx.passphrase || null,
  });
  const seal = {
    backend: P12,
    tenantCertificate: !!pfx.tenant,
    sealedAt: new Date().toISOString(),
  };
  if (appendOnly) {
    const pdf = await sealAppendOnly({
      pdfBytes,
      p12Signer,
      reason: `Digitally signed by ${eSignName} for ${reason}`,
      name: eSignName,
      contactInfo: eSigncontact,
    });
    return { pdf, seal };
  }
  const pdfDoc = await PDFDocument.load(pdfBytes);
  if (certificate) {
    pdflibAddPlaceholder({
      pdfDoc,
      reason: `Digitally signed by ${eSignName}.`,
      location: 'n/a',
      name: eSignName,
      contactInfo: eSigncontact,
      signatureLength: 16000,
    });
  } else {
    Placeholder({
      pdfDoc,
      reason: `Digitally signed by ${eSignName} for ${reason}`,
      location: 'n/a',
      name: eSignName,
      contactInfo: eSigncontact,
      signatureLength: 16000,
    });
  }
  const withPlaceholder = Buffer.from(await pdfDoc.save());
  const pdf = await new SignPdf().sign(withPlaceholder, p12Signer);
  return { pdf, seal };
}

/**
 * Seal a PDF.
 *
 * @param {Buffer} pdfBytes - the document (already flattened, unless append-only)
 * @param {boolean} appendOnly - a BetterSign identity signed it: the seal must
 *   be one appended revision
 * @param {object} doc - the contracts_Document (JSON), for the tenant's certificate
 * @param {string} [reason] - who signed, for the p12 seal's /Reason
 * @param {boolean} [certificate] - this is the completion certificate
 * @param {string} [filename] - kept in the BetterSign signing record
 * @returns {Promise<{pdf: Buffer, sig?: Buffer, seal: object}>} `sig` is the
 *   BetterSign proof (bs-service-identity only); `seal` is what to store as
 *   the document's Seal / CertificateSeal (without the `.sig` URL)
 */
export async function sealPdf({
  pdfBytes,
  appendOnly = false,
  doc,
  reason = '',
  certificate = false,
  filename,
}) {
  const pfx = pfxFor(doc);
  const backend = pfx.tenant ? P12 : process.env.SEAL_BACKEND || P12;
  if (backend === P12) {
    return sealWithP12({ pdfBytes, appendOnly, reason, certificate, pfx });
  }
  if (backend !== BS_SERVICE_IDENTITY) {
    throw new Error(`unknown SEAL_BACKEND ${JSON.stringify(backend)}`);
  }
  try {
    return await sealWithService({ pdfBytes, appendOnly, filename });
  } catch (err) {
    if (process.env.SEAL_FALLBACK !== P12 || !pfx.base64) throw err;
    console.log(
      JSON.stringify({
        event: 'seal_fallback',
        docId: doc?.objectId,
        certificate,
        error: err.message,
      })
    );
    const res = await sealWithP12({ pdfBytes, appendOnly, reason, certificate, pfx });
    return { ...res, seal: { ...res.seal, fallback: true } };
  }
}

// Upload a seal's `.sig` (if it has one) as `<pdfName>.sig` and return the
// seal to store on the document, with its URL.
export async function storeSeal({ sig, seal }, pdfName) {
  if (!sig) return seal;
  const file = await parseUploadFile(`${pdfName}.sig`, sig, 'application/octet-stream');
  const sigUrl = getSecureUrl(file?.url)?.url;
  if (!sigUrl) throw new Error('could not store the seal proof');
  return { ...seal, sigUrl };
}
