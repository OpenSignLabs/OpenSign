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
- Switch to the newly created OpenSign directory.
  ```
  cd OpenSign
  ```  
- Copy the .env.frontend_dev file to  apps/OpenSign/.env using below command(on mac & linux). For windows use COPY command instead.
  ```
  cp .env.frontend_dev apps/OpenSign/.env
  ```
- Switch to apps/OpenSign directory.
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

## Localhost(Docker)
- Please refer this documentation => [click here](https://docs.opensignlabs.com/docs/self-host/docker/run-locally) 
