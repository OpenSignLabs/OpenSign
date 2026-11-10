# Browser tests

## PDF widget placement regressions

Drawing a text widget uses the page where the gesture starts, not the
scroll-selected page in the toolbar. When two pages are partially visible,
those page numbers can differ. The placement callback must use the supplied
page number for scaling, placeholder insertion/merging, and widget selection;
updating React page state does not update the callback's current closure.
Changing the toolbar page after drawing must not programmatically scroll the
PDF; the user's drawing position should remain visible.
Request-signature, template, and draft editors follow this rule.

Run the focused drawing and template placement tests with:

```sh
npm --prefix apps/OpenSign test -- src/components/pdf/RenderPdf.test.jsx src/pages/TemplatePlaceholder.test.jsx
```

These tests cover half-page scrolling, placement near the page bottom,
mixed page sizes, merging existing widgets, and the selected-page fallback
for click placement. They do not require a backend.

## Text widget auto-height regressions

Text and text-input widgets store their dimensions in PDF units, not rendered
screen pixels. Auto-height converts the scaled line height back to PDF units
and only grows the existing text axis for multiline values. Typing, deleting
lines, or clearing a value must not shrink a field. Rotated widgets grow their
width (the displayed text height) instead of their height.

Run the backend-free regression tests with:

```sh
npm --prefix apps/OpenSign test -- src/components/pdf/PlaceholderType.test.jsx
```

The tests cover mobile and desktop scales, fractional and normal line heights,
signer and self-sign layouts, and rotated text. For a visual check, open a
disposable signing document at mobile and desktop widths, enter a single-line
value, then add and remove multiple lines. The field must retain its original
height for a single line, grow only when needed, and retain the grown height
when lines are removed.

## Tour persistence

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
