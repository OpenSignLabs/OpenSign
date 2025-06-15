---
title: Digital Ocean
---
# Digital Ocean

OpenSign application consists of 3 components -
- ReactJS frontend
- NodeJS API
- MongoDB database

You can install all 3 components on digital ocean using the button below -

[![Deploy on DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/OpenSignLabs/Deploy-OpenSign-to-Digital-Ocean/tree/main&refcode=30db1c901ab0)

**Note:** This button is not intended for production installations because it sets up the OpenSign database within an app platform container that lacks persistent storage. Instead, in the next step, replace the MongoDB connection string with one from a managed MongoDB instance, which you should set up on DigitalOcean.