import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Facade over the split utils/<name>.js modules. Every name below keeps the
// export surface the cloud functions, routes and migrations import from here,
// so existing `from '../../Utils.js'` imports keep working unchanged.
export {
  MAX_DESCRIPTION_LENGTH,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  appName,
  cloudServerUrl,
  color,
  emailRegex,
  prefillBlockColor,
  prefillDraftDocWidget,
  prefillDraftTemWidget,
  serverAppId,
  smtpenable,
  smtpsecure,
  useLocal,
} from './utils/appConfig.js';
export { normalizeMailSubject, replaceMailVaribles } from './utils/mailVars.js';
export { saveFileUsage, updateMailCount } from './utils/storageCounts.js';
export { generateId, randomId, sanitizeFileName } from './utils/fileNames.js';
export { flattenPdf } from './utils/pdfFlatten.js';
export { stripHtml } from './utils/textFormat.js';
export { formatDateTime, formatTimeInTimezone, selectFormat } from './utils/dateFormat.js';
export { getSecureUrl } from './utils/secureUrl.js';
export { mailTemplate } from './utils/mailTemplate.js';
export { handleValidImage } from './utils/placeholders.js';
