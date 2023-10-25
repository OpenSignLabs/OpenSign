
# INSTALLATON INSTRUCTIONS

You can use our app as a cloud version from [OpenSignLabs](www.opensignlabs.com)

or follow below instructions to install it on your own infrastructure.

- Digital Ocean
- Localhost

## Digital Ocean

OpenSign application consistes of 3 components -
- ReactJS frontend
- NodeJS API
- MongoDB database

You can install all 3 components on digital ocean using the button below -

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/OpenSignLabs/OpenSign/tree/monorepo&refcode=30db1c901ab0)

## You will need to create an AWS S3 bucket or digital ocean space in order to store your uploaded documents

### AWS S3 -
- Step 1 : Create a S3 bucket
  - Login to AWS console
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
