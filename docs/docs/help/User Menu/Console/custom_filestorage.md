---
sidebar_position: 5
title: Custom File Storage
---

# 💾 Custom File Storage

## 🌩️ Introduction to BYOC (Bring Your Own Cloud)

OpenSign supports **BYOC (Bring Your Own Cloud)** — allowing you to **store your documents in your own cloud storage** instead of OpenSign’s default storage.  

With BYOC, organizations and users gain **greater control, privacy, and compliance flexibility** by connecting their preferred cloud providers such as **AWS S3** or **DigitalOcean Spaces**.  

> 🧠 **Why BYOC?**  
> - Maintain complete ownership and control of your documents.  
> - Comply with internal, regional, or client-specific data policies.  
> - Choose your preferred cloud region or provider for better performance and compliance.  

---

## 🚀 How to Access the Custom File Storage Setup

Follow the steps below to navigate to the **Custom File Storage** setup page in OpenSign:

1. Log in to your **OpenSign** account using an **Admin account**.  
2. Click on your **profile menu** (top-right corner) and select **Console**.  
3. In the **left sidebar**, go to **Storage**.  

<img width="1722" height="814" alt="Custom file storage" src="https://github.com/user-attachments/assets/813f6685-3f36-40e4-aaaf-0d8b86bdc3b7" />

You will now be on the **Custom File Storage** setup page where you can configure your own storage provider.

> 🔒 **Note:** Access to Custom File Storage settings is available only to **Admin users**. Regular users will not see this option in their menu.

---

## 🔔 Set Up File Storage

By default, all users are connected to **OpenSign’s default file storage**.  
If you prefer to use your **own custom cloud storage (BYOC)**, you can easily configure it here.

You can set up an **AWS S3 bucket** or **DigitalOcean Space** to store your uploaded documents securely.  
To configure OpenSign with your cloud storage, refer to this detailed guide:  
👉 [Cloud Storage Setup Guide](https://docs.opensignlabs.com/docs/self-host/cloud-storage/s3)

---

### 🪣 Steps to Configure Custom Storage

1. Click the **Add New** button.

<img width="861" height="408" alt="Add new workspace" src="https://github.com/user-attachments/assets/0f734c6a-e2ac-445a-8194-746b9c202f0a" />

2. Fill in the following details:

   - **Unique File Adapter Name:** Enter a unique name for your storage configuration.  
   - **Storage Provider:** Choose your provider — currently, OpenSign supports **AWS S3** and **DigitalOcean Spaces**.  
   - **Bucket Name:** Specify your storage bucket name.  
   - **Region:** Enter the region where your bucket is hosted.  
   - **Endpoint:** Provide the endpoint URL of your storage service.  
   - **Base URL:** Enter the base URL used to access stored files.  
   - **Access Key ID:** Enter your storage access key ID.  
   - **Secret Access Key:** Enter your storage secret access key.

3. Once all details are filled, click **Save and Activate** to enable your custom file storage.

After activation:
- All your documents will be stored in the configured **BYOC storage provider**.  
- You will be automatically logged out to clear any previous file adapter data from your local session.  
- Upon logging in again, your custom file storage will be active, and all future documents will be saved there.

<img width="861" height="408" alt="custom file storage" src="https://github.com/user-attachments/assets/1add417d-f745-4e00-8cf3-7dcd9798f4db" />

---

### ⚠️ Important Note

In some cases, documents stored in your **custom (BYOC)** file storage may not load in OpenSign due to **CORS (Cross-Origin Resource Sharing)** policy restrictions.  
If you’ve activated custom file storage, ensure your cloud configuration **allows OpenSign to access your documents** and does **not block requests** due to CORS errors.

👉 [Read the article to learn how to set up CORS policies](https://docs.opensignlabs.com/docs/self-host/cloud-storage/s3)

---

## 💬 Need Help?

If you need help setting up or testing your BYOC or custom file storage integration, contact our support team at  
📩 **[support@opensignlabs.com](mailto:support@opensignlabs.com)**  

Or join our community for instant assistance:  
💬 [Join our Discord](https://discord.com/invite/xe9TDuyAyj)

**Happy Signing with OpenSign™!**

