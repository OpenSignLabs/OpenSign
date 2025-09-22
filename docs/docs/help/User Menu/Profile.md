---
sidebar_position: 1
title: Profile
---
import ReactPlayer from 'react-player';

# 👤 Profile

The **Profile ** in OpenSign allows users to manage their personal and account-related details. You can update your information, verify your email, and set up a public profile.  

<img width="861" alt="Profile Menu" src="https://github.com/user-attachments/assets/8bfff942-222a-4e16-ac2d-cc07df1429de" />

---

## 📌 Profile Information  

<img width="1722" alt="Profile Information" src="https://github.com/user-attachments/assets/8745e89d-4faa-4921-9ada-57253a8d4293" />

### 🔐 Roles  

- **Admin**  
  - Role is displayed under your avatar.  
  - Has access to all features, including **User Management** and **Billing**.  

- **OrgAdmin**  
  - Has the same access as Admin.  
  - **Does not** have access to the **Console Application** or **Billing details**.  

- **Editor/User**: Cannot access Console Application, Billing, and are restricted from creating Teams, sharing templates.
---

### 👤 User Details  

- **Name** – Displays the full name of the user.  
- **Phone** – Shows the registered phone number.  
- **Email** – Displays the user’s registered email address. This cannot be changed or updated. It is used for login and notifications. 
- **Company** – Shows the company name associated with the account.  
- **Job Title** – Displays the job title of the user.  

---

## ✅ Email Verification  

- **Is Email Verified:** Indicates whether your email is verified.  
- If **Not Verified**, click **Verify** to begin the verification process.  
  - An OTP will be sent to your registered email address.  
  - Enter the OTP to complete verification. This is a one-time process, and once verified, the status will update to Verified.  

---

## 🌍 Public Profile  

- **Public Profile Username**  
  Set a unique username to create your **public profile**.  

- **Share Templates Publicly**  
  Your public profile allows you to share templates openly, enabling signers to sign documents easily.  

- **Tagline**  
  Add a short tagline to your profile by entering text in the **Tagline** field.  
  This tagline will be displayed publicly as part of your profile information.

---

### 🔖 Disable DocumentId  

Whenever a document is signed by all parties, **OpenSign™ automatically adds a unique DocumentId** at the top-left corner of the signed document.  

This ID can be used later to **verify the authenticity of the document**, so we **strongly recommend keeping it enabled**.  

If you prefer not to include the DocumentId in your signed documents, simply toggle the **Disable DocumentId** switch **ON**.

> **Note:** This feature is available only for paid users.

### Language

Users can set their preferred language for this account. Once a language is selected, it will be applied whenever the user logs in, and the application interface will automatically switch to the chosen language.

### Edit User Details

Click **Edit** to update user information, including:  

- Profile avatar  
- Name  
- Phone number  
- Company  
- Job title  
- Public profile  
- Tagline  
- Enable/disable DocumentId 

<img width="861"  alt="Edit Personal information" src="https://github.com/user-attachments/assets/c8c93c33-193f-4e1d-bfba-a8d7447d1007" />

<img width="861"  alt="Edit profile" src="https://github.com/user-attachments/assets/2f40254d-fd68-4a86-a018-7ac4f7ebf1f5" />

# ❌ Delete User (Admin Account)

Follow these steps to permanently delete an admin account from OpenSign.

### Steps to Delete Your Account

1. **Open Profile Menu** – Click the profile menu and select **Profile**.  
2. **Delete Account** – Scroll to the bottom and click **Delete Account**. Confirm by selecting **Yes**.  
3. **Confirm via Email** – Open the deletion email and click **Confirm Account Deletion**.  
4. **Send OTP** – On the next page, click **Send OTP**.  
5. **Enter OTP** – Check your email for the OTP and enter it.  
6. **Final Deletion** – Click **Delete Account**. All records and documents will be permanently removed.

<div>
    <ReactPlayer playing controls url='https://youtu.be/pY0T7U164Y4' />
</div>
      
---

### Cases When Account Deletion is Not Allowed

- **Team Users Exist**  
  If you have team users added under your account, you must delete them first before deleting your own account.

- **Active Paid Plan**  
  If you have an active paid plan, you cannot delete your account directly.  
  To proceed with account deletion, please contact [support@opensignlabs.com](mailto:support@opensignlabs.com) for assistance.

---
If you need additional assistance setting up OpenSign APIs, feel free to contact our support team at support@opensignlabs.com.
