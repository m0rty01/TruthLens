"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Link2, Loader2, Info, BarChart3, TrendingUp } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { correlationApi } from "@/lib/api";

interface Correlation {
  id: string; narrative_id: string; narrative_title: string; narrative_category: string;
  incident_type: string; correlation_score: number; confidence_lower: number; confidence_upper: number;
  p_value: number; sample_size: number; methodology: string;
}
interface CorrelationResponse { correlations: Correlation[]; disclaimer: string; methodology: string; }
interface NarrativeCorrelation { narrativeId: string; correlations: Correlation[]; disclaimer: string; interpretation: { strong: string; moderate: string; weak: string }; }

function getStrength(r: number): { label: string; color: string } {
  const abs = Math.abs(r);
  if (abs >= 0.7) return { label: "Strong", color: "text-red-600" };
  if (abs >= 0.4) return { label: "Moderate", color: "text-orange-600" };
  return { label: "Weak", color: "text-gray-500" };
}

export default function CorrelationPage() {
  const { data, loading } = useApi<CorrelationResponse>(() => correlationApi.list(), []);
  const [selectedNarr, setSelectedNarr] = useState<string | null>(null);
  const { data: narrDetail } = useApi<NarrativeCorrelation>(() => selectedNarr ? correlationApi.getByNarrative(selectedNarr) : Promise.resolve(null), [selectedNarr]);

  const correlations = data?.correlations ?? [];
  const narrativeIds = [...new Set(correlations.map((c) => c.narrative_id))];

  return (
    <div className="space-y-6">
      <PageHeader title="Harm Correlation Engine" description="Statistical analysis of associations between narrative volume and incident reports" />

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Important Statistical Disclaimer</p>
          <p className="text-xs text-blue-600 mt-1">{data?.disclaimer || "Correlation does not imply causation. These scores represent statistical associations only."}</p>
        </div>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Correlation Matrix */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> All Correlations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 font-medium text-muted-foreground">Narrative</th>
                <th className="text-left py-3 px-3 font-medium text-muted-foreground">Incident Type</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Correlation (r)</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">95% CI</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">p-value</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Sample</th>
                <th className="text-center py-3 px-3 font-medium text-muted-foreground">Strength</th>
              </tr>
            </thead>
            <tbody>
              {correlations.map((c) => {
                const score = c.correlation_score ?? 0;
                const ciLow = c.confidence_lower ?? 0;
                const ciHigh = c.confidence_upper ?? 0;
                const pVal = c.p_value ?? 1;
                const s = getStrength(score);
                const significant = pVal < 0.05;
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedNarr(c.narrative_id)}>
                    <td className="py-3 px-3 font-medium text-card-foreground">{c.narrative_title}</td>
                    <td className="py-3 px-3 text-muted-foreground capitalize">{c.incident_type}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold ${s.color}`}>{score.toFixed(3)}</span>
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-muted-foreground">[{ciLow.toFixed(3)}, {ciHigh.toFixed(3)}]</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs font-medium ${significant ? "text-green-600" : "text-gray-400"}`}>
                        {pVal.toFixed(4)} {significant ? "*" : ""}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-xs text-muted-foreground">{c.sample_size}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color} bg-muted`}>{s.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data?.methodology && (
          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border">{data.methodology}</p>
        )}
      </div>

      {/* Per-Narrative Detail */}
      {narrDetail && narrDetail.correlations.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Narrative Detail: {narrDetail.correlations[0].narrative_title}
          </h3>
          <div className="space-y-4">
            {narrDetail.correlations.map((c) => {
              const score = c.correlation_score ?? 0;
              const ciLow = c.confidence_lower ?? 0;
              const ciHigh = c.confidence_upper ?? 0;
              const pVal = c.p_value ?? 1;
              const s = getStrength(score);
              return (
                <div key={c.id} className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm capitalize">{c.incident_type} incidents</span>
                    <span className={`font-bold text-lg ${s.color}`}>r = {score.toFixed(3)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div><p className="text-xs text-muted-foreground">95% CI</p><p className="font-medium">[{ciLow.toFixed(3)}, {ciHigh.toFixed(3)}]</p></div>
                    <div><p className="text-xs text-muted-foreground">p-value</p><p className={`font-medium ${pVal < 0.05 ? "text-green-600" : ""}`}>{pVal.toFixed(4)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Sample Size</p><p className="font-medium">{c.sample_size}</p></div>
                    <div><p className="text-xs text-muted-foreground">Strength</p><p className={`font-medium ${s.color}`}>{s.label}</p></div>
                  </div>
                  {/* Visual bar */}
                  <div className="mt-3">
                    <div className="h-3 rounded-full bg-background overflow-hidden">
                      <div className={`h-full rounded-full ${Math.abs(score) >= 0.7 ? "bg-red-500" : Math.abs(score) >= 0.4 ? "bg-orange-500" : "bg-gray-400"}`} style={{ width: `${Math.abs(score) * 100}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interpretation Guide */}
          <div className="mt-4 p-4 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-2">Interpretation Guide</h4>
            <div className="space-y-1">
              {Object.entries(narrDetail.interpretation).map(([key, text]) => (
                <p key={key} className="text-xs text-muted-foreground">{text}</p>
              ))}
            </div>
          </div>

          {narrDetail.disclaimer && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-yellow-700">{narrDetail.disclaimer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
