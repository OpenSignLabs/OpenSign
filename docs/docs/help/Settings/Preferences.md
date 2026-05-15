---
sidebar_position: 4
title: Preferences
---

# 🔧 Preferences

The **Preferences** page in **OpenSign™** allows users and administrators to tailor the signing experience to suit individual, team, or organizational needs. Below is a breakdown of all configurable options and what they control.

---

## 🚀 Steps to Navigate to Preferences

**Step 1:** Log in to your OpenSign account using valid credentials.

**Step 2:** Navigate to the **Settings** section and click on **Preferences**.

---

## 📌 Signature Types Control

The **Allowed Signature Types** section defines which signature methods are available to signers:

- ✅ **Draw**: Create a handwritten signature using a mouse, stylus, or finger.
- ✅ **Type**: Type your name and apply it using pre-set font styles.
- ✅ **Upload**: Upload a scanned or saved image of your signature.
- ✅ **Default**: Use the default signature stored under *My Signature* in settings.

⚙️ The options selected here determine what appears in the signature widget during document creation and signing. You can also change these preferences while creating a document.

---

## 🔄 Multi-Level Signature Type Control

**OpenSign™** introduces flexible control over signature options at three levels:

### 🏢 Organization-Level

Admins can enforce company-wide signing policies by restricting available signature methods platform-wide.

**Step 1:** Open the profile menu and select **Console Application** to launch the console.

**Step 2:** Once the Console Application loads, navigate to the **General** menu. Here, admins can configure the allowed signature types at the organization level.

All users created under your account will only see the signing methods you enable here in their **Preferences**. They will be restricted from using any methods you don't select.

**Example:**  
Adam, the administrator of your company account, disables the **Typed** signature option in the **Manage Signature Types** settings. As a result, Ursula, a team member, will no longer see the **Typed** signature option in her preferences.

Ursula can enable or disable any of the remaining three signature methods for each document she creates.

When she sends a document to Sofia, a signer, Sofia will only see the signature methods that Ursula selected during the document creation process.

**Note:** Managing **Signature Types** at the organization level is only available on the **Teams** plan. This feature is not included in the **Professional** or **Free** plans.

