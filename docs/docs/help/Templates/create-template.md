---
sidebar_position: 1
title: Create Templates
---

## Getting Started

Creating a template in OpenSign is straightforward and can significantly enhance your document workflow. Follow these steps to create a custom template:

# How to Create a Template in OpenSign™

## Step 1: 
### Begin New Template Creation

- **Navigate to New template form**: On the left sidebar, click on "Templates" to expand the menu. and Click on the "Create template" option.

<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/143a752c-1ee3-4424-afe4-65922b71ddbb" />

### Uploading Your Document

- **[1] Choose File**: Once the "New template" page opens, click here to select and upload the document file from your computer that needs to be signed. Supported formats include PDF, PNG, JPG, JPEG, and DOCX.
- **[2] Choose File from Dropbox**: Click the Dropbox icon to select the document file from your Dropbox account.

### Entering Template Details

- **[3] Title** *(Required)*: Provide a title for your template. For example, "Demo Custom Template."
- **[4] Description**: Optionally add a description to give context or instructions regarding the template. 
- **[5] Note**: Optionally add a note to give context or instructions regarding the document.

### Set the sending order
- **[6] Send in Order**
  - **If you choose:**
  - **Yes**: Selecting this option will send the signing request to the first signer initially. Once the first signer completes their part, the next signer in the sequence will receive the request. This process continues until all signers have signed the document. This method ensures that the document is signed in a specific order.
  - **No**: Selecting this option will send the signing links to all signers simultaneously. Every signer can sign the document at their convenience, regardless of whether other signers have completed their signatures. This method is faster but does not enforce any signing order among the participants.
Select the option that best suits the needs of your document processing.
### Auto reminder (feature only available for subscribed users)
- **[7]** Once you enable the auto reminder, a text field will appear allowing you to set the reminder for a specific number of days.
  - **Remind once in every (Days)**: Here, you can set the number of days for the reminder.

  Note: You can set a maximum of 15 reminders. For example, if the document completion time is 16 days and you try to schedule a reminder every day, the system will not allow it, as the reminder limit would be exceeded.
  
### Time to complete (days)
- **[8]** You can specify the number of days within which the document must be signed. For example, if you set the expiration period to 15 days, the created document will remain available for signing for 15 days from the date of creation. After this period, the document will expire, and the signer will no longer be able to sign it.

###  BCC
- **[9]** The BCC (Blind Carbon Copy) feature allows users to receive document completion emails at specified email addresses.
You can add multiple contacts in the BCC field to notify several recipients. 
You can either:
Click "Add New" to enter a new email contact, or
Select from existing contacts using the dropdown list.

### Security Setting
- **[10] Enable OTP Verification** :
  
If set to "Yes," the signer will be required to complete email OTP verification before viewing and signing the document. If "Enable OTP Verification" is set to "No," the signer will not be prompted for OTP verification during the signing process.
Note: This feature is available exclusively on paid plans.

### Enable tour:
  
- **[11]** If set to "Yes," the signer will see the tour guide while signing the document. If your signer is familiar with OpenSign and you prefer not to display the tour guide, you can select "No," and the tour guide will not be shown to your signers.

### Notify on signatures:
  
- **[12]** If set to "Yes," the document owner will receive an email notification each signer completes their signature.
Note: This feature is available exclusively on paid plans.

### Allow modifications: 

- **[13]** If set to Yes, the signer will be allowed to make modifications to the document during the signing process. However, they cannot edit or remove any fields that were already placed by the document owner. They can only add basic fields such as signature, stamp, initials, text, and cells.

If both Allow Modification and Enable OTP are set to Yes, the signer will still not be able to edit or delete existing fields, but will gain access to additional advanced fields to add during signing. These include: signature, stamp, initials, name, job title, company, text, cells, and email.

Note: This feature is available exclusively on paid plans.

### Redirect url: 
- **[14]**  After signing the document and upon its completion, the signer will be redirected to the specified URL.

### Proceed to Template Creation Panel
- **Next**: Click the "Next" button to proceed to the next stage of template creation, where you can add widgets and finalize the template.
- **Cancel**: If you need to start over or make changes, click Cancel button to clear the form.
## Step 2: 
### Template creation 

<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/986a0068-e711-4367-91b6-349dc1db8c43" />

- **[1] Define Roles**:
  - **Add Roles**: In the roles section on the right, click "+ Add role" to specify the roles involved in the document, such as Candidate, HR, and Manager.
