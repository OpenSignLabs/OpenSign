---
sidebar_position: 4
title: Bulk Document Send for Signature Using Template
---
## Overview
Bulk Send allows you to send a document to multiple recipients at once using a template. You can prefill document data, signer details, and import information using a CSV file to automate large-scale document sending.

# How to Use the OpenSign Bulk Document Send Feature to Send Documents for Signature Using a Template

### Step 1: Begin New Template Creation

- **Navigate to New template form**: On the left sidebar, click on "Templates" to expand the menu. and Click on the "Create template" option.

<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/9a21705c-84ff-44c1-81a5-bc4e5cae3c7a" />

### Uploading Your Document

- **[1] Choose File**: Once the "New template" page opens, click here to select and upload the document file from your computer that needs to be signed. Supported formats include PDF, PNG, JPG, JPEG, and DOCX.
- **[2] Choose File from Dropbox**: Click the Dropbox icon to select the document file from your Dropbox account.

### Entering Template Details

- **[3] Title** *(Required)*: Provide a title for your template. For example, "Demo Custom Template."
- **[4] Description**: Optionally add a description to give context or instructions regarding the template. 
- **[5] Note**: Optionally add a note to give context or instructions regarding the document.
You can also configure additional settings such as Send in Order, Allowed Modifications, and other advanced options based on your requirements.

### Proceed to Template Editor
- **Next**: Click the "Next" button to proceed to the next stage of template creation, where you can add widgets and finalize the template.
- **Cancel**: If you need to start over or make changes, click Cancel button to clear the form.
  
## Step 2: Add Roles and Widgets

### Add Prefill Widgets

- Select the **Prefill role** from the right-side panel.  
- Drag and drop Prefill widgets onto the document.

<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/e9d07206-254d-48b6-9ea5-19f3ca1ce080" />

#### Add widgets against the role

- Select the role → Click Signature Widget → Place it where the signature is required.
- You can add multiple signature widgets for each role.

After placing the Signature widget, the following options are available:

### Add Other Widgets

You can also add additional widgets such as:

- Stamp  
- Initials  
- Name  
- Date  
- Text  
- Checkbox  
- Dropdown  
- Cells
- Number
- Image 

---

## Step 3: Save Template

- Click **Next** after placing and configuring all widgets to save the template.

After saving, a **Create Document** popup will appear with the message:

> *"What would you like to do with the template you just created?"*

You will see the following options:

- Use Template  
- **Bulk Send**  
- Embed  
- Copy Public URL  

Click **Bulk Send** to open the Bulk Send panel and start sending documents in bulk.

---

## Prefill Widgets in Bulk Send

OpenSign supports **Prefill Widgets** in Bulk Send.

When a template contains Prefill Widgets:

- Prefill fields appear in the **Bulk Send panel**
- Users can enter values before sending
- Entered values are automatically embedded into the document
- Both **Required** and **Optional** Prefill fields are supported

<img width="828" alt="Bulk send panel" src="https://github.com/user-attachments/assets/567c4549-52aa-477d-8c94-a5acc6835ce6" />

---

## Import Data Using CSV

You can upload a CSV file to automatically populate Prefill fields and signer details.

<img width="828" alt="bulk import from csv" src="https://github.com/user-attachments/assets/d4aa2fd0-80a9-4e6b-8261-4331f1c9fc17" />

### Steps to Import CSV
1. Click **Download sample file**
2. Add your data to the sample CSV
3. Upload the CSV file in Bulk Send
4. Click **Send**

**Important:**
- Do **not change column names** in the CSV file  
- **CSV import is NOT available in Free Self-Host version**

---

## Date Format Rules (CSV Only)

For **Date-type Prefill fields in CSV**, you must use:
**Format:** `DD-MM-YYYY`  
**Example:** `28-01-2026`

- On the document, users may use any date format, but in the Excel/CSV file the date must strictly follow `DD-MM-YYYY`.
- After import, the date automatically converts to the widget’s selected format

---

## Checkbox Widget – Multiple Selection (CSV)

Checkbox widgets support multiple values in CSV.

Use the **pipe separator `|`** between options.

**Example:** Option-1|Option-2
---

