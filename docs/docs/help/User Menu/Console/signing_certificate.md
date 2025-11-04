---
sidebar_position: 6
title: Custom Signing Certificate
---

# 🔐 Custom Signing Certificate

The **Custom Signing Certificate** page allows you to upload and manage your own **digital signing certificate** (PFX format) for secure and verified document signing in OpenSign.

By default, OpenSign uses its **built-in signing certificate** to digitally sign documents.  
However, if your organization has its own **custom certificate (PFX or P12 format)**, you can upload and activate it here.
<img width="1722" height="814" alt="pfx cerificate upload" src="https://github.com/user-attachments/assets/a5668f61-332d-49c5-ace2-5f0f92d3b68f" />

---

## 🪪 What is a PFX Certificate?

A **PFX** (or **P12**) certificate is a password-protected digital certificate file that contains:
- A **private key** (used for signing documents securely)
- A **public certificate** (used to verify the signature’s authenticity)

Using a custom certificate enhances trust and compliance by ensuring all signed documents carry your organization’s **digital identity**.

---

## ⚙️ How to Upload Your Custom Certificate

Follow these steps to set up your custom signing certificate:

1. **Log in** to your OpenSign account using your admin credentials.  
2. Navigate to the **Console → Signing Certificate** section.  
3. In the **Custom Signing Certificate** panel:
   - Click **Choose File** and upload your `.pfx` or `.p12` certificate file.  
   - Enter your **certificate password** (required to unlock the private key).  
4. Click **Update** to save and activate your custom signing certificate.

> Once updated, all new documents signed using your OpenSign account will be digitally signed with your uploaded certificate.

---

## 🧾 Using the Default OpenSign Certificate

If you wish to revert to the standard OpenSign certificate:
- Simply click **Use default OpenSign™ certificate**.  
- OpenSign will replace your custom certificate with its default one.
<img width="861" height="408" alt="pfx_Certificate" src="https://github.com/user-attachments/assets/9063d927-c28f-4bb5-ac36-caeebc3845fc" />

---

## 🛡️ Security Notes

- OpenSign securely encrypts and stores your uploaded certificate.  
- Ensure that your PFX file and password are valid and belong to your organization.  
- Invalid or expired certificates may prevent successful document signing.  
- Use strong passwords for your certificate to maintain compliance and security.

---

## 💬 Need Help?

If you encounter any issues while uploading or activating your certificate, contact our support team at  
📩 **[support@opensignlabs.com](mailto:support@opensignlabs.com)**

**Empower your brand with trusted digital signatures — securely with OpenSign™.**
