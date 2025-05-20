---
sidebar_position: 4
title: Preferences
---

# 🔧 Preferences

The **Preferences** page in **OpenSign™** allows users and administrators to tailor the signing experience to suit individual, team, or organizational needs. Below is a breakdown of all configurable options and what they control.

---

## 📌 Signature Types Control

The **Allowed Signature Types** section defines which signature methods are available to signers:

- ✅ **Draw**: Create a handwritten signature using a mouse, stylus, or finger.
- ✅ **Type**: Type your name and apply it using pre-set font styles.
- ✅ **Upload**: Upload a scanned or saved image of your signature.
- ✅ **Default**: Use the default signature stored under *My Signature* in settings.

⚙️ The options selected here will determine what appears in the signature widget during document creation and signing. You can also change these preferences while creating the document.

---

## 🔄 Multi-Level Signature Type Control

**OpenSign™** introduces flexible control over signature options at three levels:

### 🏢 Organization-Level

Admins can enforce company-wide signing policies by restricting signature methods platform-wide.

> In the **Console Application > General**, admins can set allowed signature types at the organization level. Only the selected types will be shown on the **Preferences > Signature** page for users.

### 👤 User-Level

> Navigate to **Settings > Preferences** to configure user-level signature types.  
If a user sets preferred types here, only these will be shown when adding signature or initial widgets during document creation.

### 📄 Document-Level

> While creating a document, users can set specific allowed signature types.  
Only these will be available to the signer—useful for legal or regulatory requirements.

---

## 🔔 Notify on Signatures

Enable or disable email or in-app notifications when a document is signed.

- **Yes** – Receive alerts for each completed signature.  
- **No** – Notifications are turned off.

> User can change this option while creating the document or template.

**Details**:
The document creator will receive an email notification whenever a signer signs the document.

**Note**: Regardless of this setting, a **completion email** with the signed document and completion certificate is **always sent** to all signers and the document owner.

---

## 📬 Send in Order

Decide whether the document should be signed **sequentially** or **simultaneously** by multiple signers.

- **Yes** – Signers receive the document in a set order.
- **No** – All signers receive the document at once.

> User can change this option while creating the document or template.

**Details**:

- **Yes**: Signers are notified one after another. The next signer gets access only after the previous has completed signing.
- **No**: All signers receive links at the same time. They can sign independently of one another.

---

## 🚫 Enable Tour

The tour feature provides guidance for first-time users. You can turn this off for a cleaner, uninterrupted experience:

- **Yes** – Show onboarding tips.
- **No** – Disable tour prompts *(recommended for experienced users)*.

> User can change this option while creating the document or template.

**Details**:

- **Yes**: Enables guided tooltips for the signer during the signing process.
- **No**: Disables the tour, speeding up the signing experience.

💡 **Tip**: Disable if your users are already familiar with OpenSign™.

---

## 🧭 Timezone & Date Format

Customize the **Timezone** and **Date Format** according to your regional preferences.  
These settings are reflected in:

- Document Completion Certificates  
- Signing Logs  
- Webhooks

### 📅 Date Format
- Used as the **default format** for date widgets when creating documents.
- Applies in all flows including APIs.

### 🕒 Time Format
- Supports **12-hour** and **24-hour** formats.
- Affects timestamps in certificates, logs, and webhooks.

---

## 🧪 LTV Enabled Signatures

**LTV (Long-Term Validation)** ensures that signatures remain valid and verifiable even after certificates expire or are revoked.

### 🔐 Key Features:
- Embeds certificate chain
- Includes CRLs and OCSP responses
- Enables offline verification
- Complies with PDF standards like **PAdES**

### 📌 Why It Matters:
Even if a certificate becomes invalid in the future, the LTV-enabled signature stays verifiable.

### ✅ Use Cases:
- Legal Contracts
- Financial or Medical Records
- Long-term archiving requirements

---

## 📧 Email Templates

In the **Preferences > Email** tab, users can customize email templates for:

### ✉️ Request Signature Email
Once set, all signers will receive the customized request email.

### 📩 Document Completion Email
On completion, all signers receive the custom-formatted email with the signed document.

---

## 🔒 Security

### ✅ Two-Factor Authentication (2FA)

Adds a second verification step when logging in.

### Benefits:
- Enhances account protection
- Requires time-based code from an app like Google Authenticator

### How to Enable:
1. Go to **Security > Setup 2FA**
2. Scan the QR Code with an authenticator app
3. Save Recovery Codes for backup
4. Enter verification code to complete setup

> If 2FA is enabled, you’ll be prompted for a verification code after entering your password.

---

### 🛡️ Passkey Authentication

Passkeys offer **passwordless** and **phishing-resistant** sign-in.

#### 🔐 Key Features:
- Use fingerprint, face ID, or device PIN
- Passwordless and secure
- Reduces credential theft risks

### 🛠 How to Register a Passkey:
1. Click **Register another passkey**
2. Your device prompts biometric or PIN-based authentication
3. On success, the passkey is saved and listed under **Your Passkeys**
   
### 🧾 Managing Your Passkeys

Each passkey entry shows:
- Name (e.g., "Windows Edge")
- Created Date
- Last Used Date
- Credential ID

#### ✏️ Rename:
Click the **pencil icon** to rename a passkey.

#### 🗑 Delete:
Click the **trash icon** to remove a passkey.  
⚠️ This revokes access via that method.

---

For more assistance with OpenSign™ features or APIs, contact our support team at **[support@opensignlabs.com](mailto:support@opensignlabs.com)**.
