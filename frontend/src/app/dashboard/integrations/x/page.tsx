import { ConnectorSetup } from "@/components/connector-setup";

export default function XIntegrationPage() {
  return (
    <ConnectorSetup
      title="X / Twitter Connection"
      description="Connect X for posting, replies, and audience engagement workflows."
      badge="X"
      storageKey="marketingpilot.connector.x"
      fields={[
        { name: "xBearerToken", label: "Bearer Token", placeholder: "Paste X bearer token", kind: "textarea", rows: 5, type: "password" },
        { name: "xApiKey", label: "API Key", placeholder: "Optional API key" },
        { name: "xApiSecret", label: "API Secret", placeholder: "Optional API secret", type: "password" },
      ]}
      statusLabels={[
        { label: "Bearer token", description: "Primary token used for posting and API requests." },
        { label: "Reply flow", description: "Can power social reply automation." },
        { label: "Audience", description: "Useful for brand mentions and monitoring." },
      ]}
      notes={[
        "Make sure your app has the required access level for posting and reading content.",
        "Start with read-only actions first, then add posting once the app is approved.",
        "Keep the token private and move it to backend storage when you're ready.",
      ]}
    />
  );
}
