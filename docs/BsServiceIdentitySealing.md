# Plan: seal documents with bs-service-identity instead of the demo PFX

Written 2026-11-15 against BetterSignApps branch
`immediacy/rust-core-cloud-signing-feasibility-f8417b48` (commit `6bc46df`),
where the service lives at `server/bs-service-identity/`.

**Status (2026-11-15):**

- §2 is done in BetterSignApps PR #200 (deployed to Fly app
  `bs-service-identity`). `field_name` is supported; reason, location and
  contact are not (bs-sdk has no fields for them).
- §3 is done there too.
- §4.1–4.3, 4.5 and 4.6 are built here (`apps/OpenSignServer/utils/seal.js`).
  The real-binary test isn't: the specs use a stand-in for the service.
- §4.4 (showing the seal, verifying it, publishing the identity) is not built.
- §5 rollout hasn't started: `SEAL_BACKEND` is unset, so docsign still seals
  with the PFX.
- §7 went with the recommendations: a tenant's own PFX wins; a service failure
  fails the signing unless `SEAL_FALLBACK=p12`; the demo PFX stays.

## 1. What changes

Today docsign seals every completed document, and its completion certificate,
with one PKCS#12 (`PFX_BASE64` / `PASS_PHRASE`, the self-signed "OpenSign Demo
Signer", or a tenant's `PfxFile`) through `@signpdf`.

bs-service-identity is a Rust sidecar that gives docsign its own BetterSign
identity (a VLAD with a provenance log, published to the DHT by an embedded
peer) and a PAdES document-signing account. Over a private HTTP API with one
bearer token it can:

