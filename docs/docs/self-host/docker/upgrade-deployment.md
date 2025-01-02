---
title: OpenSign™ Self-Hosted 'Upgrade Deployment' Guide Using Docker on Linux, macOS, or Windows
---
import ReactPlayer from 'react-player';

This guide provides step-by-step instructions to upgrade the deployment of OpenSign using Docker.

### Step 1: Open the Terminal
  - **Windows:** Press Win + X and select Windows PowerShell or Windows Terminal from the menu.
  - **macOS:**  Go to Applications > Utilities > Terminal or search for "Terminal" using Spotlight (Cmd + Space).
  - **Linux:**  Open the terminal from the application menu or by pressing Ctrl + Alt + T.

### Step 2: Pull the Latest Docker Images
1) Before executing the commands below, make sure Docker is running on your machine.
2) Ensure that you are in the same directory where you executed the `build` or `compose` Docker command.

Run the following command to pull the latest OpenSign Docker images:

**Note:**  If you've made any custom changes to your docker-compose.yml file, they will be lost when running the command below. This command is intended only for those who haven't made any custom modifications to their docker-compose.yml file.

## Running on a custom domain
**linux/MacOS**
```
export HOST_URL=https://opensign.yourdomain.com && curl --remote-name-all https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml && docker compose pull
```
**Windows** (Powershell)
```
$env:HOST_URL="https://opensign.yourdomain.com"; Invoke-WebRequest -Uri https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml -OutFile docker-compose.yml; docker compose pull
```
**Windows** (Command Prompt)
```
set HOST_URL=https://opensign.yourdomain.com && curl -O https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml && docker compose pull
```
  - This command will fetch the most recent versions of the Docker images required by OpenSign.
  - Wait for the pulling process to complete. You should see messages indicating the progress and completion of the download.

## Running locally
**linux/MacOS**
```
curl --remote-name-all https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml && docker compose pull
```
**Windows** (Powershell)
```
Invoke-WebRequest -Uri https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml -OutFile docker-compose.yml; docker compose pull
```
**Windows** (Command Prompt)
```
curl -O https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml && docker compose pull
```
  - This command will fetch the most recent versions of the Docker images required by OpenSign.
  - Wait for the pulling process to complete. You should see messages indicating the progress and completion of the download.
<img width="550" alt="Pulling completed" src="https://github.com/user-attachments/assets/1b708b04-e6e6-45a0-9625-94e420a68343" />

### Step 3: Start the Updated OpenSign Deployment
After the images have been successfully pulled, run the following command to start the updated OpenSign deployment:

### Running Docker Compose in Detached Mode

To start your Docker Compose services in detached mode (running in the background), use the following command:
```
docker compose up -d
```
**Explanation:**
  - docker-compose up: This command starts the services defined in your docker-compose.yml file.
  - -d: The detached mode flag, which runs the containers in the background and frees up your terminal.
    
<img width="550" alt="Docker compose up" src="https://github.com/user-attachments/assets/c573baaf-f70d-468e-a531-75b85a275647" />

### OR 
If you have already run the above command, you do not need to execute this command.
```
docker compose up
```
  - This command will recreate and start all the necessary containers with the updated images.
  - You should see logs indicating that the containers are being created or updated, and eventually, that they are up and running.

## Note:
   - The docker compose pull command ensures that you have the latest version of the Docker images, while the docker compose up command applies any updates and starts the containers.

## Troubleshooting:
   - If you encounter any errors, check Docker logs by running docker compose logs to get more details.
   - Verify that your environment variables and Docker configuration files are set correctly.
     
If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

For instant help and support, **[join our Discord community!](https://discord.com/invite/xe9TDuyAyj)**
