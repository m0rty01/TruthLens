"use client";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { FileText, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { reportsApi } from "@/lib/api";
import type { IntelligenceReport } from "@/types";
export default function ReportsPage() {
  const { data: reports, loading } = useApi<IntelligenceReport[]>(() => reportsApi.list(), []);
  return (
    <div className="space-y-6">
      <PageHeader title="Monthly Intelligence Reports" description="Automated intelligence reports with narrative analysis and forecasts" />
      <div className="space-y-4">
        {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {(reports ?? []).map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`} className="block bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10"><FileText className="w-6 h-6 text-primary" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.summary}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.month} {report.year}</span>
                  <span>{report.topNarratives.length} top narratives</span>
                  <span>{report.emergingNarratives.length} emerging</span>
                  <span>{report.forecasts.length} forecasts</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