- **[2] Assign Widgets to Roles**: Click on each role to highlight it, then drag and drop the widget to assign it to that role.
  - **[1] Assign signature widget**: The signature widget is used to add a signature to the document. Each role must have at least one signature widget assigned.
    
Select the Role from the right side panel, click on the signature widget, and position it where the signature is required. You can place multiple signature widgets for each Role, as required.

  After placing the Signature widget, you will see the options on the widget such as:
  - **Add Signer/Change Signer**: Clicking the first icon on the signature widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
  - **Copy Signature**: Clicking on this option reveals the following choices.
    -  All pages: It will copy the signature widget to all pages.
    -  All pages but last: It will copy the signature widget to all pages except the last page.
    -  All pages but first: It will copy the signature widget to all pages except the first page.
    
  - **[2] Add other widgets**: Depending on your needs, you can include additional widgets such as:
   - **Stamp**: The stamp widget allows signers to add a stamp to the document. Signers can upload their stamp during the signing process.
After placing the Stamp widget, you will see the options on the widget such as:
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
 - **Name**: The name widget allows signers to add their name or any other text, functioning like a text field during the signing process.
After placing the name widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Add Signer/Change Signer: Clicking the first icon on the Name widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the name widget.
 - **Job title**: The Job title widget allows signers to add their Job title or any other text, functioning like a text field during the signing process.
After placing the job title widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Add Signer/Change Signer: Clicking the first icon on the Job title widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the job title widget.
  
 - **Company**: The company widget allows signers to add their company or any other text, functioning like a text field during the signing process.
After placing the company widget, you will see the options on the widget such as:
     - Setting icon: By clicking on the option, you can set the color and font.
     - Add Signer/Change Signer: Clicking the first icon on the Company widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the Company widget.
 - **Date**: The date widget allows signers to add a date during the signing process. 
After placing the date widget, you will see the options on the widget such as:
     - Setting icon: By clicking on the option, you can choose from various date formats.
     - Add Signer/Change Signer: Clicking the first icon on the Date widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the date widget. 
 - **Text**: The text field functions as a label. Users can add and type text into this field, which will be embedded in the document when it's sent. This field is not editable by the signer. 
After placing the Text widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Copy : Clicking on this you can duplicate the Text widget.
  
 - **Text Input**: The text input field is used to collect input from the signer. Signers can type their responses directly into this field.
