# BetterSign API (`/api/v1`)

OpenSign's API for the **BetterSign desktop app**. The app holds the user's
VLAD and keys and talks to OpenSign directly: no browser, no bs-id. It proves
who it is by signing a challenge with the identity's `/keys/primary`, and
OpenSign checks that signature through the BetterSign verifier
(`verify.bettersign.ing`, BetterSignApps `server/OrgIdP/bs-verifier`).

bs-id stays for passkey sign-in on the website only.

Base URL: `https://docsign-bettersign-api.fly.dev/api/v1`

Code: `apps/OpenSignServer/cloud/customRoute/bsapi/`.

## 1. Sign-in

### What a VLAD signs: the canonical signed message

**Every VLAD sign-in signs the same form**, the canonical to-be-signed bytes
(TBS) of a bs-message, exactly what bs-auth signs (BetterSignApps
`crates/bs-message/src/message.rs` `build_tbs`). This API's sign-in and
upload statements use it, and any new VLAD login should too: an identity's
key then only ever signs one shape, which names who it's from, which key,
who it's for and what kind of content it is, so a signature made for one
purpose or one server can't be replayed as another.

```
TBS = DOMAIN_SEP ‖ sender_vlad ‖ Varbytes(sender_key_path)
      ‖ receiver_vlad ‖ Varbytes(content_type) ‖ Varbytes(body)
```

| Part | Value here |
| --- | --- |
| `DOMAIN_SEP` | the 21 ASCII bytes `bettersign-message-v2` (no length, no terminator) |
| `sender_vlad` | the signing identity's VLAD, in its wire encoding (self-delimiting; the same bytes as the `vlad` hex). Must equal the statement's `vlad` |
| `sender_key_path` | `/keys/primary` |
| `receiver_vlad` | this server's VLAD, `receiverVlad` from `/auth/challenge` (`BS_API_RECEIVER_VLAD`) |
| `content_type` | `application/vnd.bettersign.login+cbor` for sign-in, `application/vnd.bettersign.docsign+cbor` for uploads |
| `body` | the statement CBOR (below), unchanged |

`Varbytes(x)` is `x`'s length as an unsigned LEB128 varint (shortest form),
then `x`. The signature is a **Multisig** by `/keys/primary` over the TBS bytes
themselves, with no extra hash. The verifier gets `nonce = hex(TBS)`.

Send either:

- `statement`: the body only. OpenSign builds the TBS from it, so if your
  bytes differ anywhere the signature just doesn't verify (`401`).
- `message`: the full TBS you signed. OpenSign inspects it before asking the
  verifier and refuses anything not exactly in this form, from you, to this
  server, for this content type, with no trailing bytes: `400
  invalid_statement`, naming the part (`domain separator`, `sender_vlad`,
  `sender_key_path`, `receiver_vlad`, `content_type`, `body`, `trailing
  bytes`). Easier to debug.

Both may be sent; then `statement` must be the message's body.

The desktop app refuses to sign anything that isn't this layout with its own
VLAD, `/keys/primary` and an allow-listed content type.

```
Desktop app                          OpenSign                              bs-verifier
  POST /auth/challenge {vlad}  ─────▶  linked VLAD? store 32B challenge (60 s, single use)
                               ◀─────  {challengeId, challenge, origin, rp, receiverVlad, expiresAt}
  build bs-login v1 statement,
  sign it as a canonical signed
  message with /keys/primary
  POST /auth/token             ─────▶  check message + statement ── POST /verify {vlad, nonce: TBS, signature} ─▶
    {challengeId, statement|message, signature}       ◀─ 200 (current /keys/primary, log verified)
                               ◀─────  {access_token: "bso_…", expires_in: 1800}
  Authorization: Bearer bso_…  on every other call
```

### The statement

The same **bs-login v1** statement oauthService and apiDelegateService accept
(BetterSignApps `docs/Technical/extension-login-design.md` §6.3). It's a
canonical CBOR map (RFC 8949 §4.2.1 key order, shortest-form lengths) of
exactly nine keys:

