---
sidebar_position: 6
title: Manage users
---

# 👤 User Management

The **User Management** feature in OpenSign allows administrators to add, edit, and manage users within the platform. This functionality is available on **Self-Hosted**, **Teams**, and **Enterprise** plans. 

> ✅ Only users with the roles **Admin** or **OrgAdmin** have permission to access and manage users.

---

## 🧭 Accessing User Management

To access the user management panel:

1. Log in to your OpenSign account.
2. In the left-hand sidebar, navigate to **Settings → Users**.

<img width="436" alt="Navigate-to-users" src="https://github.com/user-attachments/assets/9f34201c-fda7-406b-9a78-49a5459269cd"></img>

A list of existing users will be displayed.

---

## ➕ Adding a New User

To add a new user:

1. **Click the ➕ Add User Button**

2. **Fill in the User Information**

   | Field        | Required | Description                                                                                                                                               |
   |--------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
   | **Name**     | ✅ Yes    | Enter the user's full name.                                                                                                                                |
   | **Email**    | ✅ Yes    | Enter a valid email address.                                                                                                                               |
   | **Password** | ✅ Yes    | The system auto-generates a password. **Copy it immediately** as it will be shown only once.                                                               |
   | **Phone**    | ❌ No     | (Optional) Enter the user’s phone number.                                                                                                                   |
   | **Team**     | ✅ Yes    | Select the team the user belongs to from the dropdown.<br />_Note: Teams must be created beforehand under **Settings → Teams** (available in Teams & Enterprise plans)._ |
   | **Role**     | ✅ Yes    | Choose one of the following roles:                                                                                                                          |
   |              |          | - **OrgAdmin**: Full access, including user and team management.                                                                                            |
   |              |          | - **Editor**: Can create and share templates but **cannot manage users**.                                                                                   |
   |              |          | - **User**: Can use templates for signing but **cannot share** them or manage users.                                                                        |

<img width="436" alt="Add-user-form" src="https://github.com/user-attachments/assets/c176dd4f-257d-42e2-be7f-a05a1f7e4094"></img>

3. **Submit or Cancel**
   - Click **Submit** to create the user.
   - Click **Cancel** to exit without saving.

> 🔒 **Note:** Once a user is created, the password will not be visible again. If needed, you can use the **"Forgot Password"** option on the login page to reset it.

<img width="436" alt="new  user" src="https://github.com/user-attachments/assets/647c40d8-061d-4e0a-b62c-302296e83493"></img>

---

## 🔁 Managing User Status

- **Activate/Deactivate Users**
  - Use the toggle in the **Active** column to enable or disable a user’s account.
  - **Deactivated users** will not be able to log in to OpenSign until reactivated.

---
## 🔁 Delete Users  

- OpenSign allows **admins** to delete users when needed.  
- Once a user is deleted, their account and all associated data are **permanently removed**. OpenSign does **not** keep deleted user records and restoration is **not possible**.  
- To delete a user:  
  1. Click the **Delete** button next to the user you want to remove.  
  2. A confirmation popup will appear.  
  3. Enter the user’s email in the input box and click **Delete**.  
- After deletion, the user (and all related data) will be permanently erased.  

> ⚡ **Note:** Once a user is deleted, your **available user count will automatically increase**.  

---

## 🔐 Permissions by Role

| Role        | Manage Users | Create Templates | Share Templates with Teams | Use Templates |
|-------------|---------------|------------------|-----------------------------|---------------|
| **OrgAdmin** | ✅ Yes        | ✅ Yes            | ✅ Yes                      | ✅ Yes         |
| **Editor**   | ❌ No         | ✅ Yes            | ✅ Yes                      | ✅ Yes         |
| **User**     | ❌ No         | ✅ Yes            | ❌ No                       | ✅ Yes         |

---

## 👥 Buy More Users (Buy Additional Seats)

OpenSign allows you to create users based on the number of seats included in your selected plan. For example, if your current plan includes **2 users**, you can only create **2 users** by default. To add a **third user**, you must **purchase additional seats**.

### Steps to Buy More Users

1. **Click "Buy more users"**
2. A popup titled **Add Seats** will appear.
3. **Enter Quantity** – specify how many additional users (seats) you want to purchase.
4. The **cost** will be calculated automatically based on your plan rate (e.g., USD 100 per user).
5. Click the **Proceed** button to finalize the purchase.
6. The seats will be **immediately added** to your account.

<img width="436" alt="buy-more-seats" src="https://github.com/user-attachments/assets/2e093a64-1b75-4543-b4c4-1186d4c02b09"></img>

7. Once you’ve purchased additional seats, click the **"+" Add User** button to create the new user.

> 💡 **Tip:** You can also purchase additional seats in advance to avoid interruptions during user onboarding.

---

### 🔢 Understanding "Available Seats"

At the bottom-right of the **Users** page, you’ll see the **Available seats** status.

<img width="436" alt="seat-availability" src="https://github.com/user-attachments/assets/37c2a5c7-0d4b-4bd2-8fb1-11def9e65b42"></img>

**Example:**  
`Available seats: 2/3`

This means:
- **2 seats** are currently available for creating new users.
- **3** is the **total number of user seats** your organization has purchased.

If the available seats count is **0**, you must **buy more seats** before adding new users.

---

## 📌 Frequently Asked Questions (FAQ)

**Q: How do I pay for purchased add-on users?**  
**A:** After purchasing additional users (seats), your saved card will be charged automatically, and an invoice will be emailed to your registered address.
If no card is on saved, a payment link will be sent to your email to complete the transaction.

---

## 📣 Need Help?

If you need further assistance, feel free to reach out to our customer support at **support@opensignlabs.com**.

For more support and updates, follow us on:

- 🌐 [Website](http://www.opensignlabs.com)
- 🐦 [Twitter](https://twitter.com/OpenSignHQ)
- 📘 [Facebook](https://www.facebook.com/profile.php?id=61551030403669)
- 💼 [LinkedIn](https://www.linkedin.com/company/opensignhq/)
- 📺 [YouTube](https://www.youtube.com/@opensignhq)

---

Happy signing with **OpenSign™**!
