---
sidebar_position: 8
title: Qualified Electronic Signature (QES)
---

OpenSign supports Qualified Electronic Signature (QES) workflows for eligible documents and supported countries through integrated qualified-signature providers. A QES is a specific type of electronic signature defined under applicable regulations, such as the EU eIDAS framework. Its availability and legal effect depend on the applicable law, the provider, and the signing process used.

> **Note:** Available countries, providers, and verification steps may change. The options shown in your OpenSign account and the selected provider's instructions are the source of truth for a particular signing session.

## Before you begin
- Prepare the PDF or document you want to send for signature.
- Confirm that the intended signer can use a supported QES provider for the selected country.
- Review any provider-specific identity verification requirements before sending the document.
- This feature is available only in paid plans.

## Configure a document for QES

1. Sign in to OpenSign.
2. Start a document workflow, such as **Request Signature**.
3. Upload the document you want signed.
4. Add the signer and provide the required recipient details.
5. Open **Advanced Settings** and enable **Qualified Signature**.
6. Select a country supported by the QES options displayed in OpenSign.
7. Add the **Qualified Signature** widget to the appropriate location in the document.
8. Review the document, signer details, and signature placement.
9. Send the document for signing.

> The exact labels or order of these controls may vary by OpenSign version or account configuration.

## Sign a document with QES

1. Open the signing request from OpenSign.
2. Review the document and any signing instructions.
3. When prompted, select a QES provider available for the selected country.
4. Follow the provider's instructions to authenticate and approve the signature. This may involve a provider app, identity check, PIN, or other verification step.
5. Return to the OpenSign signing flow if prompted and complete the signing process.
6. Wait for OpenSign to confirm that signing is complete.

### Example: Estonia with Smart-ID

If Estonia and Smart-ID are available in the signing flow:

1. Select **Estonia** as the country.
2. Choose **Smart-ID** as the QES provider.
3. Follow the on-screen Smart-ID instructions to approve the signing request.
4. Complete any required authentication in Smart-ID.
5. Return to OpenSign and confirm that the document has completed signing.

This example is illustrative. The available options and exact verification steps depend on the provider, the signer's eligibility, and the current integration.

## Verify the signed document

After signing:

1. Open or download the completed document from OpenSign.
2. Locate the qualified-signature stamp or signature information, if displayed in the document.
3. If you need to validate the cryptographic signature or certificate, use a suitable PDF signature-validation tool or the validation method recommended by the provider.
4. Check the validation result, signer certificate, and any reported warnings before relying on the signature.

A visible stamp alone does not prove that a signature is valid. For important documents, validate the digital signature and certificate using a trusted validation method.

## Troubleshooting

### I cannot see the Qualified Signature option

- Check whether QES is enabled and available for your account or deployment.
- Confirm that you are using a supported document workflow.
- Check whether a supported country and provider are available.
- Contact your OpenSign administrator or support team if the option should be available but is missing.

### My country or provider is not listed

Only choose from the countries and providers displayed in OpenSign. Availability can depend on the integration, account configuration, provider coverage, and applicable requirements. Contact your administrator or OpenSign support if you believe an expected option is missing.

### The provider verification did not complete

- Follow the provider's instructions and check that the provider app or authentication method is available.
- Confirm that you are approving the request associated with the correct signing session.
- Retry only if the provider and OpenSign indicate that it is safe to do so.
- If the issue persists, record the error message and contact the provider or OpenSign support.

### The document appears signed, but validation reports a problem

Download the completed file and validate its digital signature with a trusted PDF signature-validation tool or the provider's recommended method. A visual signature mark and cryptographic signature validation are different checks.

## Frequently asked questions

### Is a QES the same as a regular electronic signature?

No. QES is a specific category of electronic signature with additional requirements under the applicable legal framework. Not every electronic signature qualifies as a QES.

### Does selecting a country automatically make a signature qualified?

No. The signing process must satisfy the applicable requirements, and the selected provider must complete the required process. Follow the instructions presented by OpenSign and the provider.

### Can every signer use every QES provider?

No. Provider availability and eligibility requirements vary by country, provider, and signing method.

### Where can I get help?

For help with OpenSign configuration or a QES signing flow, contact **support@opensignlabs.com**. Include the workflow you used, the selected country and provider, and any error message. Do not send passwords, PINs, one-time codes, or other authentication secrets.

## Important information

This guide describes the general workflow and is not legal advice. The legal status of a signature depends on the applicable law, the provider, and whether the required signing and validation steps have been completed. Always follow the current instructions in OpenSign and from the selected provider.


