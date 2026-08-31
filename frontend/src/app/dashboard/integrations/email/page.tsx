import { ConnectorSetup } from "@/components/connector-setup";

export default function EmailIntegrationPage() {
  return (
    <ConnectorSetup
      title="Email / SMTP Connection"
      description="Connect Zoho Mail or any SMTP provider so the platform can send automated emails."
      badge="Email"
      storageKey="marketingpilot.connector.email"
      fields={[
        { name: "smtpHost", label: "SMTP Host", placeholder: "smtp.zoho.in" },
        { name: "smtpPort", label: "SMTP Port", placeholder: "465" },
        { name: "smtpUser", label: "SMTP User", placeholder: "progvision@zohomail.in" },
        { name: "emailFrom", label: "From Address", placeholder: "progvision@zohomail.in" },
        { name: "smtpPass", label: "SMTP Password", placeholder: "App password or SMTP password", kind: "textarea", rows: 4, type: "password" },
      ]}
      statusLabels={[
        { label: "Host", description: "Usually smtp.zoho.in for Zoho Mail." },
        { label: "Port", description: "465 is common for secure SMTP." },
        { label: "Sender", description: "This address will appear in outgoing campaigns." },
      ]}
      notes={[
        "Use an app password if your mail provider does not allow plain account passwords.",
        "The email sender in the app already routes through the central mail service.",
        "You can later connect this page to backend secrets instead of local storage.",
      ]}
    />
  );
}
