"use client";
import { PageHeader, EmptyState } from "@/components/ui";
import { Zap, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { forecastApi } from "@/lib/api";

interface ForecastData {
  forecasts: { title: string; predictedGrowth: number; confidence: number; timeframe: string; factors?: string[] }[];
}

export default function ForecastPage() {
  const { data, loading } = useApi<ForecastData>(() => forecastApi.list(), []);
  const forecasts = data?.forecasts ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Narrative Forecasting Engine" description="ML-powered predictions of likely viral narratives and emerging trends" />
      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      <div className="space-y-4">
        {forecasts.map((f, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-card-foreground">{f.title}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-muted-foreground">Predicted Growth</p><p className="font-semibold text-success">+{f.predictedGrowth}%</p></div>
              <div><p className="text-muted-foreground">Confidence</p><p className="font-semibold">{f.confidence}%</p></div>
              <div><p className="text-muted-foreground">Timeframe</p><p className="font-semibold">{f.timeframe}</p></div>
            </div>
            {f.factors && <div className="mt-3 flex flex-wrap gap-2">{f.factors.map((factor, j) => (<span key={j} className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">{factor}</span>))}</div>}
          </div>
        ))}
      </div>
      <EmptyState title="Advanced Forecasting" description="Real-time ML predictions with historical pattern analysis, cluster detection, and scenario modeling is being developed." />
    </div>
  );
}
