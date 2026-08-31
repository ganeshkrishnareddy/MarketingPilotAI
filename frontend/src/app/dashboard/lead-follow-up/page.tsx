import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function LeadFollowUpPage() {
  return (
    <AiModuleWorkbench
      moduleKey="lead-follow-up"
      title="Lead Follow-up AI"
      description="Score leads, generate follow-up sequences, handle objections, and create CRM tasks automatically."
      defaultChannel="Lead Follow-up"
      quickActions={["Score this lead", "Create 7-day follow-up sequence", "Write objection replies", "Generate call task notes", "Create lost lead recovery", "Create hot lead close script"]}
    />
  );
}