| Key | Type | Value |
| --- | --- | --- |
| `v` | uint | `1` |
| `type` | text | `"bs-login"` |
| `vlad` | bytes | raw VLAD bytes (the `vlad` hex sent to `/auth/challenge`) |
| `origin` | text | `origin` from the challenge response (`https://docsign.bettersign.ing`) |
| `rp` | text | `rp` from the challenge response (`bs-opensign-api`) |
| `challenge` | bytes(32) | the challenge, base64url-decoded |
| `reqId` | bytes(16) | random per request |
| `extSignPub` | bytes(32) | the desktop install's own public key (audit only) |
| `iat` | uint | Unix seconds; must be within ±120 s of the server clock |

The identity signs it in the canonical signed message above (content type
`application/vnd.bettersign.login+cbor`). Send base64url:

```http
POST /api/v1/auth/token
{ "challengeId": "…", "statement": "<b64url CBOR>", "signature": "<b64url Multisig>" }
// or "message": "<b64url TBS>" in place of (or as well as) "statement"
```

(An earlier draft signed `SHA-256("bs-login/v1/statement\n" ‖ statement)`.
That is no longer accepted.)

### What OpenSign checks

1. The challenge exists, hasn't expired and hasn't been used. It's taken
   atomically, so one challenge gives at most one token, even under a race.
   Any attempt uses it up; a failed one needs a new challenge.
2. What was signed is the canonical signed message from that challenge's VLAD
   to our `receiverVlad`, with `/keys/primary` and the login content type.
3. The statement is a well-formed bs-login v1 statement for that challenge's
   VLAD, our `origin` and `rp`, that challenge, with a fresh `iat`.
4. The verifier's `/verify` returns 200 for `{vlad, nonce: hex(TBS),
   signature}`. Anything else fails. A verifier 503 (it couldn't resolve the
   log) is returned as `503 verifier_unavailable`, so the app can retry; it
   never counts as a pass.
5. The VLAD is still linked to an account (section 3).

The token lasts `BS_API_TOKEN_TTL_S` (30 min). Only its SHA-256 is stored, and
no OpenSign (Parse) session is created: handlers act for the account with the
master key and explicit owner / signer checks. The link is checked on every
call, so unlinking a VLAD ends its tokens immediately. `POST /auth/logout`
revokes the token.

The `rp` sent to the verifier is `BS_API_RP`, the same value statements must
name.

## 2. Endpoints

Errors are `{ "error": "<code>", "message": "…" }`.

| Method & path | Returns |
| --- | --- |
| `POST /auth/challenge` `{vlad}` | `{challengeId, challenge, origin, rp, receiverVlad, expiresAt}`, also for a VLAD with no active link; `403 not_linked` only for a broken link (two active rows, or a missing account); `503 not_configured` if `BS_API_RECEIVER_VLAD` is malformed |
| `POST /auth/token` | `{access_token, token_type, expires_in, expires_at}`; `403 not_linked` (signature good, no active link: the VLAD is recorded for an admin, section 3), `401 access_denied`, `400 invalid_challenge`/`invalid_statement`, `503 verifier_unavailable` |
| `POST /auth/logout` | 204 |
| `GET /me` | `{vlad, user: {id, email, name}}` |
| `GET /documents?role=owner\|signer&status=…&limit=&skip=` | `{results: [Document], limit, skip}`. `status`: `draft`, `in_progress`, `completed`, `declined`, `expired`. `limit` ≤ 100 |
| `GET /documents/:id` | `Document` if you own it or are a signer, else 404 |
| `GET /documents/:id/file?version=current\|original` | the PDF. `X-Content-SHA256` is its hash |
| `POST /documents/:id/signatures` | your desktop-signed PDF (section 5). `201` + `Document` + `signedSha256`; `409` with `stale_base`, `already_signed`, `not_your_turn`, `not_a_signer`, `completed`, `expired`…; `400 not_appended`/`no_signature`; `401 access_denied`; `503 verifier_unavailable` |

```jsonc
// Document
{
  "id": "…", "name": "…", "description": null, "note": null,
  "status": "in_progress", "role": "owner",
  "owner": { "email": "…", "name": "…" },
  "signers": [{ "id": "…", "email": "…", "name": "…", "signed": false,
                 "signedWithBetterSign": false }],
  "appendOnly": false,            // a BetterSign identity has signed (section 5)
  "canSign": true,                // your turn, now
  "cannotSignReason": null,       // else not_your_turn, already_signed, not_a_signer, …
  "myFields": [                   // where to put your signature (when canSign)
    { "page": 1, "type": "signature", "x": 50, "y": 100, "width": 150, "height": 50 }
  ],
  "sendInOrder": false, "declineReason": null, "declinedBy": null,
  "expiresAt": "…", "createdAt": "…", "updatedAt": "…"
}
```

`myFields` are in PDF points from the **top-left** of the page's crop box, as
OpenSign stores them. In PDF user space (origin bottom-left) a field's
rectangle is `[x, top - y - height, x + width, top - y]` with
`top = cropBox.y + cropBox.height`. Rotated pages need the same compensation
OpenSign's `getWidgetPosition` applies.

## 3. Linking a VLAD to an account

A VLAD signs in only to an existing account an admin linked it to. The same
list serves the website's Sign in with BetterSign (`bsidlogin`). It's the
`bs_Identity` class (master key only), read by `utils/bsIdentity.js`:
`{ vlad, UserId, Label, Active, LastSeenAt }`. The VLAD's active row
(`Active: true`) gives the account; with none, it's blocked. A save hook keeps
`Active` false unless it's set, refuses an active row with no account, and
allows one active row per VLAD (turn the old link off before turning a new one
on). If there are ever two, for example from a direct database write, nobody
signs in until one is off. (The old `BS_ID_USERS` env list is no longer read;
migration `20261115140000-move_bs_id_users_to_bs_identity.cjs` moved it into
`bs_Identity`.)

A VLAD that proves itself (its `/auth/token` signature verifies, or bs-id
vouches for it at Sign in with BetterSign) but has no active link is refused
and recorded: a new row with `Active: false`, no account, `Label`
`Sign-in attempt` and `LastSeenAt`; later attempts bump `LastSeenAt`.

Admins manage links on the Users page (BetterSign identities), through the
cloud functions `bsidentitylist`, `bsidentitysave` and `bsidentitydelete`
(`cloud/parsefunction/bsIdentityAdmin.js`). An admin sees links to accounts in
their tenant plus unassigned rows, and can link only to accounts in their
tenant.

Or with the master key:

```sh
curl -X POST "$SERVER/app/classes/bs_Identity" \
  -H "X-Parse-Application-Id: $APP_ID" -H "X-Parse-Master-Key: $MASTER_KEY" \
  -H 'content-type: application/json' \
  -d '{"vlad":"<lower-case hex>","Label":"Alice desktop","Active":true,"ACL":{},
       "UserId":{"__type":"Pointer","className":"_User","objectId":"<user id>"}}'
