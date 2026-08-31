import { ConnectorSetup } from "@/components/connector-setup";

export default function WhatsAppIntegrationPage() {
  return (
    <ConnectorSetup
      title="WhatsApp Connection"
      description="Set up WhatsApp Cloud API so the app can send messages, respond to leads, and trigger follow-ups."
      badge="WhatsApp"
      storageKey="marketingpilot.connector.whatsapp"
      fields={[
        { name: "whatsappWabaId", label: "WABA ID", placeholder: "123456789" },
        { name: "whatsappPhoneNumberId", label: "Phone Number ID", placeholder: "987654321" },
        { name: "whatsappWebhookUrl", label: "Webhook URL", placeholder: "https://your-domain.com/api/webhooks/whatsapp" },
        { name: "whatsappVerifyToken", label: "Verify Token", placeholder: "your-verify-token", type: "password" },
      ]}
      statusLabels={[
        { label: "Phone number", description: "Required for sending and receiving WhatsApp messages." },
        { label: "Webhook", description: "Used to receive delivery receipts and inbound events." },
        { label: "Verify token", description: "Used to validate your webhook during setup." },
      ]}
      notes={[
        "Create a WhatsApp app inside Meta, then copy the phone number ID and WABA ID into this page.",
        "Your webhook must be reachable from Meta's servers over HTTPS.",
        "Once this is saved, connect the same values to your backend or n8n workflow.",
      ]}
    />
  );
}
