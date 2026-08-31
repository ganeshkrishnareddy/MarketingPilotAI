import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function BusinessProcessAutomationPage() {
  return (
    <AiModuleWorkbench
      moduleKey="business-process"
      title="Business Process Automation"
      description="Map repeatable business operations into triggers, actions, SOPs, approvals, and KPI tracking."
      defaultChannel="Business Process Automation"
      quickActions={["Map onboarding process", "Create SOP checklist", "Suggest automation triggers", "Build approval workflow", "Create KPI tracker", "Generate handoff rules"]}
    />
  );
}
