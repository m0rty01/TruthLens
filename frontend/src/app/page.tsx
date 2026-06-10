"use client";

import {
  DashboardCard,
  TrendBadge,
  PlatformBadge,
  PageHeader,
} from "@/components/ui";
import {
  Radar,
  ShieldCheck,
  Flame,
  Flag,
  MessageSquare,
  Search,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { dashboardMetrics } from "@/lib/mock/data";
import { formatNumber } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { narrativesApi, viralContentApi, claimsApi } from "@/lib/api";
import { Narrative, ViralContent, Claim } from "@/types";

export default function DashboardPage() {
  const { data: narratives } = useApi<Narrative[]>(() => narrativesApi.list(), []);
  const { data: viralContent } = useApi<ViralContent[]>(() => viralContentApi.list(), []);
  const { data: claims } = useApi<Claim[]>(() => claimsApi.list(), []);

  const topNarratives = narratives
    ? [...narratives].sort((a, b) => b.trend.score - a.trend.score).slice(0, 5)
    : [];
  const recentContent = viralContent
    ? [...viralContent].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()).slice(0, 5)
    : [];
  const recentClaims = claims ? claims.slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of narrative intelligence and misinformation tracking"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Active Narratives"
          value={narratives?.length ?? dashboardMetrics.activeNarratives}
          trend="up"
          subtitle={`${dashboardMetrics.narrativesSpiking} spiking`}
          icon={<Radar className="w-5 h-5" />}
        />
        <DashboardCard
          title="Claims Verified"
          value={claims?.length ?? dashboardMetrics.claimsVerified}
          subtitle={`${dashboardMetrics.claimsFalse} false/exaggerated`}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <DashboardCard
          title="Viral Content"
          value={viralContent?.length ?? dashboardMetrics.viralContentTracked}
          trend="up"
          subtitle={`${formatNumber(dashboardMetrics.totalMentions)} total mentions`}
          icon={<Flame className="w-5 h-5" />}
        />
        <DashboardCard
          title="Community Reports"
          value={dashboardMetrics.communityReports}
          subtitle="5 verified this week"
          icon={<Flag className="w-5 h-5" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/copilot"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Ask AI Copilot
        </Link>
        <Link
          href="/report"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <Flag className="w-4 h-4" />
          Report Incident
        </Link>
        <Link
          href="/narratives"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <Search className="w-4 h-4" />
          Search Narratives
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Trending Narratives */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-card-foreground">Top Trending Narratives</h2>
            <Link
              href="/narratives"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topNarratives.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading narratives...</p>
            )}
            {topNarratives.map((narrative, i) => (
              <Link
                key={narrative.id}
                href={`/narratives/${narrative.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {narrative.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(narrative.totalMentions)} mentions
                    </span>
                    <span className="text-muted-foreground">-</span>
                    {narrative.platformDistribution.slice(0, 2).map((p) => (
                      <PlatformBadge key={p.platform} platform={p.platform} />
                    ))}
                  </div>
                </div>
                <TrendBadge direction={narrative.trend.direction} />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Viral Content */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-card-foreground">Recent Viral Content</h2>
            <Link
              href="/viral-content"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentContent.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading content...</p>
            )}
            {recentContent.map((content) => (
              <Link
                key={content.id}
                href={`/viral-content/${content.id}`}
                className="flex items-start gap-4 px-5 py-3 hover:bg-muted/50 transition-colors"
              >
                <PlatformBadge platform={content.platform} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">{content.content}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(content.engagement.views)} views
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(content.engagement.shares)} shares
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      content.sentiment === "negative"
                        ? "text-destructive"
                        : content.sentiment === "positive"
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {content.sentiment}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Score: {content.viralityScore}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Recent Claim Verifications</h2>
          <Link
            href="/claims"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentClaims.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading claims...</p>
          )}
          {recentClaims.map((claim) => (
            <Link
              key={claim.id}
              href={`/claims/${claim.id}`}
              className="flex items-center gap-4 px-5 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{claim.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Checked {claim.timesChecked} times
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-foreground">
                  {claim.confidenceScore}%
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    claim.classification === "FALSE"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : claim.classification === "EXAGGERATED"
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : claim.classification === "MISLEADING"
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {claim.classification.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