After placing the Text Input widget, you will see the options on the widget such as:
    - Setting icon: The widget settings panel provides additional customization options, including:
       - Choosing a **font color**
       - Setting the **font size**
       - Marking the field as **required** or **optional**
       - Providing a **default value**
       - Making the field **read-only**
       - Adding a **hint**, which will be displayed on the widget for better clarity
       - **Custom Validations** are also supported, including:
       - Predefined formats like **SSN**, **email**, or **numeric values**
          - Custom JavaScript validations using regular expressions
            For example:
             - `^\d+$` – allows only digits  
             - `^[A-Z]+$` – allows only uppercase letters  

  You can enter your regex pattern in the **Validations** field of the widget.  
  *(Optional reference: [JavaScript RegExp guide](https://www.w3schools.com/jsref/jsref_obj_regexp.asp))*
  
  <img width="800" alt="Cells widget" src="https://github.com/user-attachments/assets/ce0c335b-b2bf-4d30-968c-c4c957f46014" />
  
  - Add Signer/Change Signer: Clicking the first icon on the Text Input widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
  -  Copy : Clicking on this you can duplicate the Text Input widget.
    
  - **Cells**  
  The **Cells widget** is ideal for documents that require input in a structured, table-like format, allowing the signer to fill in details within individual cells. After dragging and dropping the widget onto the document, you can adjust the number of cells by moving the **blue marker**.

<img width="800" alt="Cells widget" src="https://github.com/user-attachments/assets/20184017-2fa9-4acb-985f-fde18ee53246" />

   - Setting icon: The widget settings panel provides additional customization options, including:
        - Manually entering the **number of cells**
        - Choosing a **font color**
        - Setting the **font size**
        - Marking the field as **required** or **optional**
        - Providing a **default value**
        - Making the field **read-only**
        - Adding a **hint**, which will be displayed on the widget for better clarity
        - **Custom Validations** are also supported, including:
        -  Predefined formats like **SSN**, **email**, or **numeric values**
        -  Custom JavaScript validations using regular expressions
            - For example:
            - `^\d+$` – allows only digits
            - `^[A-Z]+$` – allows only uppercase letters  

  You can enter your regex pattern in the **Validations** field of the widget.  
  *(Optional reference: [JavaScript RegExp guide](https://www.w3schools.com/jsref/jsref_obj_regexp.asp))*

<img width="800" alt="request signatures" src="https://github.com/user-attachments/assets/100579af-a12f-4c90-8cad-1db697db1f1c" />

 - Add Signer/Change Signer: Clicking the first icon on the Cells widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
  - Copy : Clicking on this you can duplicate the cells widget.
    
 - **Checkbox**: The checkbox widget is used to capture input in the form of a checkbox selection.
Once you drop the checkbox widget, a popup will open where you can set the checkbox name and options. Additionally, there are a few options available such as setting the minimum and maximum checks, making the checkbox read-only, and hiding the label.
     - Add Signer/Change Signer: Clicking the first icon on the CheckBox widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the dropdown widget.
 - **Dropdown**: Once you drop the dropdown widget, a popup will open where you can set the dropdown name and options. Additionally, there are a few options available such as setting a default value and marking the dropdown as required or optional.
     - Add Signer/Change Signer: Clicking the first icon on the Dropdown widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the dropdown widget.
 - **Radio button**: The radio button widget is used to capture input in the form of a radio button selection.
Once you drop the radio button widget, a popup will open where you can set the radio button name and options. Additionally, there are a few options available such as setting a default value, making the radio button read-only, and hiding the label.
     - Add Signer/Change Signer: Clicking the first icon on the Radio button widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the radio button widget.
 - **Image**: The image widget allows signers to upload an image during the signing process.
After placing the Image widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can specify whether this widget is mandatory or optional during the document signing.
    - Add Signer/Change Signer: Clicking the first icon on the Image widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the image widget.
 - **Email**: The email widget is used to enter an email address during the signing process. It only accepts input in a valid email format. If the signer enters invalid text, a validation error will occur, and the document cannot be completed until it's corrected. 
After placing the email widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
    - Add Signer/Change Signer: Clicking the first icon on the Email widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the email widget.
 ### 📄 Edit Template
At the top of the Create Template panel, you’ll find a settings (gear) icon. Clicking this icon opens the Edit Template Details panel, where you can modify various details of your template.

<img width="800" alt="edit template details" src="https://github.com/user-attachments/assets/161d41fd-bf07-485e-ab7b-5b33e0c500bf" />

- **🔁 File Replacement** : Users can replace the existing document by simply uploading a new file. However, certain conditions must be met:
  - The new document must have the same number of pages.
  - The page dimensions (width and height) must be identical to the original.

These conditions are enforced to ensure that, during template editing, the pre-placed widgets remain correctly aligned. If the new document's dimensions don’t match, widgets may shift or be positioned outside the visible area of the document.

<img width="800" alt="Edit template details" src="https://github.com/user-attachments/assets/f03b76d3-6480-4d4b-b310-9f3f4a3acf4c" />

You can also update the following template details: 
- **Template Title** 
- **Description** 
- **Note** 
- **Send in Order**
- **Auto reminder** 
- **Enable OTP Verification** : 
- **Enable tour**:
- **Notify on signatures**:
- **BCC**:
- **Redirect Url**
- **Time to complete (Days)**
Clik on the submit button to save the edits.

 ### 📄 Document Page Controls
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

<img width="918" alt="page controls" src="https://github.com/user-attachments/assets/71e9873b-d8e1-4a01-b0a4-88f9a62b2be4" />

### Save Template 
**Next button**: Once you’ve organized your widgets and set their properties, simply click the “Next” button to save your template.

After doing so, a “Create document” popup will appear, prompting you with the question: “Do you want to create a document using the template you just created?” You’ll have the option to choose either “Yes” or “No.”

**If you select "Yes"**: It will create a document using the template you just created.

**If you select "No"**: You will be redirected to the Manage templates form.

## Step 3:  
### Viewing and Managing Templates  

The **Manage Templates** page displays all the templates you’ve created or have access to. Each template entry shows key details including the template title, file, owner, assigned signers, and its public/private status.  

For a full walkthrough, check the detailed guide here:  
[Manage Templates](https://docs.opensignlabs.com/docs/help/Templates/manage-templates)  

## Additional Information
  - The fields with an asterisk (*) are mandatory.
  - Make sure your document is in PDF, PNG, JPG, JPEG, or DOCX format.
  - You can access your signed documents in the folder you've selected by visiting OpenSign™ Drive anytime. You can also access the documents from reports section.

If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!
