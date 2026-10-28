# Document-scoped access candidate for v3.0.1

Originally developed on OpenSignLabs/OpenSign tag v3.0.1, commit 62117d36e0ef087db3157139daf4c67b5d612580. The pull request is rebased onto staging at a6ecc434ccf306ca844837b954a22286f5a1e93d; the builds and all validation below were repeated on that upstream base. This is a review candidate, not an upstream-approved release or a complete security audit. It addresses the reproduced getDocument and fileupload behaviors described by CVE-2026-72689 / CVE-2026-72688 and the equivalent getsignedurl path.

## Behavior

Authenticated reads first use a Parse session and the document ACL, then expand related objects under the server's privileges because related classes have separate CLPs. The expansion refuses a changed document revision. Anonymous recipients require a 256-bit secret scoped to a document and recipient. Only the document creator (or trusted master-key code) may issue or revoke grants. Grant secrets are stored hashed; grant and upload-receipt records have empty ACLs and master-only mutation hooks.

Guest access is refused at or after ExpiryDate, on revocation, archive, decline, removal of the recipient, or invalid/tampered tokens. Grant lifetime is at most seven days and never beyond the document deadline. The document's OTP setting is respected; a grant cannot substitute for required recipient authentication.

fileupload and getsignedurl check both principal/grant and the requested file's relationship to the authorised record. An upload receipt permits an authenticated uploader to preview a new file before associating it with a document. Caller-supplied URLs are not automatically treated as permission to access those files. User-supplied URL fields in createdocumentfromapp are checked before its master-key save.

Local download JWTs carry document/grant scope and are rechecked at download time, including HEAD. Remote document downloads use an application proxy so an already-issued storage presigned URL is not exposed as a revocation bypass. Responses use private, no-store caching.

Signing checks expiry, recipient identity, replay/completion and revocation before PDF processing and immediately before persistence. A beforeSave guard rejects late Signed/Approved events, including master-key writes. A denial no longer updates the document DebugginLog. Authenticated archival access remains separate from an expired recipient link; previously downloaded copies cannot be recalled.

## Client and integration changes

createdocumentaccess accepts docId and recipientId (or the email of an already-bound recipient), and returns signUrl, token, grantId and expiresAt. revokedocumentaccess accepts docId and grantId. A signUrl contains a fifth base64 field holding the secret. The frontend stores it in tab-scoped sessionStorage, removes it from the address bar, and sends it only as guestToken to the document operations.

SMTP sendmailv3 rewrites legacy invitation links into server-issued links after checking the sender's ownership. Manual sharing uses the same issuer. Integrators such as EOSsign must request signUrl from createdocumentaccess instead of constructing their own unsigned link. Older unsigned links require reissue; weakening access checks to keep them working would reintroduce the problem.

## Migration and review boundaries

Deploy client and server together. Keep the old backend inaccessible when validating the candidate. Existing protected, attached files are supported via their record ACLs; legacy unattached uploads without provenance must be uploaded again. Review account-creation/OTP authentication, public-template enrollment, delegated sender roles, batch/Gmail/other invitation transports, storage adapters and concurrent multi-recipient signing independently before production. The demonstrated workflow is a normal SMTP invitation with local PDF storage, typed signatures and an invented recipient. Remote proxy tests use mocked storage; no live S3 service was tested. This candidate does not make a FEA or qualified-signature compliance claim.

A housekeeping/TTL policy for expired private grant records should be agreed before a high-volume rollout. Pre-existing short-lived unscoped file tokens may remain valid until their original expiry; they must not be presented as immediately revoked by the upgrade.

## Validation

From apps/OpenSignServer after npm ci:

~~~sh
npm run test:document-access
~~~

41 Node tests passed. Separate real Parse/Mongo HTTP tests passed 16 access-control scenarios. A real Chrome guest completed a typed signature; the resulting PDF CMS integrity was verified with OpenSSL (-noverify for the test's self-signed certificate). Repeated signing was denied. After expiring that document, a new browser context showed the unavailable page and requested no PDF; its previously-issued guest file URL was refused, while the owner recovered the identical signed PDF. The ordinary local EOSsign/OpenSign installation was not patched.

## References

- https://github.com/OpenSignLabs/OpenSign/issues/2218
- https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/72xxx/CVE-2026-72689.json
- https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/72xxx/CVE-2026-72688.json

These are confirmations of previously reported vulnerabilities. Original discovery credit remains with the researchers named in the existing records.
