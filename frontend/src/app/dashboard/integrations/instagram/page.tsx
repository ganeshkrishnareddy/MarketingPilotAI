import { ConnectorSetup } from "@/components/connector-setup";

export default function InstagramIntegrationPage() {
  return (
    <ConnectorSetup
      title="Instagram Connection"
      description="Connect Instagram Graph API for DMs, comments, story replies, and automation."
      badge="Instagram"
      storageKey="marketingpilot.connector.instagram"
      fields={[
        { name: "instagramAccessToken", label: "Instagram Access Token", placeholder: "Paste Instagram Graph token", kind: "textarea", rows: 5, type: "password" },
        { name: "instagramBusinessAccountId", label: "Business Account ID", placeholder: "Instagram business account ID" },
        { name: "instagramPageId", label: "Connected Facebook Page ID", placeholder: "Page ID" },
      ]}
      statusLabels={[
        { label: "Graph token", description: "Used for Instagram content and messaging APIs." },
        { label: "Business account", description: "Required for professional account automation." },
        { label: "Page link", description: "Instagram is usually attached to a Meta page." },
      ]}
      notes={[
        "You need a professional Instagram account connected to a Meta Page.",
        "Use the long-lived access token generated in Meta developer settings.",
        "Set up your webhook first if you want comment and DM events to flow into the app.",
      ]}
    />
  );
}
