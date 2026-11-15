// Desktop (VLAD) signing through POST /documents/:id/signatures, mixed with
// online signing through signPdf; append-only once a VLAD has signed.
import fs from 'node:fs';
import path from 'node:path';
import * as pdfLib from 'pdf-lib';
import {
  MASTER,
  ORIGIN,
  PARSE,
  PUBLIC,
  browserPdf,
  desktopSign,
  docRow,
  docsignStatement,
  getDoc,
  getFile,
  identity,
  link,
  mkContact,
  mkDoc,
  mkOwner,
  mkUser,
  req,
  sha,
  signPdf,
  tag,
  tokenFor,
  upload,
  verifyAll,
  waitFor,
  certificateOf,
} from './support/lib.js';
import { verifier } from './support/verifier.js';
import { shared } from './support/setup.js';
import { mailer } from '../../cloud/customRoute/bsapi/notify.js';
import { commitAtRevision } from '../../cloud/parsefunction/pdf/PDF.js';
import { presignedlocalUrl } from '../../cloud/parsefunction/getSignedUrl.js';
import { sealAppendOnly } from '../../utils/appendOnlyPdf.js';
import { P12Signer } from '@signpdf/signer-p12';
import { SignPdf } from '@signpdf/signpdf';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { startSealService, sealService } from './support/sealService.js';

const uploadedFiles = () => fs.readdirSync(path.resolve('files/files')).length;

