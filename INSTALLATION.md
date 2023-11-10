
# INSTALLATON INSTRUCTIONS

You can use our app as a cloud version from [OpenSignLabs](https://www.opensignlabs.com)

or follow below instructions to install it on your own infrastructure.

- Localhost(Frontend only)
- Digital Ocean
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
- CD to /apps/OpenSign directory
- Install NPM packages using
  ```
  npm install
  ```
- Run the project locally using
  ```
  npm run start
  ```
You should be able to access the application from http://localhost:3000 after this.
Create an account by signing-up and start contributing.


## Digital Ocean

OpenSign application consistes of 3 components -
- ReactJS frontend
- NodeJS API
- MongoDB database

You can install all 3 components on digital ocean using the button below -

[![Deploy on DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/OpenSignLabs/Deploy-OpenSign-to-Digital-Ocean/tree/main&refcode=30db1c901ab0)

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


## Localhost(Docker)

For local Setup we need to need following prerequisite:

Environment Varaibles:

| Environment Varibale  | Value | Description |
| ------------- | ------------- | ------------- |
| CI  | false  | Set CI to false while running the app locally |
| PUBLIC_URL  | http://localhost:3000  | Set it to the URL form where the app home page will be accessed |
| GENERATE_SOURCEMAP  | false | Set it to true if you want to generate the Sourcemap for debugging |
| REACT_APP_SERVERURL  | http://localhost:8080/app  | Set it to the URL from where APIs will be accessible, for local development it should be localhost:3000/api/app (use your local port number instead) |
| REACT_APP_APPID  | http://localhost:3000  | Set it to the URL form where the app home page will be accessed |
| PUBLIC_URL  | opensignstgn  | A 12 character long random app identifier. The value of this should be same as APP_ID which is a variable used by backend API. |
| APP_ID  | opensignstgn  | A 12 character long random app identifier. The value of this should be same as REACT_APP_APPID which is a variable used by Frontend React App. |
| appName  | open_sign_server  | Name of the app. It will be visible in the verification emails sent out. |
| MASTER_KEY  | XnAadwKxxByMr  | A 12 character long random secret key that allows access to all the data. It is used in Parse dashboard config to view all the data in the database. |
| MONGODB_URI  | mongodb://host.docker.internal:27017/OpenSignDB  | Mongodb URI to connect to |
| PARSE_MOUNT  |/app  | Path on which APIs should be mounted. Do not change this. This variable shall be removed & value hardcoded in the source code in coming versions. |
| SERVER_URL  | http://127.0.0.1:8080/app  | Set it to the URL from where APIs will be accessible to the NodeJS functions, for local development it should be localhost:3000/api/app (use your local port number instead) |
| DO_SPACE  | DOSPACENAME  | Digital ocean space name or AWS S3 bucket name for uploading documents |
| DO_ENDPOINT  | ams3.digitaloceanspaces.com  | Digital ocean spaces endpoint or AWS S3 endpoint for uploading documents |
| DO_BASEURL  |https://DOSPACENAME.ams3.digitaloceanspaces.com  | Digital ocean baseurl or AWS S3 base URL |
| DO_ACCESS_KEY_ID  | YOUR_S3_ACCESS_ID  | Digital ocean spaces access key ID or AWS s3 Access key ID for uploading the docs |
| DO_SECRET_ACCESS_KEY  | YOUR_S3_ACCESS_KEY  | Digital ocean spaces secret access key or AWS s3 secret access key for uploading the docs |
| DO_REGION  | YOUR_S3_REGION  | Digital ocean spaces region or AWS s3 region |
| USE_LOCAL  | FALSE  | To use local file storage to save file |
| MAILGUN_API_KEY  | YOUR_MAILGUNAPI_KEY  | Mailgun API Key |
| MAILGUN_DOMAIN  | YOUR_MAILGUNAPI_DOMAIN | Mailgun API Domain |
| MAILGUN_SENDER  | - | Mailgun Sender Mail ID |
| PFX_BASE64  | - | Base64 encoded PFX or p12 document signing certificate file. You can generate base64 encoded self sign certificate using the passphrase `emudhra` |

# Steps to Generate Self Sign Certificate
```
# execute below command and use passphrase emudhra
openssl genrsa -des3 -out ./cert/local_dev.key 2048
openssl req -key ./cert/local_dev.key -new -x509 -days 365 -out ./cert/local_dev.crt
openssl pkcs12 -inkey ./cert/local_dev.key -in ./cert/local_dev.crt -export -out ./cert/local_dev.pfx
openssl base64 -in ./cert/local_dev.pfx -out ./cert/base64_pfx
```

# CORS Configuration

As document storage is delegated to S3-compatible services that reside in a different host than the OpenSign one, document operations (loading, storing, deleting) are subject to [Cross-Origin Resource Sharing](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) restriction policies; as a consequence, OpenSign app may fail with (browser console) errors like the following:
```
Access to fetch at 'https://foo.nyc3.digitaloceanspaces.com/exported_file_4627_0000-00-00T00%3A45%3A43.344Z.pdf'
from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header
is present on the requested resource. If an opaque response serves your needs, set the request's mode to
'no-cors' to fetch the resource with CORS disabled.
```

In order to address this, your document storage system must be instructed to accept requests from other hosts; below the relevant documentation links:
- [How to Configure CORS on DigitalOcean Spaces](https://docs.digitalocean.com/products/spaces/how-to/configure-cors/)
- [Configuring cross-origin resource sharing on AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html)

# Build Local Environment

Command to build project -
- Execute `make build`

Command to run project -
- Execute `make run`