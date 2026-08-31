import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function AIChatbotPage() {
  return (
    <AiModuleWorkbench
      moduleKey="ai-chatbot"
      title="AI Chatbot Builder"
      description="Create website chatbot flows for lead qualification, FAQs, appointment booking, and human handoff."
      badge="AI Automation"
      defaultChannel="Website Chatbot"
      defaultPrompt="Build a chatbot script that qualifies leads and books appointments."
      quickActions={[
        "Create welcome chatbot flow",
        "Generate FAQ answers",
        "Create lead qualification questions",
        "Build booking handoff script",
        "Write objection replies",
        "Create escalation rules",
      ]}
    />
  );
}
