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
      "And much more"
    ]
  },
  {
    planName: "OPENSIGN™ PROFESSIONAL",
    img: "professional.png",
    currency: "$",
    monthlyPrice: "29.99",
    yearlyPrice: `10 <sup style="font-size: 17px;">/month/user</sup>`,
    subtitle: "Exclusive Access to advanced features.",
    btn: { text: "Subscribe", color: "op-btn-primary" },
    url:
      window.location.origin === "https://staging-app.opensignlabs.com"
        ? "https://billing.zoho.in/subscribe/9627f62a09df1c8ce500f2f4dc8328dd84ecda20eeae13878ce581d60240f206/pro-weekly"
        : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af901d1a09dfa8085585cdd4ec4d7f32137f3/professional-monthly",
    yearlyUrl:
      window.location.origin === "https://staging-app.opensignlabs.com"
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
      "DocumentId removal from signed docs",
      "Custom email templates",
      "Auto reminders"
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
    ]
  }
];
export const stagingPlan = {
  planName: "OPENSIGN™ TEAMS",
  img: "teams.png",
  currency: "$",
  monthlyPrice: "40",
  yearlyPrice: `20 <sup style="font-size: 17px;">/month/user</sup>`,
  subtitle: "Exclusive Access to advanced features.",
  btn: { text: "Subscribe", color: "op-btn-accent" },
  url:
    window.location.origin === "https://staging-app.opensignlabs.com"
      ? "https://billing.zoho.in/subscribe/ed8097273a82b6bf39892c11a3bb3c381eb2705736014cfbdbde1ccf1c7a189d/team-weekly"
      : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af901d1a09dfa8085585cdd4ec4d7f32137f3/professional-monthly",
  yearlyUrl:
    window.location.origin === "https://staging-app.opensignlabs.com"
      ? "https://billing.zoho.in/subscribe/ed8097273a82b6bf39892c11a3bb3c381eb2705736014cfbdbde1ccf1c7a189d/team-weekly"
      : "https://billing.opensignlabs.com/subscribe/ef798486e6a0a11ea65f2bae8f2af901d8ad1135190dff951330360e47585a71/professional-yearly",
  target: "_self",
  benefits: [
    "Everything in OpenSign™ free, professional",
    "Field validations",
    "Regular expression validations",
    "Organize docs in OpenSign™ Drive",
    "Webhooks",
    "Zapier integration",
    "API Access",
    "100 API signatures included",
    "DocumentId removal from signed docs",
    "Custom email templates",
    "Auto reminders"
  ]
};
export default plans;
