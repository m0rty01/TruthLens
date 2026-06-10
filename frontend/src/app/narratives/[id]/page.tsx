"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader, TrendBadge, PlatformBadge, ScoreGauge, DashboardCard } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { narrativesApi, claimsApi } from "@/lib/api";
import type { Narrative, Claim } from "@/types";

export default function NarrativeDetailPage() {
  const params = useParams();
  const { data: narrative, loading } = useApi<Narrative>(
    () => narrativesApi.getById(params.id as string),
    [params.id]
  );
  const { data: allClaims } = useApi<Claim[]>(() => claimsApi.list(), []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!narrative) return <div className="p-8 text-center text-muted-foreground">Narrative not found</div>;

  const relatedClaims = (allClaims ?? []).filter((c) => (narrative.relatedClaims ?? []).includes(c.id));

  return (
    <div className="space-y-6">
      <Link href="/narratives" className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Narratives
      </Link>

      <PageHeader title={narrative.title} description={narrative.description} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard title="Trend Score" value={narrative.trend.score} />
        <DashboardCard title="Velocity" value={`${narrative.trend.velocity}/hr`} />
        <DashboardCard title="Total Mentions" value={formatNumber(narrative.totalMentions)} />
        <div className="flex items-center justify-center bg-card rounded-xl border border-border p-5">
          <div className="text-center">
            <TrendBadge direction={narrative.trend.direction} />
            <p className="text-xs text-muted-foreground mt-2">Direction</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-3">
            {narrative.platformDistribution.map((p) => (
              <div key={p.platform} className="flex items-center gap-3">
                <PlatformBadge platform={p.platform} />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.percentage}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-20 text-right">
                  {formatNumber(p.mentions)} ({p.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Country Distribution</h3>
          <div className="space-y-3">
            {narrative.countryDistribution.map((c) => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-sm font-medium w-32">{c.country}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-info rounded-full" style={{ width: `${c.percentage}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-20 text-right">
                  {formatNumber(c.mentions)} ({c.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Mention Timeline (30 days)</h3>
        <div className="flex items-end gap-1 h-32">
          {narrative.timeline.map((entry, i) => {
            const max = Math.max(...narrative.timeline.map((e) => e.mentions));
            const height = (entry.mentions / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${entry.date}: ${entry.mentions} mentions`}>
                <div className="w-full bg-primary/70 rounded-t" style={{ height: `${height}%` }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{narrative.timeline[0]?.date}</span>
          <span>{narrative.timeline[narrative.timeline.length - 1]?.date}</span>
        </div>
      </div>

      {/* Related Claims */}
      {relatedClaims.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Related Claims</h3>
          <div className="space-y-2">
            {relatedClaims.map((claim) => (
              <Link key={claim.id} href={`/claims/${claim.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                <span className="text-sm">{claim.text}</span>
                <span className="text-xs font-semibold">{claim.confidenceScore}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {narrative.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">#{tag}</span>
        ))}
      </div>
    </div>
  );
}
