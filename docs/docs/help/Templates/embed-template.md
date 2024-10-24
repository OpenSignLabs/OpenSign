---
sidebar_position: 5
title: Embedding OpenSign templates
---
# What is OpenSign Template Embedding?
OpenSign Template Embedding allows users to seamlessly integrate public document templates into their websites or applications. By embedding templates, you can provide a direct and interactive signing experience for your users without requiring them to leave your platform. This feature supports various technologies like React, Next.js, HTML, JavaScript, and Angular, making it easy to add signing capabilities to different web projects.
With OpenSign Template Embedding, businesses can offer a streamlined and professional document signing process, enhancing user experience and workflow efficiency.

## How to set up a Public profile, Design templates, and Embed a template?

### Step 1: Set up your Public profile (Username & Tagline)

- **Navigate to your profile**: On the top right, click your profile icon, select "Edit profile," and enter a public username (e.g., "OpenSignPublicProfile").
- **Add a tagline**(Optional): Enter a custom tagline (e.g., "Seal the deal openly") and save the changes.
  
<img width="828" alt="Set up Public Profile" src="https://github.com/user-attachments/assets/6c9cbd4b-eb1a-4a5b-bb0a-21777621555c" />

### Step 2: Create a new template

- **Navigate to Templates**: On the left sidebar, click "Templates" and select "Create template."
  
<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/95ee5c26-4284-46aa-9de7-3f492ad34feb" />

### Upload your document and fill in the template details:

- **[1] Choose file**: Select the document to upload (supported formats: PDF, PNG, JPG, JPEG, DOCX).
- **[2] Choose file from Dropbox**: Click the dropbox icon to select the document file from your dropbox account.
- **[3] Title** *(Required)*: Provide a title for your template.
- **[4] Description**: Optionally add a description to give context or instructions regarding the template. 
- **[5] Note**: Add additional notes or instructions.
- **[6] Send in Order**: Choose "Yes" or "No" for sending in a specific order.
- **[7] Auto reminder**: Set up automatic email reminders for signers. 
- **[8] Enable OTP verification** : Choose "Yes" or "No" for requiring email verification via OTP.
- **[9] Enable tour**: Select "Yes" or "No" for enabling the tour feature.
  
### Proceed to template creation panel
- **Next**: Click the "Next" button to proceed to the next stage of template creation, where you can add widgets and finalize the template.
- **Cancel**: If you need to start over or make changes, click Cancel button to clear the form.

### Step 3: Template creation 

<img width="828" alt="Create Template" src="https://github.com/user-attachments/assets/36a269fb-179b-462e-abc0-f436ec195a4a" />

- **[1] Define roles**:
  - **Add Roles**: In the roles section on the right, click "+ Add role" to specify the roles involved in the document, such as Candidate, HR, and Manager.

    **Note**: Make sure the public role is positioned at the top if 'Send in Order' is set to Yes; Otherwise, you will not be able to make the template public.
    
- **[2] Assign widgets to roles**: Click on each role to highlight it, then drag and drop the widget to assign it to that role. The widgets will appear in the same colour as the role name once you drop it on the document.
  - **[1] Assign signature widget**: Select the Role from the right side panel, click on the signature widget, and position it where the signature is required. You can place multiple signature widgets for each Role, as required.
  - **[2] Add other widgets**: Depending on your needs, you can include additional widgets such as:
Stamps, Initials, Name, Date, Text, Checkbox, and more.

**Important**: Before proceeding, ensure that all roles have assigned signers, except for the public role, since we are making this template public.

### Save template 
  - **Next button**: Once you’ve organized your widgets and set their properties, simply click the “Next” button to save your template.

  - After doing so, a “Create document” popup will appear, prompting you with the question: “Do you want to create a document using the template you just created?” You’ll have the option to choose either “Yes” or “No.”

  - Choose "No" you will be redirected to the Manage templates screen.

### Step 4: Managing and Embedding the template

<img width="828" alt="Manage Template" src="https://github.com/user-attachments/assets/4fd68285-d489-4998-bcf1-1cf40eada723" />

On the Manage templates page, you'll see a list of templates you've created or have access to. This list provides details such as the template title, file, owner, signers, and whether the template is public.

  - To embed a template, you first need to make it public by clicking the toggle button in the public column of the template.

  - A confirmation popup will appear with the message, 'Are you sure you want to make this template public?' You can choose either Yes or No. Select Yes to make the template public.

  - A public profile popup will appear, displaying the code to embed the template.

  - We support embedding the template in React/Next.js, HTML/JavaScript, and Angular application.

**Embed the template in a React or Next.js application**
  - Copy the code and paste it into your React or Next.js application.
  - Install the required OpenSign dependencies and run your project.

Watch the video below to see how to embed the template in a React or Next.js application.

<div>
    <ReactPlayer playing controls url='https://youtu.be/W5tCPVNVNvg?si=IE0k33Gwzt3pwdxF' />
</div>
           
**Embed the template in an HTML or JavaScript project**
  - Copy the code and paste it into your HTML or JavaScript application.
    
Watch the video below to see how to embed the template in HTML or JavaScript application.

<div>
    <ReactPlayer playing controls url='https://youtu.be/0CXZGRiGIjw?si=MqGkTZ1uz-2F-5Qn' />
</div>
      
**Embed the template in an Angular project**
  - Copy the code and paste it into your an Angular application.
  - Install the required OpenSign dependencies and run your project.
    
Watch the video below to see how to embed the template in an Angular application.

<div>
    <ReactPlayer playing controls url='https://youtu.be/3zz5flzql8M?si=2TgnLgjd0laCX3fu' />
</div>
      
### Step 5: Sign the document through the Embed public template.

  - Once the document loads, click Sign Now in the top right corner. A popup will appear asking for signer details such as Name, Email, and Phone Number.

  - Enter the required details and click Submit.

  - You can now fill in the necessary fields within the document's widgets and sign it.
    
  - After you finish signing, the document will be completed and automatically sent to the next signer for their signature.
    
### Step 6: Print document, Download completion certificate, and Download Document

You’ll see options to Print or Download the signed document for your records.

If you are the only signer, the signing process is finished, and you will have the options to Print document, Download completion certificate, and Download document.

  
## Additional Information
- All fields marked with an asterisk (*) must be completed before the document can be submitted.
- Ensure that the document format is supported by OpenSign before uploading.

If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!write 
