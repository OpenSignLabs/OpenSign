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

Step 1: Open the profile menu and select Console Application to launch the console.

Step 2: Once the Console Application loads, navigate to the General menu. Here, admins can configure the allowed signature types at the organization level.

After the signature types are set, only those selected options will appear in the Preferences page and in the Signature, Initial Widgets during both document creation and signing.

<img width="436" alt="Signature type setup console" src="https://github.com/user-attachments/assets/c8c3de19-e82e-464a-977b-cdf3fd12aed7" />

### 👤 User-Level

Navigate to **Settings > Preferences** to configure user-level signature types.

If a user sets preferred types here, only those will appear when adding signature or initial widgets during document creation.

<img width="436" alt="Signature type setup preferences" src="https://github.com/user-attachments/assets/ae413b24-fe53-4aa9-9242-624574f1d7b3" />

### 📄 Document-Level

While creating a document, users can specify allowed signature types.

Only these will be available to the signer—useful for legal or regulatory requirements.

<img width="436" alt="Signature type setup signature widget" src="https://github.com/user-attachments/assets/d64510e1-df14-44fe-8020-45b17c612238" />

---

## 🔔 Notify on Signatures

The document owner will receive email notifications when a document is signed.

- **Yes** – Receive alerts for each completed signature.  
- **No** – Notifications are turned off.

> Users can change this option while creating the document or a template.

**Note**: Regardless of this setting, a **completion email** with the signed document and completion certificate is **always sent** to all signers and the document owner.

<img width="436" alt="Preferences setup" src="https://github.com/user-attachments/assets/5adad567-6c01-4766-9b10-db3f95ad65d3" />

---

## 📬 Send in Order

Decide whether the document should be signed **sequentially** or **simultaneously** by multiple signers.

- **Yes** – Signers receive the document in a set order. The next signer gains access only after the previous one completes signing.
- **No** – All signers receive the document at once and can sign independently.

> Users can change this option while creating the document or a template.

---

## 🚫 Enable Tour

The tour feature provides guidance for first-time users. You can turn this off for a cleaner, uninterrupted experience:

- **Yes** – Show onboarding tips. Enables guided tooltips for the signer during the signing process.
- **No** – Disable tour prompts *(recommended for experienced users)*. Speeds up the signing experience.

> Users can change this option while creating the document or a template.

💡 **Tip**: Disable if your users are already familiar with OpenSign™.

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

<img width="436" alt="Preferences setup" src="https://github.com/user-attachments/assets/5bb9ad1a-f3c7-4b6e-9469-1bb003e1eec0" />

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

## 📧 Email Templates  
For details, visit: [https://docs.opensignlabs.com/docs/help/Settings/Teams](https://docs.opensignlabs.com/docs/help/Settings/Teams)

## 🔒 Security  
For details, visit: [https://docs.opensignlabs.com/docs/help/Settings/Teams](https://docs.opensignlabs.com/docs/help/Settings/Teams)

For more assistance with OpenSign™ features or APIs, contact our support team at **[support@opensignlabs.com](mailto:support@opensignlabs.com)**.
