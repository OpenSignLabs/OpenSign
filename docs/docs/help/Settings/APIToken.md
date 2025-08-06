---
sidebar_position: 2
title: API Token
---

# 🔐 API Authentication – Setting Up Your `x-api-token`

To authenticate and use OpenSign API endpoints, you’ll need a valid API token (`x-api-token`).

Follow the steps below to generate one.

> **Note:** You can generate both **Live** and **Sandbox** API tokens from your OpenSign account.

---

## 🧭 Step-by-Step Guide to Generate Your API Token

**Step 1:** Log in to your OpenSign account using valid credentials.

**Step 2:** Navigate to the **Settings** section and click on **API Token**.

<img width="436" alt="Navigate-to-Api-token" src="https://github.com/user-attachments/assets/e0e05a23-f815-4805-a047-f08d3727ad98" />

**Step 3:** On the API Token page, click the **Generate Live API Token** button.

> **Note:** To generate a **Live API Token**, you must upgrade to a **paid plan** — either the **Professional** or **Teams** plan.

<img width="436" alt="Generate token" src="https://github.com/user-attachments/assets/f5a17744-cfce-464f-9b82-685570ed1e39" />

- Your `x-api-token` will now be generated and displayed.
- **Copy this token** — you’ll need it to authenticate your OpenSign API requests.

---

### 🧪 Sandbox API Token

You’ll also find the option to generate a **Sandbox API Token** on the same page.

- **Sandbox API tokens** are available on all plans, including the **free plan**, and are intended for development and testing.
- **Do not upload confidential data** to the Sandbox environment.

  <img width="436" alt="Sandbox api token" src="https://github.com/user-attachments/assets/f27d9e00-7989-4c01-b23e-cecaccce4be2" />
  
### 🧪 Sandbox Cloud Account Login

OpenSign provides a **sandbox testing cloud environment**, which is a replica of the production environment. This allows users to test features without affecting live data.

- ✅ Available in **all plans**, including the **free plan**.
- 🧪 Ideal for **testing and development** purposes.

<img width="436" alt="login to sandbox" src="https://github.com/user-attachments/assets/3bc6bacd-9c15-4232-b9d7-6d0fb423cf57" />

#### 🔐 How to Access the Sandbox Environment

1. Go to the **Settings** menu.
2. Click on **API Token**.
3. On the API Token page, click **Login to Sandbox**.
4. You will be automatically logged in to the sandbox environment using your existing account — **no need to enter your username or password**.

> ⚠️ **Important Note:**  
> Manually entering your username and password will **not work** for sandbox login. Always use the "Login to Sandbox" button for access.
---
### Buy the api credit 
User can buy the api credit using this feature 
On the click of the buy premium credits the 

## 🧠 Frequently Asked Questions

**1. What is the OpenSign Sandbox environment?**  
The Sandbox is a testing environment designed for developers to safely experiment with OpenSign APIs and workflows. It mirrors the live environment but with certain limitations.

**2. Can I upload large documents to the Sandbox?**  
No. Please avoid uploading documents larger than **5MB** in the Sandbox. It is optimized for lightweight testing only.

**3. Can I use my Live API Token in the Sandbox?**  
No. **Live API Tokens do not work** in the Sandbox environment. You’ll need to generate a separate token specifically for Sandbox testing.

**4. Why can’t I use a live template in the Sandbox?**  
Live and Sandbox environments are **separate**. Templates created in the Live environment cannot be used in the Sandbox, and vice versa.

**5. Can I use the API in the free self-hosted environment?**  
No. The **free self-hosted version** does not support API token generation.  
To use OpenSign APIs in a self-hosted setup, you must upgrade to a **paid self-hosted plan**.

If you need additional assistance setting up OpenSign APIs, feel free to contact our support team at support@opensignlabs.com.
