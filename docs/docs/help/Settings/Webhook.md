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

<img width="861" height="407" alt="Navigate to Add Webhook" src="https://github.com/user-attachments/assets/883dc914-9316-42b0-b59c-10b168265b38" />

**Step 3:** Click **Add Webhook**.

- A popup will appear. Enter your **Webhook URL** and click **Yes** to save it.

> **Note:** To enable **Live Webhook** support, you must upgrade to a **paid plan** — either the **Professional** or **Teams** plan.

---

## 🧭 How to Create a Webhook Security Key

A **Webhook Security Key** (also called a webhook secret) is a shared secret used to verify that webhook requests are genuinely sent by OpenSign and have not been tampered with.

### Steps to Create a Webhook Security Key

1. Log in to your **OpenSign** account.
2. Navigate to **Settings → Webhooks**.
3. Add or edit a webhook endpoint.
4. Generate a Security Key by clicking Enable Authentication, then click the Generate button.
The webhook security key has been generated.
   - Example: `a50a904a2a329d761781dac27c984416a07396736ac5588b62c6fe226538fbca`
6. Save the webhook configuration.
   
<img width="861" height="407" alt="webhook security key" src="https://github.com/user-attachments/assets/6f61a23e-25a1-4785-b241-657af0c1eeb1" />

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

// Process webhook event
```

---

## 📦 Sample Webhook Payload

```json
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

console.log("Try programiz.pro", verifySignature({body: {
  "event": "created",
  "type": "request-sign",
  "objectId": "SBEbnHwfrN",
  "file": "https://legadratw3d.ams3.digitaloceanspaces.com/c3f0bc11b84a87e6265de6bf28e5015e_uoeksXXU6FI5Op2B.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DO00QAPRB3CQRWHWQ8ZB%2F20251219%2Fus-west%2Fs3%2Faws4_request&X-Amz-Date=20251219T152806Z&X-Amz-Expires=900&X-Amz-Signature=9635dfb8ee8fde933f881905a97f869578ef7e99b337d4b21a0805b8317fd70d&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
  "name": "Sample Test Doc Line Compressed",
  "note": "Please review and sign this document",
  "description": "",
  "signers": [
    {
      "name": "Peter Mark",
      "email": "peter.mark@opensignlabs.com"
    },
    {
      "name": "kelvin bosch",
      "email": "kelvin.bosch@opensignlabs.com"
    }
  ],
  "createdAt": "Sat, 20 Dec 2025 00:58:20 GMT+9:30"
}, headers:{"x-webhook-signature":"52958fd3900f19ba6485319eb2622ef0ec4cf5ddfe36509cbe95eb706ed6b8c2" }}, "0906e8cbc88da0d5a6fd78162eb8e5e57ba7bd99bdc472145dc089d7f82b0a4a"));
```

The corresponding signature is sent in the request header:

```
x-webhook-signature: bcf57b06dde0c030d9423639824bad17ab7dd09ea3bf0a743773b95254ecf78e
```
If the script returns true, it means the webhook is valid and has not been tampered with.

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
