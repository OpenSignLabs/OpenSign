import { isStaging } from "../constant/const";

const plans = [
  {
    planName: "OPENSIGN™ FREE",
    img: "free.png",
    currency: "",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    subtitle: "Free Unlimited E-signatures, Forever.",
    btn: { text: "Subscribe", color: "op-btn-primary" },
    url: "",
    target: "_blank",
    benefits: [
      "Unlimited envelopes",
      "Sign documents yourself",
      "Request signatures from others",
      "14 field types",
      "Automatic e-signatures",
      "Completion certificates",
      "Send in order",
      "Document templates",
      "Import from Dropbox",
      "Contact book",
      "Document expiry support",
      "Decline document support",
      "Email notifications",
      "Recipient authentication using OTP",
      "Bulk send (upto 5 docs)",
      "Public profiles",
      "And much more"
    ],
    yearlyBenefits: [
      "Unlimited envelopes",
      "Sign documents yourself",
      "Request signatures from others",
      "14 field types",
      "Automatic e-signatures",
      "Completion certificates",
      "Send in order",
      "Document templates",
      "Import from Dropbox",
      "Contact book",
      "Document expiry support",
      "Decline document support",
      "Email notifications",
      "Recipient authentication using OTP",
      "Bulk send (upto 5 docs)",
      "Public profiles",
      "And much more"
    ]
  },
  {
    planName: "OPENSIGN™ PROFESSIONAL",
    img: "professional.png",
    currency: "$",
    monthlyPrice: "29.99",
    yearlyPrice: `9.99<sup style="font-size: 17px;">/month</sup>`,
    subtitle: "Exclusive Access to advanced features.",
    btn: { text: "Subscribe", color: "op-btn-primary" },
    url: isStaging
      ? "https://billing.zoho.in/subscribe/9627f62a09df1c8ce500f2f4dc8328dd84ecda20eeae13878ce581d60240f206/pro-weekly"
      : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af901d1a09dfa8085585cdd4ec4d7f32137f3/professional-monthly",
    yearlyUrl: isStaging
      ? "https://billing.zoho.in/subscribe/9627f62a09df1c8ce500f2f4dc8328ddc184411129224f1f29ed84f6cef3b862/pro-yearly"
      : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af901d8ad1135190dff951330360e47585a71/professional-yearly",
    target: "_self",
    benefits: [
      "Everything in OpenSign™ free",
      "Field validations",
      "Regular expression validations",
      "Organize docs in OpenSign™ Drive",
      "Webhooks",
      "Zapier integration",
      "API Access",
      "100 API signatures included",
      "Custom email templates",
      "Auto reminders",
      "Bulk send (upto 20 docs)",
      "Premium Public profile usernames",
      "Embedding (coming soon)"
    ],
    yearlyBenefits: [
      "Everything in OpenSign™ free",
      "Field validations",
      "Regular expression validations",
      "Organize docs in OpenSign™ Drive",
      "Webhooks",
      "Zapier integration",
      "API Access",
      "240 API signatures included",
      "Custom email templates",
      "Auto reminders",
      "Bulk send (upto 20 docs)",
      "Premium Public profile usernames",
      "Embedding (coming soon)"
    ]
  },
  {
    planName: "OPENSIGN™ TEAMS",
    img: "teams.png",
    currency: "$",
    monthlyPrice: `39.99<sup style="font-size: 17px;">/user</sup>`,
    yearlyPrice: `19.99<sup style="font-size: 17px;">/user/month</sup>`,
    subtitle: "Exclusive Access to advanced features.",
    btn: { text: "Subscribe", color: "op-btn-accent" },
    url: isStaging
      ? "https://billing.zoho.in/subscribe/ed8097273a82b6bf39892c11a3bb3c381eb2705736014cfbdbde1ccf1c7a189d/team-weekly"
      : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af901237d0702bfaa959406306635d80f138c/teams-monthly",
    yearlyUrl: isStaging
      ? "https://billing.zoho.in/subscribe/ed8097273a82b6bf39892c11a3bb3c381eb2705736014cfbdbde1ccf1c7a189d/team-weekly"
      : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af9011a864994bbeeec71fcf106188630199d/teams-yearly",
    target: "_self",
    benefits: [
      "Everything in OpenSign™ professional",
      "100 API signatures included",
      "Teams and Organizations",
      "Share Templates with teams",
      "Share Templates with individuals",
      "DocumentId removal from signed docs",
      "Bulk send (upto 50 docs)",
      "Request Payments (coming soon)",
      "Mobile app (coming soon)"
    ],
    yearlyBenefits: [
      "Everything in OpenSign™ professional",
      "500 API signatures included",
      "Teams and Organizations",
      "Share Templates with teams",
      "Share Templates with individuals",
      "DocumentId removal from signed docs",
      "Bulk send (upto 50 docs)",
      "Request Payments (coming soon)",
      "Mobile app (coming soon)"
    ]
  },
  {
    planName: "OPENSIGN™ ENTERPRISE",
    img: "enterprise.png",
    currency: "",
    monthlyPrice: `<p style="font-size: 22px;">Request Price</p>`,
    yearlyPrice: `<p style="font-size: 22px;">Request Price</p>`,
    subtitle: "Scalable Features with priority support.",
    btn: { text: "Contact us", color: "op-btn-primary" },
    url: "https://www.opensignlabs.com/contact-us",
    target: "_blank",
    benefits: [
      "All features",
      "Custom domain",
      "Custom branding",
      "Uptime SLA",
      "SSO support",
      "Priority support"
    ],
    yearlyBenefits: [
      "All features",
      "Custom domain",
      "Custom branding",
      "Uptime SLA",
      "SSO support",
      "Priority support"
    ]
  }
];

export default plans;
