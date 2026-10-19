const OPEN_SIGN_NAME = 'OpenSign™';
const OPEN_SIGN_EMAIL_LOGO = 'https://qikinnovation.ams3.digitaloceanspaces.com/logo.png';
const OPEN_SIGN_ACCENT = '#47a3ad';
const OPEN_SIGN_PDF_FONT = 'https://cdn.opensignlabs.com/webfonts/times.ttf';

const readValue = (value, key) => {
  if (!value) return undefined;
  if (typeof value.get === 'function') return value.get(key);
  return value[key];
};

const cleanText = (value, fallback = '', maxLength = 160) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return normalized ? normalized.slice(0, maxLength) : fallback;
};

const parseHttpUrl = value => {
  if (!value) return '';
  try {
    const url = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch {
    return '';
  }
};

const parseHostname = value => {
  const url = parseHttpUrl(value);
  return url ? new URL(url).hostname : '';
};

const parseEmail = value => {
  const email = cleanText(value, '', 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
};

const parseColor = (value, fallback) => {
  const color = cleanText(value);
  return /^#[\da-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
};

const normalizeBrandKey = value => cleanText(value, 'opensign', 80).toLowerCase();

const tenantFromDocument = document => {
  const extUser = readValue(document, 'ExtUserPtr');
  return readValue(extUser, 'TenantId');
};

const objectIdFromValue = value => {
  if (!value) return '';
  return cleanText(value?.id || readValue(value, 'objectId') || value?.objectId, '', 80);
};

const resolveDeploymentProfile = env => {
  return null;
};

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function resolveDeploymentBrand(env = process.env) {
  const deploymentProfile = resolveDeploymentProfile(env);
  const profile = deploymentProfile?.server;
  const configured = (key, fallback) =>
    deploymentProfile && Object.hasOwn(env, key) ? env[key] : env[key] || fallback;
  const configuredBrandKey = cleanText(env.APP_BRAND_KEY, '', 80).toLowerCase();
  const brandKey = normalizeBrandKey(configuredBrandKey || deploymentProfile?.brandKey);
  const isOpenSign = brandKey === 'opensign';
  const productName = cleanText(
    env.APP_NAME,
    cleanText(profile?.productName, isOpenSign ? OPEN_SIGN_NAME : brandKey, 80),
    80
  );
  const explicitEmailLogo = parseHttpUrl(
    configured('APP_EMAIL_LOGO_URL', profile?.assets?.emailLogoUrl)
  );
  const emailLogoUrl =
    explicitEmailLogo || (isOpenSign && productName === OPEN_SIGN_NAME ? OPEN_SIGN_EMAIL_LOGO : '');
  const accentFallback = isOpenSign ? OPEN_SIGN_ACCENT : '#334155';
  const deploymentId =
    cleanText(env.APP_DEPLOYMENT_ID, '', 80) ||
    parseHostname(env.APP_CANONICAL_URL) ||
    parseHostname(env.SERVER_URL) ||
    'unknown';

  return Object.freeze({
    ...(deploymentProfile
      ? {
          deploymentProfileKey: deploymentProfile.profileKey,
          webAuthnRpName: cleanText(profile?.webAuthnRpName, '', 120),
          billing: deploymentProfile.billing,
        }
      : {}),
    brandKey,
    deploymentId,
    isOpenSign,
    productName,
    senderName: cleanText(
      configured('APP_EMAIL_SENDER_NAME', profile?.senderName),
      productName,
      120
    ),
    assets: Object.freeze({
      emailLogoUrl,
      certificateLogoUrl: parseHttpUrl(
        configured('APP_CERTIFICATE_LOGO_URL', profile?.assets?.certificateLogoUrl)
      ),
      pdfFontUrl:
        parseHttpUrl(configured('APP_PDF_FONT_URL', profile?.assets?.pdfFontUrl)) ||
        (isOpenSign ? OPEN_SIGN_PDF_FONT : ''),
      useBundledCertificateLogo:
        isOpenSign && productName === OPEN_SIGN_NAME && !env.APP_CERTIFICATE_LOGO_URL,
    }),
    colors: Object.freeze({
      emailAccent: parseColor(
        configured('APP_EMAIL_ACCENT_COLOR', profile?.colors?.emailAccent),
        accentFallback
      ),
      certificatePrimary: parseColor(
        configured('APP_CERTIFICATE_PRIMARY_COLOR', profile?.colors?.certificatePrimary),
        isOpenSign ? '#003366' : '#334155'
      ),
    }),
    contacts: Object.freeze({
      supportEmail: parseEmail(
        configured(
          'APP_SUPPORT_EMAIL',
          profile?.contacts?.supportEmail ?? (isOpenSign ? 'support@opensignlabs.com' : '')
        )
      ),
      complaintsEmail: parseEmail(
        configured(
          'APP_COMPLAINTS_EMAIL',
          profile?.contacts?.complaintsEmail ?? (isOpenSign ? 'complaints@opensignlabs.com' : '')
        )
      ),
      abuseEmail: parseEmail(
        configured(
          'APP_ABUSE_EMAIL',
          profile?.contacts?.abuseEmail ?? (isOpenSign ? 'abuse@opensignlabs.com' : '')
        )
      ),
      billingEmail: parseEmail(
        configured(
          'APP_BILLING_EMAIL',
          profile?.contacts?.billingEmail ?? (isOpenSign ? 'hello@opensignlabs.com' : '')
        )
      ),
    }),
    urls: Object.freeze({
      app: parseHttpUrl(env.APP_CANONICAL_URL),
      publicProfile: parseHttpUrl(env.APP_PUBLIC_PROFILE_URL),
      terms: parseHttpUrl(
        configured(
          'APP_TERMS_URL',
          profile?.urls?.terms ??
            (isOpenSign ? 'https://www.opensignlabs.com/terms-and-conditions' : '')
        )
      ),
      privacy: parseHttpUrl(
        configured(
          'APP_PRIVACY_URL',
          profile?.urls?.privacy ??
            (isOpenSign ? 'https://www.opensignlabs.com/privacy-policy' : '')
        )
      ),
    }),
    digitalSignature: Object.freeze({
      name: cleanText(
        configured('APP_ESIGN_NAME', profile?.digitalSignature?.name),
        productName.replace(/™/g, '').trim(),
        120
      ),
      contact: parseEmail(
        configured(
          'APP_ESIGN_CONTACT',
          profile?.digitalSignature?.contact ||
            configured(
              'APP_SUPPORT_EMAIL',
              profile?.contacts?.supportEmail ?? (isOpenSign ? 'hello@opensignlabs.com' : '')
            )
        )
      ),
    }),
  });
}

export function resolveBrandContext({ tenant, deployment, document, env = process.env } = {}) {
  const resolvedDeployment = deployment || resolveDeploymentBrand(env);
  const resolvedTenant = tenant || tenantFromDocument(document);
  const tenantName = cleanText(readValue(resolvedTenant, 'WhiteLabelAppName'), '', 80);
  const hasTenantOverride = Boolean(tenantName && tenantName !== resolvedDeployment.productName);

  return Object.freeze({
    ...resolvedDeployment,
    tenantId: objectIdFromValue(resolvedTenant),
    productName: tenantName || resolvedDeployment.productName,
    senderName: tenantName || resolvedDeployment.senderName,
    assets: Object.freeze({
      ...resolvedDeployment.assets,
      emailLogoUrl: hasTenantOverride ? '' : resolvedDeployment.assets.emailLogoUrl,
      certificateLogoUrl: hasTenantOverride ? '' : resolvedDeployment.assets.certificateLogoUrl,
      useBundledCertificateLogo:
        !hasTenantOverride && resolvedDeployment.assets.useBundledCertificateLogo,
    }),
    tenantOverride: hasTenantOverride,
    source: hasTenantOverride ? 'tenant' : 'deployment',
  });
}

export function renderEmailLogo(context, { padding = false } = {}) {
  const logoUrl = parseHttpUrl(context?.assets?.emailLogoUrl);
  if (!logoUrl) return '';
  const style = padding ? " style='padding:20px'" : '';
  return `<img src='${escapeHtml(logoUrl)}' height='50'${style}/>`;
}

export function renderEmailHeading(context, heading) {
  const accent = parseColor(context?.colors?.emailAccent, '#334155');
  return `<div style='padding:2px;font-family:system-ui;background-color:${accent}'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>${escapeHtml(heading)}</p></div>`;
}

export function renderAutomatedEmailFooter(context, senderEmail = '') {
  const productName = escapeHtml(context?.productName || '');
  const sender = escapeHtml(senderEmail);
  const senderText = sender
    ? ` For any queries regarding this email, please contact the sender ${sender} directly.`
    : '';
  return `<div><p>This is an automated email from ${productName}.${senderText}</p></div>`;
}

export function renderDocumentEmail({ context, heading, contentHtml, senderEmail = '' }) {
  return (
    "<html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background-color:white'>" +
    `<div>${renderEmailLogo(context, { padding: true })}</div>` +
    renderEmailHeading(context, heading) +
    `<div>${contentHtml}</div></div>` +
    renderAutomatedEmailFooter(context, senderEmail) +
    `</div></body></html>`
  );
}

export function renderComplaintFooter(context, extUserId = '', senderEmail = '') {
  const productName = escapeHtml(context?.productName || '');
  const complaintsEmail = parseEmail(context?.contacts?.complaintsEmail);
  if (!complaintsEmail) {
    return `<p style="font-size: 13px; color:grey; text-align: center;">If you think this email is inappropriate or spam, you may file a complaint with ${productName}.</p>`;
  }

  const traceUserId = cleanText(extUserId, 'unknown', 80);
  const deploymentId = cleanText(context?.deploymentId, 'unknown', 80);
  const tenantId = cleanText(context?.tenantId, 'not available', 80);
  const sendingAccountEmail = parseEmail(senderEmail) || 'not available';
  const subject = encodeURIComponent(
    `Spam report for user ID ${traceUserId} [${deploymentId}] [${sendingAccountEmail}]`
  );
  const body = encodeURIComponent(
    `Hello Support Team,\n\nI'm reporting spam activity coming from a sender using your platform.\n\nThe user ID associated with the emails is: ${traceUserId}. Please investigate this account and take appropriate action.\n\nTrace information:\nDeployment: ${deploymentId}\nTenant ID: ${tenantId}\ncontracts_Users ID: ${traceUserId}\nSending account email: ${sendingAccountEmail}\n\nThank you.`
  );
  return `<p style="font-size: 13px; color:grey; text-align: center;">If you think this email is inappropriate or spam, you may file a complaint with ${productName} <a href="mailto:${escapeHtml(complaintsEmail)}?subject=${subject}&body=${body}">here</a>.</p>`;
}

export function buildCanonicalBrandUrl(context, pathname = '') {
  const appUrl = parseHttpUrl(context?.urls?.app);
  if (!appUrl) return '';
  const url = new URL(appUrl);
  url.pathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

export function colorToPdfRgb(value, fallback = '#003366') {
  const color = parseColor(value, fallback).slice(1);
  return [0, 2, 4].map(index => parseInt(color.slice(index, index + 2), 16) / 255);
}

export async function fetchBrandImage(
  value,
  { fetchImpl = globalThis.fetch, maxBytes = 2 * 1024 * 1024 } = {}
) {
  const url = parseHttpUrl(value);
  if (!url || typeof fetchImpl !== 'function') return null;

  try {
    const response = await fetchImpl(url, {
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    if (!response?.ok) return null;
    const declaredLength = Number(response.headers?.get?.('content-length') || 0);
    if (declaredLength > maxBytes) return null;
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > maxBytes) return null;

    const isPng =
      bytes.length >= 8 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
    const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!isPng && !isJpeg) return null;
    return { bytes, type: isPng ? 'png' : 'jpeg' };
  } catch {
    return null;
  }
}

export const OPEN_SIGN_BRAND_DEFAULTS = Object.freeze({
  productName: OPEN_SIGN_NAME,
  emailLogoUrl: OPEN_SIGN_EMAIL_LOGO,
  emailAccent: OPEN_SIGN_ACCENT,
  pdfFontUrl: OPEN_SIGN_PDF_FONT,
});
