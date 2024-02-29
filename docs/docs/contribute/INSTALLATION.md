---
sidebar_position: 4
title: Installation instructions
---

# INSTALLATION INSTRUCTIONS

You can use our app as a cloud version from [OpenSignLabs](https://www.opensignlabs.com)

or follow below instructions to install it on your own infrastructure.

- Localhost(Frontend only)
- Localhost(Docker)

## Localhost(Frontend only)

This is the easiest way to run the frontend application for development or testing purpose without the hassle of installing backend & DB. All the features including document upload, signing, email notifications will work seamlessly from staging backend.

**Warning:** All data, including user accounts and documents, is stored in the staging backend. This data will be erased every time there is a merge to the main branch. As a result, you may need to recreate user accounts repeatedly. If you find that login attempts are failing, it is likely because the data has been cleared due to a recent merge.

Below are the steps to follow -
- [Clone the repository](https://help.github.com/articles/cloning-a-repository/) to your local machine using below command -
  ```
  git clone https://github.com/OpenSignLabs/OpenSign.git
  ```
- Copy the .env.frontend_dev file to  apps/OpenSign/.env using below command(on mac & linux). For windows use COPY command instead.
  ```
  cp .env.frontend_dev apps/OpenSign/.env
  ```
- Switch to OpenSign directory.
  ```
  cd apps/OpenSign
  ```  
- Install NPM packages using
  ```
  npm install
  ```
- Run the project locally using
  ```
  npm run start-dev
  ```
You should be able to access the application from http://localhost:3000 after this.
Create an account by signing-up and start contributing.

## You will need to create an AWS S3 bucket or digital ocean space in order to store your uploaded documents

### AWS S3 -
- Step 1 : Create a S3 bucket
  - Login to [AWS console](https://aws.amazon.com/console/)
  - Navigate to S3 under services
  - Hit "Create Bucket" button on upper right corner
  - Remove the check from "block all public access" checkbox(we need this in order to provide access to not-logged in users after OTP verification)
  - Set bucket versioning and tags as per your requirements
  - Hit "Create bucket" button
- Step 2 : Create IAM user and provide access to AWS bucket
  - Search for "IAM" on the search bar in AWS console
  - On IAM dashboard, click the number of users(count) under IAM resources table
  - Hit "create user" button on the upper right corner of the page
  - Enter the user name & click next
  - Click create policy, search for S3 and provide the Read, Write & list permissions
  - Click next and click "Create user"
 - Step 3 : Generate Credentials
  - Go to IAM/Users in AWS console
  - Hit the hyperlink for the user created in the previous step
  - Click the "Security credentials" tab
  - Scroll down to "Access keys" and hit "Create access key"
  - In the next step select "Application running outside AWS"
  - Add a description tag if needed & hit "Create access key"
  - In the next step you will see "Access key" and "Secret Access key". Copy both the values.
  - Set the value of "Access key" to "DO_ACCESS_KEY_ID" environment variable
  - Set the value of "Secret Access key" to "DO_SECRET_ACCESS_KEY" environment variable
- Step 3 : Copy bucket credentials
  - Visit "Amazon S3 -> Buckets" in aws console
  - Click the bucket created in previous steps & visit the properties tab
  - Under "Bucket overview" you will find the value of AWS region(for ex. ap-south-1). Set that value to env variable "DO_REGION"
  - You can create the value for "DO_ENDPOINT" env variable by appending the region value to amazonaws.com (for ex. s3.ap-south-1.amazonaws.com)
  - You can create the value for "DO_BASEURL" by adding the bucketname in front of the endpoint value(for ex. https://bucketname.s3.ap-south-1.amazonaws.com)

 Visit below link if you face any issues while following the above instructions -
  - https://repost.aws/knowledge-center/create-access-key


## Localhost(Docker)
- Please refer this documentation => [click here](https://docs.opensignlabs.com/docs/self-host/docker/run-locally) 
