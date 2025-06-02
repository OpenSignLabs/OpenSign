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

![Signature type setup preferences](https://github.com/user-attachments/assets/ae413b24-fe53-4aa9-9242-624574f1d7b3)

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

![Preferences setup](https://github.com/user-attachments/assets/5bb9ad1a-f3c7-4b6e-9469-1bb003e1eec0)

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

In the **Preferences > Email** tab, users can customize email templates to personalize communication with signers and stakeholders.  
This feature helps maintain brand consistency and enhances engagement throughout the signing workflow.

👉 [📄 Step-by-step guide to setting up custom email templates](https://docs.opensignlabs.com/docs/help/Settings/Custom-email-templates)

**Note:** The custom email templates feature is only available on the **Professional** and higher plans—it is not included in the **Free** plan.

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
