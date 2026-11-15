// OpenSign's seal (utils/seal.js) against a stand-in for bs-service-identity's
// POST /v1/pades/sign. No database: `npx jasmine --config=spec/support/bsapi.json`.
import http from 'node:http';
import forge from 'node-forge';
import * as pdfLib from 'pdf-lib';
import { extendsPdf, signatureByteRanges } from '../../utils/appendOnlyPdf.js';
import { BS_SERVICE_IDENTITY, P12, pfxFor, sealFieldName, sealPdf } from '../../utils/seal.js';

const TOKEN = 'seal-spec-token-0123456789abcdef0123456789';

// A throwaway self-signed signing certificate.
function testP12() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 864e5);
  cert.validity.notAfter = new Date(Date.now() + 864e5);
  const attrs = [{ name: 'commonName', value: 'Test Signer' }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], 'test', { algorithm: '3des' });
  return Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary');
}

async function onePagePdf() {
  const doc = await pdfLib.PDFDocument.create();
  doc.addPage([300, 300]).drawText('seal me', { x: 20, y: 150 });
  return Buffer.from(await doc.save());
}

// The service: answers with the input plus an appended revision, unless a
// spec queues other answers in `service.replies`.
const service = {
  calls: [],
  replies: [],
};

function startService() {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const url = new URL(req.url, 'http://x');
      service.calls.push({
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
        headers: req.headers,
        body,
      });
      const send = (status, obj) => {
        res.writeHead(status, { 'content-type': 'application/json' });
        res.end(JSON.stringify(obj));
      };
      if (req.headers.authorization !== `Bearer ${TOKEN}`) {
        return send(401, { code: 'unauthorized', error: 'missing or wrong bearer token' });
      }
      const reply = service.replies.shift();
      if (reply) return send(reply.status, reply.body(body));
      const sealed = Buffer.concat([body, Buffer.from('\n% sealed\n')]);
      return send(200, {
        pdf: sealed.toString('base64'),
        sig: Buffer.from('proof').toString('base64'),
        record_id: 'rec1',
        plog_vlad: 'vlad1',
        log_id: 'log1',
        verification_key: 'zKey',
      });
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

describe('seal', () => {
  let server;
  let p12;
  let pdf;
  const saved = {};
  const ENV = [
    'SEAL_BACKEND',
    'SEAL_FALLBACK',
    'BS_SERVICE_IDENTITY_URL',
    'BS_SERVICE_IDENTITY_TOKEN',
    'PFX_BASE64',
    'PASS_PHRASE',
  ];

  beforeAll(async () => {
    for (const k of ENV) saved[k] = process.env[k];
    p12 = testP12();
    pdf = await onePagePdf();
    server = await startService();
  });

  afterAll(async () => {
    for (const k of ENV) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    await new Promise(resolve => server.close(resolve));
  });

  beforeEach(() => {
    service.calls = [];
    service.replies = [];
    Object.assign(process.env, {
      SEAL_BACKEND: BS_SERVICE_IDENTITY,
      BS_SERVICE_IDENTITY_URL: `http://127.0.0.1:${server.address().port}/`,
      BS_SERVICE_IDENTITY_TOKEN: TOKEN,
      PFX_BASE64: p12.toString('base64'),
      PASS_PHRASE: 'test',
    });
    delete process.env.SEAL_FALLBACK;
  });

  it('names the field without a dot, and differently on a retry', () => {
    const now = new Date('2026-11-15T10:11:12.345Z');
    expect(sealFieldName(now)).toBe('OpenSign seal 2026-11-15T10:11:12Z');
    expect(sealFieldName(now, 1)).toBe('OpenSign seal 2026-11-15T10:11:12Z 2');
    expect(sealFieldName(now)).not.toContain('.');
  });

  it("uses a tenant's own certificate over the deployment's", () => {
    const tenant = { ExtUserPtr: { TenantId: { PfxFile: { base64: 'AAA', password: 'pw' } } } };
    expect(pfxFor(tenant)).toEqual({ base64: 'AAA', passphrase: 'pw', tenant: true });
    expect(pfxFor({}).tenant).toBe(false);
  });

  it('seals with bs-service-identity and returns the proof', async () => {
    const res = await sealPdf({ pdfBytes: pdf, appendOnly: true, doc: {}, filename: 'a.pdf' });
    expect(service.calls.length).toBe(1);
    const call = service.calls[0];
    expect(call.path).toBe('/v1/pades/sign');
    expect(call.headers['content-type']).toBe('application/pdf');
    expect(call.query.format).toBe('json');
    expect(call.query.append_only).toBe('true');
    expect(call.query.filename).toBe('a.pdf');
    expect(call.query.field_name).toMatch(/^OpenSign seal \S+Z$/);
    expect(call.body.equals(pdf)).toBe(true);

    expect(extendsPdf(pdf, res.pdf)).toBe(true);
    expect(res.sig.toString()).toBe('proof');
    expect(res.seal).toEqual(
      jasmine.objectContaining({
        backend: BS_SERVICE_IDENTITY,
        recordId: 'rec1',
        logId: 'log1',
        plogVlad: 'vlad1',
        verificationKey: 'zKey',
        fieldName: call.query.field_name,
        sealedLength: res.pdf.length,
      })
    );
  });

  it('lets the service repair a document that is not append-only', async () => {
    await sealPdf({ pdfBytes: pdf, doc: {} });
    expect(service.calls[0].query.append_only).toBeUndefined();
  });

  it('refuses an answer that rewrote an append-only document', async () => {
    service.replies.push({
      status: 200,
      body: () => ({ pdf: Buffer.from('%PDF-rewritten').toString('base64'), sig: '' }),
    });
    await expectAsync(sealPdf({ pdfBytes: pdf, appendOnly: true, doc: {} })).toBeRejectedWithError(
      /rewrote earlier bytes/
    );
  });

  it('retries when the signing log moved or the field name was taken', async () => {
    service.replies.push(
      { status: 409, body: () => ({ code: 'abandoned', error: 'moved' }) },
      { status: 409, body: () => ({ code: 'field_exists', error: 'taken' }) }
    );
    const res = await sealPdf({ pdfBytes: pdf, appendOnly: true, doc: {} });
    expect(service.calls.length).toBe(3);
    const names = service.calls.map(c => c.query.field_name);
    expect(new Set(names).size).toBe(3);
    expect(res.seal.fieldName).toBe(names[2]);
  });

  it('gives up after three tries', async () => {
    for (let i = 0; i < 3; i++) {
      service.replies.push({ status: 409, body: () => ({ code: 'abandoned', error: 'moved' }) });
    }
    await expectAsync(sealPdf({ pdfBytes: pdf, doc: {} })).toBeRejectedWithError(/abandoned/);
    expect(service.calls.length).toBe(3);
  });

  it('fails the seal when the service fails and there is no fallback', async () => {
    process.env.BS_SERVICE_IDENTITY_TOKEN = 'wrong-token-wrong-token-wrong-token';
    await expectAsync(sealPdf({ pdfBytes: pdf, doc: {} })).toBeRejectedWithError(/401/);
  });

  it('falls back to the PFX only when SEAL_FALLBACK=p12', async () => {
    process.env.SEAL_FALLBACK = P12;
    service.replies.push({ status: 500, body: () => ({ code: 'internal', error: 'boom' }) });
    const res = await sealPdf({ pdfBytes: pdf, appendOnly: true, doc: {}, reason: 'A <a@x>' });
    expect(res.seal.backend).toBe(P12);
    expect(res.seal.fallback).toBe(true);
    expect(res.sig).toBeUndefined();
    expect(extendsPdf(pdf, res.pdf)).toBe(true);
    expect(signatureByteRanges(res.pdf).length).toBe(1);
  });

  it("seals a tenant's document with its own certificate, not the service", async () => {
    const doc = {
      ExtUserPtr: { TenantId: { PfxFile: { base64: p12.toString('base64'), password: 'test' } } },
    };
    const res = await sealPdf({ pdfBytes: pdf, doc, reason: 'A <a@x>' });
    expect(service.calls.length).toBe(0);
    expect(res.seal).toEqual(jasmine.objectContaining({ backend: P12, tenantCertificate: true }));
    expect(signatureByteRanges(res.pdf).length).toBe(1);
  });

  it('seals documents and certificates with the PFX on the p12 backend', async () => {
    process.env.SEAL_BACKEND = P12;
    for (const certificate of [false, true]) {
      const res = await sealPdf({ pdfBytes: pdf, doc: {}, reason: 'A <a@x>', certificate });
      expect(res.seal).toEqual(
        jasmine.objectContaining({ backend: P12, tenantCertificate: false })
      );
      expect(signatureByteRanges(res.pdf).length).toBe(1);
    }
    expect(service.calls.length).toBe(0);
  });

  it('refuses an unknown backend', async () => {
    process.env.SEAL_BACKEND = 'hsm';
    await expectAsync(sealPdf({ pdfBytes: pdf, doc: {} })).toBeRejectedWithError(
      /unknown SEAL_BACKEND/
    );
  });
});
