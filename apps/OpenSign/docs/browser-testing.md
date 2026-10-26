# Browser tests

The tour persistence browser tests run the production `Tour` and
`TourContentWithBtn` components in Chromium. Their fixture uses local-only team
and admin identities. Playwright intercepts all fixture API traffic and keeps
tour status in memory, so these tests do not connect to Parse, a deployment, or
production data.

Login/dashboard, template reports, request-signature placeholders, template
placeholders, self-sign, and Drive use the shared `src/utils/tourStatus.js`
save helper. Every save includes `X-Parse-Session-Token`; a custom
`sessionToken` HTTP header is not recognized by Parse's class REST API.
This authentication is required for ACL-protected team-user profiles.
The self-sign contact-book fallback keeps its original target class.
Draft document/template cloud saves also forward the authenticated session
to Parse, preserving object ACL enforcement.

Run the focused persistence unit tests with:

```sh
npm --prefix apps/OpenSign test -- src/utils/tourStatus.test.js
node --test apps/OpenSignServer/cloud/parsefunction/updateTourStatus.test.js
```

From the repository root, install the frontend dependencies and Chromium once:

```sh
npm --prefix apps/OpenSign ci
npx --prefix apps/OpenSign playwright install chromium
```

Run the browser regression tests with:

```sh
npm --prefix apps/OpenSign run test:browser
```

Run the frontend unit suite and formatting check with:

```sh
npm test
apps/OpenSign/node_modules/.bin/prettier --check apps/OpenSign/src/ee/utils/tourStatus.js apps/OpenSign/src/pages/Opensigndrive.jsx apps/OpenSign/tests/browser/tour-fixture.jsx apps/OpenSign/tests/browser/tour-persistence.pw.js apps/OpenSign/playwright.config.js apps/OpenSign/docs/browser-testing.md .github/workflows/browser-qa.yml
```

The Playwright config starts a local Vite server on `127.0.0.1:4179`. The
`Browser QA` GitHub Actions workflow runs the browser tests alongside the unit
suite and retains the HTML report and test results as workflow artifacts.
