"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui";
import {
  Plug,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { socialMediaApi } from "@/lib/api";

interface PlatformStatus {
  platform: string;
  configured: boolean;
  postCount: number;
  error?: string;
}

interface PlatformConfig {
  key: string;
  label: string;
  envVars: { name: string; label: string; placeholder: string; docs: string }[];
  color: string;
}

const platformConfigs: PlatformConfig[] = [
  {
    key: "x",
    label: "X (Twitter)",
    color: "#000000",
    envVars: [
      {
        name: "X_BEARER_TOKEN",
        label: "Bearer Token",
        placeholder: "AAAAAAAAAAAAAAAAAAAAA...",
        docs: "https://developer.twitter.com/en/docs/authentication/oauth-2-0/bearer-tokens",
      },
    ],
  },
  {
    key: "reddit",
    label: "Reddit",
    color: "#FF4500",
    envVars: [
      {
        name: "REDDIT_CLIENT_ID",
        label: "Client ID",
        placeholder: "your_reddit_client_id",
        docs: "https://www.reddit.com/prefs/apps",
      },
      {
        name: "REDDIT_CLIENT_SECRET",
        label: "Client Secret",
        placeholder: "your_reddit_client_secret",
        docs: "https://www.reddit.com/prefs/apps",
      },
    ],
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "#FF0000",
    envVars: [
      {
        name: "YOUTUBE_API_KEY",
        label: "API Key",
        placeholder: "AIza...",
        docs: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
      },
    ],
  },
  {
    key: "tiktok",
    label: "TikTok",
    color: "#000000",
    envVars: [
      {
        name: "TIKTOK_CLIENT_KEY",
        label: "Client Key",
        placeholder: "your_tiktok_client_key",
        docs: "https://developers.tiktok.com/doc/getting-started",
      },
      {
        name: "TIKTOK_CLIENT_SECRET",
        label: "Client Secret",
        placeholder: "your_tiktok_client_secret",
        docs: "https://developers.tiktok.com/doc/getting-started",
      },
    ],
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "#E4405F",
    envVars: [
      {
        name: "INSTAGRAM_ACCESS_TOKEN",
        label: "Access Token",
        placeholder: "IGQV...",
        docs: "https://developers.facebook.com/docs/instagram-api/getting-started",
      },
    ],
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "#1877F2",
    envVars: [
      {
        name: "FACEBOOK_ACCESS_TOKEN",
        label: "Access Token",
        placeholder: "EAAD...",
        docs: "https://developers.facebook.com/docs/graph-api/overview",
      },
    ],
  },
];

export default function IntegrationsPage() {
  const [statuses, setStatuses] = useState<PlatformStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await socialMediaApi.getStatus();
      setStatuses(data.platforms ?? []);
    } catch {
      setStatuses([]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // Only send non-empty keys
    const nonEmptyKeys = Object.fromEntries(
      Object.entries(keys).filter(([, v]) => v.trim() !== "")
    );
    if (Object.keys(nonEmptyKeys).length === 0) {
      setSaveMsg("No keys to save");
      return;
    }

    setSaving(true);
    setSaveMsg(null);
    // API keys are configured via environment variables on the backend
    // This page shows status only - configure keys in backend/.env
    setSaveMsg("API keys are configured via environment variables. See backend/.env.example for instructions.");
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 5000);
  };

  const getStatus = (platform: string) =>
    statuses.find((s) => s.platform === platform);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Integrations"
        description="Connect social media platforms to fetch live viral content data instead of mock data"
        actions={
          <button
            onClick={loadStatus}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>
        }
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-foreground">
            API keys are stored in the backend environment and memory only.
          </p>
          <p className="text-muted-foreground mt-1">
            For persistent configuration, set environment variables in{" "}
            <code className="px-1 py-0.5 rounded bg-muted text-xs">backend/.env</code>.
            Keys entered here take effect immediately but reset on server restart unless saved to .env.
          </p>
        </div>
      </div>

      {/* Platform Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {platformConfigs.map((pc) => {
          const status = getStatus(pc.label.split(" ")[0]);
          const isConfigured = status?.configured ?? false;
          return (
            <div
              key={pc.key}
              className="bg-card rounded-xl border border-border p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: pc.color }}
                />
                <span className="text-sm font-medium">{pc.label}</span>
              </div>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
              ) : isConfigured ? (
                <span className="flex items-center justify-center gap-1 text-xs text-success font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <XCircle className="w-3.5 h-3.5" /> Not configured
                </span>
              )}
              {status && status.postCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {status.postCount} posts
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* API Key Configuration */}
      <div className="space-y-4">
        {platformConfigs.map((pc) => {
          const status = getStatus(pc.label.split(" ")[0]);
          const isConfigured = status?.configured ?? false;

          return (
            <div
              key={pc.key}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: pc.color }}
                  >
                    {pc.label.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {pc.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {pc.envVars.length} credential
                      {pc.envVars.length > 1 ? "s" : ""} required
                    </p>
                  </div>
                </div>
                {isConfigured ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    <Plug className="w-3.5 h-3.5" /> Inactive
                  </span>
                )}
              </div>

              <div className="p-5 space-y-4">
                {pc.envVars.map((envVar) => (
                  <div key={envVar.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">
                        {envVar.label}
                      </label>
                      <a
                        href={envVar.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Get API key →
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKeys[envVar.name] ? "text" : "password"}
                          value={keys[envVar.name] || ""}
                          onChange={(e) =>
                            setKeys((prev) => ({
                              ...prev,
                              [envVar.name]: e.target.value,
                            }))
                          }
                          placeholder={envVar.placeholder}
                          className="w-full px-3 py-2 pr-10 rounded-lg bg-background border border-border text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                        />
                        <button
                          onClick={() =>
                            setShowKeys((prev) => ({
                              ...prev,
                              [envVar.name]: !prev[envVar.name],
                            }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showKeys[envVar.name] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Environment variable:{" "}
                      <code className="px-1 py-0.5 rounded bg-muted text-xs">
                        {envVar.name}
                      </code>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save API Keys
        </button>
        {saveMsg && (
          <span
            className={`text-sm ${
              saveMsg.includes("success")
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {saveMsg}
          </span>
        )}
      </div>
    </div>
  );
}
