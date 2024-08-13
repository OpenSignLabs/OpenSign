---
title: Self-host OpenSign™ with Docker on Linux/MacOS/Windows
---
import ReactPlayer from 'react-player';

## Steps to run OpenSign™ with docker on Linux/MacOS/Windows:
  1. Firstly, install Docker and ensure it is running before proceeding to the next steps. Make sure that you have NodeJS & GIT installed on your machine.
  2. Now, open the terminal and type the following command:

Command for linux/MacOS  
```
export HOST_URL=https://opensign.yourdomain.com && curl --remote-name-all https://raw.githubusercontent.com/OpenSignLabs/OpenSign/docker_beta/docker-compose.yml https://raw.githubusercontent.com/OpenSignLabs/OpenSign/docker_beta/Caddyfile https://raw.githubusercontent.com/OpenSignLabs/OpenSign/docker_beta/.env.local_dev && mv .env.local_dev .env.prod && docker compose up --force-recreate
```
Command for Windows (Powershell)
```
$env:HOST_URL="https://opensign.yourdomain.com"; Invoke-WebRequest -Uri https://raw.githubusercontent.com/OpenSignLabs/OpenSign/docker_beta/docker-compose.yml -OutFile docker-compose.yml; Invoke-WebRequest -Uri https://raw.githubusercontent.com/OpenSignLabs/OpenSign/docker_beta/Caddyfile -OutFile Caddyfile; Invoke-WebRequest -Uri https://raw.githubusercontent.com/OpenSignLabs/OpenSign/docker_beta/.env.local_dev -OutFile .env.local_dev; Rename-Item -Path .env.local_dev -NewName .env.prod; docker compose up --force-recreate
```
  and Hit Enter start the containers automatically. Make sure that you replace the host URL with your subdomain from where OpenSign will be accessible. You need to point the subdomain to the server you are running these commands by adding the necessary A record to your DNS.
  
  3. If you want to test it locally, remove `export HOST_URL=https://opensign.yourdomain.com &&` for Linux/MacOS and `$env:HOST_URL="https://opensign.yourdomain.com";` for Windows. Once deployed successfully, follow the steps from the screenshots.
<div>
  <img width="937" alt="localhost" src="https://github.com/user-attachments/assets/f5de1882-64d0-44ea-86e3-3a7c8405272c">
</div>
<div>
  <img width="935" alt="proceedtolocalhost" src="https://github.com/user-attachments/assets/33f975b9-4a9a-431e-a869-72e38f3b6754">
</div>


*Note: If you wish to incorporate our latest features into your Docker container, follow the steps again after stopping existing containers.* 

## Information About ENV variables which are used to setup OpenSign™ with Docker on Localhost
To set up OpenSign™ locally using Docker, the following prerequisites are required: 

Add below Environment Varaibles to the ".env.prod" file that is automatically created in order to personalize your installation:

| Environment Varibale  | Value | Description |
| ------------- | ------------- | ------------- |
| PUBLIC_URL  | http://localhost:3001  | Set it to the URL form where the app home page will be accessed |
| APP_ID  | opensign  | A 12 character long random app identifier. The value of this should be same as REACT_APP_APPID which is a variable used by Frontend React App. |
| appName  | open_sign_server  | Name of the app. It will be visible in the verification emails sent out. |
| MASTER_KEY  | XnAadwKxxByMr  | A 12 character long random secret key that allows access to all the data. It is used in Parse dashboard config to view all the data in the database. |
| MONGODB_URI  | mongodb://mongo-container:27017/OpenSignDB  | Mongodb URI to connect to |
| PARSE_MOUNT  | /app  | Path on which APIs should be mounted. Do not change this. This variable shall be removed & value hardcoded in the source code in coming versions. |
| SERVER_URL  | http://localhost:8080/app  | Set it to the URL from where APIs will be accessible to the NodeJS functions, for local development it should be localhost:8080/app (use your local port number instead) |
| DO_SPACE  | DOSPACENAME  | Digital ocean space name or AWS S3 bucket name for uploading documents |
| DO_ENDPOINT  | ams3.digitaloceanspaces.com  | Digital ocean spaces endpoint or AWS S3 endpoint for uploading documents |
| DO_BASEURL  | https://dospace.ams3.digitaloceanspaces.com  | Digital ocean baseurl or AWS S3 base URL |
| DO_ACCESS_KEY_ID  | YOUR_S3_ACCESS_ID  | Digital ocean spaces access key ID or AWS s3 Access key ID for uploading the docs |
| DO_SECRET_ACCESS_KEY  | YOUR_S3_ACCESS_KEY  | Digital ocean spaces secret access key or AWS s3 secret access key for uploading the docs |
| DO_REGION  | YOUR_S3_REGION  | Digital ocean spaces region or AWS s3 region |
| USE_LOCAL  | true  | To use local file storage to save file |
| MAILGUN_API_KEY  | YOUR_MAILGUNAPI_KEY  | Mailgun API Key |
| MAILGUN_DOMAIN  | YOUR_MAILGUNAPI_DOMAIN | Mailgun API Domain |
| MAILGUN_SENDER  | - | Mailgun Sender Mail ID |
| SMTP_ENABLE | false | to enable SMTP 
| SMTP_HOST | smtp.yourhost.com | Provide smtp host 
| SMTP_PORT | 443 | Provide smtp port number
| SMTP_USER_EMAIL | mailer@yourdomain.com | Provide user email of smtp
| SMTP_PASS | password | Provide smtp password
| PFX_BASE64  | - | Base64 encoded PFX or p12 document signing certificate file. You can generate base64 encoded self sign certificate using the passphrase. |
| PASS_PHRASE | opensign | Pass phrase of PFX or p12 document signing certificate file.|

# Steps to Generate Self Sign Certificate
```
# execute below command and use passphrase 'opensign'
openssl genrsa -des3 -out ./local_dev.key 2048
openssl req -key ./local_dev.key -new -x509 -days 365 -out ./local_dev.crt
openssl pkcs12 -inkey ./local_dev.key -in ./local_dev.crt -export -out ./local_dev.pfx
openssl base64 -in ./local_dev.pfx -out ./base64_pfx
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
