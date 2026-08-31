import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function InstagramAutomationPage() {
  return (
    <AiModuleWorkbench
      moduleKey="instagram-automation"
      title="Instagram Automation"
      description="Create DM automation, comment replies, story responses, lead capture scripts, and engagement workflows."
      defaultChannel="Instagram"
      quickActions={["Create DM opener", "Generate comment reply set", "Build story reply flow", "Create lead magnet DM sequence", "Write saved replies", "Create engagement workflow"]}
    />
  );
}