# turn off: PUT …/bs_Identity/<id> {"Active":false}
```

`bs_Identity`, `bs_ApiChallenge` and `bs_ApiToken` are created master-key
only by migration `20261114120000-create_bettersign_api_classes.cjs`, and
`bs_ApiConfig` (the generated receiver VLAD) by
`20261115120000-create_bs_apiconfig.cjs`.

## 4. Configuration (Fly secrets)

| Variable | Default | |
| --- | --- | --- |
| `BS_VERIFIER_URL` | `https://verify.bettersign.ing` | |
| `BS_VERIFIER_SECRET` | none | the verifier droplet's `BS_VERIFIER_SECRET`. **Required in production** |
| `BS_API_ORIGIN` | `https://docsign.bettersign.ing` | the `origin` statements must name, and the website that emailed links open |
| `BS_API_RP` | `bs-opensign-api` | the `rp` statements must name |
| `BS_API_RECEIVER_VLAD` | generated | this server's VLAD (hex wire encoding, starts `8724`): the `receiver_vlad` every signed message must name. Unset: the first sign-in generates one (`8724` + 32 random bytes, not a real identity), stores it in `bs_ApiConfig` so every machine and restart uses it, and loads it into this variable. Set but malformed: sign-in and uploads return `503 not_configured` |
| `BS_API_TOKEN_TTL_S` | `1800` | |

## 5. Signing on the desktop

The desktop app pulls the PDF, signs it locally (lopdf appends a signature
field, `bs-pades` appends the PAdES signature, both incremental updates), and
uploads the result. The signature belongs to the VLAD, not to OpenSign's
server certificate.

```
GET  /documents/:id                → canSign, myFields
GET  /documents/:id/file           → PDF bytes, X-Content-SHA256 (= base)
     sign locally: field + PAdES, appended
POST /documents/:id/signatures     ← { pdf, statement | message, signature }
```

```http
POST /api/v1/documents/:id/signatures
{ "pdf": "<base64 of the signed PDF>",
  "statement": "<b64url CBOR bs-docsign statement>",
  "signature": "<b64url Multisig by /keys/primary>" }
```

