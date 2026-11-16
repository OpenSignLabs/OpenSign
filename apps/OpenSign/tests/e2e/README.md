# Browser tests (Playwright)

These tests drive the real client against an isolated stack: client,
server and a Mongo that holds test data. **Never point them at a deployed
environment.** They use the master key of that stack to create documents,
and they change the admin password.

## Variables

All are required. The suite fails fast when one is missing.

- `E2E_BASE_URL`: client URL, for example `http://127.0.0.1:3105`.
- `E2E_SERVER_URL`: Parse server URL including the mount path.
- `E2E_APP_ID`: Parse application id.
- `E2E_MASTER_KEY`: master key of the isolated server.
- `E2E_ADMIN_EMAIL`: admin account that exists in the test data.
- `E2E_ADMIN_PASSWORD`: password the tests set for that account. It must
  satisfy the password policy.
- `E2E_BASE_DOC_ID`: id of an unsigned document with one signer. New
  documents are cloned from it.
- `E2E_SIGNER_EMAIL`: email of that signer. It must belong to an existing
  user, which the OTP login needs.

Optional:

- `E2E_CHROME_PATH` uses an installed Chrome instead of the Playwright one.
- `E2E_MAIL_LOG` is the log file of an SMTP sink that receives the stack's
  mail. The OTP tests read the code from it and are skipped without it.

## Run

```sh
cd apps/OpenSign
npx playwright test -c playwright.e2e.config.js
```

## What is covered

- Guest signer completion with a digitally signed PDF.
- Text, signature (draw and type), initials, image, stamp, radio,
  checkbox, dropdown, date and cells widgets.
- Linked fields and next-field navigation, including the last field.
- The radio value drawn in the signed PDF.
- Decline with a reason, the owner dashboard, the template editor and the
  sidebar reports (templates, documents by status, contactbook).
- The prefill modal: fill, pick a recipient, create the document.
- A 30-page template: leaving the editor, and DOM activity while idle.
- The password-reset copy indicator.
- The OTP login from the emailed link: request the code, verify it, wrong
  code and resend.

## Not covered yet

- QES, and whether the PDF editor bundle loads only on its own pages
  (needs a production build, not the Vite dev server).
