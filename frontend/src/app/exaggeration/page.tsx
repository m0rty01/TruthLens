"use client";
import { PageHeader, EmptyState } from "@/components/ui";
import { ScoreGauge } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { claimsApi } from "@/lib/api";
import type { Claim } from "@/types";
import { Loader2 } from "lucide-react";

export default function ExaggerationPage() {
  const { data: claims, loading } = useApi<Claim[]>(() => claimsApi.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Exaggeration Index" description="Measure narrative inflation and claim exaggeration levels" />
      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(claims ?? []).slice(0, 8).map((claim) => (
          <div key={claim.id} className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm font-medium text-card-foreground mb-3">&ldquo;{claim.text}&rdquo;</p>
            {claim.exaggerationIndex !== undefined ? (
              <div className="flex items-center gap-4">
                <ScoreGauge score={claim.exaggerationIndex} label="Exaggeration" size="sm" />
                <ScoreGauge score={100 - claim.exaggerationIndex} label="Evidence" size="sm" />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-destructive rounded-full" style={{ width: `${claim.exaggerationIndex}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Evidence supports {100 - claim.exaggerationIndex}% of claim</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Analysis pending</p>
            )}
          </div>
        ))}
      </div>
      <EmptyState title="Full Exaggeration Analysis" description="Detailed breakdown of narrative inflation factors including cherry-picking, statistical manipulation, and contextual distortion is being developed." />
    </div>
  );
}
