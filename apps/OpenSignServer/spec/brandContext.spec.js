import {
  LOCALHOST_HOSTNAMES,
  REMINDER_INTERVAL_MS,
  resolveDeploymentBrand
} from '../utils/brandContext.js';

// Centralized server defaults (issue #72): identical behavior, single source.
describe('REMINDER_INTERVAL_MS', () => {
  it('keeps the hourly scheduler interval', () => {
    expect(REMINDER_INTERVAL_MS).toBe(60 * 60 * 1000);
  });
});

describe('LOCALHOST_HOSTNAMES', () => {
  it('is the single shared localhost list', () => {
    expect([...LOCALHOST_HOSTNAMES]).toEqual(['localhost', '127.0.0.1']);
    expect(Object.isFrozen(LOCALHOST_HOSTNAMES)).toBe(true);
  });
});

describe('resolveDeploymentBrand defaults', () => {
  it('keeps the OpenSign brand behavior when nothing is set', () => {
    const brand = resolveDeploymentBrand({});
    expect(brand.brandKey).toBe('opensign');
    expect(brand.isOpenSign).toBe(true);
    expect(brand.productName).toBe('OpenSign™');
    expect(brand.assets.emailLogoUrl).toBe(
      'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png'
    );
    expect(brand.assets.pdfFontUrl).toBe('https://cdn.opensignlabs.com/webfonts/times.ttf');
    expect(brand.colors.emailAccent).toBe('#47a3ad');
    expect(brand.contacts.supportEmail).toBe('support@opensignlabs.com');
    expect(brand.urls.terms).toBe('https://www.opensignlabs.com/terms-and-conditions');
    expect(brand.urls.privacy).toBe('https://www.opensignlabs.com/privacy-policy');
  });

  it('honors the APP_NAME override', () => {
    const brand = resolveDeploymentBrand({ APP_NAME: 'Acme Sign' });
    expect(brand.productName).toBe('Acme Sign');
    expect(brand.senderName).toBe('Acme Sign');
  });
});
