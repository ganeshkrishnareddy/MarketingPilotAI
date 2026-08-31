"use client";

import * as React from "react";
import { pb } from "./pocketbase";

export type Role = "admin" | "client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  status?: string;
  client_of?: string;
  business?: string;
}

export function getCurrentUser(): AuthUser | null {
  const model = pb.authStore.model as any;
  if (!model || !pb.authStore.isValid || !model.id) return null;
  return {
    id: model.id,
    email: model.email || "",
    name: model.name || "",
    role: (model.role as Role) || "client",
    status: model.status || "active",
    client_of: model.client_of || "",
    business: model.business || "",
  };
}

export function isAdmin(): boolean {
  return getCurrentUser()?.role === "admin";
}

export function isClient(): boolean {
  return getCurrentUser()?.role === "client";
}

export async function login(email: string, password: string): Promise<AuthUser> {
  await pb.collection("users").authWithPassword(email.trim(), password);
  const user = getCurrentUser();
  if (!user) throw new Error("Login failed");
  return user;
}

export function logout(): void {
  pb.authStore.clear();
}

/** Reactive auth hook. Re-renders when the PocketBase auth store changes. */
export function useAuth() {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const sync = () => {
      setUser(getCurrentUser());
      setLoading(false);
    };
    sync();
    const unsub = pb.authStore.onChange?.(() => sync());
    return () => {
      try {
        unsub?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { user, loading, isAdmin: user?.role === "admin", isClient: user?.role === "client" };
}
