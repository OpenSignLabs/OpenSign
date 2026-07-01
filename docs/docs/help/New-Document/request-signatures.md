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
  
<img width="866" alt="requets signature" src="https://github.com/user-attachments/assets/f3edeafa-66d1-416a-854e-ce666f27e7b7" />

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

<img width="866"  alt="request signature2" src="https://github.com/user-attachments/assets/f2e07e62-5a46-480d-b9a9-94f406805ce6" />

- **[7] Send in Order**

  **If you choose:**
  - **Yes**: Selecting this option will send the signing request to the first signer initially. Once the first signer completes their part, the next signer in the sequence will receive the request. This process continues until all signers have signed the document. This method ensures that the document is signed in a specific order.
  - **No**: Selecting this option will send the signing links to all signers simultaneously. Every signer can sign the document at their convenience, regardless of whether other signers have completed their signatures. This method is faster but does not enforce any signing order among the participants.
Select the option that best suits the needs of your document processing.
  - **Enforce strict order**: When this feature is enabled, signers must sign the document strictly in the predefined order. A signer assigned to the second position cannot sign the document until the first signer has completed their signing process.
    If a subsequent signer attempts to sign the document before the previous signer has signed, an error message will be displayed, and the document signing process cannot be completed.
    
    <img width="866" alt="Enforce strict order" src="https://github.com/user-attachments/assets/79876739-a8a8-4597-bd67-a6845761ec63" />

### Setting the Time Frame
- **Time To Complete (Days)** *(Required)*: **[8]** Specify the number of days the signers have to complete the signatures. After that, the document will no longer be available for signing.
  
### Setting BCC and CC
- **BCC**: **[9]** The BCC (Blind Carbon Copy) feature allows users to receive document completion emails at specified email addresses.
You can add multiple contacts in the BCC field to notify several recipients. 
You can either:
Click "Add New" to enter a new email contact, or
Select from existing contacts using the dropdown list.
- **CC**: **[10]** The CC (Carbon Copy) feature allows users to receive document completion emails at specified email addresses.
You can add multiple contacts in the CC field to notify several recipients. 
You can either:
Click "Add New" to enter a new email contact, or
Select from existing contacts using the dropdown list.

**Merge Certificate to PDF** [11]: 
  - **Yes**: This will ensure that the completion certificate is included in the final PDF document. However, please note that once merged, the certificate cannot be separated from the main document.
  - **No**: If you choose not to merge, the completion certificate will be provided as a separate PDF file along with the signed document.
This feature only available for the paid users.

### Auto reminder
- **[12]** Once you enable the auto reminder, a text field will appear allowing you to set the reminder for a specific number of days.
- **Remind once in every (Days)**: You can specify the reminder interval in days (e.g., every 1 or every 2 days).
Note: You can set a maximum of 15 reminders. For example, if the document completion time is 16 days and you try to schedule a reminder every day, the system will not allow it, as the reminder limit would be exceeded.
This feature only available for the paid users.

### Security Setting
- **Enable OTP Verification** [13] :
  
   - If set to "Yes," the signer will be required to complete email OTP verification before viewing and signing the document.
   - If "Enable OTP Verification" is set to "No," the signer will not be prompted for OTP verification during the signing process.

Note: This feature is available exclusively on paid plans.

- **Allow offline signing** :
**[14]** Choose whether signers can submit a copy of this document signed using an external tool for owner review.
   - **Yes**: Signers will see a “Sign Offline” option, allowing them to upload an externally signed PDF and submit it to the document owner for approval.
   - On Approval: Once the owner approves the submission, the signer’s signing process will be marked as completed. After the document is approved by the owner, a notification email will be sent to the signer confirming that the document has been approved and their signing process is complete. At the same time, a request signature email will be triggered and sent to the next signer in the signing order.
   - On Declined: If the document is incorrectly filled out or improperly formatted, the owner can decline it and add comments. The signer can then use the same signing link that was initially shared to them to either re-upload a corrected offline file or continue the process using OpenSign’s online signing interface.
   
   - **No**: Signers can only sign within the app. The Sign Offline option will be hidden.

