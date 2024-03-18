---
title: Localhost Setup with Docker
---
import ReactPlayer from 'react-player';

## Steps to run OpenSign™ with docker in macos/linux:
  1. Firstly, install Docker and ensure it is running before proceeding to the next steps.
  2. Now, open the terminal and type the following command: 
  ```
  git clone https://github.com/OpenSignLabs/OpenSign.git
  ```
  and Hit Enter to clone the OpenSign project locally.
  
  3. Then, navigate to the project directory with the command:
  ```
  cd OpenSign
  ```
  Hit Enter to access the OpenSign project in the terminal.
  
  4. Execute the following command to build the container image:
  ```
  make build
  ```
 This will initiate the process of creating the container image. It may take some time to complete.
 
  5. For subsequent runs, open Docker and start the OpenSign container by clicking on the play button in the actions panel.

*Note: If you wish to incorporate our latest features into your Docker container, delete the existing OpenSign container and follow the steps again.* 
 
## Steps to run OpenSign™ with docker in windows:
  1. Set up WSL 2 on Windows by referring to the video provided.

<div>
    <ReactPlayer playing controls url='https://youtu.be/1kFFwknneD8?si=FKriXPwFqZPLUagI' />
</div>
      
   2. Install Docker Desktop on Windows and launch Docker Desktop.
   3. Enable WSL in Docker Desktop by navigating to Settings > Resources > WSL Integration. Check the box and click on "Apply & Restart." Minimize Docker Desktop.

![docker](https://legadratw3d.ams3.cdn.digitaloceanspaces.com/Screenshot%202024-02-23%20201448.png) 
      
   4. Navigate to your desired location in Windows. Open PowerShell in that folder by holding Shift and right-clicking the mouse, then select "Open PowerShell window here."
   5. In the PowerShell window, type the following command:
  ```
  git clone https://github.com/OpenSignLabs/OpenSign.git
  ```
  and Hit Enter to clone the OpenSign project locally.
  
   6. Open the OpenSign folder with Visual Studio Code. Go to `apps > mongo > mongo-init.sh`. Change the file type from CRLF to LF, save the file, and close Visual Studio Code.

![docker](https://legadratw3d.ams3.cdn.digitaloceanspaces.com/Screenshot%202024-02-23%20175944.png) 

   7. Open the Ubuntu/WSL terminal and use the command to navigate to the folder where you cloned the OpenSign project, e.g., cd mnt/c/testing/docker/OpenSign.
   8. Execute the following command to build the container image:
  ```
  make build
  ```
 This will initiate the process of creating the container image. It may take some time to complete.
   
   9. Refer below video for more specific details.
   10. For subsequent runs, open Docker and start the OpenSign container by clicking on the play button in the actions panel.

*Note: If you wish to incorporate our latest features into your Docker container, delete the existing OpenSign container and follow the steps again.* 

<div>
    <ReactPlayer playing controls url='https://www.youtube.com/watch?v=GY_OP697EiU' />
</div>

## Information About ENV variables which are used to setup OpenSign™ with Docker on Localhost
To set up OpenSign™ locally using Docker, the following prerequisites are required: 

Environment Varaibles:

| Environment Varibale  | Value | Description |
| ------------- | ------------- | ------------- |
| CI  | false  | Set CI to false while running the app locally |
| PUBLIC_URL  | http://localhost:3000  | Set it to the URL form where the app home page will be accessed |
| GENERATE_SOURCEMAP  | false | Set it to true if you want to generate the Sourcemap for debugging |
| REACT_APP_SERVERURL  | http://localhost:8080/app  | Set it to the URL from where APIs will be accessible, for local development it should be localhost:8080/app (use your local port number instead) |
| REACT_APP_APPID  | opensignstgn  | A 12 character long random app identifier. The value of this should be same as APP_ID which is a variable used by backend API. |
| APP_ID  | opensignstgn  | A 12 character long random app identifier. The value of this should be same as REACT_APP_APPID which is a variable used by Frontend React App. |
| appName  | open_sign_server  | Name of the app. It will be visible in the verification emails sent out. |
| MASTER_KEY  | XnAadwKxxByMr  | A 12 character long random secret key that allows access to all the data. It is used in Parse dashboard config to view all the data in the database. |
| MONGODB_URI  | mongodb://host.docker.internal:27017/OpenSignDB  | Mongodb URI to connect to |
| PARSE_MOUNT  |/app  | Path on which APIs should be mounted. Do not change this. This variable shall be removed & value hardcoded in the source code in coming versions. |
| SERVER_URL  | http://localhost:8080/app  | Set it to the URL from where APIs will be accessible to the NodeJS functions, for local development it should be localhost:8080/app (use your local port number instead) |
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
| PFX_BASE64  | - | Base64 encoded PFX or p12 document signing certificate file. You can generate base64 encoded self sign certificate using the passphrase. |
| PASS_PHRASE | opensign | Pass phrase of PFX or p12 document signing certificate file.|

# Steps to Generate Self Sign Certificate
```
# execute below command and use passphrase 'opensign'
openssl genrsa -des3 -out ./local_dev.key 2048
openssl req -key ./local_dev.key -new -x509 -days 365 -out ./local_dev.crt
openssl pkcs12 -inkey ./local_dev.key -in ./cert/local_dev.crt -export -out ./local_dev.pfx
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
