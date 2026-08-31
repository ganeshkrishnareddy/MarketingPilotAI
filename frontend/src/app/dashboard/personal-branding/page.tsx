import { AiModuleWorkbench } from "@/components/ai-module-workbench";

export default function PersonalBrandingPage() {
  return (
    <AiModuleWorkbench
      moduleKey="personal-branding"
      title="Personal Branding AI"
      description="Create founder positioning, authority content, bio copy, topic pillars, and trust-building posts."
      badge="Vision 360"
      defaultChannel="Personal Branding"
      quickActions={["Create founder positioning", "Write LinkedIn bio", "Generate authority topics", "Create 10 personal posts", "Build trust signals", "Create founder story"]}
    />
  );
}