This setting defaults to your account preference under Preferences and is available on paid plans.

### Enable tour:
- **[15]** If set to "Yes," the signer will see the tour guide while signing the document. If your signer is familiar with OpenSign and you prefer not to display the tour guide, you can select "No," and the tour guide will not be shown to your signers.

### Notify on signatures: 
- **[16]** If set to "Yes," the document owner will receive an email notification each signer completes their signature.
Note: This feature is available exclusively on paid plans.

### allow modifications: 
- **[17]** If set to Yes, the signer will be allowed to make modifications to the document during the signing process. However, they cannot edit or remove any fields that were already placed by the document owner. They can only add basic fields such as signature, stamp, initials, text, and cells.

If both Allow Modification and Enable OTP are set to Yes, the signer will still not be able to edit or delete existing fields, but will gain access to additional advanced fields to add during signing. These include: signature, stamp, initials, name, job title, company, text, cells, and email.

Note: This feature is available exclusively on paid plans.

### Redirect url: 
- **[18]**  After signing the document and upon its completion, the signer will be redirected to the specified URL.

### Pen colors: 
- **[19]**  Choose the pen color for signing the document. The selected color will be available during the signing process. OpenSign currently supports red, blue, and black pen colors.

### Step 2: Proceed to Document Creation Panel
- **Next**: Once all the necessary fields are filled, click this button to proceed to create the document for signing.
- **Cancel**: If you need to start over or make changes, click this button to clear the form.
  
### Step 3: Document Creation  
### Prefill Widgets 

The **Prefill Widgets** feature lets document creators prefill specific fields before sending a document for signature. This ensures that important details (such as date, name, email, images, checkboxes, radio buttons, or custom text) are already completed when recipients receive the document. By default, prefilled data cannot be edited by signers.  

<img width="866" alt="Prfill" src="https://github.com/user-attachments/assets/4794b2a9-acc0-4ef8-8110-076f0d90cc57" />

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
- **Draw** – Allows the user to draw directly in this widget; use it when a prefill drawing is required.
---

## Signers/Recipients 
Below the **Prefill** section, you'll find the list of signers that were added while creating the document. From this panel, you can select a recipient to assign widgets or use the **Add Recipient** option to include additional signers. 

Each recipient can be assigned one of the following roles:

**Signer**: If the role is selected as Signer, the signer must fill in all required fields while signing the document before they can complete the signing process.

**Viewer**: If the role is selected as Viewer, widgets cannot be assigned to that user. The Viewer role only allows the user to view the document.

**Approver**: If the role is selected as Approver, it works similarly to the Signer role. However, the main difference is that the Approver role does not require a signature widget. The approver can approve the document even if no widgets are assigned.

## Access code
The **Access Code** feature in OpenSign adds an extra layer of security to your documents by requiring recipients to enter a unique access code before they can view and sign a document. This feature helps ensure that only authorized recipients can access sensitive documents, even if the signing link is accidentally shared or intercepted.

<img width="866" alt="Access code" src="https://github.com/user-attachments/assets/e227e069-ee56-41ee-832d-b2c210cd3d63" />

### How the Access Code Works
  1. The document owner can enable **Access Code** protection by clicking the **Lock** icon next to the signer's details. This opens the **Access Code** dialog, where the owner can enter a unique **6-digit numeric access code** (for example, `809966`). After entering the code, click **Save** to assign it to the signer.

2. Send the document for signature.

3. The signer receives an email invitation containing the document signing link. Alternatively, the document owner can share the signing link manually through another secure communication channel, such as SMS, a messaging application, or email.

4. When the signer opens the document signing link, they are prompted to enter the assigned **6-digit access code** before they can access the document. The signer must obtain this access code directly from the document owner, who should share it using a separate and secure communication channel (such as a phone call, SMS, or messaging application).

5. If the signer enters the correct access code, the document opens and they can proceed with reviewing and signing it.

