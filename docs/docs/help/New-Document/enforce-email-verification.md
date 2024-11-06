---
sidebar_position: 4
title: Enforce email OTP verification
---

# How to Use the "Enable OTP Verification" Feature in OpenSign

The "Enable OTP Verification" feature in OpenSign is designed to add an extra layer of security to the document-signing process by verifying the signer’s email address. Here’s an in-depth look at how it works, when to use it, and its impact on the signing process.

## What is OTP Verification?

**OTP (One-Time Password) Verification** is a security feature that requires each signer to enter a unique code sent to their email address before they can sign the document. This ensures that only individuals with access to the specified email address can complete the signing process, adding an extra level of authenticity to each signature.

## How to Enable OTP Verification

1. **Prepare the Document**: 
   - Navigate to "Main Menu" -> "Request Signatures" & start by uploading the document you want to send for signatures in OpenSign.
   
2. **Add Signers**:
   - Specify the individuals who need to sign the document by entering their email addresses.

3. **Configure Security Settings**:
   - Click the "Advanced Options"
   - <img width="499" alt="image" src="https://github.com/user-attachments/assets/2f099abb-9421-49fb-b53a-7d9a610a8cfe"/>

   - Under **Security Settings**, find the option labeled "Enable OTP Verification."
   - Select **Yes** to activate OTP verification for this document.
   - <img width="1125" alt="image" src="https://github.com/user-attachments/assets/48d15c53-5eba-407c-8f81-1b17a47f32cb"/>

  


4. **Send the Document**:
   - Once all settings are configured, proceed to send the document to the signers.

## How OTP Verification Works for Signers

When OTP verification is enabled, here’s what the signing experience looks like for recipients:

1. **Email Notification**:
   - The signer receives an email notification prompting them to review and sign the document.
   
2. **OTP Verification Prompt**:
   - When the signer clicks the link to sign the document, they are required to enter a one-time password (OTP).
   - An OTP is sent to the signer’s email address. They must enter this code on the signing page to proceed.

3. **Document Signing**:
   - After entering the correct OTP, the signer gains access to the document and can proceed with adding their signature.

## Benefits of Using OTP Verification

- **Enhanced Security**: Only users with access to the designated email account can sign, reducing the risk of unauthorized access.
- **Reliable Authentication**: Verifying the signer’s email adds an additional level of validation, helping to ensure the authenticity of each signature.

## Impact on the Completion Certificate

Once the document is fully signed by all parties, OpenSign generates a **Completion Certificate**. This certificate contains detailed information about the signing process, including:

- **Signer’s Identity**: Each signer’s name and email address.
- **OTP Verification Status**: If OTP verification was enabled for the document, this is noted in the completion certificate. This notation serves as proof that the signer’s email address was verified before the document was signed.

This feature makes it clear that the signing process involved OTP verification, adding credibility to the document’s legal standing.

## When to Use OTP Verification

Consider enabling OTP verification in scenarios where:

- **Confidentiality** is critical: You want to ensure that only authorized individuals with access to the signer’s email can view and sign the document.
- **Authentication** is a priority: OTP adds an extra layer of verification, enhancing the document’s validity and security.
- **Compliance** is required: Certain regulations or standards may necessitate an additional verification step for document signing.

## Disabling OTP Verification

If OTP verification is unnecessary for a particular document:

1. Under the **Security Settings**, select **No** for the "Enable OTP Verification" option.
2. By disabling OTP verification, recipients can directly access and sign the document without needing to enter an OTP.

## Summary

The "Enable OTP Verification" feature in OpenSign is a powerful tool for ensuring that only verified individuals can sign documents. By sending a unique code to each signer’s email and requiring it before signing, this feature strengthens security and authenticity. The use of OTP verification is also recorded in the completion certificate, providing a clear record of email verification.

Use OTP verification whenever you need an added layer of email-based security and authenticity in your document signing workflows.

If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!