## Unsupported Prefill Imports

The following widget values **cannot be imported via CSV**:

- Image widgets  
- Draw widgets  

---

## Signer Widgets in Bulk Send

Bulk Send also supports **Signer Widgets**.

- Signer widgets appear with **Signer Role + Widget Name**
- You can prefill signer details before sending
- When signer receives the document:
  - Prefilled values are visible
  - Signer can edit/update values
  - Signer can complete the document

### Notes

- All signer widget prefills are **optional**
- You can send without entering signer widget values
- Signers widgets prefilling is **NOT supported** for:
  - Signature
  - Stamp
  - Initials
  - Image

Signer details can also be imported via CSV.

---

## CSV Rules for Signer Widgets

### Date Format (Same Rule)
Use:

`DD-MM-YYYY` (Example: `28-01-2026`)

### Checkbox Multiple Selection
Use:

`Option-1|Option-2`

---

## Bulk Send Limits

OpenSign allows sending up to **1000 documents per Bulk Send**.

The number depends on signer roles:

- **1 Role in template → 1000 documents** (This depends on the number of signers included in the Bulk Send request.)
- **2 Roles in template → 500 documents**
- More roles reduce total documents accordingly
- Each document consumes 1 API credit. If you create 200 documents, then 200 premium credits will be deducted.(Premium credits)
---
## Sending Documents via Bulk Send

- Assign signers to the roles shown in the popup.  
- To create multiple documents, click **Add New** to add more signers.  
- After adding all signers, click **Send**.  

Signature request emails will be sent to the respective signers, and the created documents will appear under the **In Progress Documents** report.

---

### Step 4: Bulk Send from Manage Templates
For faster processing, the Bulk Send feature allows you to swiftly create and send a document to a signer using the selected template.

<img width="828" alt="Manage Template" src="https://github.com/user-attachments/assets/cb6f77ef-a542-49c9-a0ab-1cc568dc54df" />

How to Send the Document:
-  Click the Bulk Send button next to the template in the list.
    
-  A popup will open where you can assign signers to each role by entering their email addresses and fill in any Prefill widgets available in the template.
    
-  If you need to create multiple documents, click the Add New button.
    
After adding the signers, click the Send button. This will generate the document and send an email to the signers with a signature request.

### Step 5: Signers Signing Process

### OTP Verification Disabled

If **OTP Verification = No**, the signer can directly open and sign the document without email verification.

- The signer clicks the **Sign Here** link in the email  
- The document opens immediately for signing  

---

### OTP Verification Enabled

If **OTP Verification = Yes**, email verification is required before signing.

- The signer clicks **Sign Here** in the email  
- The email verification screen appears  
- Click **Get Verification Code** to receive an OTP  
- Enter the OTP and click **Verify**  
- After successful verification, the document opens and the signer can proceed to sign  

<div>
  <img width="800" alt="OpenSign send OTP" src="https://github.com/user-attachments/assets/b82c796a-98e3-4296-bde1-fe86b1b993ad" />
</div>
<div>
  <img width="800" alt="OpenSign verify otp" src="https://github.com/user-attachments/assets/63cf4b75-9d47-4630-a83c-e916a5c13b3c" />
</div>

### Step 6: Finalizing the Process

To sign the document, the signer clicks the **Signature widget**, which provides options to **draw**, **upload**, or **type** their signature.
If any signer fields were prefilled by the document owner, the signer can review and edit those values if needed. After completing all required fields, the signer should click **Finish**.

- If the signer is the **final signer**, they will have the option to **download or print** the signed document along with the **Completion Certificate**.  
- If there are **multiple signers**, the document will automatically move to the next signer. Once all signers have completed the process, each signer will be able to **download and print** the final signed document and Completion Certificate.

<img width="800" alt="OpenSignFinalStep" src="https://github.com/user-attachments/assets/427c9e9e-4300-40e6-8ded-23afeb844e39" />

---

## Additional Information

- All fields marked with an asterisk (*) must be completed before submitting the document.  
- Ensure the uploaded document format is supported by OpenSign.  
- Signed documents can be found in the **Root folder** or the folder you selected.  
- **Bulk Send is available only in paid plans.**

If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!write 
