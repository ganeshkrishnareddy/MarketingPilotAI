export type EmailTemplateKey =
  | "welcome-account-created"
  | "email-verification"
  | "workspace-invitation"
  | "onboarding-email"
  | "login-details"
  | "password-reset"
  | "trial-started"
  | "trial-ending"
  | "payment-successful"
  | "report-ready"
  | "website-scan-complete"
  | "new-lead-captured"
  | "follow-up-reminder"
  | "weekly-business-report";

export type EmailTemplate = {
  key: EmailTemplateKey;
  title: string;
  subject: string;
  description: string;
  category: string;
  ctaLabel: string;
  previewTitle: string;
  body: string;
  variables: string[];
};

export const emailTemplates: EmailTemplate[] = [
  {
    key: "welcome-account-created",
    title: "Welcome & Account Created",
    subject: "Welcome to MarketingPilot AI - Your Workspace is Ready",
    description: "Premium onboarding email for new workspace owners.",
    category: "Onboarding",
    ctaLabel: "Access Your Dashboard",
    previewTitle: "Welcome to MarketingPilot AI",
    variables: ["{{first_name}}", "{{workspace_name}}", "{{email}}", "{{temporary_password}}", "{{dashboard_link}}"],
    body: [
      "Hi {{first_name}},",
      "",
      "Welcome aboard!",
      "",
      "Your AI-powered business workspace has been successfully created.",
      "",
      "You can now manage your CRM, automate marketing, collaborate with AI Employees, and grow your business from one place.",
      "",
      "Your Login Details",
      "Workspace: {{workspace_name}}",
      "Email: {{email}}",
      "Temporary Password: {{temporary_password}}",
      "Login URL: {{dashboard_link}}",
      "",
      "Please change your password after your first login.",
      "",
      "Need assistance? Reply to this email and our team will help.",
    ].join("\n"),
  },
  {
    key: "login-details",
    title: "Login Details Email",
    subject: "Your MarketingPilot AI Login Details",
    description: "Send login credentials in a polished, secure format.",
    category: "Account",
    ctaLabel: "Login Now",
    previewTitle: "Your MarketingPilot AI Login Details",
    variables: ["{{first_name}}", "{{email}}", "{{password}}", "{{login_url}}"],
    body: [
      "Hello {{first_name}},",
      "",
      "Your account has been successfully created.",
      "",
      "Login Credentials",
      "Email: {{email}}",
      "Password: {{password}}",
      "Login: {{login_url}}",
      "",
      "Please change your password after your first login.",
    ].join("\n"),
  },
  {
    key: "new-lead-captured",
    title: "New Lead Added",
    subject: "New Lead Captured",
    description: "Internal CRM alert for incoming leads.",
    category: "CRM",
    ctaLabel: "Open CRM",
    previewTitle: "New Lead Captured",
    variables: ["{{lead}}", "{{company}}", "{{dashboard_link}}"],
    body: [
      "A new lead has entered your CRM.",
      "",
      "Lead: {{lead}}",
      "Company: {{company}}",
      "",
      "Open CRM to review and assign follow-up actions.",
    ].join("\n"),
  },
  {
    key: "weekly-business-report",
    title: "Weekly Business Report",
    subject: "Your Weekly Business Summary",
    description: "Executive summary email for owners and managers.",
    category: "Reports",
    ctaLabel: "View Dashboard",
    previewTitle: "Weekly Business Summary",
    variables: ["{{leads}}", "{{campaigns}}", "{{revenue}}", "{{tasks}}"],
    body: [
      "Here's what happened this week.",
      "",
      "New Leads: {{leads}}",
      "Campaigns: {{campaigns}}",
      "Revenue: {{revenue}}",
      "AI Tasks: {{tasks}}",
      "",
      "Open your dashboard to review the full report.",
    ].join("\n"),
  },
  {
    key: "trial-started",
    title: "Trial Started",
    subject: "Your Free Trial Has Started",
    description: "Friendly activation email for free trial users.",
    category: "Billing",
    ctaLabel: "Start Exploring",
    previewTitle: "Your Free Trial Has Started",
    variables: ["{{first_name}}", "{{trial_days}}"],
    body: [
      "Congratulations!",
      "",
      "Your free trial is now active.",
      "",
      "Available features:",
      "CRM",
      "AI Studio",
      "Marketing",
      "Workflow Automation",
      "AI Employees",
      "",
      "Days remaining: {{trial_days}}",
    ].join("\n"),
  },
  {
    key: "report-ready",
    title: "AI Report Ready",
    subject: "Your AI Report Is Ready",
    description: "Let users know their generated report is ready.",
    category: "Reports",
    ctaLabel: "Open Report",
    previewTitle: "Your AI Report Is Ready",
    variables: ["{{report}}", "{{dashboard_link}}"],
    body: [
      "Good news!",
      "",
      "Your requested report has finished processing.",
      "",
      "Report: {{report}}",
      "",
      "Open the report in your dashboard.",
    ].join("\n"),
  },
  {
    key: "website-scan-complete",
    title: "Website Scan Complete",
    subject: "Website Analysis Completed",
    description: "Premium website audit notification with score and next steps.",
    category: "Analysis",
    ctaLabel: "Open Results",
    previewTitle: "Website Scan Complete",
    variables: ["{{score}}", "{{issues}}", "{{dashboard_link}}"],
    body: [
      "Your website scan has finished.",
      "",
      "Overall Score: {{score}}",
      "Issues Found: {{issues}}",
      "",
      "Open the dashboard to review the scan and recommendations.",
    ].join("\n"),
  },
];

export function getEmailTemplate(key: EmailTemplateKey) {
  return emailTemplates.find((template) => template.key === key) ?? emailTemplates[0];
}

export function renderEmailTemplate(body: string, values: Record<string, string>) {
  return Object.entries(values).reduce((output, [token, value]) => output.split(token).join(value), body);
}

