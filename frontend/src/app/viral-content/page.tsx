"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, PlatformBadge, ScoreGauge } from "@/components/ui";
import { formatNumber, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Platform } from "@/types/content";
import { Eye, Heart, Share2, MessageCircle, CheckCircle, Loader2, RefreshCw, ExternalLink, Database } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { viralContentApi, socialMediaApi } from "@/lib/api";
import type { ViralContent } from "@/types";

const platforms: (Platform | "All")[] = ["All", "X", "Reddit", "YouTube", "TikTok", "Instagram", "Facebook"];

export default function ViralContentPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | "All">("All");
  const [query, setQuery] = useState("");
  const { data: allContent, loading, refetch } = useApi<ViralContent[]>(
    () => viralContentApi.list(),
    []
  );
  const { data: statusData } = useApi<{ platforms: { platform: string; configured: boolean }[] }>(
    () => socialMediaApi.getStatus(),
    []
  );

  const configuredPlatforms = ((statusData?.platforms ?? []) as { platform: string; configured: boolean }[]).filter((s) => s.configured).map((s) => s.platform);
  const hasLiveApis = configuredPlatforms.length > 0;

  const filtered = (allContent ?? []).filter(
    (c) => selectedPlatform === "All" || c.platform === selectedPlatform
  ).sort((a, b) => b.viralityScore - a.viralityScore);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Viral Content Tracker"
        description="Track viral content related to tracked narratives across social media platforms"
        actions={
          <div className="flex items-center gap-2">
            {hasLiveApis ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                <Database className="w-3.5 h-3.5" /> Live ({configuredPlatforms.join(", ")})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                <Database className="w-3.5 h-3.5" /> Mock Data
              </span>
            )}
            <Link
              href="/integrations"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> API Keys
            </Link>
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
            </button>
          </div>
        }
      />

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPlatform(p)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              selectedPlatform === p
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Content Feed */}
      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      <div className="space-y-4">
        {filtered.map((content) => (
          <Link
            key={content.id}
            href={`/viral-content/${content.id}`}
            className="block bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <PlatformBadge platform={content.platform} />
                  {content.isVerified && (
                    <span className="flex items-center gap-1 text-xs text-info">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(content.postedAt)}
                  </span>
                </div>

                <p className="text-sm text-card-foreground mb-3 line-clamp-3">{content.content}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>by {content.authorHandle}</span>
                  <span>-</span>
                  <span>{formatNumber(content.authorFollowers)} followers</span>
                  <span>-</span>
                  <span>{content.country}</span>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3.5 h-3.5" /> {formatNumber(content.engagement.views)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3.5 h-3.5" /> {formatNumber(content.engagement.likes)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Share2 className="w-3.5 h-3.5" /> {formatNumber(content.engagement.shares)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5" /> {formatNumber(content.engagement.comments)}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold ml-auto",
                      content.sentiment === "negative" ? "text-destructive" :
                      content.sentiment === "positive" ? "text-success" : "text-muted-foreground"
                    )}
                  >
                    {content.sentiment}
                  </span>
                </div>
              </div>

              <ScoreGauge score={content.viralityScore} label="Virality" size="sm" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
