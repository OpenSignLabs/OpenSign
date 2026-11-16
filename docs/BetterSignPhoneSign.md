# Sign on phone

A signer approves a signature or initials field in their BetterSign phone app
instead of drawing it. This replaced the phone-number box, which went through a
separate coordinator Worker (`bs-opensign-sign`, `REACT_APP_BS_SIGN_URL`) whose
phone-number registry no longer exists.

- [Rules](#1-rules)
- [How a request reaches the phone](#2-how-a-request-reaches-the-phone)
- [The flow](#3-the-flow)
- [Messages](#4-messages)
- [What docsign checks](#5-what-docsign-checks)
- [What the BetterSign app needs](#6-what-the-bettersign-app-needs)
- [Settings](#7-settings)
- [Limits and follow-ups](#8-limits-and-follow-ups)

## 1. Rules

1. **The button is only there for someone who signed in with BetterSign.**
   - `bsidlogin` records the session in `bs_WebSession` with the VLAD from the
     bs-id `id_token` (`apps/OpenSignServer/utils/bsWebSession.js`).
   - The browser keeps that session token as `bsSession` and shows the button
     only while it is the current session (`isBetterSignSession`, `PhoneSign.jsx`).
     Recipients who opened the emailed link never have it.
   - The server enforces the same rule. Without a BetterSign session,
     `bsphonesignstart` refuses (`119`).
2. **The request goes straight to the app over its own connection to the
   BetterSign relay.** If the app isn't reachable, the relay wakes the phone with
   FCM. There is nothing to type: the server already knows the VLAD.

## 2. How a request reaches the phone

The BetterSign relay (`https://relay.bettersign.ing`, BetterSignApps
`server/bs-fill-relay`) is the connection the app already uses for the browser
extension and Agent Gate. A request is addressed to the identity:
`to = sha256(VLAD bytes)`. Delivery follows the relay's "open app first, push
second" rule (BetterSignApps `client/browserExtension/docs/DELIVERY.md`):

| The app is… | What happens | `delivery` |
|---|---|---|
| open (long-polling `/v1/inbox`) | handed to it at once; the push is held 2 s and cancelled when the app marks it seen | `live`, then `seen` |
| closed or in the background | the relay sends a content-free FCM push; the app wakes and drains its inbox | `pushed` |
| over its push budget | stays in the inbox until the app next polls | `queued` |

The relay only stores opaque, signed envelopes, for at most the request's
lifetime (3 minutes here), and logs no bodies or ids.

Why the relay and not the P2P network: the push home that rings phones for P2P
messages (`server/bs-push-home`) isn't deployed, and the app gives P2P messages
no handler other than chat. The relay is live, has FCM on, and is what the app
already listens to.

## 3. The flow

```
browser                  docsign API                    relay                    phone app
  │ bsphonesignstart ──────▶ │                              │                          │
  │  {docId, fieldId, kind}  │ session → VLAD, doc access   │                          │
  │                          │ POST /v1/req {env, to, …} ──▶│── live, or FCM wake ────▶│
  │ ◀── {requestId, delivery}│                              │                          │ checks from = relay-key,
  │ bsphonesignpoll ───────▶ │ GET /v1/resp/{reqId} ───────▶│                          │ shows the doc + field,
  │   (repeat)               │   (long-poll 20 s)           │◀── POST /v1/resp ────────│ App Lock, signs
  │                          │ open, check, /verify         │                          │
  │ ◀── {status: signed, image}                             │                          │
  │ image → field (normal signing path)                     │                          │
```

Cloud functions (`apps/OpenSignServer/cloud/parsefunction/bsPhoneSign.js`):

| Function | Params | Returns |
|---|---|---|
| `bsphonesignstart` | `{ docId, fieldId, kind: "signature" \| "initials" }` | `{ requestId, delivery, expiresAt }` |
| `bsphonesignpoll` | `{ requestId, delivery? }` (the last `delivery` seen) | `{ status: "pending", delivery, retry? }`, `{ status: "signed", image }` (PNG data URL), `{ status: "denied" \| "expired" }` or `{ status: "failed", message }` |

`bsphonesignstart` errors:

| Code | When |
|---|---|
| `101` | No such document, or the app has never connected to the relay (`unknown-recipient`: "Open the app on your phone, then try again") |
| `119` | The session isn't from Sign in with BetterSign, or the user can't sign the document now. A signer needs a pending field and their turn (as the desktop API's `signerState`); a document you sign yourself needs to be yours and unfinished |
| `155` | The relay's rate limit. A sender the phone hasn't answered yet shares 10 requests an hour per identity |
| `100` | The relay is unreachable |

## 4. Messages

Encoding is the relay protocol's (BetterSignApps
`client/browserExtension/docs/PROTOCOL.md` §1.3): deterministic CBOR, binary as
byte strings, times in Unix seconds. On the relay's JSON API, envelopes are
base64url without padding.

### 4.1 Request (docsign → app)

`ct = application/vnd.bettersign.docsign-sign-request+cbor`

```jsonc
Envelope {
  header: { v: 1, ct, to: <32B sha256(vlad)>, from: <32B docsign relay key>,
            reqId: <16B>, iat, exp },          // exp − iat = 180
  body: <bytes: CBOR(DocsignSignRequest)>,
  sig: <64B Ed25519 by `from` over "bs-docsign/v1/env\n" ‖ CBOR(header) ‖ sha256(body)>
}

DocsignSignRequest {
  v: 1,
  reqId: <16B>,                       // = header.reqId
  origin: "https://docsign.bettersign.ing",
  rp: "bs-opensign-api",
  receiverVlad: <bytes>,              // docsign's VLAD, the receiver of the signed message
  docId: "…", fieldId: "…",
  kind: "signature" | "initials",
  challenge: <32B>,
  ephPub: <32B X25519>,               // seal the answer to this
  iat, exp                            // = the header's
}
```

The request is **signed, not sealed**. docsign doesn't know the identity's
`/keys/encrypt` key (`id.enc`), which only pairing hands out today. So the
request carries no document title: whoever holds the relay binding for the
identity can read it (§8). The app gets the title itself from the docsign API
(`GET /api/v1/documents/{docId}`, §6). Sealing the request to `id.enc` once
docsign can resolve that key is a follow-up.

### 4.2 Answer (app → docsign)

`ct = application/vnd.bettersign.docsign-sign-response+cbor`. It is an ordinary
relay envelope (PROTOCOL.md §1.5): `header { v, ct, to: sha256(reqId), from:
id.sign, reqId, iat, exp, enc }`, `ciphertext` HPKE-sealed to `ephPub`
(info `"bettersign-fill/v1/" ‖ ct`, aad `CBOR(header)`), and `sig` by `id.sign`
over `"bs-fill/v1/env\n" ‖ CBOR(header) ‖ sha256(ciphertext)`. This is the
same sealing the app already uses for `login-response`.

```jsonc
DocsignSignResponse {
  v: 1,
  reqId: <16B>,
  result: "ok" | "denied" | "error",
  reason?: "user" | "expired" | "locked" | …,
  statement?: <bytes>,   // iff ok: CBOR(bs-docsign-field statement), below
  vladSig?: <bytes>,     // iff ok: Multisig by /keys/primary over the signed message below
  image?: <bytes>        // iff ok: PNG of the signature or initials, ≤ 512 KiB
}
```

### 4.3 What the identity signs

A `bs-docsign-field` v1 statement:

```jsonc
{ v: 1, type: "bs-docsign-field", vlad: <bytes>, origin, rp,
  docId, fieldId, challenge: <32B>, reqId: <16B>,
  imageHash: <32B SHA-256 of the PNG in the answer>, iat }
```

`imageHash` puts the image that goes on the document under the VLAD signature.
The envelope around the answer can't vouch for it: HPKE base mode doesn't
authenticate the sender, and docsign doesn't know the app's `id.sign`.

It is wrapped in bs-message's canonical form, like every VLAD signature to
docsign (BetterSignUpdates.md, "What a VLAD signs to log in"):

```
"bettersign-message-v2" ‖ vlad ‖ Varbytes("/keys/primary") ‖ receiverVlad
‖ Varbytes("application/vnd.bettersign.docsign-field+cbor") ‖ Varbytes(statement)
```

The type and content type differ from `bs-login` and `bs-docsign`, so this
approval can't be replayed as a sign-in or an upload, or the other way round.

## 5. What docsign checks

On the answer (`bsphonesignpoll`):

1. The envelope's signature by `header.from`, the content type, `reqId`,
   `to = sha256(reqId)` and the time window. It then opens the envelope with the
   request's one-time key. The relay only accepts an answer from the key bound
   to the identity's `to`. `from` itself is the app's `id.sign`, which docsign
   doesn't know.
2. The statement names this VLAD, this site (`origin`, `rp`), the document, the
   field, the challenge and the request.
   - Its `imageHash` is the SHA-256 of the image in the answer.
   - Its `iat` falls while the request was open, allowing a minute of clock
     difference. It is judged against the request, not the time of the poll, so
     a verifier outage can't age out a good answer.
3. The image is a PNG of at most 512 KiB.
4. The verifier's `/verify` accepts `vladSig` over the canonical message for the
   VLAD's current `/keys/primary`. If the verifier is down, the poll stays
   `pending`; the relay keeps the answer until the request expires.

Before sending, `bsphonesignstart` also checks that the user can sign the
document now (the `119` row above), so the phone never rings for a finished
document.

The request row (`bs_PhoneSignRequest`, master key only) is saved before the
request is pushed. If the relay refuses it, the row is deleted. Once signed, the
row keeps the statement, signature and image.

The request's one-time X25519 key is stored encrypted:
- AES-256-GCM under a key derived from `MASTER_KEY`;
- bound to the request id;
- deleted when the request settles.

Unsigned rows are swept 10 minutes after they expire.

## 6. What the BetterSign app needs

None of this is in the app yet. Until it is, `bsphonesignstart` answers that
the app hasn't connected (the relay has no binding for the identity).

1. **Register with the relay for the identity, without a grant.** Today the app
   registers and polls only for relays named by a browser or agent grant
   (`fill_service.dart` `_relays`). For docsign it should register
   `to = sha256(vlad)` with its FCM token at `https://relay.bettersign.ing`, and
   long-poll `/v1/inbox` while open. Register as soon as the identity exists:
   the relay binds `to` to the first key that registers it (§8).
2. **Route `docsign-sign-request` to a new handler**, alongside the fill and
   agent content types. It must not require a `grantId`.
3. **Check the sender before showing anything:**
   - verify `sig` with `header.from`;
   - check `exp − iat ≤ 300` and the clock;
   - check `body.reqId == header.reqId` and `body.exp == header.exp`;
   - check that `header.from` equals the `pub` from `GET <docsign API>/api/v1/relay-key`,
     fetched over HTTPS from the docsign API the app already knows (as
     `opensign_client.dart` does), and that its `origin` equals `body.origin`.
   - check that the docsign API knows the document: `GET /api/v1/documents/{docId}`
     with the app's API token (it signs in with `opensign_auth.dart`). This also
     gives the title to show, which the request doesn't carry.
   A request that fails any check is dropped with no screen. Optionally,
   remember the key per origin and warn when it changes.
4. **Show it:** the origin, the document title (from step 3) and whether it's a
   signature or initials. Approval needs App Lock. Call `POST /v1/seen/{reqId}` when it's on
   screen, so the relay cancels the held push.
5. **On approve:**
   - render the image (`document_signing.dart` `generateInitialsPng`, or the
     saved signature);
   - build the statement (§4.3), with `imageHash` = SHA-256 of that PNG, and
     sign it with the identity's `/keys/primary`;
   - seal the answer to `ephPub`;
   - `POST /v1/resp/{reqId}`.
6. **On decline:** answer `result: "denied", reason: "user"`.

## 7. Settings

Server (`apps/OpenSignServer`, all optional):

| Setting | Default | Meaning |
|---|---|---|
| `BS_RELAY_URL` | `https://relay.bettersign.ing` | The relay |
| `BS_RELAY_SIGNING_KEY` | generated once, kept in `bs_ApiConfig` | docsign's relay key, an Ed25519 seed in hex. Published at `GET /api/v1/relay-key` |
| `BS_API_ORIGIN`, `BS_API_RP`, `BS_API_RECEIVER_VLAD` | as for the desktop API | What the statement must name (docs/BetterSignAPI.md) |
| `BS_VERIFIER_URL` | `https://verify.bettersign.ing` | Checks `vladSig` |

Migration `20261115180000-create_bs_phonesign_classes.cjs` creates
`bs_WebSession` and `bs_PhoneSignRequest`.

The frontend has no settings. `REACT_APP_BS_SIGN_URL` is no longer read.

## 8. Limits and follow-ups

- **Sessions from before this change aren't BetterSign sessions.** Someone
  signed in before the deploy has to sign in again to see the button.
- **The approval doesn't go into the document's audit trail as a VLAD
  signature yet.** The image is applied through the normal online signing path,
  so the completion certificate shows an ordinary signature. The statement and
  signature are kept in `bs_PhoneSignRequest`. Linking them to the audit entry
  (as the desktop API does with `Vlad`) is a follow-up.
- **`fieldId` isn't checked against the document's placeholders.** Self-signed
  documents only save their fields when signing finishes. The statement still
  binds the approval to the field the browser asked for.
- **Someone can claim a user's relay address first.** The relay binds `to` to
  the first key that registers it (trust on first use), and VLADs aren't secret:
  they're public identifiers, and the old `BS_ID_USERS` list is in this public
  repo's history. Someone who registers `sha256(vlad)` before the
  user's phone does:
  - receives that user's docsign requests: document and field ids, origin and
    kind, but no title;
  - blocks the real phone from registering (`bound-to-other-key`), so Sign on
    phone doesn't work for that user.

  They can't approve anything: the VLAD signature is checked. Closing this
  needs the relay to accept a binding only with proof of the VLAD's key (a
  relay change), or docsign sealing requests to `id.enc`. Until then, the app
  should register as soon as the identity exists.
- **The request isn't sealed** (§4.1).
- **The relay's unknown-sender budget** is 10 requests an hour per identity
  until the phone has answered docsign once.
