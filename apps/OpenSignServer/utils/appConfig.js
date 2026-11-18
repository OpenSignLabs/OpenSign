import dotenv from 'dotenv';
import { getServerConfig } from './serverConfig.js';

// dotenv must load before getServerConfig runs: ESM evaluates imports before
// the entry point body, so relying on index.js's dotenv.config() leaves
// cloudServerUrl frozen to defaults on .env-file-only boots (#85).
dotenv.config({ quiet: true });

// Centralized server identity, limits and mail flags. cloudServerUrl is
// derived from the server config (PORT/PARSE_MOUNT), never hardcoded.
export const cloudServerUrl = getServerConfig(process.env).cloudServerUrl;
export const serverAppId = process.env.APP_ID || 'opensign';
export const appName = 'OpenSign™';
export const prefillDraftDocWidget = ['date', 'textbox', 'checkbox', 'radio button', 'image'];
export const prefillDraftTemWidget = [
  'date',
  'textbox',
  'checkbox',
  'radio button',
  'image',
  'dropdown',
];
export const MAX_NAME_LENGTH = 250;
export const MAX_NOTE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const color = [
  '#93a3db',
  '#e6c3db',
  '#c0e3db',
  '#bce3db',
  '#b8ccdb',
  '#ceb8db',
  '#ffccff',
  '#99ffcc',
  '#cc99ff',
  '#ffcc99',
  '#66ccff',
  '#ffffcc',
];

export const prefillBlockColor = 'transparent';

export const useLocal = process.env.USE_LOCAL ? process.env.USE_LOCAL.toLowerCase() : 'false';
export const smtpsecure =
  process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE.toLowerCase() === 'true'
    : process.env.SMTP_PORT && process.env.SMTP_PORT !== '465'
      ? false
      : true;
export const smtpenable =
  process.env.SMTP_ENABLE && process.env.SMTP_ENABLE.toLowerCase() === 'true' ? true : false;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
