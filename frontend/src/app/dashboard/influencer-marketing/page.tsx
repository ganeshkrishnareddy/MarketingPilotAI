import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function InfluencerMarketingPage() {
  return (
    <AiModuleWorkbench
      moduleKey="influencer-marketing"
      title="Influencer Marketing AI"
      description="Create influencer briefs, outreach messages, campaign rules, deliverables, and tracking plans."
      badge="Vision 360"
      defaultChannel="Influencer Marketing"
      quickActions={["Create influencer brief", "Write outreach DM", "Define deliverables", "Create tracking metrics", "Generate content rules", "Build collaboration offer"]}
    />
  );
}
