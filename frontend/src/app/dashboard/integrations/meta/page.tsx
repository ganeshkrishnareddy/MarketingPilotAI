import { ConnectorSetup } from "@/components/connector-setup";

export default function MetaIntegrationPage() {
  return (
    <ConnectorSetup
      title="Meta Business Connection"
      description="Connect Meta so Facebook and Instagram workflows can use a single app and access token."
      badge="Meta"
      storageKey="marketingpilot.connector.meta"
      fields={[
        { name: "metaAppId", label: "Meta App ID", placeholder: "Meta App ID" },
        { name: "facebookPageId", label: "Facebook Page ID", placeholder: "Facebook Page ID" },
        { name: "metaAccessToken", label: "Meta Access Token", placeholder: "Paste long-lived access token", kind: "textarea", rows: 5, type: "password" },
      ]}
      statusLabels={[
        { label: "App ID", description: "Main Meta application identifier." },
        { label: "Access token", description: "Should be long-lived for stable automation." },
        { label: "Page ID", description: "Needed for Facebook page publishing and messaging." },
      ]}
      notes={[
        "Use a long-lived token from Meta so scheduled posts and automation do not stop unexpectedly.",
        "If you plan to use Instagram automation, this same Meta app usually powers it.",
        "Keep the access token private and move it to a backend secret store when you're ready.",
      ]}
    />
  );
}
