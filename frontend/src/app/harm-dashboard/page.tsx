"use client";
import { PageHeader, ScoreGauge, DashboardCard } from "@/components/ui";
import { Activity, Loader2, AlertTriangle, TrendingUp, Users, ShieldAlert, Info } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { harmIntelligenceApi, earlyWarningApi, resilienceApi, correlationApi } from "@/lib/api";

export default function HarmDashboardPage() {
  const { data: harmScores, loading: l1 } = useApi<any[]>(() => harmIntelligenceApi.list(), []);
  const { data: harmIndex, loading: l2 } = useApi<any>(() => harmIntelligenceApi.getIndex(), []);
  const { data: alerts, loading: l3 } = useApi<any[]>(() => earlyWarningApi.alerts(), []);
  const { data: resilience, loading: l4 } = useApi<any[]>(() => resilienceApi.list(), []);
  const { data: correlations, loading: l5 } = useApi<any>(() => correlationApi.list(), []);

  const loading = l1 || l2 || l3 || l4 || l5;
  const activeAlerts = (alerts ?? []).filter((a: any) => a.status === "active");
  const criticalAlerts = activeAlerts.filter((a: any) => a.level === "Critical");
  const avgResilience = resilience ? Math.round(resilience.filter((r: any) => !r.city).reduce((s: number, r: any) => s + r.overall_score, 0) / (resilience.filter((r: any) => !r.city).length || 1)) : 0;
  const strongCorrelations = (correlations?.correlations ?? []).filter((c: any) => Math.abs(c.correlation_score) >= 0.7);

  const topHarm = (harmScores ?? []).sort((a: any, b: any) => b.overall_index - a.overall_index).slice(0, 3);
  const categories = [
    { key: "physical", label: "Physical" }, { key: "economic", label: "Economic" }, { key: "mental_health", label: "Mental Health" },
    { key: "reputation", label: "Reputation" }, { key: "policy", label: "Policy" }, { key: "community", label: "Community" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Harm Dashboard" description="Aggregate view of harm impact, early warnings, and community resilience" />

      {/* Correlation Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-600">All harm scores represent observed correlations, not causal relationships. Data is simulated for demonstration.</p>
      </div>

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Top-Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="Narrative Harm Index" value={harmIndex?.narrativeHarmIndex ?? 0} subtitle={`Confidence: ${harmIndex?.confidence ?? 0}%`} icon={<Activity className="w-5 h-5" />} />
        <DashboardCard title="Active Alerts" value={activeAlerts.length} trend={criticalAlerts.length > 0 ? "up" : "stable"} subtitle={`${criticalAlerts.length} critical`} icon={<ShieldAlert className="w-5 h-5" />} />
        <DashboardCard title="Avg Resilience" value={avgResilience} subtitle="across countries" icon={<Users className="w-5 h-5" />} />
        <DashboardCard title="Strong Correlations" value={strongCorrelations.length} subtitle="narrative-incident pairs" icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Harm Narratives */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> Top Harm Narratives</h3>
          <div className="space-y-4">
            {topHarm.map((n: any, i: number) => (
              <div key={n.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                <ScoreGauge score={n.overall_index} size="sm" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{n.narrative_title}</h4>
                  <p className="text-xs text-muted-foreground">{n.narrative_category} · {n.total_mentions?.toLocaleString()} mentions</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Harm Category Distribution</h3>
          <div className="space-y-3">
            {categories.map((cat) => {
              const avg = Math.round((harmScores ?? []).reduce((s: number, h: any) => s + (h[cat.key] || 0), 0) / ((harmScores ?? []).length || 1));
              return (
                <div key={cat.key} className="flex items-center gap-3">
                  <span className="text-sm w-28">{cat.label}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${avg >= 70 ? "bg-red-500" : avg >= 40 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${avg}%` }} />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{avg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Alerts & Correlations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-warning" /> Active Alerts</h3>
          <div className="space-y-2">
            {activeAlerts.slice(0, 5).map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <div className={`w-2.5 h-2.5 rounded-full ${a.level === "Critical" ? "bg-red-500" : a.level === "High" ? "bg-orange-500" : "bg-yellow-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.level} · {a.type}</p>
                </div>
              </div>
            ))}
            {!activeAlerts.length && <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Strong Correlations</h3>
          <div className="space-y-2">
            {strongCorrelations.slice(0, 5).map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <span className={`text-sm font-bold ${(c.correlation_score ?? 0) >= 0.7 ? "text-red-600" : "text-orange-600"}`}>{(c.correlation_score ?? 0).toFixed(2)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{c.narrative_title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{c.incident_type} · p={(c.p_value ?? 1).toFixed(3)}</p>
                </div>
              </div>
            ))}
            {!strongCorrelations.length && <p className="text-sm text-muted-foreground text-center py-4">No strong correlations found</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