### The upload statement (bs-docsign v1)

Canonical CBOR, like the sign-in statement, but its own type and content
type, so neither can be used as the other:

| Key | Type | Value |
| --- | --- | --- |
| `v` | uint | `1` |
| `type` | text | `"bs-docsign"` |
| `vlad` | bytes | raw VLAD bytes (the signed-in identity) |
| `origin` | text | `https://docsign.bettersign.ing` |
| `rp` | text | `bs-opensign-api` |
| `docId` | text | the document id |
| `base` | bytes(32) | SHA-256 of the file you downloaded (`X-Content-SHA256`) |
| `file` | bytes(32) | SHA-256 of the file you upload |
| `reqId` | bytes(16) | random |
| `iat` | uint | Unix seconds, within ±120 s |

Signed in the canonical signed message (section 1), content type
`application/vnd.bettersign.docsign+cbor`. As with sign-in, send `statement`
or the full `message`.

### What OpenSign checks

1. It's your turn: you're a signer with a pending field, the document is sent,
   not completed, declined or expired, and earlier signers are done when it's
   sent in order.
2. What was signed is the canonical signed message from you to us with the
   docsign content type, and the statement names you, this site, this
   document, the current file (`base`) and exactly the uploaded bytes
   (`file`), and is fresh.
3. The upload **starts with the current file byte for byte** (only appended
   to), and the appended part contains a signature whose `ByteRange` covers
   the whole file. A changed base is `409 stale_base`: download again.
4. The verifier accepts the statement's signature (`/verify`).
5. It's stored only if nobody else's signature landed since the file you
   signed. Every signing, online or desktop, commits with one atomic
   compare-and-swap on the document's `SignRevision`
   (`PDF.js commitAtRevision`), so of two signers working from the same
   version, one wins and the other gets `409 stale_base` (online:
   "This document changed since you opened it"). The loser's uploaded file is
   deleted.

Then it's recorded like any signature (audit trail `Signed`, with `Vlad` and
`SignedWith: "BetterSign"`), plus an entry in the document's `VladSignatures`.
If the document is sent in order, the next signer gets the "your turn to
sign" email the browser would otherwise send, with a link to `BS_API_ORIGIN`.

`VladSignatures` and `SignRevision` can only be changed with the master key
(`DocumentBeforesave`): a client that could clear `VladSignatures` could get a
desktop signature rewritten away.

Not checked yet: that the PAdES signature inside the PDF is cryptographically
valid and made by a key the VLAD's log authorises. That needs `bs-pades`
verification on the server, for example as a verifier endpoint. Until then,
the bs-docsign statement is what binds the upload to the identity.

### Append-only from then on

Once a document has a VLAD signature, nothing may rewrite it:

- **Online signers.** The signing page loads the PDF with `@cantoo/pdf-lib`
  (a maintained, API-compatible pdf-lib fork) in incremental mode, so their
  drawn signature is appended, and it flattens every field except signature
  fields (`apps/OpenSign/src/utils/appendOnlyPdf.js`). `signPdf` refuses a PDF
  that doesn't extend the current file.
- **Completion.** OpenSign's seal is appended without flattening
  (`apps/OpenSignServer/utils/appendOnlyPdf.js` `sealAppendOnly`). The
  completion certificate is a separate PDF, as before.

The final PDF carries every desktop signature, the online signers' drawn
signatures, and OpenSign's seal over the whole, each still verifiable.
Documents without a VLAD signature are signed exactly as before.

Viewers judge which changes are allowed after a signature. Drawing on a page
after a desktop signature may show as "modified after signing" in Acrobat,
even though that signature still verifies for its revision. Not yet tested
against Acrobat or `bs-pades` verification.

## 6. Tests

```sh
cd apps/OpenSignServer
npm run test:bsapi              # unit: statements, append-only signing, emails (no database)
npm run test:bsapi:integration  # the API end to end: in-process server, mock verifier, MongoDB
cd ../OpenSign && npm test      # the signing page's append-only helpers
```

The integration specs run the server on `localhost:8080/app` (where
`Utils.js` expects to reach itself), so that port must be free, and a mock
verifier on `:8799`. `mongodb-runner exec` downloads and starts MongoDB.
`.github/workflows/bettersign-tests.yml` runs all three on pull requests.
