"use client";

import * as React from "react";
import {
  MessageCircle,
  Bot,
  Settings,
  History,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Phone,
  User,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none";

interface ChatbotConfig {
  welcome_message: string;
  business_hours: string;
  fallback_message: string;
  handoff_keywords: string;
  auto_reply_enabled: boolean;
  language: string;
}

interface Conversation {
  phone: string;
  contact_id: string;
  lastMessage: string;
  lastDirection: string;
  timestamp: string;
}

interface ChatMessage {
  id: string;
  phone: string;
  direction: "incoming" | "outgoing";
  message: string;
  timestamp: string;
}

export default function WhatsAppChatbotPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"config" | "conversations">("config");
  const [config, setConfig] = React.useState<ChatbotConfig>({
    welcome_message: "Hello! 👋 Welcome to V360 AI Agency. How can I help you today?",
    business_hours: "Mon-Fri 9:00 AM - 6:00 PM IST",
    fallback_message: "I'm sorry, I didn't understand that. Can you rephrase? You can also type 'agent' to speak with a human.",
    handoff_keywords: "agent, human, person, speak to someone",
    auto_reply_enabled: true,
    language: "auto",
  });
  const [saving, setSaving] = React.useState(false);
  const [saveResult, setSaveResult] = React.useState("");
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = React.useState(false);
  const [metaConfigured, setMetaConfigured] = React.useState(false);
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [verifyToken, setVerifyToken] = React.useState("");

  // Load config
  React.useEffect(() => {
    fetch("/api/whatsapp/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        if (data.meta_configured !== undefined) setMetaConfigured(data.meta_configured);
        if (data.webhook_url) setWebhookUrl(data.webhook_url);
        if (data.verify_token) setVerifyToken(data.verify_token);
      })
      .catch(() => {});
  }, []);

  // Load conversations
  const loadConversations = React.useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/whatsapp/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {
      setConversations([]);
    }
    setLoadingConversations(false);
  }, []);

  React.useEffect(() => {
    if (activeTab === "conversations") loadConversations();
  }, [activeTab, loadConversations]);

  // Load specific conversation
  React.useEffect(() => {
    if (!selectedPhone) {
      setChatMessages([]);
      return;
    }
    fetch(`/api/whatsapp/conversations?phone=${encodeURIComponent(selectedPhone)}`)
      .then((r) => r.json())
      .then((data) => setChatMessages(data.conversations || []))
      .catch(() => setChatMessages([]));
  }, [selectedPhone]);

  // Save config
  const saveConfig = async () => {
    setSaving(true);
    setSaveResult("");
    try {
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult("✅ Configuration saved successfully!");
      } else {
        setSaveResult(`❌ ${data.error || "Failed to save"}`);
      }
    } catch (e: any) {
      setSaveResult(`❌ ${e.message}`);
    }
    setSaving(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            WhatsApp AI Chatbot
          </h1>
          <p className="text-xs text-slate-500">
            Configure your AI-powered WhatsApp chatbot and view conversations.
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-xl border p-4 ${
          metaConfigured
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {metaConfigured ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">
              {metaConfigured ? "WhatsApp Connected" : "WhatsApp Not Configured"}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {metaConfigured
                ? "Your Meta WhatsApp Business API is configured. The chatbot is active."
                : "Set META_ACCESS_TOKEN and META_PHONE_NUMBER_ID in your .env.local to connect."}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "config"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings className="h-4 w-4" /> Chatbot Config
        </button>
        <button
          onClick={() => setActiveTab("conversations")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "conversations"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <History className="h-4 w-4" /> Conversations
        </button>
      </div>

      {/* ═══ CONFIG TAB ═══ */}
      {activeTab === "config" && (
        <div className="space-y-6">
          {/* Webhook Setup */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Webhook Setup</h3>
            <p className="mb-3 text-xs text-slate-500">
              Configure these in your{" "}
              <a
                href="https://business.facebook.com/wa/manage/quick-start"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                Meta WhatsApp Manager
              </a>
              .
            </p>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Webhook URL (paste in Meta)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={webhookUrl}
                    className={inputCls + " font-mono text-xs"}
                  />
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Verify Token (paste in Meta)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={verifyToken}
                    className={inputCls + " font-mono text-xs"}
                  />
                  <button
                    onClick={() => copyToClipboard(verifyToken)}
                    className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
                <strong>Steps:</strong>
                <ol className="mt-1 list-decimal pl-4 space-y-1">
                  <li>Go to Meta WhatsApp Manager → Quick Start</li>
                  <li>Create an Application</li>
                  <li>Set Primary Answer URL to the Webhook URL above</li>
                  <li>Set the Verify Token to: <code className="rounded bg-slate-100 px-1">{verifyToken}</code></li>
                  <li>Subscribe to <code className="rounded bg-slate-100 px-1">messages</code> field</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Chatbot Settings */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Chatbot Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={config.auto_reply_enabled}
                  onChange={(e) =>
                    setConfig({ ...config, auto_reply_enabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700">Enable AI auto-replies</span>
              </label>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Welcome Message
                </label>
                <textarea
                  value={config.welcome_message}
                  onChange={(e) =>
                    setConfig({ ...config, welcome_message: e.target.value })
                  }
                  rows={2}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Fallback Message (when AI doesn't understand)
                </label>
                <textarea
                  value={config.fallback_message}
                  onChange={(e) =>
                    setConfig({ ...config, fallback_message: e.target.value })
                  }
                  rows={2}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Business Hours
                  </label>
                  <input
                    value={config.business_hours}
                    onChange={(e) =>
                      setConfig({ ...config, business_hours: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Language
                  </label>
                  <select
                    value={config.language}
                    onChange={(e) =>
                      setConfig({ ...config, language: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Human Handoff Keywords (comma-separated)
                </label>
                <input
                  value={config.handoff_keywords}
                  onChange={(e) =>
                    setConfig({ ...config, handoff_keywords: e.target.value })
                  }
                  className={inputCls}
                  placeholder="agent, human, person, speak to someone"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  When a user sends a message containing any of these words, the chatbot will offer to connect them with a human agent.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-500 px-4 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {saving ? "Saving..." : "Save Configuration"}
              </button>
              {saveResult && (
                <span className="text-xs text-slate-600">{saveResult}</span>
              )}
            </div>
          </div>

          {/* Environment Variables Reference */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Required Environment Variables</h3>
            <p className="mb-3 text-xs text-slate-500">
              Add these to your <code className="rounded bg-slate-100 px-1">.env.local</code> file:
            </p>
            <div className="rounded-lg bg-slate-900 p-4 font-mono text-[11px] text-slate-300">
              <div>META_ACCESS_TOKEN=your_permanent_access_token</div>
              <div>META_PHONE_NUMBER_ID=your_phone_number_id</div>
              <div>META_VERIFY_TOKEN=vision360_secure_token</div>
              <div className="mt-2 text-slate-500"># AI (already configured)</div>
              <div>AI_API_KEY=your_openrouter_key</div>
              <div className="mt-2 text-slate-500"># PocketBase (already configured)</div>
              <div>POCKETBASE_ADMIN_EMAIL=admin@vision360.ai</div>
              <div>POCKETBASE_ADMIN_PASSWORD=Vision@360</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONVERSATIONS TAB ═══ */}
      {activeTab === "conversations" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Conversation List */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Conversations</h3>
              <button
                onClick={loadConversations}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-500">No conversations yet</p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Messages will appear here when customers reach out.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.phone}
                    onClick={() => setSelectedPhone(conv.phone)}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      selectedPhone === conv.phone
                        ? "bg-emerald-50 ring-1 ring-emerald-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                        <Phone className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-900">
                          {conv.phone}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat View */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:col-span-2">
            {selectedPhone ? (
              <>
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <button
                    onClick={() => setSelectedPhone("")}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <Phone className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-900">{selectedPhone}</span>
                </div>

                <div className="space-y-3" style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {chatMessages.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-500">No messages yet</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === "outgoing" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            msg.direction === "outgoing"
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              msg.direction === "outgoing"
                                ? "text-emerald-100"
                                : "text-slate-400"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <MessageCircle className="mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm text-slate-500">Select a conversation to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
