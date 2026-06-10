"use client";
import { PageHeader, EmptyState } from "@/components/ui";
import { Loader2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { attributionApi } from "@/lib/api";

interface AttributionData {
  actors: { type: string; count: number; percentage: number; confidence: string }[];
}

export default function AttributionPage() {
  const { data, loading } = useApi<AttributionData>(
    () => attributionApi.getByNarrativeId("nar-1"),
    []
  );
  const actors = data?.actors ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Actor Attribution System" description="Estimate likely amplifiers with evidence-based confidence levels" />
      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      {actors.length > 0 && (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Actor Type Distribution</h3>
        <div className="space-y-3">
          {actors.map((actor) => (
            <div key={actor.type} className="flex items-center gap-3">
              <span className="text-sm font-medium w-40">{actor.type}</span>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${actor.percentage}%` }} />
              </div>
              <span className="text-sm text-muted-foreground w-24 text-right">{actor.percentage}% ({actor.count})</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actor.confidence === "High" ? "bg-green-100 text-green-700" : actor.confidence === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{actor.confidence}</span>
            </div>
          ))}
        </div>
      </div>
      )}
      <EmptyState title="Detailed Attribution Analysis" description="Advanced attribution modeling with temporal analysis, linguistic fingerprinting, and cross-platform correlation is being developed." />
    </div>
  );
}
