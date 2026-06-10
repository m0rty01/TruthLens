"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { GitBranch, Calendar, MapPin, Loader2, ChevronRight, ExternalLink, TrendingUp, Radio, CircleDot } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { narrativesApi } from "@/lib/api";
import type { Narrative } from "@/types";

const lifecycleStages = [
  { stage: "Emergence", color: "bg-blue-400", description: "Initial appearance detected" },
  { stage: "Growth", color: "bg-cyan-400", description: "Volume increasing steadily" },
  { stage: "Amplification", color: "bg-orange-400", description: "Coordinated amplification detected" },
  { stage: "Mainstream Adoption", color: "bg-red-400", description: "Crossed into mainstream media" },
  { stage: "Decline", color: "bg-gray-400", description: "Volume decreasing" },
  { stage: "Resurgence", color: "bg-purple-400", description: "Re-emergence after decline" },
];
const stageMap: Record<string, string> = { "narr-001": "Mainstream Adoption", "narr-002": "Amplification", "narr-003": "Growth", "narr-004": "Decline", "narr-005": "Growth", "narr-006": "Amplification" };

const originDetails: Record<string, { earliestPost: string; mutations: string[]; amplificationEvents: { date: string; event: string; impact: number }[] }> = {
  "narr-001": {
    earliestPost: "2025-08-15 — Reddit r/canadahousing: 'Are international students the reason I can't find an apartment?'",
    mutations: ["Students → Immigrants generalization", "Housing → Jobs crossover", "Canada → UK/Australia spread"],
    amplificationEvents: [
      { date: "2025-08-15", event: "Original Reddit post goes viral", impact: 85 },
      { date: "2025-09-02", event: "YouTube creator makes video", impact: 92 },
      { date: "2025-10-10", event: "X trending hashtag campaign", impact: 78 },
      { date: "2025-12-01", event: "Mainstream media pickup", impact: 95 },
      { date: "2026-03-15", event: "Policy discussion link", impact: 88 },
    ],
  },
  "narr-002": {
    earliestPost: "2025-06-20 — X @techworker42: 'My company just replaced our entire team with H-1B workers at half the salary'",
    mutations: ["Tech → all industries", "H-1B → immigration generalization", "US → Canada crossover"],
    amplificationEvents: [
      { date: "2025-06-20", event: "Viral tweet thread", impact: 90 },
      { date: "2025-07-15", event: "Reddit megathread", impact: 82 },
      { date: "2025-09-20", event: "Congressional hearing reference", impact: 95 },
    ],
  },
};

export default function OriginPage() {
  const { data: narratives, loading } = useApi<Narrative[]>(() => narrativesApi.list(), []);
  const [selectedNarrative, setSelectedNarrative] = useState<string | null>(null);

  const selected = selectedNarrative ? (narratives ?? []).find((n) => n.id === selectedNarrative) : null;
  const details = selectedNarrative ? originDetails[selectedNarrative] : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Narrative Origin Explorer" description="Trace the earliest known appearances and evolution of narratives" />

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Narrative List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Tracked Narratives</h3>
          {(narratives ?? []).map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedNarrative(n.id)}
              className={`bg-card rounded-xl border p-4 cursor-pointer transition-all ${
                selectedNarrative === n.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:shadow-sm"
              }`}
            >
              <h4 className="font-medium text-card-foreground text-sm line-clamp-1">{n.title}</h4>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(n.firstSeen).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Radio className="w-3 h-3" /> {n.totalMentions?.toLocaleString()} mentions</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {n.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!selected && (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a narrative</h3>
              <p className="text-sm text-muted-foreground">Choose a narrative from the list to explore its origin timeline and evolution</p>
            </div>
          )}

          {selected && (
            <>
              {/* Origin Summary */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{selected.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{selected.description}</p>

                {/* Lifecycle Stage Indicator */}
                <div className="mb-4 p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Lifecycle Stage</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${lifecycleStages.find(s => s.stage === (stageMap[selected.id] || "Growth"))?.color || "bg-gray-400"}`}>
                      {stageMap[selected.id] || "Growth"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {lifecycleStages.map((ls) => {
                      const currentIdx = lifecycleStages.findIndex(s => s.stage === (stageMap[selected.id] || "Growth"));
                      const thisIdx = lifecycleStages.indexOf(ls);
                      const isActive = thisIdx <= currentIdx;
                      const isCurrent = thisIdx === currentIdx;
                      return (
                        <div key={ls.stage} className="flex-1">
                          <div className={`h-2 rounded-full ${isCurrent ? ls.color : isActive ? "bg-primary" : "bg-background"} transition-all`} />
                          <p className={`text-[9px] mt-1 text-center ${isCurrent ? "font-bold text-foreground" : "text-muted-foreground"}`}>{ls.stage}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">First Seen</p>
                    <p className="font-semibold text-card-foreground">{new Date(selected.firstSeen).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Origin Platform</p>
                    <p className="font-semibold text-card-foreground">{selected.platformDistribution?.[0]?.platform || "Unknown"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Total Mentions</p>
                    <p className="font-semibold text-card-foreground">{selected.totalMentions?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Earliest Known Post */}
              {details && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" /> Earliest Known Post
                  </h4>
                  <p className="text-sm text-muted-foreground italic">{details.earliestPost}</p>
                </div>
              )}

              {/* Timeline Events */}
              {details?.amplificationEvents && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Amplification Timeline
                  </h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-4">
                      {details.amplificationEvents.map((evt, i) => (
                        <div key={i} className="flex items-start gap-4 pl-8 relative">
                          <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-card ${
                            evt.impact > 90 ? "bg-destructive" : evt.impact > 75 ? "bg-warning" : "bg-success"
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-muted-foreground">{new Date(evt.date).toLocaleDateString()}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                evt.impact > 90 ? "bg-red-100 text-red-700" : evt.impact > 75 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                              }`}>Impact: {evt.impact}</span>
                            </div>
                            <p className="text-sm text-card-foreground mt-1">{evt.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mutations */}
              {details?.mutations && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-semibold text-card-foreground mb-3 flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" /> Narrative Mutations
                  </h4>
                  <div className="space-y-2">
                    {details.mutations.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm text-card-foreground">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Distribution */}
              {selected.platformDistribution && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-semibold text-card-foreground mb-3">Platform Spread</h4>
                  <div className="space-y-3">
                    {selected.platformDistribution.map((p) => (
                      <div key={p.platform} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-20">{p.platform}</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${p.percentage}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-28 text-right">{p.mentions?.toLocaleString()} ({p.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
