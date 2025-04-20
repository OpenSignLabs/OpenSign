---
title: OpenSign Deployment Guide on Azure VM via command-line
---

# 🚀 OpenSign Deployment Guide on Azure VM (Frontend + Backend + MongoDB + Caddy)

## 🧱 Prerequisites

- Azure CLI installed
- A domain you control (e.g., `yourdomain.com`)
- Subdomain pointing to your VM (e.g., `opensign.yourdomain.com`)
- SSH access

---

## 🔧 Step 1: Create an Azure VM

### 1.1 Create Resource Group
```bash
az group create --name OpenSignRG --location eastus
```

### 1.2 Create Ubuntu VM
```bash
az vm create \
  --resource-group OpenSignRG \
  --name opensign-vm \
  --image Ubuntu2404 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --size Standard_B1ms
```

### 1.3 Get VM IP
```bash
az vm list-ip-addresses --name opensign-vm --resource-group OpenSignRG --output table
```

---

## 🔐 Step 2: Open Required Ports

Azure’s default port-opening approach conflicts if you use the same priorities. So instead, **add rules with increasing priorities** manually:

### 2.1 Get NSG name
```bash
az network nsg list --resource-group OpenSignRG --query "[].name"
```

Assume it’s `opensign-vmNSG`. Then:

### 2.2 Add inbound port rules
```bash
az network nsg rule create \
  --resource-group OpenSignRG \
  --nsg-name opensign-vmNSG \
  --name Allow-HTTP \
  --priority 1001 \
  --direction Inbound \
  --protocol Tcp \
  --access Allow \
  --destination-port-ranges 80

az network nsg rule create \
  --resource-group OpenSignRG \
  --nsg-name opensign-vmNSG \
  --name Allow-HTTPS \
  --priority 1002 \
  --direction Inbound \
  --protocol Tcp \
  --access Allow \
  --destination-port-ranges 443

az network nsg rule create \
  --resource-group OpenSignRG \
  --nsg-name opensign-vmNSG \
  --name Allow-Caddy-Internal \
  --priority 1003 \
  --direction Inbound \
  --protocol Tcp \
  --access Allow \
  --destination-port-ranges 3001
```

---

## 🌍 Step 3: Point Domain to VM

In your DNS provider (e.g., GoDaddy, Cloudflare):

- Add an **A record**:  
  - Name: `opensign`  
  - Value: `<your VM public IP>`  
  - TTL: 1 min or Auto

Let it propagate (~5–10 mins).

---

## 📦 Step 4: SSH into the VM

```bash
ssh azureuser@<your-vm-ip>
```

---

## 🐳 Step 5: Install Docker + Compose V2

```bash
sudo apt update && sudo apt install docker.io -y

# Install Compose V2 (CLI plugin)
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Enable Docker
sudo systemctl enable docker
```

Verify:
```bash
docker compose version
```

---

## 📁 Step 6: Set Up Project and Volumes

### 6.1 Create a working directory
```bash
mkdir opensign && cd opensign
```

### 6.2 Download files
```bash
export HOST_URL=https://opensign.yourdomain.com

curl -O https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/Caddyfile
curl -O https://raw.githubusercontent.com/OpenSignLabs/OpenSign/main/.env.local_dev
mv .env.local_dev .env.prod
```
Make sure that you update the SMTP settings by editing the .env.prod file in order to receive emails.
---


## ⚙️ Step 7: Start the Stack

Now boot the containers using Compose V2:

```bash
docker compose up -d --force-recreate
```

---

## ✅ Step 8: Verify Everything

- `https://opensign.yourdomain.com` loads the app with HTTPS
- Caddy fetched SSL certs automatically
- Backend routes work at `/api/*`
- MongoDB persists data
- Uploaded files persist via `opensign-files` volume

Test:

```bash
docker exec -it OpenSignServer-container ls /usr/src/app/files
docker volume inspect opensign-files
```

---

## 📦 Step 9: Auto-start on Reboot (optional)

```bash
crontab -e
```

Add:
```bash
@reboot cd /home/azureuser/opensign && docker compose up -d
```

---

## 🔄 Backups (optional)

```bash
# Backup MongoDB volume
docker run --rm -v opensign_data-volume:/data -v $(pwd):/backup ubuntu tar czvf /backup/mongo-backup.tar.gz /data

# Backup OpenSign files
docker run --rm -v opensign_opensign-files:/data -v $(pwd):/backup ubuntu tar czvf /backup/files-backup.tar.gz /data
```
