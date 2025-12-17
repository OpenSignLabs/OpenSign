---
sidebar_position: 3
title: Webhook
---

# 🔁 Webhook

## 🔔 What is a Webhook?

A **webhook** allows one system (like OpenSign) to automatically send real-time data or notifications to another system (like your server) when a specific event occurs.

Think of it as a **push notification for your backend** — instead of continuously checking for updates (polling), a webhook pushes data to your endpoint **as soon as an event happens**.

---

## 🧠 Simple Example

Suppose you're using OpenSign to collect eSignatures:

- When someone **signs a document**, OpenSign triggers a **POST request** to your server.
- The request includes data such as the document ID, signer email, and signature status.
- Your server can then process this information — for example, update your CRM, trigger a workflow, or send a confirmation email.

---

## 🧭 How to Add a Webhook in OpenSign

**Step 1:** Log in to your OpenSign account using your credentials.  
**Step 2:** Navigate to **Settings → Webhook**.

![Navigate to Add Webhook](https://github.com/user-attachments/assets/6b069b6c-d2b7-408b-b7c9-7fbeb55d6c98)

**Step 3:** Click **Add Webhook**.

- A popup will appear. Enter your **Webhook URL** and click **Yes** to save it.

> **Note:** To enable **Live Webhook** support, you must upgrade to a **paid plan** — either the **Professional** or **Teams** plan.

![Add Webhook](https://github.com/user-attachments/assets/ff68b255-a6e6-4a7d-9cef-6dd9e3b6d4e4)

---

## 🧭 How to Create a Webhook Security Key

A **Webhook Security Key** (also called a webhook secret) is a shared secret used to verify that webhook requests are genuinely sent by OpenSign and have not been tampered with.

### Steps to Create a Webhook Security Key

1. Log in to your **OpenSign** account.
2. Navigate to **Settings → Webhooks**.
3. Add or edit a webhook endpoint.
4. Generate a **Security Key** (or manually enter a strong secret).
   - Use a long, random string (at least 32 characters).
   - Example: `a50a904a2a329d761781dac27c984416a07396736ac5588b62c6fe226538fbca`
5. Save the webhook configuration.

⚠️ **Important:** Store this key securely. Do not expose it in client-side code or public repositories.

---

## 🔐 How the Webhook Security Key Works

OpenSign signs every webhook request using your security key.

### High-level Flow

1. An event occurs (e.g. create document, document viewed, signed, completed, and declined).
2. OpenSign sends a webhook request to your configured endpoint.
3. OpenSign generates a signature using:
   - The **raw request payload**
   - Your **webhook security key**
   - The **HMAC-SHA256** algorithm
4. The generated signature is sent in the request header:

```
x-webhook-signature
```

5. Your server recomputes the signature using the same payload and secret.
6. If both signatures match, the request is verified as authentic.

---

## 🧪 Signature Verification Example (Node.js)

Below is a sample implementation to verify the webhook signature on your server.

```js
const crypto = require("crypto");

function verifySignature(req, secret) {
  const receivedSignature = req.headers["x-webhook-signature"];
  const payload = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");

  return receivedSignature === expectedSignature;
}
```

### Usage Example

```js
const isValid = verifySignature(req, WEBHOOK_SECRET);

if (!isValid) {
  return res.status(401).send("Invalid webhook signature");
}

// Process webhook event
```

---

## 📦 Sample Webhook Payload

```json
{
  "event": "viewed",
  "objectId": "d4LP0kKezS",
  "type": "request-sign",
  "file": "https://...pdf",
  "name": "Nu-international-application-form",
  "note": "Please review and sign this document",
  "signers": [
    {
      "name": "Mathew Wade",
      "email": "mathew.wade@opensignlabs.com"
    },
    {
      "name": "Steve Broad",
      "email": "steve.Broad@opensignlabs.com",
      "phone": "2678288322"
    }
  ],
  "viewedBy": "mathew.wade@opensignlabs.com",
  "viewedAt": "Wed, 17 Dec 2025 13:46:05 GMT+5:30",
  "createdAt": "Wed, 17 Dec 2025 13:36:40 GMT+5:30"
}
```

The corresponding signature is sent in the request header:

```
x-webhook-signature: bcf57b06dde0c030d9423639824bad17ab7dd09ea3bf0a743773b95254ecf78e
```
---

## ✅ Best Practices

- Always verify the webhook signature before processing the payload.
- Use the **raw request body** for signature calculation (avoid modifying it).
- Rotate your webhook security key periodically.
- Return a **2xx** HTTP status only after successful verification.

---

## 🧩 Common Issues

- **Signature mismatch**: Ensure the payload is stringified exactly as received.
- **Missing header**: Confirm `x-webhook-signature` is present in the request.
- **Wrong secret**: Verify the same security key is used on both sides.

---

This mechanism ensures webhook requests are secure, tamper-proof, and trustworthy.

## 🧪 Sandbox Webhook

- You can also add webhook for the **Sandbox** environment on the same page.
- **Sandbox webhook** are available on all plans, including the **Free** plan, and are ideal for development and testing.

> **Caution:** Avoid sending sensitive or confidential data to the Sandbox environment.

📘 **API Reference:**  
You can also manage your webhooks via our API.  
See the API documentation here: [Save/Update Webhook API](https://docs.opensignlabs.com/docs/API-docs/save-update-webhook)

---

## 📋 Supported Webhook Events

OpenSign sends event notifications to your configured webhook URL when any of the following actions occur:

- **Document Created** – A document is created.
- **Document Viewed** – A signer viewed the document.
- **Document Signed** – A signer signed the document.
- **Document Completed** – All required signatures are completed.
- **Document Revoked or Declined** – The document was revoked or declined.

Each notification is sent as a **POST request** with a **JSON payload** containing relevant event data.

---

### 🔍 Example Payload: `Document Created`

```json
{
  "event": "created",
  "type": "request-sign",
  "objectId": "kpeg6Q2rO7",
  "file": "https://legadratw3d.ams3.digitaloceanspaces.com/851de61f62b60a1f62e03232464fa4bf_81wV17MTebsrRoov.pdf?...",
  "name": "Sample Test Doc",
  "note": "Please review and sign this document",
  "description": "",
  "signers": [
    {
      "name": "Peter Mark",
      "email": "peter.mark1093@gmail.com",
      "phone": "3556567789"
    }
  ],
  "createdAt": "Fri, 16 May 2025 15:02:42 IST"
}
```
### 🔍 Example Payload: `Document Viewed`

```json
{
  "event": "viewed",
  "type": "request-sign",
  "objectId": "kpeg6Q2rO7",
  "file": "https://legadratw3d.ams3.digitaloceanspaces.com/851de61f62b60a1f62e03232464fa4bf_81wV17MTebsrRoov.pdf?...",
  "name": "Sample Test Doc",
  "note": "Please review and sign this document",
  "description": "",
  "signers": [
    {
      "name": "Peter Mark",
      "email": "peter.mark1093@gmail.com",
      "phone": "3556567789"
    }
  ],
  "viewedBy": "peter.mark1093@gmail.com",
  "viewedAt": "Fri, 16 May 2025 16:18:16 IST",
  "createdAt": "Fri, 16 May 2025 15:02:28 IST"
}
```

---

### 🔍 Example Payload: `Document Signed`

```json
{
  "event": "signed",
  "type": "request-sign",
  "objectId": "kpeg6Q2rO7",
  "file": "https://legadratw3d.ams3.digitaloceanspaces.com/bc2eb56cc9d29a5f222e4a4b5dbbcfbf_signed_sample_test_doc_4858.pdf?...",
  "name": "Sample Test Doc",
  "note": "Please review and sign this document",
  "description": "",
  "signer": {
    "name": "Peter Mark",
    "email": "peter.mark1093@gmail.com",
    "phone": "3556567789"
  },
  "signedAt": "Fri, 16 May 2025 16:18:34 GMT+5:30",
  "createdAt": "Fri, 16 May 2025 15:02:28 GMT+5:30"
}
```

---

### 🔍 Example Payload: `Document Completed`

```json
{
  "event": "completed",
  "type": "request-sign",
  "objectId": "kpeg6Q2rO7",
  "file": "https://legadratw3d.ams3.digitaloceanspaces.com/bc2eb56cc9d29a5f222e4a4b5dbbcfbf_signed_sample_test_doc_4858.pdf?...",
  "certificate": "https://legadratw3d.ams3.digitaloceanspaces.com/9c954912f529acb7e4d065ec0521a63b_certificate.pdf?...",
  "name": "Sample Test Doc",
  "note": "Please review and sign this document",
  "description": "",
  "signers": [
    {
      "name": "Peter Mark",
      "email": "peter.mark1093@gmail.com",
      "phone": "3556567789"
    }
  ],
  "completedAt": "Fri, 16 May 2025 16:18:35 GMT+5:30",
  "createdAt": "Fri, 16 May 2025 15:02:28 GMT+5:30"
}
```
---

### 🔍 Example Payload: `Document Declined`

```json
{
  "event": "declined",
  "type": "request-sign",
  "objectId": "1gtDMBHpEY",
  "file": "https://legadratw3d.ams3.digitaloceanspaces.com/e90c32a45351eb52eb00e0054ae50566_581ZmOn4CwAqnxSF.pdf?...",
  "name": "Sample Test Doc ",
  "note": "Please review and sign this document",
  "description": "",
  "signers": [
    {
      "name": "Peter Mark",
      "email": "peter.mark1093@gmail.com",
      "phone": "9283784545554"
    }
  ],
  "declinedBy": "peter.mark1093@gmail.com",
  "declinedReason": "Invalid date format used.",
  "declinedAt": "Fri, 16 May 2025 16:25:38 IST",
  "createdAt": "Fri, 16 May 2025 16:24:28 IST"
}
```
---

## ❓ Frequently Asked Questions

### 1. What is the OpenSign Sandbox environment?

The Sandbox is a testing environment designed for developers to safely experiment with OpenSign APIs and workflows. It mirrors the live environment but with testing limitations.

---

### 2. Can I use my Live Webhook in the Sandbox?

No. **Live Webhooks do not work** in the Sandbox environment. You must configure a separate webhook specifically for Sandbox testing.

---

### 3. Can I test all webhook events in the Sandbox?

Yes. The Sandbox environment supports all event types, including `created`, `viewed`, `signed`, `completed`, and `revoked/declined`.  
However, some behaviors may be simulated for testing purposes.

---

## 💬 Need Help?

If you need help testing your webhook or integrating it into your application, feel free to reach out to our support team at [support@opensignlabs.com](mailto:support@opensignlabs.com).

**Happy signing with OpenSign™!**
