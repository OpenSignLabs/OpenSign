---
sidebar_position: 3
title: Quickly Send the Document for Signature Using Template
---

# How to use the OpenSign Quick Send feature to send a document for signature using a template

### Step 1: Begin New Template Creation

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

<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/cad2a0ee-c3be-4569-a5ae-d1114ea6a853" />

- **[1] Define Roles**:
  - **Add Roles**: In the roles section on the right, click "+ Add role" to specify the roles involved in the document, such as Candidate, HR, and Manager.
- **[2] Assign Widgets to Roles**: Click on each role to highlight it, then drag and drop the widget to assign it to that role.
  - **[1] Assign signature widget**: Select the Role from the right side panel, click on the signature widget, and position it where the signature is required. You can place multiple signature widgets for each Role, as required.

  After placing the Signature widget, you will see the options on the widget such as:
  - **Add Signer/Change Signer**: Clicking the first icon on the signature widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
  - **Copy Signature**: Clicking on this option reveals the following choices.
    -  All pages: It will copy the signature widget to all pages.
    -  All pages but last: It will copy the signature widget to all pages except the last page.
    -  All pages but first: It will copy the signature widget to all pages except the first page.
  - **[2] Add other widgets**: Depending on your needs, you can include additional widgets such as:
Stamps, Initials, Name, Date, Text, Checkbox, and more.

### Step 3: Save Template 
**Next button**: Once you’ve organized your widgets and set their properties, simply click the “Next” button to save your template.

After creating a template, a “Create Document” popup will appear with the prompt:
 “What would you like to do with the template you just created?”

You’ll be presented with the following options: Use Template, Bulk Send, Embed, and Copy Public URL.

- Click Bulk Send to open a popup for selecting signers.
- Assign signers to the roles displayed in the popup. You can create multiple documents by clicking the Add New button to add more signers. Once all signers are added, click Send.
- Request signature emails will be sent to the respective signers, and the documents will be created and listed under the In Progress Documents report.

### Step 4: Bulk Send from Manage Templates
For faster processing, the Bulk Send feature allows you to swiftly create and send a document to a signer using the selected template.

<img width="828" alt="Manage Template" src="https://github.com/user-attachments/assets/8eed5a30-8f67-4b58-bc3d-2a8fed9a1299" />

How to Send the Document:
-  Click the Bulk Send button next to the template in the list.
    
-  A popup will open where you can assign signers to each role by simply adding their email addresses.
    
-  If you need to create multiple documents, click the Add New button.
    
After adding the signers, click the Send button. This will generate the document and send an email to the signers with a signature request.

### Step 5: Signers Signing Process

🔹 Enable OTP Verification: No
If OTP verification is set to No, the signer can access and sign the document directly without email verification.
Once the signer clicks the signature request link received via email, the document will load immediately, allowing them to sign without entering any OTP.

🔹 Enable OTP Verification: Yes
If OTP verification is enabled, the signer must complete email verification before signing.
After receiving the email, the signer should click the ‘Sign Here’ button. This will open the email verification screen.
Click ‘Get Verification Code’ to receive an OTP via email. Enter the OTP into the textbox and click ‘Verify’. Once verified, the document will open and the signer can proceed to sign.

<div>
  <img width="800" alt="OpenSign send OTP" src="https://github.com/user-attachments/assets/b82c796a-98e3-4296-bde1-fe86b1b993ad" />
</div>
<div>
  <img width="800" alt="OpenSign verify otp" src="https://github.com/user-attachments/assets/63cf4b75-9d47-4630-a83c-e916a5c13b3c" />
</div>

### Step 6: Finalizing the Process:

To sign the document, the signer simply clicks on the signature widget, which provides options to draw, upload a scanned signature, or type their name. 

After completing all assigned fields, the signer should click the ‘Finish’ button.
   - If the signer is the final signer, they will have the option to download or print the signed document along with the completion certificate. 

   - If there are multiple signers, the document will automatically be forwarded to the next signer. Once all signers have completed their signatures, each signer will be able to download and print the final signed document and completion certificate.
     
<img width="800" alt="OpenSignFinalStep" src="https://github.com/user-attachments/assets/f4783aa0-2879-4ec2-9ddc-16d59f3a1fc0" />

## Additional Information
- All fields marked with an asterisk (*) must be completed before the document can be submitted.
- Ensure that the document format is supported by OpenSign before uploading.
- Signed documents can be accessed in the designated 'Root' folder or the one you have specified.
- Bulk Send is available exclusively with paid plans.

If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!write 
