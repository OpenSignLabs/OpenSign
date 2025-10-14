---
sidebar_position: 2
title: Request signatures
---

# Request signatures using OpenSign™

## Interface Overview

The OpenSign™ Request signatures interface is designed to streamline the process of creating, preparing, and sending documents for electronic signature.

# How to Create and Send a Document for Signature with OpenSign™

### Step 1: Begin New Document Creation

- **Navigate to Request Signatures form**: Start by navigating to 'Request Signatures' from the main menu to initiate the creation of a document for signatures.

<img width="800" alt="request signatures" src="https://github.com/user-attachments/assets/65087c2d-a1e4-4735-8420-759ea97b38aa" />

### Uploading Your Document

- **[1] Choose File**: Once the "Request signature" form opens, click "Choose file" button to select and upload the document file from your computer that needs to be signed. Currently you can upload only 1 file at a time but you can add additional documents by clicking "Add pages" in the next step.
- **[2] Choose File from Dropbox**: Click the dropbox icon to select the document file from your dropbox account.

### Entering Document Details And Signers

- **[3] Title** *(Required)*: Input the title of your document. This identifier will be visible to signers and in your document management.
- **[4] Signers**: Use the dropdown to select existing signers or use the addition button to add a new signer who needs to sign the document. (Here, add the signer's details such as name, email, and phone number). 
- **[5] Note**: Optionally add a note to give context or instructions regarding the document.

### Organizing Your Document

- **[6] Folder**: Select a folder where you want the document to be stored, or leave it to default to the 'Root' folder. You can browse your documents in a beautiful explorer view by navigating to "OpenSign™ Drive".
  
### Set the sending order
- **[7] Send in Order**

  **If you choose:**
  - **Yes**: Selecting this option will send the signing request to the first signer initially. Once the first signer completes their part, the next signer in the sequence will receive the request. This process continues until all signers have signed the document. This method ensures that the document is signed in a specific order.
  - **No**: Selecting this option will send the signing links to all signers simultaneously. Every signer can sign the document at their convenience, regardless of whether other signers have completed their signatures. This method is faster but does not enforce any signing order among the participants.
Select the option that best suits the needs of your document processing.

### Setting the Time Frame
- **[8] Time To Complete (Days)** *(Required)*: Specify the number of days the signers have to complete the signatures. After that, the document will no longer be available for signing.
  
### Setting BCC
- **[9] BCC**: The BCC (Blind Carbon Copy) feature allows users to receive document completion emails at specified email addresses.
You can add multiple contacts in the BCC field to notify several recipients. 
You can either:
Click "Add New" to enter a new email contact, or
Select from existing contacts using the dropdown list.

### Auto reminder
- **[10]** Once you enable the auto reminder, a text field will appear allowing you to set the reminder for a specific number of days.
- **Remind once in every (Days)**: You can specify the reminder interval in days (e.g., every 1 or every 2 days).
Note: You can set a maximum of 15 reminders. For example, if the document completion time is 16 days and you try to schedule a reminder every day, the system will not allow it, as the reminder limit would be exceeded.
This feature only available for the paid users.

### Security Setting
- **[11] Enable OTP Verification** :
  
   - If set to "Yes," the signer will be required to complete email OTP verification before viewing and signing the document.
   - If "Enable OTP Verification" is set to "No," the signer will not be prompted for OTP verification during the signing process.

Note: This feature is available exclusively on paid plans.

### Enable tour:
- **[12]** If set to "Yes," the signer will see the tour guide while signing the document. If your signer is familiar with OpenSign and you prefer not to display the tour guide, you can select "No," and the tour guide will not be shown to your signers.

### Notify on signatures: 
- **[13]** If set to "Yes," the document owner will receive an email notification each signer completes their signature.
Note: This feature is available exclusively on paid plans.

### allow modifications: 
- **[14]** If set to Yes, the signer will be allowed to make modifications to the document during the signing process. However, they cannot edit or remove any fields that were already placed by the document owner. They can only add basic fields such as signature, stamp, initials, text, and cells.

If both Allow Modification and Enable OTP are set to Yes, the signer will still not be able to edit or delete existing fields, but will gain access to additional advanced fields to add during signing. These include: signature, stamp, initials, name, job title, company, text, cells, and email.

Note: This feature is available exclusively on paid plans.

### Redirect url: 
- **[15]**  After signing the document and upon its completion, the signer will be redirected to the specified URL.

### Step 2: Proceed to Document Creation Panel
- **Next**: Once all the necessary fields are filled, click this button to proceed to create the document for signing.
- **Cancel**: If you need to start over or make changes, click this button to clear the form.
  
### Step 3: Document Creation  
## Prefill Widgets 

The **Prefill Widgets** feature lets document creators prefill specific fields before sending a document for signature. This ensures that important details (such as date, name, email, images, checkboxes, radio buttons, or custom text) are already completed when recipients receive the document. By default, prefilled data cannot be edited by signers.  

<img width="800" alt="Prfill" src="https://github.com/user-attachments/assets/4794b2a9-acc0-4ef8-8110-076f0d90cc57" />

---

**✨ Key Benefits**
- ✅ Save time by auto-filling repetitive information.  
- ✅ Ensure accuracy for critical fields (e.g., company name, contract number).  
- ✅ Maintain consistency across multiple signers and templates.  
- ✅ Reduce signer effort for a smoother signing experience.  

---

**🛠️ How It Works**
1. **Add Widgets to the Document**  
   - Open the right-side panel, select **Prefill Widgets**, then drag and drop the required widgets (Text, Date, Checkbox, Dropdown, Image, etc.) onto the document.  

2. **Enter Prefill Value**  
   - Provide the default value (e.g., *"Company: OpenSign Labs"*, *Date: 30/09/2025*).  
   - For option-based widgets (Dropdown, Radio, Checkbox), choose the option to be prefilled.  

---

**📋 Supported Widgets for Prefill**
- **Text Field** – Names, job titles, company names, contract IDs  
- **Date Field** – Default signing date or contract start date  
- **Dropdown** – Preselect an option  
- **Radio Button** – Prefill with a selected choice  
- **Checkbox** – Prefill as checked or unchecked  
- **Image** – Insert a default image (e.g., logo or stamp) 

---

**Add Widgets for Signers**

<img width="800" alt="request signatures" src="https://github.com/user-attachments/assets/25997f4c-6fbf-4851-b8a8-a803c3343f87" />

- **[1] Add signature widget**: Once your document is loaded in the document creation panel, you'll need to add a signature widget for each signer. OpenSign provides an intuitive interface for this task. Select the signer from the right side panel, click on the signature widget, and position it where the signature is required.
Use the option on the right side to add recipients if you need to include additional signers. You can place multiple signature widgets for each signer, as required.

  After placing the Signature widget, you will see the options on the widget such as:
  - **Add Signer/Change Signer**: Clicking the first icon on the signature widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
  - **Copy Signature**: Clicking on this option reveals the following choices.
    -  All pages: It will copy the signature widget to all pages.
    -  All pages but last: It will copy the signature widget to all pages except the last page.
    -  All pages but first: It will copy the signature widget to all pages except the first page.
 
- **[2] Add other widgets**: Depending on your needs, you can include additional widgets such as:
 - **Stamp**: The stamp widget allows signers to add a stamp to the document. Signers can upload their stamp during the signing process. After placing the Stamp widget, you will see the options on the widget such as:
      - Setting icon: By clicking on the option, you can specify whether this widget is mandatory or optional during the document signing.
      - Add Signer/Change Signer: Clicking the second option on the stamp widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
      - Copy Stamp: Clicking on this option reveals the following choices.
        -  All pages : It will copy the stamp widget to all pages.
        -  All pages but last: It will copy the stamp widget to all pages except the last page.
        -  All pages but first: It will copy the stamp widget to all pages except the first page.
 - **Initials**: The initials widget allows signers to add their initials to the document. During the signing process, signers can draw, upload, or type their initials. After placing the Initials widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can specify whether this widget is mandatory or optional during the document signing.
    - Add Signer/Change Signer: Clicking the first icon on the Initials widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy Initials: Clicking on this option reveals the following choices.
      -  All pages : It will copy the initials widget to all pages.
      -  All pages but last: It will copy the initials widget to all pages except the last page.
      -  All pages but first: It will copy the initials widget to all pages except the first page.
 - **Name**: The name widget allows signers to add their name or any other text, functioning like a text field during the signing process. After placing the name widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Add Signer/Change Signer: Clicking the first icon on the Name widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the name widget.
 - **Job title**: The Job title widget allows signers to add their Job title or any other text, functioning like a text field during the signing process. After placing the job title widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Add Signer/Change Signer: Clicking the first icon on the Job title widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the job title widget.
  
 - **Company**: The company widget allows signers to add their company or any other text, functioning like a text field during the signing process. After placing the company widget, you will see the options on the widget such as:
     - Setting icon: By clicking on the option, you can set the color and font.
     - Add Signer/Change Signer: Clicking the first icon on the Company widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the Company widget.
 - **Date**: The date widget allows signers to add a date during the signing process. After placing the date widget, you will see the options on the widget such as:
     - Setting icon: By clicking on the option, you can choose from various date formats.
     - Add Signer/Change Signer: Clicking the first icon on the Date widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the date widget. 
 - **Text**: The text field functions as a label. Users can add and type text into this field, which will be embedded in the document when it's sent. This field is not editable by the signer. After placing the Text widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Copy : Clicking on this you can duplicate the Text widget.
  
 - **Text Input**: The text input field is used to collect input from the signer. Signers can type their responses directly into this field. After placing the Text Input widget, you will see the options on the widget such as:
    - Setting : The widget settings panel provides additional customization options, including:
      - Choosing a **font color**
      - Setting the **font size**
      - Marking the field as **required** or **optional**
      - Providing a **default value**
      - Making the field **read-only**
      - Adding a **hint**, which will be displayed on the widget for better clarity
      - **Custom Validations** are also supported, including:
       - Predefined formats like **SSN**, **email**, or **numeric values**
       - Custom JavaScript validations using regular expressions
         - For example:
          - `^\d+$` – allows only digits
          - `^[A-Z]+$` – allows only uppercase letters  

  You can enter your regex pattern in the **Validations** field of the widget.  
  *(Optional reference: [JavaScript RegExp guide](https://www.w3schools.com/jsref/jsref_obj_regexp.asp))*
  
   - Add Signer/Change Signer: Clicking the first icon on the Text Input widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.

   - Copy : Clicking on this you can duplicate the Text Input widget.

- **Cells**  
  The **Cells widget** is ideal for documents that require input in a structured, table-like format, allowing the signer to fill in details within individual cells. After dragging and dropping the widget onto the document, you can adjust the number of cells by moving the **blue marker**.
  
<img width="800" alt="Cells widget" src="https://github.com/user-attachments/assets/2a301776-5275-4daf-b361-fd48af2878fc" />

  The widget settings panel provides additional customization options, including:
   - Manually entering the **number of cells**
   - Choosing a **font color**
   - Setting the **font size**
   - Marking the field as **required** or **optional**
   - Providing a **default value**
   - Making the field **read-only**
   - Adding a **hint**, which will be displayed on the widget for better clarity

  **Custom Validations** are also supported, including:

   - Predefined formats like **SSN**, **email**, or **numeric values**
   - Custom JavaScript validations using regular expressions

  For example:
   - `^\d+$` – allows only digits  
   - `^[A-Z]+$` – allows only uppercase letters  

  You can enter your regex pattern in the **Validations** field of the widget.  
  *(Optional reference: [JavaScript RegExp guide](https://www.w3schools.com/jsref/jsref_obj_regexp.asp))*

<img width="800" alt="request signatures" src="https://github.com/user-attachments/assets/dee17fe8-243b-4113-896a-00424d12ea8a" />

 - **Checkbox**: The checkbox widget is used to capture input in the form of a checkbox selection. Once you drop the checkbox widget, a popup will open where you can set the checkbox name and options. Additionally, there are a few options available such as setting the minimum and maximum checks, making the checkbox read-only, and hiding the label.
     - Add Signer/Change Signer: Clicking the first icon on the CheckBox widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the Checkbox widget.
- **Dropdown**: Once you drop the dropdown widget, a popup will open where you can set the dropdown name and options. Additionally, there are a few options available such as setting a default value and marking the dropdown as required or optional.
     - Add Signer/Change Signer: Clicking the first icon on the Dropdown widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the dropdown widget.
 - **Radio button**: The radio button widget is used to capture input in the form of a radio button selection. Once you drop the radio button widget, a popup will open where you can set the radio button name and options. Additionally, there are a few options available such as setting a default value, making the radio button read-only, and hiding the label.
     - Add Signer/Change Signer: Clicking the first icon on the Radio button widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the radio button widget.
 - **Image**: The image widget allows signers to upload an image during the signing process. After placing the Image widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can specify whether this widget is mandatory or optional during the document signing.
    - Add Signer/Change Signer: Clicking the first icon on the Image widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the image widget.
 - **Email**: The email widget is used to enter an email address during the signing process. It only accepts input in a valid email format. If the signer enters invalid text, a validation error will occur, and the document cannot be completed until it's corrected. After placing the email widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Add Signer/Change Signer: Clicking the first icon on the Email widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the email widget.
  ### 📄 Document Page Controls
- **Navigating Between Pages in OpenSign™**
  To navigate between pages of a document that you have uploaded either click on the previous page ∧ & V next page  buttons at the top or click on any of the page previews loaded on the left side.
  
  <img width="918" alt="OpenSign Page controls" src="https://github.com/user-attachments/assets/c577e165-f8ac-45c7-bc6f-d499c710a7ed" />

- **Add Pages**  
  In the left-side panel, users will see an **"Add" button**. Clicking it allows users to select and merge new documents into the current one.

- **Delete Page**  
  An option is available to **delete** any unwanted page from the document.

- **Reorder Pages**  
  Users can reorder pages by clicking the **"Reorder" button**, which opens a popup displaying all pages. Use the **Up** and **Down** arrows to change the order. Click **Save** to apply the new page order.

- **Zoom In / Zoom Out**  
  Controls are available to **zoom in** or **zoom out** of the document view.

- **Rotate Page**  
  Options are provided to **rotate pages** in both **clockwise** and **counterclockwise** directions.
      
### Step 4: Next:
- **Next**: After adding the widgets and signatures, click the 'Next' button. The document will then be created.

### Step 5: Send Mail
After finishing the document creation, a 'Send Mail' popup will appear, offering options to Send Email, Customize Email, Copy Link, or Share the document.
  - Send Email: Click the 'Send' button to send the document for signing to all signers. If the sending order is set to 'Yes', it will send the document to the first signer.

  - Customize Email: Click the 'Customize Email' button to open the email editor. Here, you can set variables and customize the content. After clicking 'Send', the document will be sent for signing to all signers, or if the sending order is set to 'Yes', it will be sent to the first signer with the customized email.

  - Copy Link: You can copy the link to sign the document.
  
  - Share: Use this option to share the document via email, WhatsApp and other Windows apps
    
  <img width="800" alt="request signatures" src="https://github.com/user-attachments/assets/e2344479-daae-43ff-a61a-14ea98b237d6" />   
                                                                                                                             
## Signers Signing Process
### Step 6: Email OTP verification
Once the email is received, the signer can click the 'Sign Here' button. This will open the email verification page. After clicking the 'Get Verification Code' button, an OTP (one-time password) will be sent to the signer’s email address. Enter the received OTP into the verification textbox and click the 'Verify' button.

<div>
  <img width="800" alt="OpenSign send OTP" src="https://github.com/user-attachments/assets/b82c796a-98e3-4296-bde1-fe86b1b993ad" />
</div>
<div>
  <img width="800" alt="OpenSign verify otp" src="https://github.com/user-attachments/assets/63cf4b75-9d47-4630-a83c-e916a5c13b3c" />
</div>

### Step 7: Finalizing the Process:

After verification, the signer will be redirected to the document signing page, where he can view the document received for signing. To sign, the signer simply clicks on the signature widget, which allows them to draw, upload a digitally scanned signature, or type the signature. 

After filling out all assigned widgets, click the 'Finish' button. Once the document is finished,.
   - The signer has the option of downloading or printing the signed document. He will also obtain the completion certificate if he is the final signer.  

   - If there are more than one signer, the document will be immediately sent to the next signer. Once all signers have finished their signatures, they can download and print the signed document as well as the completion certificate.
<img width="800" alt="OpenSignFinalStep" src="https://github.com/user-attachments/assets/f4783aa0-2879-4ec2-9ddc-16d59f3a1fc0" />

## Additional Information
- All fields marked with an asterisk (*) must be completed before the document can be submitted.
- Ensure that the document format is supported by OpenSign before uploading.
- Signed documents can be accessed in the designated 'Root' folder or the one you have specified.

If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!
