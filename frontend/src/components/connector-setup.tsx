"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export type ConnectorField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "email";
  kind?: "input" | "textarea";
  rows?: number;
};

type ConnectorSetupProps = {
  title: string;
  description: string;
  badge: string;
  storageKey: string;
  fields: ConnectorField[];
  notes: string[];
  statusLabels: { label: string; description: string }[];
};

export function ConnectorSetup({
  title,
  description,
  badge,
  storageKey,
  fields,
  notes,
  statusLabels,
}: ConnectorSetupProps) {
  const initialState = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, ""])) as Record<string, string>,
    [fields]
  );
  const [values, setValues] = useState<Record<string, string>>(initialState);
  const [statusMessage, setStatusMessage] = useState("Not connected yet");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setValues({ ...initialState, ...JSON.parse(saved) });
      setStatusMessage("Saved locally on this device");
    }
  }, [initialState, storageKey]);

  const filledCount = Object.values(values).filter((value) => Boolean(value.trim())).length;

  const save = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(values));
    setStatusMessage("Connection saved locally");
    toast.success("Connection saved");
  };

  const reset = () => {
    setValues(initialState);
    window.localStorage.removeItem(storageKey);
    setStatusMessage("Reset");
    toast.success("Connection reset");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="mb-3 gap-2 bg-primary/10 text-primary" variant="secondary">
              {badge}
            </Badge>
            <h1 className="font-outfit text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {filledCount} fields filled
            </Badge>
            <Badge variant="outline">{statusMessage}</Badge>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Connection details</CardTitle>
            <CardDescription>Fill in the real credentials or endpoint values for this connector.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name} className={field.kind === "textarea" ? "md:col-span-2 space-y-2" : "space-y-2"}>
                  <Label>{field.label}</Label>
                  {field.kind === "textarea" ? (
                    <Textarea
                      value={values[field.name]}
                      onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                      placeholder={field.placeholder}
                      rows={field.rows || 4}
                    />
                  ) : (
                    <Input
                      type={field.type || "text"}
                      value={values[field.name]}
                      onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={save} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Save setup
              </Button>
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Connection status</CardTitle>
              <CardDescription>Quick health check for this integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusLabels.map((item) => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-background/60 p-4">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Setup notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
