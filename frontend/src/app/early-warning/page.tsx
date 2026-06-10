"use client";
import { useState } from "react";
import { PageHeader, DashboardCard } from "@/components/ui";
import { ShieldAlert, Loader2, RefreshCw, AlertTriangle, CheckCircle, Clock, Radio, BarChart3, Activity } from "lucide-react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { earlyWarningApi } from "@/lib/api";

interface Alert {
  id: string; type: string; level: string; title: string; description: string;
  narrative_id: string; narrative_title: string; metric: string; metric_value: number;
  status: string; created_at: string;
}
interface SystemStatus {
  systemStatus: string; activeAlerts: number; totalAlerts: number;
  byLevel: { Critical: number; High: number; Medium: number; Low: number };
  byType: Record<string, number>; lastScan: string; scanFrequency: string;
  monitoredNarratives: number; dataSources: string[];
}

const levelStyles: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};
const levelDot: Record<string, string> = {
  Critical: "bg-red-500", High: "bg-orange-500", Medium: "bg-yellow-500", Low: "bg-green-500",
};
const typeLabels: Record<string, string> = {
  acceleration: "Narrative Acceleration", sentiment_spike: "Sentiment Spike",
  amplification_anomaly: "Amplification Anomaly", risk_forecast: "Risk Forecast",
};

export default function EarlyWarningPage() {
  const { data: alerts, loading: loadingAlerts, refetch: refetchAlerts } = useApi<Alert[]>(() => earlyWarningApi.alerts(), []);
  const { data: status, loading: loadingStatus, refetch: refetchStatus } = useApi<SystemStatus>(() => earlyWarningApi.status(), []);
  const { execute: runScan, loading: scanning } = useApiMutation<never, unknown>(() => earlyWarningApi.scan());
  const [filter, setFilter] = useState<string>("all");

  const handleScan = async () => {
    try {
      await runScan(null as never);
      refetchAlerts();
      refetchStatus();
    } catch { /* handled */ }
  };

  const filtered = filter === "all" ? (alerts ?? []) : (alerts ?? []).filter((a) => a.level === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Early Warning System"
        description="Predictive monitoring for narrative acceleration, sentiment spikes, and amplification anomalies"
        actions={
          <button onClick={handleScan} disabled={scanning} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Trigger Scan
          </button>
        }
      />

      {(loadingAlerts || loadingStatus) && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* System Status */}
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard title="System Status" value={status.systemStatus === "monitoring" ? "Active" : "Idle"} subtitle={`${status.scanFrequency}`} icon={<Activity className="w-5 h-5" />} />
          <DashboardCard title="Active Alerts" value={status.activeAlerts} subtitle={`${status.totalAlerts} total`} icon={<AlertTriangle className="w-5 h-5" />} />
          <DashboardCard title="Critical" value={status.byLevel.Critical} trend={status.byLevel.Critical > 0 ? "up" : "stable"} icon={<ShieldAlert className="w-5 h-5" />} />
          <DashboardCard title="Monitored" value={status.monitoredNarratives} subtitle="narratives" icon={<Radio className="w-5 h-5" />} />
        </div>
      )}

      {/* Level Filter */}
      <div className="flex items-center gap-2">
        {["all", "Critical", "High", "Medium", "Low"].map((lvl) => (
          <button key={lvl} onClick={() => setFilter(lvl)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === lvl ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}>
            {lvl === "all" ? "All Levels" : lvl}
            {lvl !== "all" && status && <span className="ml-1">({(status.byLevel as any)[lvl] ?? 0})</span>}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map((alert) => (
          <div key={alert.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${levelDot[alert.level] || "bg-gray-400"}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${levelStyles[alert.level] || "bg-gray-100 text-gray-700"}`}>{alert.level}</span>
                    <span className="text-xs text-muted-foreground">{typeLabels[alert.type] || alert.type}</span>
                  </div>
                  <h4 className="font-medium text-card-foreground text-sm">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  {alert.narrative_title && (
                    <p className="text-xs text-muted-foreground mt-2">Narrative: <span className="font-medium text-card-foreground">{alert.narrative_title}</span></p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleDateString()}</span>
                {alert.metric_value && (
                  <p className="text-xs text-muted-foreground mt-1">{alert.metric}: <span className="font-semibold">{alert.metric_value}</span>/hr</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && !loadingAlerts && (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No alerts at this level</p>
          </div>
        )}
      </div>

      {/* Detection Types & Data Sources */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Detection Types</h3>
            <div className="space-y-2">
              {Object.entries(status.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <span className="text-sm">{typeLabels[type] || type}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2"><Radio className="w-4 h-4 text-primary" /> Data Sources</h3>
            <div className="space-y-2">
              {status.dataSources.map((src) => (
                <div key={src} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="text-sm">{src}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Last scan: {new Date(status.lastScan).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