![Signature type setup console](https://github.com/user-attachments/assets/c8c3de19-e82e-464a-977b-cdf3fd12aed7)

### 👤 User-Level

Navigate to **Settings > Preferences** to configure user-level signature types.

If a user sets preferred types here, only those will appear when adding signature or initial widgets during document creation.


<img alt="signatures" src="https://github.com/user-attachments/assets/69d0851c-57f2-42e5-af6e-419f6d8821c2" />

### 📄 Document-Level

While creating a document, users can specify allowed signature types.

Only these will be available to the signer—useful for legal or regulatory requirements.

![Signature type setup signature widget](https://github.com/user-attachments/assets/d64510e1-df14-44fe-8020-45b17c612238)

---

## 🔔 Notify on Signatures

The document owner can choose to receive email notifications when a document is signed.

- **Yes** – Get notified each time a signer completes their part.  
- **No** – Turn off real-time signature notifications.

This setting can be adjusted while creating a document or template.

Regardless of this preference, a **final completion email**—including the signed document and completion certificate—is **always sent** to both the document owner and all signers.

**Note:** Notify on Signatures feature is only available on the **Professional** and higher plans—it is not included in the **Free** plan.

![Preferences setup](https://github.com/user-attachments/assets/5adad567-6c01-4766-9b10-db3f95ad65d3)

---

## 📬 Send in Order

Decide whether the document should be signed **sequentially** or **simultaneously** by multiple signers.

- **Yes** – Signers receive the document in a set order. The next signer gains access only after the previous one completes signing.
- **No** – All signers receive the document at once and can sign independently.

> Users can change this option while creating the document or a template.

---  

## Allow offline signing
Choose whether signers can submit a copy of this document signed using an external tool for owner review.
   - **Yes**: Signers will see a “Sign Offline” option, allowing them to upload an externally signed PDF and submit it to the document owner for approval.
   - On Approval: Once the owner approves the submission, the signer’s signing process will be marked as completed. After the document is approved by the owner, a notification email will be sent to the signer confirming that the document has been approved and their signing process is complete. At the same time, a request signature email will be triggered and sent to the next signer in the signing order.
   - On Declined: If the document is incorrectly filled out or improperly formatted, the owner can decline it and add comments. The signer can then use the same signing link that was initially shared to them to either re-upload a corrected offline file or continue the process using OpenSign’s online signing interface.
   
   - **No**: Signers can only sign within the app. The Sign Offline option will be hidden.

This feature is only available on paid plans.

---
## ✉️ Use profile name as sender

- **On** – When this option is enabled, your profile name will be used as the sender name in Request Signature and Document Completion emails.

- **Off** – When it is disabled, your SMTP email ID will be used as the sender name.

---
## 🚫 Enable Tour

The tour feature provides guidance for first-time users. You can turn this off for a cleaner, uninterrupted experience:

- **Yes** – Show onboarding tips. Enables guided tooltips for the signer during the signing process.
- **No** – Disable tour prompts *(recommended for experienced users)*. Speeds up the signing experience.

> Users can change this option while creating the document or a template.

💡 **Tip**: Disable if your users are already familiar with OpenSign™.

---
### 📧 Custom SMTP Configuration in OpenSign

OpenSign allows users to **send emails using their own SMTP settings**, including Gmail integration and third-party SMTP providers.

OpenSign now supports SMTP configuration at both the **organization level** and the **individual user level**.

To set up SMTP at the organization level, refer to the guide here:  
https://docs.opensignlabs.com/docs/help/User%20Menu/Console/globalSMTP

## 👤 SMTP at the User Level

Users can configure their own SMTP settings to send request-signature and completion emails using their personal mailbox.
These user-level settings will override the organization-level SMTP only if the admin has **enabled individual SMTP customization** under Console → General.

Use this option if you prefer sending emails directly from your own email address.

### To set up and enable user-level SMTP:

1. Go to **Settings**  
2. Select **Preferences**  
3. Choose one of the available SMTP options.
   
Once a user selects and configures any SMTP option, all emails will be sent using the user-level SMTP.

<img alt="smtp at user level" src="https://github.com/user-attachments/assets/27c459f3-5ae6-41e8-966d-43785e67f192" />

---
### 🔗 Connect to Gmail

Send request-signature emails directly from your **Gmail account**.

- Click **Connect to Gmail**  
- A popup will appear prompting you to sign in  
- Grant the required access permissions  
- Once authorized, OpenSign will send emails using your Gmail account

---

### ⚙️ Custom SMTP

Configure any third-party SMTP provider such as SMTP2GO or Mailgun.

- Click **Custom SMTP**  
- A popup will appear asking for your SMTP details:  
  - **Host:** SMTP server host (e.g., `mail.smtp2go.com`)  
  - **Port:** SMTP port (e.g., `2525`)  
  - **Sender Email:** Email address configured in your SMTP account  
  - **Username:** SMTP username  
  - **Password:** SMTP password  

<img alt="Custom smtp" src="https://github.com/user-attachments/assets/a3c33510-11b9-4a32-bd44-99614182b089"></img>

---

### 📤 OpenSign™ Default SMTP

If selected, all request-signature and completion emails will be sent using OpenSign’s built-in SMTP server.

---
If the user does not configure any SMTP option, emails will be sent using the organization-level SMTP (when it is enabled by the admin).
If the admin has configured a company-level SMTP, and the user has not set up their own SMTP, the user will still be connected to the default OpenSign SMTP, but all outgoing emails will be delivered using the organization-level SMTP.

---

> ⚠️ **Notes:**  
> - A green checkmark indicates the **active SMTP option**.  
> - Only one SMTP option can be active at a time.  
> - User-level SMTP is available only when permitted by the admin.  
> - Some SMTP features are limited to **Paid plans**.


  ---
## 🧭 Timezone & Date Format

Customize the **Timezone** and **Date Format** according to your regional preferences.  
These settings are reflected in:

- Document Completion Certificates  
- Signing Logs  
- Webhooks

### 📅 Date Format

- The selected date format will be applied by default to the date widget if no specific format is chosen during document creation.
- This default format also applies in all API flows.

### 🕒 Time Format

- Supports **12-hour** and **24-hour** formats.
- Affects timestamps in certificates, logs, and webhooks.

<img alt="Time zone" src="https://github.com/user-attachments/assets/bc1f29a2-565a-4ac2-96a4-9aa18b80b064"></img>

---

## 🧪 LTV-Enabled Signatures

**LTV (Long-Term Validation)** ensures that signatures remain valid and verifiable even after certificates expire or are revoked.

### 🔐 Key Features:

- Embeds certificate chain  
- Includes CRLs and OCSP responses  
- Enables offline verification  
- Complies with PDF standards like **PAdES**

### 📌 Why It Matters:

Even if a certificate becomes invalid in the future, the LTV-enabled signature remains verifiable.

### ✅ Use Cases:

- Legal Contracts  
- Financial or Medical Records  
- Long-term archiving requirements

---
### **Merge Certificate to PDF**

You can access this option by navigating to **Settings → Preferences**.

**Yes:** Selecting **Yes** will attach the completion certificate directly to the signed document, creating a single combined PDF file.  
Please note that once merged, the certificate cannot be separated from the main document.  

**No:** Selecting **No** will keep the completion certificate as a separate PDF file, which will be downloaded along with the signed document.  

> **Note:** This feature is available only in the **paid plans** of OpenSign.

## Widgets
### Date Widget Setting
Date Widget Preferences allow you to configure the default behavior of Date widgets across documents and templates. These settings are automatically applied whenever you add a new Date widget. You can still customize individual Date widgets later using the widget settings (gear icon).

- **Format**: Select the default date format that will be used for all Date widgets.
- **Default Date**: Set a predefined date that will automatically appear in the Date widget.
- **Signing Date**: When enabled, the Date widget automatically captures the date on which the signer signs the document.
- **Read Only**: When enabled, the Date widget becomes non-editable for the signer.
  <img alt="image" src="https://github.com/user-attachments/assets/4be15ebd-4965-4dff-add6-94e8451461ce" />

## 🔄 Multi-Level Custom Email Templates

**OpenSign™** offers flexible control over email templates at two different levels:

---

### 🏢 Organization Level

Admins can manage and enforce standardized email templates across the entire platform.

**Step 1:** Open the profile menu and select **Console Application** to access the admin console.  
**Step 2:** Once the Console Application opens, go to the **Mail** section. Here, administrators can configure email templates at the organization level.

All users created under your organization will automatically use these templates for sending request-signature and document completion emails **unless** they have permission to create templates at the individual level or have customized their own templates.

**Example:**  
Adam, the administrator of your company account, disables the **Allow email template customization for users individually** setting under **Console → General**. As a result, Ursula, a team member, cannot create or modify her own email templates.

When Ursula sends a document to Sofia for signing, Sofia will receive the organization-level email template.  
If Adam enables **Allow email template customization for users individually** but Ursula does not set up her own template, the signers will still receive emails based on the organization-level template.

**Note:** Organization-level email management is available only on **Paid** plans. This feature is **not** included in **Free** plans.

<img alt="Email_templates" src="https://github.com/user-attachments/assets/0b15e356-cfba-46d5-9e97-c73d32b879f4" />

---

### 👤 User Level

Users can configure their own email templates by navigating to **Settings → Preferences**.

If a user sets up templates here, those templates will be used for sending request-signature emails and document-completion emails.

<img alt="signatures" src="https://github.com/user-attachments/assets/dda05d4f-aa43-435d-bdb2-e68dca6f2b00" />

**Note:** Customize email management is only available on **Paid** plans. This feature is not included in **Free** plans.

### How Request-Signature and Completion Email Templates Work

- If the admin enables **Allow email template customization for users individually** and the user sets up their own custom templates, then both **request-signature emails** and **completion emails** will be sent using the **user-level templates**.

- If the user does **not** set up custom templates, and the admin has also **not** configured templates at the organization level, then the **default OpenSign templates** will be used.

---

## 🔒 Security

The **Security** tab in OpenSign (found under **Settings > Preferences > Security**) allows users to manage key authentication methods to protect their account access.

### 🧩 Features Available:

#### ✅ Two-Factor Authentication (2FA)

Enhance your account security by enabling 2FA. Once activated, you'll enter a time-based code from an authenticator app each time you log in.

#### 🛡️ Passkey Authentication

Passkeys offer a **passwordless**, **phishing-resistant** login experience using your device’s built-in security features such as fingerprint, Face ID, or PIN.

👉 For full details on setting up **Two-Factor Authentication (2FA)** and **Passkey Authentication**:  
[🔒 View Security Setup Guide](https://docs.opensignlabs.com/docs/help/Settings/SecurityManagement)

For more assistance with OpenSign™ features or APIs, contact our support team at **[support@opensignlabs.com](mailto:support@opensignlabs.com)**.
