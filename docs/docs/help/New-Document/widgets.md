---
sidebar_position: 3
title: Widgets in OpenSign
---

# 🧩 Understanding the Number Widget

Widgets in **OpenSign** are interactive fields that you can place on your documents to collect information, signatures, or confirmations from recipients during the signing process.  

They make your documents dynamic — allowing signers to fill in details like names, dates, numbers, checkboxes, or digital signatures directly within the document.  

**Widgets help you:**
- Create fillable and interactive documents  
- Control the type of input signers can provide (text, date, number, etc.)  
- Ensure data consistency and validation  
- Streamline form completion and signing workflows  

OpenSign offers various widget types such as **Signature**, **Initial**, **Text**, **Date**, **Checkbox**, **Stamp**, and the newly added **Number Widget** — each designed for specific use cases.

---

# 🧮 Number Widget

The **Number Widget** in **OpenSign** lets you collect numeric input from signers within your document.  
It can also perform **dynamic calculations** using values from other number widgets.

This widget ensures that only **numbers** are entered, helping maintain data accuracy and consistency across signed documents.

---

## 🔹 Purpose

Use the **Number Widget** when you need signers to input strictly numeric data during the signing process.  
It’s ideal for:

- Numeric IDs (e.g., Employee ID, Order Number)  
- Amounts or currency values  
- Quantity or item counts  
- Zip/Postal codes  

---

## 🧭 How to Add a Number Widget

1. Upload the document and open the Create Document panel. 
2. From the **Widget Toolbar**, select **“Number”**.  
3. Click anywhere on the document where you want the number field to appear.  
4. Adjust its size and position as needed.  
5. Assign the widget to a **signer** (if the document has multiple signers).  

---

## ⚙️ Widget Properties

You can configure the following options for the **Number Widget**:

| **Property** | **Description** |
|---------------|-----------------|
| **Name** | A unique identifier for this number widget. <br/>• Example: `number-1`, `number-2` <br/>• Must be unique within the document. <br/>• Used in formulas as `{{number-1}}`. <br/>🔸 *If you include a number widget in a formula, its name must be unique, since formulas rely on these identifiers.* |
| **Default Value** | (Optional) Sets an initial numeric value for the widget. This value appears automatically unless changed by the signer or overridden by a formula. |
| **Formula** | Defines a calculation using other number widgets.|
| **Required / Optional** | Specifies whether the signer must complete the field before submission. |
| **Placeholder** | Displays hint text before input (e.g., *12345*). |
| **Font Size** | Controls the font size of the number displayed on the document. |
| **Color** | Sets the font color for the number field. |

---

## ✍️ Signer Experience

When the document is opened for signing:

- The signer will see a **numeric input box** at the widget’s location.  
- Only **digits (0–9)** can be entered.  
- If marked as **Required**, the signer cannot finish signing without entering a number.  
- The entered value appears in the final signed PDF.

---

## 🔢 Using Formulas in the Number Field

You can use number widgets to perform **arithmetic and algebraic calculations** inside the **Formula** field.  
Assume you have four number widgets named:  
`number-1`, `number-2`, `number-3`, and `number-4`.

---

### 🧩 Basic Formulas

| **Formula** | **Description** | **Example Result** |
|--------------|-----------------|--------------------|
| `{{number-1}} + {{number-2}}` | Adds two numbers | 10 + 5 = **15** |
| `{{number-1}} - {{number-3}}` | Subtracts one number from another | 20 - 4 = **16** |
| `{{number-1}} * {{number-2}}` | Multiplies two numbers | 6 * 3 = **18** |
| `{{number-1}} / {{number-2}}` | Divides one number by another | 25 / 5 = **5** |
| `({{number-1}} + {{number-2}}) * {{number-3}}` | Groups values using parentheses | (4 + 6) * 2 = **20** |
| `{{number-1}} + {{number-2}} - ({{number-3}} * {{number-4}})` | Combines multiple operations | 10 + 8 - (2 * 3) = **12** |

---

### 🧮 Advanced Formulas

| **Formula** | **Description** | **Example Result** |
|--------------|-----------------|--------------------|
| `({{number-1}} + {{number-2}} + {{number-3}}) / 3` | Calculates the average of three widgets | (10 + 20 + 30) / 3 = **20** |
| `({{number-1}} * {{number-2}}) + ({{number-3}} / {{number-4}})` | Combines multiplication and division | (5 * 6) + (8 / 4) = 30 + 2 = **32** |
| `({{number-1}} + {{number-2}}) * ({{number-3}} - {{number-4}})` | Multiplies a sum by a difference | (10 + 5) * (6 - 2) = 15 * 4 = **60** |
| `({{number-1}} * {{number-2}} * {{number-3}}) / {{number-4}}` | Calculates a scaled ratio | (2 * 3 * 4) / 2 = 24 / 2 = **12** |
| `({{number-1}} + {{number-2}} + {{number-3}} + {{number-4}}) / 4` | Finds the average of four widgets | (8 + 10 + 12 + 14) / 4 = **11** |
| `{{number-1}} * ({{number-2}} + {{number-3}} - {{number-4}})` | Weighted total | 5 * (10 + 4 - 2) = 5 * 12 = **60** |
| `({{number-1}} * {{number-2}} + {{number-3}}) * {{number-4}}` | Compound operation using addition and multiplication | (3 * 4 + 2) * 5 = (12 + 2) * 5 = **70** |

---

## 🧠 Tips

- Use **parentheses `( )`** to control calculation order.  
- Formulas follow **standard arithmetic precedence** (multiplication/division before addition/subtraction).  
- Only **number widgets (`{{number-x}}`)** can be used in formulas.  
- Non-numeric fields (like text or date) are **not supported** in formula expressions.  
- Ensure all widget names used in formulas exist in the same document.

---
# 📎 Understanding the Attachment Widget

The **Attachment Widget** allows signers to upload supporting files directly while completing and signing a document. This is useful when additional documents or evidence are required as part of the signing workflow.
<img width="1731" height="811" alt="image" src="https://github.com/user-attachments/assets/201ac106-3b3a-49c0-a8e3-07ef916944b4" />

Examples of files that can be requested include:

- Identity documents (Passport, Driver's License, ID Card)
- Proof of address
- Supporting agreements or contracts
- Certificates and licenses
- Other required supporting documents

## Benefits of the Attachment Widget

The Attachment Widget helps you:

- Collect supporting documents from signers
- Keep all required files associated with a document in one place
- Eliminate the need for separate email attachments
- Streamline document collection and verification workflows
- Ensure signers provide the necessary supporting information before completing the document

## How the Attachment Widget Works

1. Signers can upload up to **5 files** using a single Attachment Widget.
2. Each file can be a maximum of **10 MB** in size.
3. A single Attachment Widget can therefore accept up to **50 MB** of attachments in total.
4. Supported file formats include:
   - PDF (`.pdf`)
   - Microsoft Word (`.docx`)
   - PNG (`.png`)
   - JPG (`.jpg`)
   - JPEG (`.jpeg`)
5. Once the signer uploads the files and completes the signing process, the uploaded files are appended as additional pages to the end of the original PDF document.
<img width="1731" height="876" alt="document attchement" src="https://github.com/user-attachments/assets/6325793e-a4ed-4aed-ab12-5e29e625f28a" />

> **Note:** All uploaded attachments become part of the completed document package, making it easier to store, review, and share the signed document along with its supporting files.

## 📩 Need Help?

If you need further assistance, contact our support team at **support@opensignlabs.com**.

Happy Signing with **OpenSign™**!
