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

```
Desktop app                          OpenSign                              bs-verifier
  POST /auth/challenge {vlad}  ─────▶  linked VLAD? store 32B challenge (60 s, single use)
                               ◀─────  {challengeId, challenge, origin, rp, expiresAt}
  build bs-login v1 statement,
  sign its digest with /keys/primary
  POST /auth/token             ─────▶  check statement ── POST /verify {vlad, nonce, signature} ─▶
    {challengeId, statement, signature}                ◀─ 200 (current /keys/primary, log verified)
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

The identity signs
`digest = SHA-256("bs-login/v1/statement\n" ‖ statement)` with
`/keys/primary`, producing a **Multisig**. Send both base64url:

```http
POST /api/v1/auth/token
{ "challengeId": "…", "statement": "<b64url CBOR>", "signature": "<b64url Multisig>" }
```

### What OpenSign checks

1. The challenge exists, hasn't expired and hasn't been used. It's taken
   atomically, so one challenge gives at most one token, even under a race.
   Any attempt uses it up; a failed one needs a new challenge.
2. The statement is a well-formed bs-login v1 statement for that challenge's
   VLAD, our `origin` and `rp`, that challenge, with a fresh `iat`.
3. The verifier's `/verify` returns 200 for `{vlad, nonce: hex(digest),
   signature}`. Anything else fails. A verifier 503 (it couldn't resolve the
   log) is returned as `503 verifier_unavailable`, so the app can retry; it
   never counts as a pass.
4. The VLAD is still linked to an account (section 3).

The token lasts `BS_API_TOKEN_TTL_S` (30 min). Only its SHA-256 is stored.
Each token holds an OpenSign session for the account whose expiry is cut to
the token's. The link is checked on every call, so unlinking a VLAD ends its
tokens immediately. `POST /auth/logout` revokes the token and its session.

## 2. Endpoints

Errors are `{ "error": "<code>", "message": "…" }`.

| Method & path | Returns |
| --- | --- |
| `POST /auth/challenge` `{vlad}` | `{challengeId, challenge, origin, rp, expiresAt}`; `403 not_linked` |
| `POST /auth/token` | `{access_token, token_type, expires_in, expires_at}`; `401 access_denied`, `400 invalid_challenge`/`invalid_statement`, `503 verifier_unavailable` |
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
list serves the website's Sign in with BetterSign (`bsidlogin`). It lives in
`utils/bsIdentity.js`, which checks, in order:

1. the `bs_Identity` class (master key only). A row with `RevokedAt` set
   blocks the VLAD, even if the env list has it.
2. `BS_ID_USERS`, JSON `{ "<vladHex>": "<account email>" }`, the original list.

Link (or unlink) with the master key:

```sh
curl -X POST "$SERVER/app/classes/bs_Identity" \
  -H "X-Parse-Application-Id: $APP_ID" -H "X-Parse-Master-Key: $MASTER_KEY" \
  -H 'content-type: application/json' \
  -d '{"vlad":"<lower-case hex>","Label":"Alice desktop","ACL":{},
       "UserId":{"__type":"Pointer","className":"_User","objectId":"<user id>"}}'
# unlink: PUT …/bs_Identity/<id> {"RevokedAt":{"__type":"Date","iso":"<now>"}}
```

`bs_Identity`, `bs_ApiChallenge` and `bs_ApiToken` are created master-key
only by migration `20261114120000-create_bettersign_api_classes.cjs`.

## 4. Configuration (Fly secrets)

| Variable | Default | |
| --- | --- | --- |
| `BS_VERIFIER_URL` | `https://verify.bettersign.ing` | |
| `BS_VERIFIER_SECRET` | none | the verifier droplet's `BS_VERIFIER_SECRET`. **Required in production** |
| `BS_API_ORIGIN` | `https://docsign.bettersign.ing` | the `origin` statements must name |
| `BS_API_RP` | `bs-opensign-api` | the `rp` statements must name |
| `BS_API_TOKEN_TTL_S` | `1800` | |
| `BS_ID_USERS` | none | fallback link list (section 3) |

## 5. Signing on the desktop

The desktop app pulls the PDF, signs it locally (lopdf appends a signature
field, `bs-pades` appends the PAdES signature, both incremental updates), and
uploads the result. The signature belongs to the VLAD, not to OpenSign's
server certificate.

```
GET  /documents/:id                → canSign, myFields
GET  /documents/:id/file           → PDF bytes, X-Content-SHA256 (= base)
     sign locally: field + PAdES, appended
POST /documents/:id/signatures     ← { pdf, statement, signature }
```

```http
POST /api/v1/documents/:id/signatures
{ "pdf": "<base64 of the signed PDF>",
  "statement": "<b64url CBOR bs-docsign statement>",
  "signature": "<b64url Multisig by /keys/primary>" }
```

### The upload statement (bs-docsign v1)

Canonical CBOR, like the sign-in statement, but its own type and signing
domain, so neither can be used as the other:

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

`digest = SHA-256("bs-docsign/v1/statement\n" ‖ statement)`, signed with
`/keys/primary`.

### What OpenSign checks

1. It's your turn: you're a signer with a pending field, the document is sent,
   not completed, declined or expired, and earlier signers are done when it's
   sent in order.
2. The statement names you, this site, this document, the current file
   (`base`) and exactly the uploaded bytes (`file`), and is fresh.
3. The upload **starts with the current file byte for byte** (only appended
   to), and the appended part contains a signature whose `ByteRange` covers
   the whole file. A changed base is `409 stale_base`: download again.
4. The verifier accepts the statement's signature (`/verify`).
5. Just before storing, the document's file is re-read; if someone else's
   signature landed meanwhile, yours is refused with `409 stale_base` rather
   than replacing theirs. (This narrows the race, it doesn't close it: there's
   no compare-and-swap on the document row. Online signing has the same race
   today.)

Then it's recorded like any signature (audit trail `Signed`, with `Vlad` and
`SignedWith: "BetterSign"`), plus an entry in the document's `VladSignatures`.

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
