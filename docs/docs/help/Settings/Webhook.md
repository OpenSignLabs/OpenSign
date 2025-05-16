---
sidebar_position: 3
title: Webhook
---

# 🔁 Webhook

## 🔔 What is a Webhook?

A **webhook** allows one system (like OpenSign) to automatically send real-time data or notifications to another system (like your server) when a specific event occurs.

Think of it like a **push notification for your backend** — instead of constantly checking for updates (polling), a webhook sends data to your endpoint **as soon as an event happens**.

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

**Step 3:** Click on **Add Webhook**.

- A popup will appear. Enter your **Webhook URL** and click **Yes** to save it.

**Note:** To enable **Live Webhook** support, you must upgrade to a **paid plan** — either the **Professional** or **Teams** plan.

![Add Webhook](https://github.com/user-attachments/assets/ff68b255-a6e6-4a7d-9cef-6dd9e3b6d4e4)

---

## 🧪 Sandbox Webhook

- You can also add webhooks for the **Sandbox** environment on the same page.
- **Sandbox Webhooks are available in all plans**, including the **free plan**, and are ideal for development and testing purposes.

---

## 📋 Supported Webhook Events

OpenSign sends event notifications to your configured webhook URL when any of the following actions occur:

- **Document Created** – A document is created.
- **Document Viewed** – A signer viewed the document.
- **Document Signed** – A signer signed the document.
- **Document Completed** – All required signatures are completed.
- **Document Revoked or Declined** – Document signing was revoked or declined.

Each notification is sent as a **POST request** with a **JSON payload** containing relevant event data.

### Example Payload: Document Created

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
      "phone": "9283784545554"
    }
  ],
  "createdAt": "Fri, 16 May 2025 15:02:42 IST"
}

```

---

## ❓ Frequently Asked Questions

### 1. What is the OpenSign Sandbox environment?
The Sandbox is a testing environment designed for developers to safely experiment with OpenSign APIs and workflows. It mirrors the live environment but has testing limitations.

---

### 2. Can I use my Live Webhook in the Sandbox?

No. Live Webhooks do not work in the Sandbox environment. You must configure a separate webhook specifically for Sandbox testing.

---

### 3. Can I test all webhook events in the Sandbox?

Yes, the Sandbox environment supports all event types, including `created`, `viewed`, `signed`, `completed`, and `revoked/declined`. However, behavior may be simulated for testing purposes.

---

If you need help testing your webhook or integrating it into your application, feel free to contact our support team at [support@opensignlabs.com](mailto:support@opensignlabs.com).

**Happy signing with OpenSign™!**
