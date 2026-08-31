import { ConnectorSetup } from "@/components/connector-setup";

export default function LinkedInIntegrationPage() {
  return (
    <ConnectorSetup
      title="LinkedIn Connection"
      description="Set up LinkedIn access for B2B content, posting, and campaign workflows."
      badge="LinkedIn"
      storageKey="marketingpilot.connector.linkedin"
      fields={[
        { name: "linkedinAccessToken", label: "LinkedIn Access Token", placeholder: "Paste LinkedIn token", kind: "textarea", rows: 5, type: "password" },
        { name: "linkedinOrganizationId", label: "Organization ID", placeholder: "LinkedIn organization ID" },
      ]}
      statusLabels={[
        { label: "Access token", description: "Used for content publishing and profile access." },
        { label: "Organization", description: "Needed for company page workflows." },
        { label: "Automation", description: "Can power B2B lead nurturing and posting." },
      ]}
      notes={[
        "LinkedIn API access depends on the permissions granted to your app.",
        "If posting is restricted, keep this page ready and connect via approved app scopes later.",
        "Store the token securely when you move beyond local testing.",
      ]}
    />
  );
}
