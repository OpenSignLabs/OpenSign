---
sidebar_position: 3
title: Widgets in OpenSign
---

# 🧩 Understanding Widgets in OpenSign

Widgets in **OpenSign** are interactive fields that you can place on your documents to collect information, signatures, or confirmations from recipients during the signing process.  

They make your documents dynamic — allowing signers to fill in details like names, dates, numbers, checkboxes, or digital signatures directly within the document.  

Widgets help you:
- Create fillable and interactive documents  
- Control the type of input signers can provide (text, date, number, etc.)  
- Ensure data consistency and validation  
- Streamline form completion and signing workflows  

OpenSign offers various widget types such as **Signature**, **Initial**, **Text**, **Date**, **Checkbox**, **Stamp**, and now the newly added **Number Widget** — each designed for specific use cases.  

# 🧮 Number Widget – Help Guide

The **Number Widget** in **OpenSign** allows you to collect numeric input from signers within your document — such as phone numbers, invoice totals, employee IDs, or any other numerical values.

This widget ensures that only **numbers** can be entered, helping maintain data accuracy and consistency in your signed documents.

---

## 🔹 Purpose

Use the **Number Widget** when you need signers to input strictly numerical data during the signing process.  
It’s ideal for:

- Numeric IDs (e.g., Employee ID, Order Number)
- Contact numbers
- Amounts or values
- Zip/Postal codes
- Quantity or count fields

---

## 🧭 How to Add the Number Widget

1. Open a document in the **OpenSign editor**.  
2. From the **Widget Toolbar**, select **“Number”**.  
3. Click anywhere on the document where you want the number field to appear.  
4. Adjust the size and position as needed.  
5. Assign the widget to a **signer** (if the document has multiple signers).

---

## ⚙️ Widget Properties

You can configure the following options for the **Number Widget**:

| **Property** | **Description** |
|---------------|-----------------|
| **Label** | Adds a name or description for the field (e.g., *Enter Invoice Number*). |
| **Placeholder** | Displays a hint or example inside the field before the signer types (e.g., *12345*). |
| **Default Value** | Pre-fills the field with a number (optional). |
| **Required** | Makes the field mandatory for the signer to complete before submission. |
| **Read-Only** | Displays the number but prevents editing by the signer. |
| **Validation** | Ensures only numbers are entered — no alphabets or special characters are allowed. |

---

## ✍️ Signer Experience

When the document is opened for signing:

- The signer will see a numeric input box where the Number Widget is placed.  
- Only **digits (0–9)** can be entered in the field.  
- If the field is marked **Required**, the signer cannot complete signing without entering a number.  
- The entered number will appear in the final signed PDF.

---

## 📄 Example Use Case

**Scenario:**  
You’re sending a purchase order form where the vendor needs to enter a **quotation amount**.  
Add a **Number Widget** labeled “Quotation Amount” and mark it as **Required**.  
This ensures the vendor provides a valid numeric value before submitting the signed document.

---

## 💡 Tips

- Use the **Number Widget** for fields where accuracy is critical — such as payment amounts or IDs.  
- Combine with **Text** or **Date Widgets** to create comprehensive forms.  
- Avoid using the **Number Widget** for formatted data (e.g., currency symbols, percentages). For such cases, predefine formatting in the document.

---

## 🔐 Output in Final Document

Once signed, the numeric input appears exactly as entered in the signed PDF, maintaining consistent alignment and formatting.

---

> 📝 *Tip: You can include screenshots here for better visual guidance (e.g., toolbar selection, widget placement, and signer view).*