describe('desktop signing', () => {
  let owner;
  let bob;
  let erin;
  let B;
  let E;
  let bobC;
  let erinC;
  let daveC;
  let mail;

  beforeAll(async () => {
    owner = await mkOwner(`owner-${tag()}@example.com`);
    bob = identity();
    erin = identity();
    verifier.register(bob);
    verifier.register(erin);
    const bobId = await mkUser(`bob-${tag()}@example.com`);
    const erinId = await mkUser(`erin-${tag()}@example.com`);
    await link(bob, bobId);
    await link(erin, erinId);
    bobC = await mkContact(owner.userId, 'Bob', `bob-${tag()}@example.com`, bobId);
    erinC = await mkContact(owner.userId, 'Erin', `erin-${tag()}@example.com`, erinId);
    daveC = await mkContact(owner.userId, 'Dave', `dave-${tag()}@example.com`);
    B = await tokenFor(bob);
    E = await tokenFor(erin);
  });

  beforeEach(() => {
    verifier.mode = 'ok';
    mail = [];
    mailer.send = async params => mail.push(params);
  });

  async function signedBy(id, auth, docId, name, opts) {
    const base = (await getFile(auth, docId)).bytes;
    const pdf = await desktopSign(base, name, shared.p12);
    return { base, pdf, stmt: docsignStatement(id, docId, base, pdf, {}, opts) };
  }

  describe('rejections', () => {
    let docId;
    let base;
    let pdf;

    beforeAll(async () => {
      docId = await mkDoc(owner, [bobC, daveC], { sendInOrder: true });
      ({ base, pdf } = await signedBy(bob, B, docId, 'bob'));
    });

    it('exposes the signer turn and fields', async () => {
      const d = (await getDoc(B, docId)).json;
      expect(d.canSign).toBe(true);
      expect(d.myFields[0]).toEqual(jasmine.objectContaining({ page: 1, x: 50, y: 100 }));
    });

    it('a base that is not the current file: 409 stale_base', async () => {
      const r = await upload(B, docId, pdf, docsignStatement(bob, docId, Buffer.alloc(1), pdf));
      expect(r.status).toBe(409);
      expect(r.json.error).toBe('stale_base');
    });

    it('a full rewrite: 400 not_appended', async () => {
      const rewritten = Buffer.from(await (await pdfLib.PDFDocument.load(pdf)).save());
      const r = await upload(B, docId, rewritten, docsignStatement(bob, docId, base, rewritten));
      expect(r.status).toBe(400);
      expect(r.json.error).toBe('not_appended');
    });

    it('appended bytes without a signature: 400 no_signature', async () => {
      const noSig = Buffer.concat([base, Buffer.from('\n% comment\n')]);
      const r = await upload(B, docId, noSig, docsignStatement(bob, docId, base, noSig));
      expect(r.status).toBe(400);
      expect(r.json.error).toBe('no_signature');
    });

    const bad = [
      ['for other bytes', (b, p, id) => docsignStatement(bob, id, b, p, { file: sha(b) })],
      ['for another document', (b, p) => docsignStatement(bob, 'someOtherId', b, p)],
      ['by someone else', (b, p, id) => docsignStatement(erin, id, b, p)],
      [
        'that is stale',
        (b, p, id) => docsignStatement(bob, id, b, p, { iat: Math.floor(Date.now() / 1000) - 900 }),
      ],
      [
        'signed for another receiver',
        (b, p, id) =>
          docsignStatement(bob, id, b, p, {}, { msg: { receiverVlad: '8724' + 'ee'.repeat(38) } }),
      ],
    ];
    for (const [name, make] of bad) {
      it(`a statement ${name}: 401`, async () => {
        const r = await upload(B, docId, pdf, make(base, pdf, docId));
        expect(r.status).toBe(401);
      });
    }

    it('a full signed message with the login content type: 400', async () => {
      const contentType = 'application/vnd.bettersign.login+cbor';
      const stmt = docsignStatement(
        bob,
        docId,
        base,
        pdf,
        {},
        { send: 'message', msg: { contentType } }
      );
      const r = await upload(B, docId, pdf, stmt);
      expect(r.status).toBe(400);
      expect(r.json.message).toMatch(/content_type/);
    });

    it('a non-signer is refused', async () => {
      const r = await upload(E, docId, pdf, docsignStatement(erin, docId, base, pdf));
      expect([404, 409]).toContain(r.status);
    });

    it("when the verifier can't decide: 503", async () => {
      verifier.mode = '503';
      const r = await upload(B, docId, pdf, docsignStatement(bob, docId, base, pdf));
      expect(r.status).toBe(503);
      expect((await docRow(docId)).VladSignatures).toBeUndefined();
    });

    it('when the verifier refuses our secret: 502 verifier_misconfigured', async () => {
      verifier.mode = 'bad_secret';
      const r = await upload(B, docId, pdf, docsignStatement(bob, docId, base, pdf));
      expect(r.status).toBe(502);
      expect(r.json.error).toBe('verifier_misconfigured');
      expect((await docRow(docId)).VladSignatures).toBeUndefined();
    });
  });

  describe('desktop first, then online', () => {
    let docId;
    let signed;

    beforeAll(async () => {
      docId = await mkDoc(owner, [bobC, daveC], { sendInOrder: true });
    });

    it('accepts the desktop signature and emails the next signer', async () => {
      const s = await signedBy(bob, B, docId, 'bob');
      signed = s.pdf;
      const r = await upload(B, docId, s.pdf, s.stmt);
      expect(r.status).toBe(201);
      expect(r.json.appendOnly).toBe(true);
      expect(r.json.status).toBe('in_progress');
      expect(r.json.signers[0].signedWithBetterSign).toBe(true);
      expect(r.json.signedSha256).toBe(sha(s.pdf).toString('hex'));

      expect(mail.length).toBe(1);
      expect(mail[0].recipient).toMatch(/^dave-/);
      // The link opens the website, not this API's host.
      const link = `${ORIGIN}/login/${Buffer.from(
        `${docId}/${mail[0].recipient}/${daveC}`
      ).toString('base64')}`;
      expect(mail[0].html).toContain(link);
    });

    it('stores exactly the upload and records it', async () => {
      expect((await getFile(B, docId)).bytes.equals(signed)).toBe(true);
      const row = await docRow(docId);
      expect(row.VladSignatures.length).toBe(1);
      expect(row.VladSignatures[0].vlad).toBe(bob.vlad);
      expect(row.VladSignatures[0].fileSha256).toBe(sha(signed).toString('hex'));
      expect(row.SignRevision).toBe(1);
      expect(row.AuditTrail).toContain(
        jasmine.objectContaining({ Activity: 'Signed', Vlad: bob.vlad, SignedWith: 'BetterSign' })
      );
    });

    it('refuses a second signature from the same signer', async () => {
      const s = await signedBy(bob, B, docId, 'bob2');
      const r = await upload(B, docId, s.pdf, s.stmt);
      expect(r.status).toBe(409);
      expect(r.json.error).toBe('already_signed');
    });

    it('refuses an online signer who rewrites the file', async () => {
      const current = (await getFile(B, docId)).bytes;
      const r = await signPdf(docId, daveC, await browserPdf(current, false));
      expect(r.json?.result?.status).not.toBe('success');
      expect((await getFile(B, docId)).bytes.equals(signed)).toBe(true);
    });

    it('accepts an online signer who appends, then seals append-only', async () => {
      const current = (await getFile(B, docId)).bytes;
      const r = await signPdf(docId, daveC, await browserPdf(current, true));
      expect(r.json?.result?.status).toBe('success');
      const done = await waitFor(async () => (await getDoc(B, docId)).json.status === 'completed');
      expect(done).toBe(true);

      const final = (await getFile(B, docId)).bytes;
      expect(final.subarray(0, signed.length).equals(signed)).toBe(true);
      const sigs = verifyAll(final);
      expect(sigs.length).toBe(2);
      expect(sigs.every(s => s.ok)).toBe(true);
      expect(final.length - sigs[1].end).toBeLessThanOrEqual(2);
      expect(await certificateOf(docId)).toBeTruthy();
    });
  });

  describe('online first, then desktop last', () => {
    it('keeps order and completes on the desktop signature', async () => {
      const docId = await mkDoc(owner, [daveC, erinC], { sendInOrder: true });
      const early = (await getDoc(E, docId)).json;
      expect(early.canSign).toBe(false);
      expect(early.cannotSignReason).toBe('not_your_turn');

      const plain = await signPdf(
        docId,
        daveC,
        await browserPdf((await getFile(E, docId)).bytes, false)
      );
      expect(plain.json?.result?.status).toBe('success');

      const s = await signedBy(erin, E, docId, 'erin');
      const r = await upload(E, docId, s.pdf, s.stmt);
      expect(r.status).toBe(201);
      expect(r.json.status).toBe('completed');
      expect(mail.length).toBe(0); // nobody left to tell
      expect(await certificateOf(docId)).toBeTruthy();

      const final = (await getFile(E, docId)).bytes;
      expect(final.subarray(0, s.pdf.length).equals(s.pdf)).toBe(true);
      const sigs = verifyAll(final);
      expect(sigs.length).toBe(2);
      expect(sigs.every(x => x.ok)).toBe(true);
    });
  });

  describe('two desktop signers', () => {
    it('keeps both signatures and the seal valid', async () => {
      const docId = await mkDoc(owner, [bobC, erinC]);
      const one = await signedBy(bob, B, docId, 'bob');
      expect((await upload(B, docId, one.pdf, one.stmt)).status).toBe(201);
      // Erin's app sends the full signed message rather than the statement.
      const two = await signedBy(erin, E, docId, 'erin', { send: 'message' });
      const r = await upload(E, docId, two.pdf, two.stmt);
      expect(r.json.status).toBe('completed');
      expect(await certificateOf(docId)).toBeTruthy();
      const sigs = verifyAll((await getFile(B, docId)).bytes);
      expect(sigs.length).toBe(3);
      expect(sigs.every(x => x.ok)).toBe(true);
    });

    it('when both sign the same version at once, one wins and the other must re-sign', async () => {
      const docId = await mkDoc(owner, [bobC, erinC]);
      const one = await signedBy(bob, B, docId, 'bob');
      const two = await signedBy(erin, E, docId, 'erin');
      const files = uploadedFiles();
      const results = await Promise.all([
        upload(B, docId, one.pdf, one.stmt),
        upload(E, docId, two.pdf, two.stmt),
      ]);
      expect(results.map(r => r.status).sort()).toEqual([201, 409]);
      expect(results.find(r => r.status === 409).json.error).toBe('stale_base');
      // Only the winner's file is kept.
      expect(uploadedFiles()).toBe(files + 1);

      const row = await docRow(docId);
      expect(row.VladSignatures.length).toBe(1);
      expect(row.AuditTrail.filter(a => a.Activity === 'Signed').length).toBe(1);

      // The loser downloads the new version and signs again.
      const [loserId, loserAuth, name] =
        results[0].status === 409 ? [bob, B, 'bob'] : [erin, E, 'erin'];
      const again = await signedBy(loserId, loserAuth, docId, name + '2');
      const r = await upload(loserAuth, docId, again.pdf, again.stmt);
      expect(r.status).toBe(201);
      expect(r.json.status).toBe('completed');
      expect(verifyAll((await getFile(B, docId)).bytes).every(x => x.ok)).toBe(true);
      expect(await certificateOf(docId)).toBeTruthy();
    });
  });

  describe('a desktop and an online signer at once', () => {
    it('never keeps both on top of the same file', async () => {
      const docId = await mkDoc(owner, [bobC, daveC]);
      const base = (await getFile(B, docId)).bytes;
      const desk = await signedBy(bob, B, docId, 'bob');
      const online = await browserPdf(base, false);
      const [d, o] = await Promise.all([
        upload(B, docId, desk.pdf, desk.stmt),
        signPdf(docId, daveC, online),
      ]);
      const desktopWon = d.status === 201;
      const onlineWon = o.json?.result?.status === 'success';
      expect(desktopWon !== onlineWon).toBe(true);
      const row = await docRow(docId);
      expect(row.AuditTrail.filter(a => a.Activity === 'Signed').length).toBe(1);
      expect(row.SignRevision).toBe(1);
    });
  });

  describe('commitAtRevision', () => {
    it('commits only at the expected revision', async () => {
      const docId = await mkDoc(owner, [bobC]);
      expect(await commitAtRevision(docId, 1, { Note: 'too new' })).toBe(false);
      expect(await commitAtRevision(docId, 0, { Note: 'first' })).toBe(true);
      expect(await commitAtRevision(docId, 0, { Note: 'stale' })).toBe(false);
      const row = await docRow(docId);
      expect(row.Note).toBe('first');
      expect(row.SignRevision).toBe(1);
    });
  });

  describe('first signing', () => {
    it("does DocumentBeforesave's bookkeeping (DocSentAt)", async () => {
      const docId = await mkDoc(owner, [daveC], { sent: false });
      const url = presignedlocalUrl((await docRow(docId)).URL);
      const current = Buffer.from(await (await fetch(url)).arrayBuffer());
      const r = await signPdf(docId, daveC, await browserPdf(current, false));
      expect(r.json?.result?.status).toBe('success');
      const row = await docRow(docId);
      expect(row.SignedUrl).toBeDefined();
      expect(row.DocSentAt).toBeDefined();
      expect(row.SignRevision).toBe(1);
      expect(await certificateOf(docId)).toBeTruthy();
    });
  });

  describe('the seal', () => {
    const fetchBytes = async url =>
      Buffer.from(await (await fetch(presignedlocalUrl(url))).arrayBuffer());
    const fileOf = async docId => {
      const row = await docRow(docId);
      return fetchBytes(row.SignedUrl || row.URL);
    };

    it('records a PFX seal by default', async () => {
      const docId = await mkDoc(owner, [daveC]);
      const current = await fileOf(docId);
      const r = await signPdf(docId, daveC, await browserPdf(current, false));
      expect(r.json?.result?.status).toBe('success');
      const row = await docRow(docId);
      expect(row.Seal).toEqual(
        jasmine.objectContaining({ backend: 'p12', tenantCertificate: false })
      );
      expect(row.Seal.sigUrl).toBeUndefined();
      expect(await certificateOf(docId)).toBeTruthy();
      expect((await docRow(docId)).CertificateSeal.backend).toBe('p12');
    });

    describe('with bs-service-identity', () => {
      let stop;
      const env = {};
      const KEYS = ['SEAL_BACKEND', 'BS_SERVICE_IDENTITY_URL', 'BS_SERVICE_IDENTITY_TOKEN'];

      beforeAll(async () => {
        for (const k of KEYS) env[k] = process.env[k];
        // The stand-in seals with the test certificate, so the result is a
        // real PDF signature the specs can check. Like the service, it
        // appends only when asked to and may re-save otherwise. A P12Signer
        // signs once (it consumes its buffer), so one per seal.
        let port;
        ({ port, stop } = await startSealService(async (pdf, query) => {
          const p12Signer = new P12Signer(shared.p12, { passphrase: 'test' });
          if (query.append_only === 'true') {
            return sealAppendOnly({
              pdfBytes: pdf,
              p12Signer,
              reason: 'seal',
              name: 'svc',
              contactInfo: '',
            });
          }
          const doc = await pdfLib.PDFDocument.load(pdf);
          pdflibAddPlaceholder({
            pdfDoc: doc,
            reason: 'seal',
            location: '',
            name: 'svc',
            contactInfo: '',
          });
          return new SignPdf().sign(Buffer.from(await doc.save()), p12Signer);
        }));
        Object.assign(process.env, {
          SEAL_BACKEND: 'bs-service-identity',
          BS_SERVICE_IDENTITY_URL: `http://127.0.0.1:${port}`,
          BS_SERVICE_IDENTITY_TOKEN: sealService.token,
        });
      });

      afterAll(async () => {
        for (const k of KEYS) {
          if (env[k] === undefined) delete process.env[k];
          else process.env[k] = env[k];
        }
        await stop();
      });

      beforeEach(() => {
        sealService.calls = [];
        sealService.mode = 'ok';
      });

      it('seals after a desktop signature, keeps it, and stores the proof', async () => {
        const docId = await mkDoc(owner, [bobC, daveC], { sendInOrder: true });
        const s = await signedBy(bob, B, docId, 'bob');
        expect((await upload(B, docId, s.pdf, s.stmt)).status).toBe(201);
        const current = (await getFile(B, docId)).bytes;
        const r = await signPdf(docId, daveC, await browserPdf(current, true));
        expect(r.json?.result?.status).toBe('success');

        const final = (await getFile(B, docId)).bytes;
        expect(final.subarray(0, s.pdf.length).equals(s.pdf)).toBe(true);
        const sigs = verifyAll(final);
        expect(sigs.length).toBe(2);
        expect(sigs.every(x => x.ok)).toBe(true);

        const docCall = sealService.calls[0];
        expect(docCall.query.append_only).toBe('true');
        expect(docCall.query.field_name).toMatch(/^OpenSign seal [^.]+Z$/);

        const row = await docRow(docId);
        expect(row.Seal).toEqual(
          jasmine.objectContaining({
            backend: 'bs-service-identity',
            recordId: 'rec-1',
            logId: 'log-1',
            fieldName: docCall.query.field_name,
            sealedLength: final.length,
          })
        );
        expect((await fetchBytes(row.Seal.sigUrl)).toString()).toBe('proof-1');

        expect(await certificateOf(docId)).toBeTruthy();
        const cert = await waitFor(async () => (await docRow(docId)).CertificateSeal);
        expect(cert.backend).toBe('bs-service-identity');
        expect(cert.sigUrl).toBeTruthy();
      });

      it('lets the service seal a flattened document', async () => {
        const docId = await mkDoc(owner, [daveC]);
        const current = await fileOf(docId);
        const r = await signPdf(docId, daveC, await browserPdf(current, false));
        expect(r.json?.result?.status).toBe('success');
        expect(sealService.calls[0].query.append_only).toBeUndefined();
        expect((await docRow(docId)).Seal.backend).toBe('bs-service-identity');
      });

      it("doesn't complete the document when the service is down", async () => {
        const docId = await mkDoc(owner, [daveC]);
        const current = await fileOf(docId);
        sealService.mode = '503';
        const r = await signPdf(docId, daveC, await browserPdf(current, false));
        expect(r.json?.result?.status).not.toBe('success');
        const row = await docRow(docId);
        expect(row.IsCompleted).not.toBe(true);
        expect(row.Seal).toBeUndefined();
        expect(row.SignRevision || 0).toBe(0);

        // The signer tries again once it's back.
        sealService.mode = 'ok';
        const again = await signPdf(docId, daveC, await browserPdf(current, false));
        expect(again.json?.result?.status).toBe('success');
        expect((await docRow(docId)).Seal.backend).toBe('bs-service-identity');
      });
    });
  });

  describe('server-only fields (VladSignatures, SignRevision, Seal, CertificateSeal)', () => {
    it('can be changed only by the server', async () => {
      const email = `owner-sess-${tag()}@example.com`;
      const userId = await mkUser(email);
      const docId = await mkDoc({ ...owner, userId }, [bobC]);
      await req('PUT', `${PARSE}/classes/contracts_Document/${docId}`, {
        headers: MASTER,
        body: { ACL: { [userId]: { read: true, write: true } } },
      });
      // Password sign-in is blocked (cloud/main.js beforeLogin); real users get
      // their session from /loginAs, as Sign in with BetterSign does.
      const login = await req('POST', `${PARSE}/loginAs`, {
        headers: MASTER,
        body: { userId },
      });
      const session = { ...PUBLIC, 'X-Parse-Session-Token': login.json.sessionToken };

      for (const body of [
        { VladSignatures: [] },
        { SignRevision: 0 },
        { Seal: { backend: 'p12' } },
        { CertificateSeal: { backend: 'p12' } },
      ]) {
        const r = await req('PUT', `${PARSE}/classes/contracts_Document/${docId}`, {
          headers: session,
          body,
        });
        expect(r.status).toBe(400);
        expect(r.json.code).toBe(119); // OPERATION_FORBIDDEN
      }
      const ok = await req('PUT', `${PARSE}/classes/contracts_Document/${docId}`, {
        headers: session,
        body: { Note: 'owners can still edit other fields' },
      });
      expect(ok.status).toBe(200);
    });
  });
});