| Route | Use in docsign |
| --- | --- |
| `POST /v1/pades/sign?append_only=true&format=json` | **The replacement seal.** Body is the PDF; answer is `{pdf, sig, record_id, plog_vlad, log_id, verification_key, ...}` |
| `POST /v1/pades/verify` | Check a seal (ours or someone else's, given its `.sig`) |
| `GET /v1/identity` | Service VLAD, seal `log_id` and `verification_key` to publish |
| `POST /v1/sign-challenge` | Later: prove to the desktop app that it is talking to the real docsign |

### Why it isn't a drop-in

1. **Different seam.** `@signpdf` wants a `Signer` that returns a CMS over
   bytes we prepared. The service doesn't expose that: bs-sdk builds the CMS
   over a field *it* adds and registers the signature in its signing log. So we
   replace the *placeholder + `SignPdf`* step, not the `P12Signer`.
2. **A second artefact.** Each seal produces a `.sig` companion (~25 KB, the
   BetterSign proof). The PDF alone is still an ordinary PAdES file, but
   without the `.sig` nobody can do BetterSign verification later. We must
   store it.
3. **No `reason` / `name` / `contactInfo`.** The certificate CN is fixed per
   service (`BS_SERVICE_SIGNER_NAME`); the field is always named `BetterSign`.
4. **Field-name collision.** bs_core names the new field `BetterSign`, the
   same name the desktop app uses for VLAD signatures. On an append-only
   document a desktop signer has already signed, the seal would add a second
   field with the same fully qualified name, which PDF readers handle badly.
   `sealAppendOnly` avoids this today with a timestamped name.
5. **A new network dependency** on the last signer's request path.
6. **Trust is unchanged.** The certificate is self-issued, so Adobe shows it
   as untrusted, exactly like the demo PFX. Adobe trust still needs a
   CA-issued (AATL) certificate.

## 2. Changes needed in bs-service-identity first (BetterSignApps)

Small, and they make the integration clean rather than worked around:

- [ ] **`field_name=<name>` query param** for the added field (default stays
      `BetterSign`). docsign will pass `OpenSign seal <ISO time>`. Fixes item 4.
      *Workaround if this slips:* docsign adds a blank, uniquely named
      signature field itself as an incremental revision (cantoo, like
      `sealAppendOnly`) and calls with `field=<name>`.
- [ ] **`reason`, `location`, `contact_info` params** written into the
      signature dictionary, if bs-sdk's preflight can carry them. If it can't,
      we accept the loss (they are informational) and put the signer list in
      the audit certificate instead, which already has it.
- [ ] Merge the branch (the TODO's squash-merge and CI items) and **publish an
      image** from CI. The Dockerfile needs a BuildKit secret for the private
      `cryptidtech/bettersign` upstream, so it can't be built in docsign's
      `fly deploy`; push it to `registry.fly.io/<app>` or GHCR and deploy with
      `fly deploy --image`.

## 3. Deploy the service next to docsign

New Fly app `bs-service-identity`, same org and region (`sjc`) as
`docsign-bettersign-api`.

- [ ] `fly.toml` with **no `[http_service]`**: private network only.
- [ ] **Listen on `[::]:8789`**. Fly `.internal` is IPv6-only; Mongo failed
      the same way until it got `--ipv6` (DEPLOYMENT.md 4.3). docsign calls
      `http://bs-service-identity.internal:8789`.
- [ ] One machine, one volume mounted at the data dir (identity log,
      `pdf-signing/` keystore and log). The service takes an exclusive lock on
      the data dir, so it can't scale out; that's fine for our volume.
- [ ] `init` once (`fly ssh console`), with `--recovery-out` to a file we copy
      off the box and delete. **Record where the recovery key lives and who
      can get it** (in DEPLOYMENT.md's runbook, not the key itself).
- [ ] Secrets: `BS_SERVICE_TOKEN` (also set on `docsign-bettersign-api` as
      `BS_SERVICE_IDENTITY_TOKEN`), `BS_SERVICE_PRIMARY_KEY`, `BS_SERVICE_PDF_UNLOCK_KEY`
      (never change this one: it orphans the keystore),
      `BS_SERVICE_SIGNER_NAME=Better OpenSign`.
- [ ] Peer: without a public UDP port it runs through the bootstrap relay,
      which is enough to publish the log. Leave it relayed to start.
- [ ] Volume snapshots on (Fly daily) and a periodic off-box copy of
      `pdf-signing/`: losing it loses the signing log, and old seals can no
      longer be tied to it.
- [ ] Smoke test from the API machine: `GET /v1/identity` with the token,
      then seal and verify a fixture PDF.

## 4. docsign code changes (this repo)

### 4.1 One sealing module

New `apps/OpenSignServer/utils/seal.js`, the only place that knows how a
document is sealed:

```js
// sealPdf({ pdfBytes, appendOnly, filename, reason }) →
//   { pdf, seal: { backend, sig, recordId, logId, plogVlad, verificationKey } | { backend: 'p12' } }
```

- Backend chosen by `SEAL_BACKEND` = `bs-service-identity` | `p12` (default `p12`
  until rollout step 3). Config: `BS_SERVICE_IDENTITY_URL`, `BS_SERVICE_IDENTITY_TOKEN`.
- `bs-service-identity`: `POST {BS_SERVICE_IDENTITY_URL}/v1/pades/sign?append_only=true&format=json&field_name=...&filename=...`
  with `content-type: application/pdf`; decode `pdf`/`sig`; **check
  `extendsPdf(pdfBytes, pdf)` ourselves** (defence in depth on top of the
  service's own check).
- On `409 abandoned`, retry once. Timeout ~60 s. Any other failure throws
  (see 4.5 for fallback).
- `p12`: today's code, moved here unchanged (`sealAppendOnly` for
  append-only; placeholder + `SignPdf` otherwise), so the switch is one env
  var and reversible.
- Tenant `PfxFile`: if a tenant uploaded its own certificate, keep using it
  through the `p12` backend. A tenant who brought a (possibly CA-issued)
  certificate expects to see it on their documents. **(Decision for you; see
  §7.)**

### 4.2 Call sites to switch to `sealPdf`

| Where | Today | After |
| --- | --- | --- |
| `cloud/parsefunction/pdf/PDF.js` `finishSigning`, append-only branch | `sealAppendOnly` with the P12 | `sealPdf({appendOnly: true})` |
| same, normal branch | `processPdf` flattens **and** adds a placeholder in one save, then `SignPdf` | `processPdf` flattens only; then `sealPdf({appendOnly: false})` seals the flattened bytes as one appended revision |
| `PDF.js` `sendMailsaveCertifcate` | placeholder + `SignPdf` on the completion certificate | `sealPdf` on the generated certificate |
| `cloud/parsefunction/generateCertificatebydocId.js` | same, for on-demand certificates | `sealPdf` |

Also remove the `keystore_<random>.pfx` temp file juggling in
`finishSigning` (it writes the PFX to the working directory and passes the
path to `sendMailsaveCertifcate`) once the PFX is only read inside `seal.js`.

`DocumentHash` keeps being computed over the sealed output; nothing changes
there.

### 4.3 Store the proof

New fields on `contracts_Document` (Parse creates them on first write; add
them to the class-level field allow-lists if `getDocument` / afterFind filter
fields):

- `Seal`: `{ backend, recordId, logId, plogVlad, verificationKey, sigUrl }` for
  the signed PDF. `sigUrl` is a Parse file `signed_<name>.pdf.sig` uploaded next
  to the PDF.
- `CertificateSeal`: the same for the completion certificate.

Upload the `.sig` before `updateDoc` and delete it on the stale path, the same
way `finishSigning` already deletes an orphaned PDF upload.

### 4.4 Show and use it

- Download: offer the `.sig` next to the signed PDF (owner's document view),
  so a holder can verify offline with BetterSign tooling.
- A "Verify seal" Parse function that fetches the stored PDF and `.sig` and
  calls `/v1/pades/verify`; the UI shows `verified`, signing time, and
  "sealed by Better OpenSign (VLAD …)".
- Publish the service's identity VLAD, seal `log_id` and
  `verification_key` (from `/v1/identity`) on a static page or
  `/.well-known/bettersign.json`, since the identity log doesn't yet name the
  signing log (service TODO "link the signing log").

### 4.5 Failure handling

The seal runs on the last signer's request. If the service is down:

- **Recommended:** fail the request with a clear "couldn't seal, try again"
  and log it. Nothing is stored, so `SignRevision` is unchanged and the signer
  can simply retry. A document never ends up "completed" with a different seal
  type than the deployment claims.
- During rollout only, `SEAL_FALLBACK=p12` seals with the PFX instead and
  records `Seal.backend = 'p12'`, so these can be found and re-sealed later.

### 4.6 Tests

- `spec/bsapi/seal.spec.js`: unit tests against a stub service (same pattern
  as `spec/bsapi-integration/support/verifier.js`): JSON decoding, the
  `extendsPdf` check rejects a rewritten answer, `409 abandoned` retries once,
  401/5xx surface as errors, fallback only when enabled.
- Extend `spec/bsapi-integration` so completing a document with the stub
  stores `Seal`/`CertificateSeal` and the `.sig`, and append-only documents
  keep every earlier byte (the existing `appendOnlyPdf.spec.js` invariants).
- One opt-in real test (`BS_SERVICE_IDENTITY_URL` set): run the actual binary locally
  with `--no-peer`, seal a document that already carries a desktop VLAD
  signature, and verify **both** signatures still validate (bs_core verify for
  the VLAD one, `/v1/pades/verify` for the seal). This is the case most likely
  to go wrong.

## 5. Rollout

1. Service changes (§2) merged, image published.
2. Deploy the service (§3); smoke test from the API machine.
3. Ship docsign with `seal.js`, `SEAL_BACKEND=p12` (no behaviour change);
   tests green.
4. Staging: `SEAL_BACKEND=bs-service-identity`, `SEAL_FALLBACK=p12`. Complete
   documents of every kind: plain, append-only with a desktop signature,
   templates, completion certificates. Check them in Acrobat (valid, untrusted
   signer) and with `/v1/pades/verify`.
5. Production: same, watch `fly logs` for fallbacks for a week, then remove
   `SEAL_FALLBACK`.
6. Update `BetterSignUpdates.md`, DEPLOYMENT.md (§4 new component, §6 item 6
   on the certificate, §7 runbook: rotate, `rotate-signing-key`, backups,
   recovery-key custody) and `docs/BetterSignAPI.md`.

## 6. Later (not in this plan)

- Verify the PAdES signature inside desktop uploads in
  `cloud/customRoute/bsapi/signatures.js` (today it checks structure and the
  VLAD statement, not the CMS). Needs the desktop app to upload its `.sig`, or a
  CMS-only check.
- Mutual auth for `/api/v1`: docsign signs the desktop app's nonce with
  `/v1/sign-challenge`, so the app can check via bs-verifier that it's talking
  to the real docsign.
- Signed hash chain over the audit trail; countersigned upload receipts.
- Visible seal stamp (bs_core supports it; the HTTP API doesn't expose it).
- B-T timestamps / LTV; KMS custody (needs a bs-sdk change); the upstream
  lock-script gap that lets a stolen primary replace the recovery key.

## 7. Decisions needed

1. **Tenant PFX:** keep honouring a tenant's own `PfxFile` (recommended), or
   seal everything with the service?
2. **Service down:** fail the signing (recommended), or keep a permanent PFX
   fallback?
3. **Demo PFX:** delete it once production is stable, or keep it for local
   dev and tests only (recommended)?
4. **Adobe trust:** is a CA-issued certificate in scope? Neither option is
   trusted by Adobe today; the service would need to accept an externally
   issued certificate for its document key, which is new work upstream.
