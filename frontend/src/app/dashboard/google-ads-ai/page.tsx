import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function GoogleAdsAiPage() {
  return (
    <AiModuleWorkbench
      moduleKey="google-ads"
      title="Google Ads AI"
      description="Generate search campaigns, ad groups, responsive search ads, keyword sets, and landing page recommendations."
      badge="Vision 360"
      defaultChannel="Google Ads"
      quickActions={["Create search campaign", "Generate keyword groups", "Write responsive search ads", "Suggest negative keywords", "Create landing page notes", "Build budget plan"]}
    />
  );
}
