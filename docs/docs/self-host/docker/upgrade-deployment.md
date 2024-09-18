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

```
docker compose pull
```
  - This command will fetch the most recent versions of the Docker images required by OpenSign.
  - Wait for the pulling process to complete. You should see messages indicating the progress and completion of the download.

<img width="550" alt="Pulling completed" src="https://github.com/user-attachments/assets/14525d84-d588-4d0d-bffd-f0608f3646f3" />

### Step 3: Start the Updated OpenSign Deployment
After the images have been successfully pulled, run the following command to start the updated OpenSign deployment:
```
docker compose up
```
  - This command will recreate and start all the necessary containers with the updated images.
  - You should see logs indicating that the containers are being created or updated, and eventually, that they are up and running.
   
### Running Docker Compose in Detached Mode

To start your Docker Compose services in detached mode (running in the background), use the following command:

```
docker-compose up -d
```
**Explanation:**
  - docker-compose up: This command starts the services defined in your docker-compose.yml file.
  - -d: The detached mode flag, which runs the containers in the background and frees up your terminal.
    
<img width="550" alt="Docker compose up" src="https://github.com/user-attachments/assets/791b2ac0-206a-4ed8-a1aa-164b3cf5015b" />

## Notes:
   - The docker compose pull command ensures that you have the latest version of the Docker images, while the docker compose up command applies any updates and starts the containers.

## Troubleshooting:
   - If you encounter any errors, check Docker logs by running docker compose logs to get more details.
   - Verify that your environment variables and Docker configuration files are set correctly.
     
If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

For instant help and support, **[join our Discord community!](https://discord.com/invite/xe9TDuyAyj)**
