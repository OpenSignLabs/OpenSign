---
sidebar_position: 2
title: General
---

# General Settings

The **General Settings** section in OpenSign provides key administrative settings to help you manage and control the overall configuration of your OpenSign platform.

---

## 🚀 How to Access the General Settings Page

1. Log in to your **OpenSign** account using an **Admin account**.  
2. Click on your **profile menu** (top-right corner) and select **Console**.  
3. From the **left sidebar**, choose **General**.

You’ll now be on the **General Settings** page.

> 🔒 **Note:** The **General Settings** page is available only to **Admin users**. Regular users will not see this option in their menu.

---

## Enabled Signature Types

Admins can define which signature types are available across the organization.  

All users under your account will only have access to the signature methods you enable here in their **Preferences**. Any disabled methods will be hidden from their options.

**Example:**  
If Adam, the admin of your organization, disables the **Typed** signature type in the **Manage Signature Types** section, Ursula (a team member) will no longer see the **Typed** signature option in her preferences.

However, Ursula can still enable or disable any of the remaining signature types for each document she creates.  
When she sends a document to Sofia (a signer), Sofia will only be able to use the signature methods that Ursula selected during the document setup.

> **Note:** Managing **Signature Types** at the organization level is available in the Teams and Enterprise plans.  
> This feature is not included in the **Professional** or **Free** plans.

<img width="918" alt="General settings" src="https://github.com/user-attachments/assets/60681095-6e53-4667-9f47-b3d4d38ab4b3" />

---

## Allow Indexing of Public Profile

When this option is enabled, user's public profiles will be indexed by search engines and may appear in search results.

---

## Email Template Customization

This setting determines whether team members can create and manage their own email templates.

- If **Disabled**: users **cannot** create or modify custom templates for signature requests or completion notifications. 
- If **Enabled**: users can design and manage their own personalized email templates.
  
### Enable Individual User SMTP Settings

This setting controls whether individual users are allowed to configure their own outgoing email servers (like connecting Gmail or using a custom SMTP).
If **Disabled**: Users CANNOT connect Gmail or configure custom SMTP at their level.
If **Enabled**: Users CAN connect Gmail or configure custom SMTP at their level.

Note: If users do not configure their own settings, all outgoing emails will be sent using the organization-level SMTP (if configured), or the OpenSign default SMTP if not.

---

Need help? [Join our Discord community](https://discord.com/invite/xe9TDuyAyj) for instant support.
