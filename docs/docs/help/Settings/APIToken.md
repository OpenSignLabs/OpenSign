---
sidebar_position: 4
title: API Token
---

# 🔐 API Authentication – Setting up Your `x-api-token`

To authenticate and use OpenSign API endpoints, you’ll need a valid API token (`x-api-token`).

Follow the steps below to generate one.

**Note:** You can generate both **Live** and **Sandbox** API tokens from your OpenSign account.

---

## 🧭 Step-by-Step Guide to Generate Your API Token

**Step 1:** Log in to your OpenSign account using valid credentials. 

**Step 2:** Navigate to the **Settings** section and click on **API Token**.  

<img width="436" alt="Navigate-to-Api-token" src="https://github.com/user-attachments/assets/8079ecb5-ad5b-4ce6-8d6c-14395130a654"></img>

**Step 3:** On the API Token page, click the **Generate Live API Token** button.

<img width="436" alt="Generate token" src="https://github.com/user-attachments/assets/6188ae46-0f40-4de6-9903-33ae0aa4e63f"></img>


- Your `x-api-token` will now be generated and displayed.
- **Copy this token** — you’ll use it to authenticate OpenSign API requests.

**Optional:**  
On the same page, you’ll also find the option to generate a **Sandbox API Token** for development and testing purposes.

---

## 🧠 Frequently Asked Questions

**1. What is the OpenSign Sandbox environment?**  
The Sandbox is a testing environment designed for developers to safely experiment with OpenSign APIs and workflows. It mirrors the live environment but with testing limitations.


**2. Can I upload large documents to the Sandbox?**  
No. Please avoid uploading documents larger than **5MB** in the Sandbox. It is optimized for lightweight testing only.


**3. Can I use my live API token in the Sandbox?**  
No. **Live API tokens do not work** in the Sandbox environment. You’ll need to generate a separate token specific to Sandbox testing.


**4. Why can’t I use a live template in the Sandbox?**  
Live and Sandbox environments are **separate**. Templates created in the live environment cannot be used in the Sandbox, and vice versa.


**5. Can I use the API in the free self-hosted environment?**  
No. We do not support generating API tokens in the **free self-hosted version**.  
If you want to use OpenSign APIs in a self-hosted setup, you must upgrade to the **paid self-hosted plan**.
