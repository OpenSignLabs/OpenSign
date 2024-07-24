---
title: How to upgrade self-hosted OpenSign to v2.1.0?
---
# Steps to upgrade any previous self-hosted OpenSign to v2.1.0

For self-hosted deployments, version 2.1.0 introduces changes to the signup process:

**New Deployment:** The signup button has been removed. During a fresh deployment, an admin creation wizard will guide you through creating an Admin user.

**Migration from Previous Versions:** For those upgrading from any previous version to 2.1.0, follow these steps to promote an existing user to Admin:

After upgrading, visit "https://public_url/upgrade-2.1" and enter the requested details to change the role of an existing user to Admin.
Ensure you have your master key (set in the environment variable during installation) and the email ID of the user to be promoted ready.

**User Roles and Capabilities**
In the self-hosted version, Admins have comprehensive control:

Admin: Admins can manage users and share templates with the entire organization. Only Admins can create users, with roles being assigned as OrgAdmin, Editor, or User.
OrgAdmin: OrgAdmins have the same access as Admins. Essentially they are new admins that can be created as and when needed.
Editor: Editors can share templates with all users but cannot create users.
User: Users cannot share templates or create users. They can only create emplates for themselves.
All other features remain accessible to all roles.
