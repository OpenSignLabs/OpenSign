// nextSignerMail (cloud/customRoute/bsapi/notify.js): the "your turn to sign"
// email a desktop upload sends, as the browser does after an online signature.
import { nextSignerMail } from '../../cloud/customRoute/bsapi/notify.js';

const SITE = 'https://docsign.bettersign.ing';

function doc(overrides = {}) {
  return {
    objectId: 'doc1',
    Name: 'NDA',
    Note: 'Please sign',
    SendinOrder: true,
    ExpiryDate: { __type: 'Date', iso: '2026-12-01T12:00:00.000Z' },
    ExtUserPtr: {
      objectId: 'ext1',
      Name: 'Olive Owner',
      Email: 'owner@example.com',
      Company: 'ACME',
      TenantId: {},
    },
    Signers: [
      { objectId: 'c1', Email: 'first@example.com', Name: 'First' },
      { objectId: 'c2', Email: 'second@example.com', Name: 'Second' },
    ],
    Placeholders: [
      { Role: 'prefill', signerObjId: 'p0' },
      { Role: 'signer', signerObjId: 'c1' },
      { Role: 'signer', signerObjId: 'c2' },
    ],
    ...overrides,
  };
}

describe('nextSignerMail', () => {
  it('addresses the next signer in order, with a link to the website', () => {
    const m = nextSignerMail(doc(), 'c1', SITE);
    expect(m.recipient).toBe('second@example.com');
    expect(m.replyto).toBe('owner@example.com');
    expect(m.from).toBe('Olive Owner');
    expect(m.extUserId).toBe('ext1');
    expect(m.subject).toBe('Olive Owner has requested you to sign "NDA"');
    const link = `${SITE}/login/${Buffer.from('doc1/second@example.com/c2').toString('base64')}`;
    expect(m.html).toContain(link);
    expect(m.html).toContain('ACME');
  });

  it('sends nothing when the document is not in order, mail is off, or nobody is next', () => {
    expect(nextSignerMail(doc({ SendinOrder: false }), 'c1', SITE)).toBeNull();
    expect(nextSignerMail(doc({ IsSendMail: false }), 'c1', SITE)).toBeNull();
    expect(nextSignerMail(doc(), 'c2', SITE)).toBeNull();
    expect(nextSignerMail(doc(), 'unknown', SITE)).toBeNull();
  });

  it("uses the tenant's request template when it has one", () => {
    const d = doc();
    d.ExtUserPtr.TenantId = {
      RequestSubject: 'Sign {{document_title}}',
      RequestBody: '<p>Hi {{receiver_name}}, sign at {{signing_url}}</p>',
    };
    const m = nextSignerMail(d, 'c1', SITE);
    expect(m.subject).toBe('Sign NDA');
    expect(m.html).toContain('Hi Second, sign at https://docsign.bettersign.ing/login/');
  });

  it("prefers the document's own template, and its sender details", () => {
    const m = nextSignerMail(
      doc({
        RequestSubject: 'Doc subject {{sender_name}}',
        RequestBody: 'body',
        SenderName: 'Sam Sender',
        SenderMail: 'sam@example.com',
      }),
      'c1',
      SITE
    );
    expect(m.subject).toBe('Doc subject Sam Sender');
    expect(m.from).toBe('Sam Sender');
    expect(m.replyto).toBe('sam@example.com');
  });
});
