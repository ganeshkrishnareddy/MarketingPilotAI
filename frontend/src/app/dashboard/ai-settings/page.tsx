"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, CheckCircle2, Database, RefreshCw, Server, Sparkles, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ProviderItem = {
  name: string;
  base_url: string;
  model: string;
  category: string;
  visible: boolean;
};

type PersistedAI = {
  defaultProvider: string;
  defaultModel: string;
  defaultTaskRoute: string;
};

const storageKey = "marketingpilot.ai-settings";

const defaultAI: PersistedAI = {
  defaultProvider: "OpenRouter",
  defaultModel: "openrouter/free",
  defaultTaskRoute: "content-creation",
};

export default function AISettingsPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [settings, setSettings] = useState<PersistedAI>(defaultAI);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setSettings({ ...defaultAI, ...JSON.parse(saved) });

    fetch("/api/config/providers")
      .then((res) => res.json())
      .then((data) => setProviders(data.providers || []))
      .catch(() => toast.error("Could not load visible provider list"))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
    toast.success("AI settings saved");
  };

  const freeProviders = providers.filter((provider) => provider.category === "Free AI");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary" variant="secondary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Visible AI providers
            </Badge>
            <h1 className="font-outfit text-3xl font-bold tracking-tight">AI Settings</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">
              Choose the default provider, model, and task route. Free models are shown directly in the UI so you can see what the app is using.
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            {loading ? "Loading" : `${freeProviders.length} free providers visible`}
          </Badge>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Default AI routing
              </CardTitle>
              <CardDescription>These values decide which provider and model the app falls back to.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Default Provider</Label>
                <Input value={settings.defaultProvider} onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Input value={settings.defaultModel} onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Default Task Route</Label>
                <Input value={settings.defaultTaskRoute} onChange={(e) => setSettings({ ...settings, defaultTaskRoute: e.target.value })} />
              </div>
              <div className="md:col-span-3 flex gap-3 pt-2">
                <Button onClick={save} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Save AI settings
                </Button>
                <Button variant="outline" onClick={() => setSettings(defaultAI)}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-400" />
                Free models in use
              </CardTitle>
              <CardDescription>These providers are visible in the product so you can confirm the free AI setup.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {freeProviders.map((provider) => (
                <div key={provider.model} className="rounded-2xl border border-white/10 bg-background/60 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.category}</p>
                    </div>
                    <Badge className="gap-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      {provider.model}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{provider.base_url}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                What this controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>The selected provider and model are the defaults your app can use when no task-specific route exists.</p>
              <p>OpenRouter free and OpenCode free models are shown in the UI so you can see the actual free AI options available.</p>
              <p>Save these locally for now, then connect them to PocketBase or a secure backend settings store later if you want team-wide sync.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
