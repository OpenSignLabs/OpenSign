---
sidebar_position: 4
title: Global SMTP
---

## 🏢 SMTP at the Organization Level

Configure SMTP at the organization level to send all outgoing emails—such as request-signature and completion emails—using a company-configured SMTP server.  
When enabled, these settings apply to all users **unless individual SMTP customization is allowed and set up by the user**.

### How to Set Up SMTP at the Organization Level

Admins can manage and enforce SMTP settings across the entire platform.

**Step 1:** Open the profile menu and select **Console Application** to access the admin console.  
**Step 2:** In the Console, navigate to the **Global SMTP** section and configure your SMTP settings.

All users under your organization will automatically use the organization-level SMTP **unless** they are allowed to configure their own SMTP settings.

<img width="861" height="409" alt="Global SMTP" src="https://github.com/user-attachments/assets/fe9dc091-59dd-47f9-992a-811cecaac2f3" />

**Example:**  
Adam, the administrator, disables **Enable individual user SMTP settings** under **Console → General**.  
As a result, Ursula cannot configure her own SMTP.

When Ursula sends a document to Sofia for signing, Sofia receives emails sent through the **organization-level SMTP**.  
If Adam enables **Enable individual user SMTP settings**, but Ursula does not configure her own SMTP, emails will still be sent using the **organization-level SMTP**.

> **Note:** Organization-level SMTP configuration is available **only on Paid plans** and is not included in **Free** plans.

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

<img width="820" alt="Custom smtp" src="https://github.com/user-attachments/assets/a3c33510-11b9-4a32-bd44-99614182b089"></img>

---

### 📤 OpenSign™ Default SMTP

If selected, all request-signature and completion emails will be sent using OpenSign’s built-in SMTP server.
