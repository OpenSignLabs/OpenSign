---
sidebar_position: 5
title: Custom File Storage
---

# 💾 Custom File Storage

## 🔔 Set Up File Storage

This page allows users to configure their own file storage to store documents securely on their personal servers.

By default, all users are connected to **OpenSign’s default file storage**.  
If you prefer to use your **own custom file storage**, follow the steps below.

You can create an **AWS S3 bucket** to store your uploaded documents through OpenSign.  
To configure OpenSign with your cloud storage setup, refer to this guide:  
👉 [Cloud Storage Setup Guide](https://docs.opensignlabs.com/docs/self-host/cloud-storage/s3)

---

### 🪣 Steps to Configure Custom Storage

1. Click the **Add New** button.  
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
- All your documents will be stored in the configured storage provider.  
- You will be automatically logged out to clear any previous file adapter data from your local session.  
- Upon logging in again, your custom file storage will be active, and all future documents will be saved there.

---

### ⚠️ Important Note

In some cases, documents stored in your custom file storage may not load in OpenSign due to **CORS (Cross-Origin Resource Sharing)** policy restrictions.  
If you’ve activated custom file storage, make sure your storage configuration **allows OpenSign to access your documents** and does **not block requests** due to CORS errors.

---

## 💬 Need Help?

If you need help setting up or testing your custom file storage integration, contact our support team at  
📩 **[support@opensignlabs.com](mailto:support@opensignlabs.com)**

**Happy Signing with OpenSign™!**