6. If the signer enters an incorrect access code, access to the document is denied. The signer must enter the correct **6-digit numeric access code** provided by the document owner to continue.
   
---
## Add Widgets for Signers
### 1. Add a Signature Widget
Once your document is loaded in the document creation panel, you'll need to add a signature widget for each signer. Select the signer from the right side panel, click on the signature widget, and position it where the signature is required.

<img width="866" alt="create document" src="https://github.com/user-attachments/assets/fa5471f0-f7cb-4170-982f-cb213e4db13d" />

### Signature Widget Options
After placing the Signature widget, you will see the options on the widget such as:
  - **Add Signer/Change Signer**: Clicking the first icon on the signature widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
  - **Copy Signature**: Clicking on this option reveals the following choices.
    -  All pages: It will copy the signature widget to all pages.
    -  All pages but last: It will copy the signature widget to all pages except the last page.
    -  All pages but first: It will copy the signature widget to all pages except the first page.
 
### 2. Add Other Widgets
Depending on your needs, you can include additional widgets such as:
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
      
      **Hide text with asterisks**: **"which masks the entered text (*) to protect sensitive information while filling out the document. The final embedded document will also display the text as asterisks, keeping the actual value hidden.
    - Add Signer/Change Signer: Clicking the first icon on the Name widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the name widget.
 - **Job title**: The Job title widget allows signers to add their Job title or any other text, functioning like a text field during the signing process. After placing the job title widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
      
      **Hide text with asterisks**: **"which masks the entered text (*) to protect sensitive information while filling out the document. The final embedded document will also display the text as asterisks, keeping the actual value hidden.
    - Add Signer/Change Signer: Clicking the first icon on the Job title widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the job title widget.
  
 - **Company**: The company widget allows signers to add their company or any other text, functioning like a text field during the signing process. After placing the company widget, you will see the options on the widget such as:
     - Setting icon: By clicking on the option, you can set the color and font.
       
       **Hide text with asterisks**: **"which masks the entered text (*) to protect sensitive information while filling out the document. The final embedded document will also display the text as asterisks, keeping the actual value hidden.
     - Add Signer/Change Signer: Clicking the first icon on the Company widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
     - Copy : Clicking on this you can duplicate the Company widget.
       
 - **Date Widget**

The **Date widget** allows signers to enter a date while signing the document. Once the widget is placed, you can configure its behavior using the available settings in the **Widget Info** panel.

#### ⚙️ Widget Options

- **Date Format**: Choose the preferred date format (for example, `MM/dd/yyyy`, `dd-mm-yyyy`, or `dd/mm/yyyy`) from the Format dropdown. This determines how the date appears to the signer.
- **Set Date**: This option allows the user to set a default date, which will be displayed while signing the document.
- **Signing Date**: When selected, the date on which the signer signs the document will be automatically displayed in the Date widget.
- **Clear**: Removes the selected date setting.

- **Date Range**
  - **Min Date**: Sets the earliest date the signer can select.
  - **Max Date**: Sets the latest date the signer can select.
  - Use **Clear** to remove the minimum or maximum date restrictions.

- **Required / Optional**  
  Mark the widget as **Required** if the signer must fill it in before completing the signing, or **Optional** if it is not mandatory.

- **Font Settings**
  Customize the **font size** and **text color** to match the document’s style.

- **Read Only**
  Enable this option to display a date that cannot be edited by the signer.

