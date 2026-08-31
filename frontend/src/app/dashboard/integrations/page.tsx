"use client";

import Link from "next/link";
import { ArrowRight, PlugZap, Bot, Mail, Smartphone, Globe2, Settings2, Webhook, MessageSquare, Phone, BriefcaseBusiness, AtSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const connectors = [
  { title: "WhatsApp", description: "Phone number, WABA, webhook, verify token", href: "/dashboard/integrations/whatsapp", icon: Smartphone },
  { title: "Meta", description: "App ID, access token, page connection", href: "/dashboard/integrations/meta", icon: Webhook },
  { title: "Instagram", description: "Instagram Graph token and permissions", href: "/dashboard/integrations/instagram", icon: MessageSquare },
  { title: "LinkedIn", description: "LinkedIn posting and campaign token", href: "/dashboard/integrations/linkedin", icon: BriefcaseBusiness },
  { title: "X / Twitter", description: "Bearer token for posting and replies", href: "/dashboard/integrations/x", icon: AtSign },
  { title: "Email / SMTP", description: "Zoho or SMTP mail connection", href: "/dashboard/integrations/email", icon: Mail },
  { title: "AI Settings", description: "OpenRouter and OpenCode model visibility", href: "/dashboard/ai-settings", icon: Settings2 },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <Badge className="mb-3 gap-2 bg-primary/10 text-primary" variant="secondary">
          <PlugZap className="h-3.5 w-3.5" />
          Connector hub
        </Badge>
        <h1 className="font-outfit text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Each connector has its own page now, so you can set up WhatsApp, social accounts, email, and website webhooks one by one.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {connectors.map((connector) => (
          <Card key={connector.title} className="border-white/10 bg-white/5 backdrop-blur-xl transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <connector.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{connector.title}</CardTitle>
              <CardDescription>{connector.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={connector.href} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                Open setup
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
