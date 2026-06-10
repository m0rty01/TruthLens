"use client";
import { useState } from "react";
import { PageHeader, ScoreGauge, DashboardCard } from "@/components/ui";
import { AlertTriangle, Loader2, Info, TrendingUp, Shield, Brain, Users, Scale, Building } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { harmIntelligenceApi } from "@/lib/api";

interface HarmScore {
  id: string; narrative_id: string; narrative_title: string; narrative_category: string;
  physical: number; economic: number; mental_health: number; reputation: number; policy: number; community: number;
  overall_index: number; confidence: number; methodology: string; total_mentions: number;
}
interface HarmIndex {
  narrativeHarmIndex: number; confidence: number; totalNarrativesAssessed: number;
  disclaimer: string; methodology: string;
  categories: { physical: number; economic: number; mentalHealth: number; reputation: number; policy: number; community: number };
}

const categoryMeta: { key: string; icon: React.ReactNode; label: string; color: string }[] = [
  { key: "physical", icon: <AlertTriangle className="w-4 h-4" />, label: "Physical Harm", color: "text-red-500" },
  { key: "economic", icon: <TrendingUp className="w-4 h-4" />, label: "Economic Harm", color: "text-orange-500" },
  { key: "mental_health", icon: <Brain className="w-4 h-4" />, label: "Mental Health", color: "text-purple-500" },
  { key: "reputation", icon: <Shield className="w-4 h-4" />, label: "Reputation Harm", color: "text-yellow-500" },
  { key: "policy", icon: <Scale className="w-4 h-4" />, label: "Policy Harm", color: "text-blue-500" },
  { key: "community", icon: <Users className="w-4 h-4" />, label: "Community Harm", color: "text-teal-500" },
];

export default function HarmIntelligencePage() {
  const { data: scores, loading: loadingScores } = useApi<HarmScore[]>(() => harmIntelligenceApi.list(), []);
  const { data: index, loading: loadingIndex } = useApi<HarmIndex>(() => harmIntelligenceApi.getIndex(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const { data: detail } = useApi<any>(() => selected ? harmIntelligenceApi.getByNarrative(selected) : Promise.resolve(null), [selected]);

  return (
    <div className="space-y-6">
      <PageHeader title="Harm Impact Intelligence" description="Measuring real-world harm correlated with narrative spread across platforms" />

      {/* Correlation Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Correlation, Not Causation</p>
          <p className="text-xs text-blue-600 mt-1">{index?.disclaimer || "Harm scores represent observed correlations between narrative volume and incident reports. They do not establish causal relationships."}</p>
        </div>
      </div>

      {(loadingScores || loadingIndex) && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Aggregate Harm Index */}
      {index && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center">
            <ScoreGauge score={index.narrativeHarmIndex} label="Narrative Harm Index" size="lg" />
            <p className="text-xs text-muted-foreground mt-2">Confidence: {index.confidence}%</p>
          </div>
          {categoryMeta.map((cat) => {
            const value = (index.categories as any)[cat.key === "mental_health" ? "mentalHealth" : cat.key] ?? 0;
            return (
              <div key={cat.key} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cat.color}>{cat.icon}</span>
                  <span className="text-sm font-medium text-card-foreground">{cat.label}</span>
                </div>
                <ScoreGauge score={value} size="md" />
              </div>
            );
          })}
        </div>
      )}

      {/* Per-Narrative Scores */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-card-foreground mb-4">Per-Narrative Harm Scores</h3>
        <div className="space-y-3">
          {(scores ?? []).map((s) => (
            <div
              key={s.id}
              onClick={() => setSelected(s.narrative_id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${selected === s.narrative_id ? "border-primary bg-primary/5" : "border-border hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-card-foreground text-sm">{s.narrative_title}</h4>
                  <span className="text-xs text-muted-foreground">{s.narrative_category} · {s.total_mentions?.toLocaleString()} mentions</span>
                </div>
                <ScoreGauge score={s.overall_index} size="sm" />
              </div>
              <div className="grid grid-cols-6 gap-2">
                {categoryMeta.map((cat) => {
                  const val = (s as any)[cat.key] ?? 0;
                  return (
                    <div key={cat.key} className="text-center">
                      <div className="h-2 rounded-full bg-muted overflow-hidden mb-1">
                        <div className={`h-full rounded-full ${val >= 70 ? "bg-red-500" : val >= 40 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{cat.label.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">Confidence: {s.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {detail && detail.categories && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4">Detailed Breakdown: {detail.narrative_title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(detail.categories).map(([key, cat]: [string, any]) => (
              <div key={key} className="p-4 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <span className="text-lg font-bold">{cat.score}</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div className={`h-full rounded-full ${cat.score >= 70 ? "bg-red-500" : cat.score >= 40 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${cat.score}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">{cat.description}</p>
              </div>
            ))}
          </div>
          {detail.disclaimer && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-yellow-700">{detail.disclaimer}</p>
            </div>
          )}
        </div>
      )}

      {/* Methodology */}
      {index?.methodology && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" /> Methodology
          </h3>
          <p className="text-sm text-muted-foreground">{index.methodology}</p>
        </div>
      )}
    </div>
  );
}
