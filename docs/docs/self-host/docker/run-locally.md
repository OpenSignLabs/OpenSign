---
title: Localhost Setup with Docker
---
import ReactPlayer from 'react-player';

## Steps to run OpenSign™ with docker in macos/linux:
  1. Firstly install docker and make sure it is running while moving to next steps.
  2. Now open terminal then type `git clone https://github.com/OpenSignLabs/OpenSign` and hit `Enter` it will clone OpenSign project in your local.
  3. Then type `cd OpenSign` command and hit `Enter` it will open OpenSign project in terminal.
  4. Then type `make build` command it will start create container image. It will take sometime to build and start.
  5. Next time if you want to run docker image just open docker and run opensign container by clicking on play button from actions.

*Note: If you want our updated feature in your docker container just delete opensign container and just follow steps again.* 
 
## Steps to run OpenSign™ with docker in windows:
  1. Setup WSL 2 in windows. To install WSL 2 refer below video

<div>
    <ReactPlayer playing controls url='https://youtu.be/1kFFwknneD8?si=FKriXPwFqZPLUagI' />
</div>
      
   2. Now install docker desktop in windows and open docker desktop.
   3. Enable wsl in docker desktop by moving on this location `Setting > Resources > WSL Inegration` and click on check box and then click on `apply & restart` button and now minimize it.

![docker](https://legadratw3d.ams3.cdn.digitaloceanspaces.com/Screenshot%202024-02-23%20201448.png) 
      
   4. Go to your desired destination in your windows then open powershell in that folder using `Shift + right click of mouse` and select `Open Powershell window here` from options. 
   5. Open powershell and type `git clone https://github.com/OpenSignLabs/OpenSign` and hit `Enter` it will clone OpenSign project in you local.
   6. Then open OpenSign folder with vs code and go to `apps > mongo > mongo-init.sh` and change type of this file from `CRLF` to `LF` and then save this file and close vs code.

![docker](https://legadratw3d.ams3.cdn.digitaloceanspaces.com/Screenshot%202024-02-23%20175944.png) 

   7. Open ubuntu/WSL terminal and write command to navigate to folder where you have clone OpenSign project for e.g. `cd mnt/c/testing/docker/OpenSign` and hit `Enter`.
   8. Now type command `Make build` and it will start build image for docker, it will take some time to build and start. for more specific steps watch below video.
   9. Next time if you want to run docker image just open docker and run opensign container by clicking on play button from actions.

*Note: If you want our updated feature in your docker container just delete opensign container and just follow steps from 2 step again.* 

<div>
    <ReactPlayer playing controls url='https://www.youtube.com/watch?v=GY_OP697EiU' />
</div>

## Information for ENV variables which are used to setup OpenSign™ with Docker on Localhost
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
