# Overview

> **OpenSign™ API v1.2 — the open-source DocuSign alternative, built for developers and trusted by enterprises.**

The OpenSign™ API is a production-ready, RESTful interface for embedding legally binding electronic signatures and end-to-end document workflows into any application. Send documents for signature, build reusable templates, automate signing pipelines, and track every event in real time — all from a single, well-documented API, with no vendor lock-in.

Whether you are digitising a single contract flow or powering signatures across an entire enterprise, v1.2 gives you the building blocks to move fast while staying compliant with global e-signature standards (ESIGN, UETA, eIDAS).

---

# Key Features

- **Documents** — Create, send, update, revoke, and delete signature requests with fine-grained control over signers, ordering, and reminders.
- **Templates** — Build reusable templates with pre-placed widgets and dispatch them to one or many signers in a single call.
- **Self-Sign** — Generate self-signed documents instantly, without an invitation or signer flow.
- **Public Templates** — Publish a shareable signing link for open intake forms — no pre-defined signer list required.
- **Draft Workflow** — Persist documents and templates as drafts, iterate, and finalise them on your own schedule.
- **Signer Roles** — Assign each recipient a role: `signer`, `viewer` (read-only), or `approver` (everything except a signature).
- **Password-Protected PDFs** — Work seamlessly with encrypted source files via the `file_password` parameter.
- **Offline Signing Control** — Toggle offline signing per template with `allow_offline_sign`.
- **Contacts & Folders** — Manage your signer contact book and organise documents in OpenSign Drive programmatically.
- **Webhooks** — Receive real-time event notifications at your own endpoint for every document lifecycle change.
- **Users & Credits** — Retrieve account information and monitor available credits on demand.
- **Security & Compliance** — TLS-encrypted transport, audit trails, IP logging, and tamper-evident signed PDFs aligned with international legal standards.

---

# What’s New in v1.2

- **Cleaner Template Retrieval** — `GET /template/:id` and `GET /templatelist` now return prefill data separately from signer parameters, with redundant fields removed for easier consumption.
- **Password-Protected PDF Support** — Pass `file_password` on document, template, draft, and self-sign creation routes.
- **Offline Signing Control** — Explicitly enable or disable offline signing per template.
- **Signer Roles** — A new `signer_role` field on the `signers` object unlocks viewer and approver flows alongside the default signer behaviour.
- **Fully Backwards-Compatible** — All v1 and v1.1 endpoints remain available on the v1.2 base URL. New parameters are optional unless otherwise documented.

---

# Getting Started

Every request must include your API token in the `x-api-token` header:

```
x-api-token: <your-api-token>
```

→ [How to generate your API token](https://docs.opensignlabs.com/docs/help/Settings/APIToken)

Prototype risk-free in the **sandbox environment** before going live.

## Available Environments

| Environment    | Base URL                                        |
| -------------- | ----------------------------------------------- |
| **Sandbox**    | `https://sandbox.opensignlabs.com/api/v1.2`     |
| **Production** | `https://app.opensignlabs.com/api/v1.2`         |
| **EU Region**  | `https://eu-app.opensignlabs.com/api/v1.2`      |
| **Staging**    | `https://staging-app.opensignlabs.com/api/v1.2` |

---

# Target Audience

- **Developers & IT Teams** — Embedding signatures and document automation into web, mobile, or backend systems.
- **Product & SaaS Companies** — Adding white-labelled e-signature flows to their own platforms.
- **Enterprises & Operations** — Standardising secure, auditable document workflows across departments.
- **Legal & Compliance Teams** — Meeting ESIGN, UETA, and eIDAS requirements with verifiable audit trails.

---

# Usage Scenarios

- Automating contract creation, dispatch, and signing across sales and procurement pipelines.
- Powering HR onboarding — offer letters, NDAs, and policy acknowledgements at scale.
- Collecting structured input via public template links for intake forms, waivers, and applications.
- Orchestrating multi-party approval flows using mixed `signer`, `approver`, and `viewer` roles.
- Standardising legal, financial, and government document workflows with reusable templates.
- Integrating signing events into downstream systems through real-time webhooks.

---

# Useful Links

- [OpenSign Website](https://www.opensignlabs.com)
- [Full Documentation](https://docs.opensignlabs.com)
- [GitHub Repository](https://github.com/opensignlabs/opensign)
- [Generate API Token](https://docs.opensignlabs.com/docs/help/Settings/APIToken)
- [Terms of Service](https://www.opensignlabs.com/terms/)