- **Save**
  Click **Save** to apply all selected settings to the Date widget.
  
 - **Text Input**: The text input field is used to collect input from the signer. Signers can type their responses directly into this field. After placing the Text Input widget, you will see the options on the widget such as:
    - Setting : The widget settings panel provides additional customization options, including:
      - Choosing a **font color**
      - Setting the **font size**
      - Marking the field as **required** or **optional**
      - Providing a **default value**
      - Making the field **read-only**
      - **Hide text with asterisks**: **"which masks the entered text (*) to protect sensitive information while filling out the document. The final embedded document will also display the text as asterisks, keeping the actual value hidden.
      - Adding a **hint**, which will be displayed on the widget for better clarity
      - **Custom Validations** are also supported, including:
       - Predefined formats like **SSN**, **email**, or **numeric values**
       - Custom JavaScript validations using regular expressions
         - For example:
          - `^\d+$` – allows only digits
          - `^[A-Z]+$` – allows only uppercase letters  

  You can enter your regex pattern in the **Validations** field of the widget.  
  *(Optional reference: [JavaScript RegExp guide](https://www.w3schools.com/jsref/jsref_obj_regexp.asp))*
  
**Conditional Logic**:
  
The Text Input widget also supports **Conditional Logic**, allowing you to dynamically show, hide, make required, or make optional the field based on values entered or selected in other widgets.
Conditional Logic enables the Text Input widget to respond dynamically based on values from other widgets.

Depending on the configured rule, the Text Input field can:
    - Show the field
    - Hide the field
    - Make the field Required
    - Make the field Optional
    
<img width="1897" alt="conditional logic textinput" src="https://github.com/user-attachments/assets/ef89a946-ba4a-4a14-a7ef-97b2a8119e6b" />

## Supported Conditions
The **Text Input** widget supports conditional logic based on the values of other widgets. 
The available conditions depend on the selected trigger widget.

### Text Input 

Supported operators: 
- **Equals**
- **Does Not Equal**
  
**Example** If the value entered in **TextInput1** is equal to **HR**, then **TextInput2** is displayed.

```
text Condition: TextInput1 = HR  
Action: Show TextInput2
 ``` 
### Number
Supported operators:
- Equals
- Does Not Equal
  
Example
If ``` number_widget1 = 5 ```
Then ``` Show TextInput1 ```

### Any Condition (OR) 

When **Any Condition (OR)** is selected, the configured action is performed if **at least one** of the specified conditions is satisfied.

**Example** 

text Condition 1: Number Field = 10 OR Condition 2: Checkbox = Checked

Action:

Show TextInput1

 **TextInput1** is displayed if either the Number field equals **10** or the Checkbox is checked.

## Example

| Property | Value |
|----------|-------|
| **Trigger Widget** | Number |
| **Condition** | Equals |
| **Condition Value** | 5 |
| **Condition 2 checkbox** | checked |
| **Action** | Show TextInput1 |

**Result**

The configured **TextInput1** widget becomes visible when **either** the Number field equals **10** **or** the Checkbox is checked.

### Related Conditional Logic Guides

The **Text Input** widget also supports Conditional Logic using the following trigger widgets:
- **Number Widget** - [Read more](https://docs.opensignlabs.com/docs/help/New-Document/conditional_logic/#number-widget-as-the-trigger)
- **Dropdown Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#dropdown-widget-as-the-trigger)
- **Checkbox Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#checkbox-widget-as-the-trigger)
- **Radio Button Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#radio-button-as-the-trigger)

### Additional Widget Options

- **Add Signer / Change Signer**: Click the first icon on the Text Input widget to assign the widget to a different signer. You can select an existing signer or add a new recipient.

- **Copy**: Click the **Copy** icon to duplicate the Text Input widget.
  
---

- **Number widget**

The Number widget is used to collect numeric input from the signer. It accepts only numeric values, helping ensure data accuracy and consistency. The Number widget also supports formulas, allowing you to perform automatic calculations using values from other Number widgets. After placing the Number widget, you will see the following options:

  - **Settings**: The widget settings panel provides additional customization options, including:
    - Choosing a **font color**
    - Setting the **font size**
    - Marking the field as **required** or **optional**
    - Providing a **default value**
    - Making the field **read-only**
    - Adding a **placeholder** to guide the signer on the expected input
    - Assigning a unique **Name** to the widget. This name is used when referencing the widget in formulas.
      - Example:
        - `number-1`
        - `subtotal`
        - `tax`
        - `grand_total`
    - Defining a **Formula** to automatically calculate values using other Number widgets.
      - Example:
        ```text
        {{quantity}} * {{price}}
        ```
      - Supported mathematical operators include:
        - `+` Addition
        - `-` Subtraction
        - `*` Multiplication
        - `/` Division
        - `%` Modulus (Remainder)
        - `()` Parentheses for grouping operations

---

### **Conditional Logic**

The Number widget also supports **Conditional Logic**, allowing you to dynamically show, hide, make required, or make optional the field based on values entered or selected in other widgets.

Conditional Logic enables the Number widget to respond dynamically based on values from other widgets.

Depending on the configured rule, the Number widget can:

- Show the field
- Hide the field
- Make the field **Required**
- Make the field **Optional**

---

## Supported Conditions

The **Number** widget supports Conditional Logic based on the values of other widgets.

The available conditions depend on the selected trigger widget.

### Text Input

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the value entered in **TextInput1** is equal to **HR**, then **Number1** is displayed.

```text
Condition: TextInput1 = HR
Action: Show Number1
```

---

### Number

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If **Number1** equals **10**, then **Number2** is displayed.

```text
Condition: Number1 = 10
Action: Show Number2
```

---

### Any Condition (OR)

When **Any Condition (OR)** is selected, the configured action is performed when **at least one** of the configured conditions is satisfied.

#### Example

**Conditions**

- Number Field = **10**
- **OR**
- Checkbox = **Checked**

**Action**

Show **Number1**

**Result**

The configured **Number1** widget is displayed when either of the following conditions is met:

- The signer enters **10** in the Number field.
- The signer checks the Checkbox.

---

## Configuration Example

| Property | Value |
|----------|-------|
| **Condition Type** | Any Condition (OR) |
| **Trigger Widget 1** | Number |
| **Condition** | Equals |
| **Condition Value** | 10 |
| **Trigger Widget 2** | Checkbox |
| **Condition** | Is Checked |
| **Action** | Show Number1 |

**Result**

The configured **Number1** widget becomes visible when **either** the Number field equals **10** **or** the Checkbox is checked.

### Related Conditional Logic Guides

The **Number** widget also supports Conditional Logic using the following trigger widgets:

- **Dropdown Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#number-widget-triggered-by-a-dropdown)

- **Checkbox Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#number-widget-triggered-by-a-checkbox)

- **Radio Button Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#number-widget-triggered-by-a-radio-button)
  
- **Number Widget Triggered by Another Number Widget** - [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#number-widget-triggered-by-another-number-widget)
  
### Additional Widget Options

- **Add Signer / Change Signer**: Click the first icon on the Number widget to assign the widget to a different signer. You can choose an existing signer or add a new recipient.

- **Copy**: Click the **Copy** icon to duplicate the Number widget.

---

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
   - **Hide text with asterisks**: **"which masks the entered text (*) to protect sensitive information while filling out the document. The final embedded document will also display the text as asterisks, keeping the actual value hidden.
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

---

 - **Checkbox**: The checkbox widget is used to capture input in the form of a checkbox selection. Once you drop the checkbox widget, a popup will open where you can set the checkbox name and options. Additionally, there are a few options available such as setting the minimum and maximum checks, making the checkbox read-only, and hiding the label.
 
 **Conditional Logic**

The **Checkbox** widget supports **Conditional Logic**, allowing you to dynamically show, hide, make required, or make optional the field based on values entered or selected in other widgets.

Conditional Logic enables the Checkbox widget to respond dynamically based on values from other widgets.

Depending on the configured rule, the Checkbox field can:

- Show the field
- Hide the field
- Make the field **Required**
- Make the field **Optional**

---

## Supported Conditions

The **Checkbox** widget supports Conditional Logic based on the values of other widgets.

The available conditions depend on the selected trigger widget.

### Text Input

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the value entered in **TextInput1** is **HR**, then **Checkbox1** is displayed.

```text
Condition: TextInput1 = HR
Action: Show Checkbox1
```

---

### Number

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If **Number1** equals **10**, then **Checkbox1** is displayed.

```text
Condition: Number1 = 10
Action: Show Checkbox1
```

---

### Dropdown

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the selected value of **Dropdown1** is **Manager**, then **Checkbox1** is displayed.

```text
Condition: Dropdown1 = Manager
Action: Show Checkbox1
```

---

### Checkbox

**Supported operators:**

- **Is Checked**
- **Is Not Checked**

**Example**

If **Checkbox1** is checked, then **Checkbox2** is displayed.

```text
Condition: Checkbox1 is Checked
Action: Show Checkbox2
```

Another example:

If **Checkbox1** is **not checked**, then **Checkbox2** is displayed.

```text
Condition: Checkbox1 is Not Checked
Action: Show Checkbox2
```

---

### Radio Button

**Supported operators:**

- **Is Checked**
- **Is Not Checked**
- **Equals**
- **Does Not Equal**

**Example**

If **Radio Button1** is checked, then **Checkbox1** is displayed.

```text
Condition: Radio Button1 is Checked
Action: Show Checkbox1
```

---

### Any Condition (OR)

When **Any Condition (OR)** is selected, the configured action is performed when **at least one** of the configured conditions is satisfied.

#### Example

**Conditions**

- Number Field = **10**
- **OR**
- Checkbox = **Checked**

**Action**

Show **Checkbox1**

**Result**

The configured **Checkbox1** widget is displayed when **either** of the following conditions is met:

- The signer enters **10** in the Number field.
- The signer checks the Checkbox.

---

## Configuration Example

| Property | Value |
|----------|-------|
| **Condition Type** | Any Condition (OR) |
| **Trigger Widget 1** | Number |
| **Condition** | Equals |
| **Condition Value** | 10 |
| **Trigger Widget 2** | Checkbox |
| **Condition** | Is Checked |
| **Action** | Show Checkbox1 |

**Result**

The configured **Checkbox1** widget becomes visible when **either** the Number field equals **10** **or** the Checkbox is checked.

### Related Conditional Logic Guides

The **Checkbox** widget also supports Conditional Logic using the following trigger widgets:

- **Text Input Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#checkbox-triggered-by-a-text-input)

- **Number Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#checkbox-triggered-by-a-number-widget)

- **Dropdown Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#checkbox-triggered-by-a-dropdown)

- **Radio Button Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#checkbox-triggered-by-a-radio-button)
  
- **Checkbox Triggered by Another Checkbox** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#checkbox-triggered-by-another-checkbox)
  
### Additional Widget Options

- **Add Signer / Change Signer**: Click the first icon on the Checkbox widget to assign the widget to a different signer. You can select an existing signer or add a new recipient.

- **Copy**: Click the **Copy** icon to duplicate the Checkbox widget.
      
---

- **Dropdown**: Once you drop the dropdown widget, a popup will open where you can set the dropdown name and options. Additionally, there are a few options available such as setting a default value and marking the dropdown as required or optional.
  
### **Conditional Logic**

The **Dropdown** widget supports **Conditional Logic**, allowing you to dynamically show, hide, make required, or make optional the field based on values entered or selected in other widgets.

Conditional Logic enables the Dropdown widget to respond dynamically based on values from other widgets.

Depending on the configured rule, the Dropdown field can:

- Show the field
- Hide the field
- Make the field **Required**
- Make the field **Optional**

---

## Supported Conditions

The **Dropdown** widget supports Conditional Logic based on the values of other widgets.

The available conditions depend on the selected trigger widget.

### Text Input

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the value entered in **TextInput1** is equal to **HR**, then **Dropdown1** is displayed.

```text
Condition: TextInput1 = HR
Action: Show Dropdown1
```

---

### Number

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If **Number1** equals **10**, then **Dropdown1** is displayed.

```text
Condition: Number1 = 10
Action: Show Dropdown1
```

---

### Dropdown

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the selected value of **Dropdown1** is **Manager**, then **Dropdown2** is displayed.

```text
Condition: Dropdown1 = Manager
Action: Show Dropdown2
```

---

### Any Condition (OR)

When **Any Condition (OR)** is selected, the configured action is performed when **at least one** of the configured conditions is satisfied.

#### Example

**Conditions**

- Number Field = **10**
- **OR**
- Checkbox = **Checked**

**Action**

Show **Dropdown1**

**Result**

The configured **Dropdown1** widget is displayed when **either** of the following conditions is met:

- The signer enters **10** in the Number field.
- The signer checks the Checkbox.

---

## Configuration Example

| Property | Value |
|----------|-------|
| **Condition Type** | Any Condition (OR) |
| **Trigger Widget 1** | Number |
| **Condition** | Equals |
| **Condition Value** | 10 |
| **Trigger Widget 2** | Checkbox |
| **Condition** | Is Checked |
| **Action** | Show Dropdown1 |

**Result**

The configured **Dropdown1** widget becomes visible when **either** the Number field equals **10** **or** the Checkbox is checked.

### Related Conditional Logic Guides

The **Dropdown** widget also supports Conditional Logic using the following trigger widgets:

- **Text input** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#dropdown-triggered-by-a-text-input)
  
- **Number** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#dropdown-triggered-by-a-number-widget)
  
- **Checkbox Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#dropdown-triggered-by-a-checkbox)

- **Radio Button Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#dropdown-triggered-by-a-radio-button)

- **Dropdown Triggered by Another Dropdown** [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#dropdown-triggered-by-another-dropdown)

### Additional Widget Options

- **Add Signer / Change Signer**: Click the first icon on the Dropdown widget to assign the widget to a different signer. You can select an existing signer or add a new recipient.

- **Copy**: Click the **Copy** icon to duplicate the Dropdown widget.

---

 - **Radio button**: The radio button widget is used to capture input in the form of a radio button selection. Once you drop the radio button widget, a popup will open where you can set the radio button name and options. Additionally, there are a few options available such as setting a default value, making the radio button read-only, and hiding the label.

### **Conditional Logic**

The **Radio Button** widget supports **Conditional Logic**, allowing you to dynamically show, hide, make required, or make optional the field based on values entered or selected in other widgets.

Conditional Logic enables the Radio Button widget to respond dynamically based on values from other widgets.

Depending on the configured rule, the Radio Button field can:

- Show the field
- Hide the field
- Make the field **Required**
- Make the field **Optional**

---

## Supported Conditions

The **Radio Button** widget supports Conditional Logic based on the values of other widgets.

The available conditions depend on the selected trigger widget.

### Text Input

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the value entered in **TextInput1** is **HR**, then **RadioButton1** is displayed.

```text
Condition: TextInput1 = HR
Action: Show RadioButton1
```

---

### Number

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If **Number1** equals **10**, then **RadioButton1** is displayed.

```text
Condition: Number1 = 10
Action: Show RadioButton1
```

---

### Dropdown

**Supported operators:**

- **Equals**
- **Does Not Equal**

**Example**

If the selected value of **Dropdown1** is **Manager**, then **RadioButton1** is displayed.

```text
Condition: Dropdown1 = Manager
Action: Show RadioButton1
```

---

### Checkbox

**Supported operators:**

- **Is Checked**
- **Is Not Checked**

**Example**

If **Checkbox1** is checked, then **RadioButton1** is displayed.

```text
Condition: Checkbox1 is Checked
Action: Show RadioButton1
```

Another example:

If **Checkbox1** is **not checked**, then **RadioButton1** is displayed.

```text
Condition: Checkbox1 is Not Checked
Action: Show RadioButton1
```

---

### Radio Button

**Supported operators:**

- **Is Checked**
- **Is Not Checked**
- **Equals**
- **Does Not Equal**

#### Example 1 – Using **Is Checked**

If **RadioButton1** is selected, then **RadioButton2** is displayed.

```text
Condition: RadioButton1 is Checked
Action: Show RadioButton2
```

#### Example 2 – Using **Equals**

If the selected value of **RadioButton1** is **Approved**, then **RadioButton2** is displayed.

```text
Condition: RadioButton1 = Approved
Action: Show RadioButton2
```

#### Example 3 – Using **Does Not Equal**

If the selected value of **RadioButton1** is **not** **Approved**, then **RadioButton2** is displayed.

```text
Condition: RadioButton1 Does Not Equal Approved
Action: Show RadioButton2
```

---

### Any Condition (OR)

When **Any Condition (OR)** is selected, the configured action is performed when **at least one** of the configured conditions is satisfied.

#### Example

**Conditions**

- Number Field = **10**
- **OR**
- Checkbox = **Checked**

**Action**

Show **RadioButton1**

**Result**

The configured **RadioButton1** widget is displayed when **either** of the following conditions is met:

- The signer enters **10** in the Number field.
- The signer checks the Checkbox.

---

## Configuration Example

| Property | Value |
|----------|-------|
| **Condition Type** | Any Condition (OR) |
| **Trigger Widget 1** | Number |
| **Condition** | Equals |
| **Condition Value** | 10 |
| **Trigger Widget 2** | Checkbox |
| **Condition** | Is Checked |
| **Action** | Show RadioButton1 |

**Result**

The configured **RadioButton1** widget becomes visible when **either** the Number field equals **10** **or** the Checkbox is checked.

### Related Conditional Logic Guides

The **Radio Button** widget also supports Conditional Logic using the following trigger widgets:

- **Text Input Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#radio-button-triggered-by-a-text-input)

- **Number Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#radio-button-triggered-by-a-number-widget)

- **Dropdown Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#radio-button-triggered-by-a-dropdown)

- **Checkbox Widget** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#radio-button-triggered-by-a-checkbox)
  
- **Radio Button Triggered by Another Radio Button** – [Read more](https://github.com/pravinOpenSign/OpenSign/blob/patch-75/docs/docs/help/New-Document/conditional_logic.md#radio-button-triggered-by-another-radio-button)

### Additional Widget Options

- **Add Signer / Change Signer**: Click the first icon on the Radio Button widget to assign the widget to a different signer. You can select an existing signer or add a new recipient.

- **Copy**: Click the **Copy** icon to duplicate the Radio Button widget.
  
---

 - **Image**: The image widget allows signers to upload an image during the signing process. After placing the Image widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can specify whether this widget is mandatory or optional during the document signing.
    - Add Signer/Change Signer: Clicking the first icon on the Image widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the image widget.
      
---

 - **Email**: The email widget is used to enter an email address during the signing process. It only accepts input in a valid email format. If the signer enters invalid text, a validation error will occur, and the document cannot be completed until it's corrected. After placing the email widget, you will see the options on the widget such as:
    - Setting icon: By clicking on the option, you can set the color and font.
      
      **Hide text with asterisks**: **"which masks the entered text (*) to protect sensitive information while filling out the document. The final embedded document will also display the text as asterisks, keeping the actual value hidden.
      
    - Add Signer/Change Signer: Clicking the first icon on the Email widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
    - Copy : Clicking on this you can duplicate the email widget.

---
      
  - **📎 Attachment Widget**

The **Attachment Widget** allows signers to upload supporting files directly while completing and signing a document. This is useful when additional documents or evidence are required as part of the signing workflow.

   - Setting icon: By clicking on the option, you can specify whether this widget is mandatory or optional during the document signing. Additionally, you can add a hint or instruction to guide signers on what information or file is expected in the widget.
   - Add Signer/Change Signer: Clicking the first icon on the Image widget allows you to change the signer. You can choose from existing signers in the dropdown or add a new signer.
   - Copy : Clicking on this you can duplicate the image widget.
     
<img width="918" alt="image" src="https://github.com/user-attachments/assets/f52e704d-c69f-464a-b3fa-f76f27d98fed" />

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
<img width="918" alt="document attchement" src="https://github.com/user-attachments/assets/6325793e-a4ed-4aed-ab12-5e29e625f28a" />

> **Note:** All uploaded attachments become part of the completed document package, making it easier to store, review, and share the signed document along with its supporting files.

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
