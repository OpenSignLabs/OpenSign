const plans = [
  {
    planName: "OPENSIGN™ FREE",
    currency: "",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    subtitle: "Free Unlimited E-signatures, Forever.",
    btnText: "Subscribe",
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
    currency: "$",
    monthlyPrice: "29.99",
    yearlyPrice: "329.99",
    subtitle: "Exclusive Access to advanced features.",
    btnText: "Subscribe",
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
      "Custom email templates(coming soon)"
    ]
  },
  {
    planName: "OPENSIGN™ ENTERPRISE",
    currency: "",
    monthlyPrice: "Request Price",
    yearlyPrice: "Request Price",
    subtitle: "Scalable Features with priority support.",
    btnText: "Contact us",
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

export default plans;
