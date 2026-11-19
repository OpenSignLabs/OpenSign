import { PDFDocument } from 'pdf-lib';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  appName,
  cloudServerUrl,
  color,
  emailRegex,
  flattenPdf,
  formatDateTime,
  formatTimeInTimezone,
  generateId,
  getSecureUrl,
  handleValidImage,
  mailTemplate,
  normalizeMailSubject,
  prefillBlockColor,
  prefillDraftDocWidget,
  prefillDraftTemWidget,
  randomId,
  replaceMailVaribles,
  sanitizeFileName,
  selectFormat,
  serverAppId,
  smtpenable,
  smtpsecure,
  stripHtml,
  useLocal,
} from '../Utils.js';
import { getServerConfig } from '../utils/serverConfig.js';

// Characterization: pins the observable behavior of Utils.js so the split
// into utils/<name>.js modules can be verified against the same contract.
describe('Utils facade contract', () => {
  it('exposes the documented app constants', () => {
    expect(appName).toBe('OpenSign™');
    expect(MAX_NAME_LENGTH).toBe(250);
    expect(MAX_NOTE_LENGTH).toBe(200);
    expect(MAX_DESCRIPTION_LENGTH).toBe(500);
    expect(prefillBlockColor).toBe('transparent');
    expect(prefillDraftDocWidget).toEqual(['date', 'textbox', 'checkbox', 'radio button', 'image']);
    expect(prefillDraftTemWidget).toContain('dropdown');
    expect(Array.isArray(color)).toBe(true);
    expect(color.length).toBeGreaterThan(0);
  });

  it('derives cloudServerUrl from the server config, not a hardcoded port', () => {
    expect(cloudServerUrl).toBe(getServerConfig(process.env).cloudServerUrl);
    if (!process.env.PORT && !process.env.PARSE_MOUNT) {
      expect(cloudServerUrl).toBe('http://localhost:8080/app');
    }
  });

  it('reads the server identity and mail flags from the environment', () => {
    if (!process.env.APP_ID) expect(serverAppId).toBe('opensign');
    if (!process.env.USE_LOCAL) expect(useLocal).toBe('false');
    if (!process.env.SMTP_ENABLE) expect(smtpenable).toBe(false);
    if (!process.env.SMTP_SECURE && !process.env.SMTP_PORT) expect(smtpsecure).toBe(true);
  });

  it('validates email addresses', () => {
    expect(emailRegex.test('a@b.com')).toBe(true);
    expect(emailRegex.test('not-an-email')).toBe(false);
  });

  it('normalizes the product name in mail subjects', () => {
    expect(normalizeMailSubject('OpenSign™ request')).toBe('opensign request');
    expect(normalizeMailSubject(null)).toBe('');
  });

  it('replaces mail variables in subject and body', () => {
    const out = replaceMailVaribles('Hi {{name}}', 'Doc {{title}} for {{name}}', {
      name: 'Ada',
      title: 'NDA',
    });
    expect(out).toEqual({ subject: 'Hi Ada', body: 'Doc NDA for Ada' });
  });

  it('sanitizes file names', () => {
    expect(sanitizeFileName('my doc (1).pdf')).toBe('mydoc1.pdf');
  });

  it('generates lowercase alphanumeric ids of the requested length', () => {
    expect(generateId(10)).toMatch(/^[a-z0-9]{10}$/);
  });

  it('generates numeric ids with the requested digit count', () => {
    const id = randomId(8);
    expect(id).toBeGreaterThanOrEqual(10000000);
    expect(id).toBeLessThanOrEqual(99999999);
  });

  it('strips html to text', () => {
    expect(stripHtml('<p>a</p><p>b</p>')).toBe('a\nb');
  });

  it('maps date format names', () => {
    expect(selectFormat('DD-MM-YYYY')).toBe('dd-MM-yyyy');
    expect(selectFormat('unknown')).toBe('MM/dd/yyyy');
  });

  it('formats time without a timezone as UTC', () => {
    expect(formatTimeInTimezone(new Date('2024-01-02T03:04:05Z'))).toContain('2024');
  });

  it('formats a date in the given timezone', () => {
    const out = formatDateTime(new Date('2024-01-02T03:04:05Z'), 'YYYY-MM-DD', 'UTC', false);
    expect(out).toContain('2024-01-02');
  });

  it('passes non-file urls through unchanged', () => {
    expect(getSecureUrl('https://cdn.example/a.pdf')).toEqual({ url: 'https://cdn.example/a.pdf' });
  });

  it('builds a sign-request mail with the sender and title', () => {
    const { subject, body } = mailTemplate({
      senderName: 'Ada',
      title: 'NDA',
      senderMail: 'a@b.com',
      organization: 'Acme',
      localExpireDate: 'tomorrow',
      note: 'hi',
      signingUrl: 'https://app.example/sign/1',
    });
    expect(subject).toContain('Ada');
    expect(subject).toContain('NDA');
    expect(body).toContain('https://app.example/sign/1');
  });

  it('flattens a widget pdf into static content', async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 200]);
    const form = doc.getForm();
    const field = form.createTextField('name');
    field.setText('Ada');
    field.addToPage(page, { x: 10, y: 10, width: 200, height: 40 });
    const bytes = await doc.save();
    const flat = await flattenPdf(bytes);
    const reloaded = await PDFDocument.load(flat);
    expect(reloaded.getForm().getFields().length).toBe(0);
  });

  it('normalizes non-prefill placeholders without network calls', async () => {
    const placeholders = [{ Role: 'signer', signerPtr: { className: '_User', objectId: 'u1' } }];
    const out = await handleValidImage(placeholders);
    expect(out).toEqual(placeholders);
  });
});
