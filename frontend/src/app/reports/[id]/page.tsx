"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, Zap, Loader2 } from "lucide-react";
import { PageHeader, DashboardCard } from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { reportsApi } from "@/lib/api";
import type { IntelligenceReport } from "@/types";
export default function ReportDetailPage() {
  const params = useParams();
  const { data: report, loading } = useApi<IntelligenceReport>(
    () => reportsApi.getById(params.id as string),
    [params.id]
  );
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!report) return <div className="p-8 text-center text-muted-foreground">Report not found</div>;
  return (
    <div className="space-y-6">
      <Link href="/reports" className="flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Reports</Link>
      <PageHeader title={report.title} description={report.summary} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-success" /> Top Narratives</h3>
          <div className="space-y-2">{report.topNarratives.map((n) => (<div key={n.id} className="flex justify-between text-sm"><span>{n.title}</span><span className="text-muted-foreground">{formatNumber(n.mentions)}</span></div>))}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-warning" /> Emerging</h3>
          <div className="space-y-2">{report.emergingNarratives.map((n) => (<div key={n.id} className="flex justify-between text-sm"><span>{n.title}</span><span className="text-success">+{n.growth}%</span></div>))}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-destructive" /> Declining</h3>
          <div className="space-y-2">{report.narrativeDeaths.map((n) => (<div key={n.id} className="flex justify-between text-sm"><span>{n.title}</span><span className="text-destructive">-{n.decline}%</span></div>))}</div>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3">Country Analysis</h3>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 px-3 text-muted-foreground">Country</th><th className="text-right py-2 px-3 text-muted-foreground">Incidents</th><th className="text-right py-2 px-3 text-muted-foreground">Sentiment</th></tr></thead><tbody>{report.countryAnalysis.map((c) => (<tr key={c.country} className="border-b border-border/50"><td className="py-2 px-3">{c.country}</td><td className="py-2 px-3 text-right">{c.incidents}</td><td className="py-2 px-3 text-right">{c.sentiment}</td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
}
