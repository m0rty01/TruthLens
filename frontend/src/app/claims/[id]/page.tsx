"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PageHeader, ClassificationBadge, ScoreGauge } from "@/components/ui";
import { useApi } from "@/hooks/useApi";
import { claimsApi } from "@/lib/api";
import type { Claim } from "@/types";

export default function ClaimDetailPage() {
  const params = useParams();
  const { data: claim, loading } = useApi<Claim>(
    () => claimsApi.getById(params.id as string),
    [params.id]
  );

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!claim) return <div className="p-8 text-center text-muted-foreground">Claim not found</div>;

  return (
    <div className="space-y-6">
      <Link href="/claims" className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Claims
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <ClassificationBadge classification={claim.classification} />
            <span className="text-xs text-muted-foreground">Checked {claim.timesChecked} times</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">&ldquo;{claim.text}&rdquo;</h1>
        </div>
        <ScoreGauge score={claim.confidenceScore} label="Confidence" size="lg" />
      </div>

      {/* Context */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-2">Context</h3>
        <p className="text-sm text-muted-foreground">{claim.context}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Origin: {claim.originPlatform}</span>
          <span>First seen: {new Date(claim.firstSeen).toLocaleDateString()}</span>
          <span>Last updated: {new Date(claim.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {claim.exaggerationIndex !== undefined && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3">Exaggeration Index</h3>
          <div className="flex items-center gap-4">
            <ScoreGauge score={100 - claim.exaggerationIndex} label="Evidence Support" size="md" />
            <ScoreGauge score={claim.exaggerationIndex} label="Exaggeration" size="md" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${100 - claim.exaggerationIndex}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Evidence supports {100 - claim.exaggerationIndex}% of the claim</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evidence */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" /> Evidence ({claim.evidence.length})
          </h3>
          {claim.evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No supporting evidence found</p>
          ) : (
            <div className="space-y-3">
              {claim.evidence.map((ev) => (
                <div key={ev.id} className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-green-800">{ev.source}</span>
                    <span className="text-xs text-green-600">Credibility: {ev.credibility}%</span>
                  </div>
                  <p className="text-sm text-green-700">{ev.snippet}</p>
                  <span className="text-xs text-green-600 mt-1 block">{ev.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Counter Evidence */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" /> Counter Evidence ({claim.counterEvidence.length})
          </h3>
          {claim.counterEvidence.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No counter evidence found</p>
          ) : (
            <div className="space-y-3">
              {claim.counterEvidence.map((ev) => (
                <div key={ev.id} className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-red-800">{ev.source}</span>
                    <span className="text-xs text-red-600">Credibility: {ev.credibility}%</span>
                  </div>
                  <p className="text-sm text-red-700">{ev.snippet}</p>
                  <span className="text-xs text-red-600 mt-1 block">{ev.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
