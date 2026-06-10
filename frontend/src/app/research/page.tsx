"use client";
import { useState } from "react";
import { PageHeader, DashboardCard } from "@/components/ui";
import { Database, Loader2, Download, BookOpen, BarChart3, FileText, CheckCircle, Lock, Unlock } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { researchApi } from "@/lib/api";

interface Dataset { id: string; name: string; description: string; records: number; format: string; lastUpdated: string; accessLevel: string; }
interface ResearchStats { totalRecords: number; byTable: Record<string, number>; dataQuality: { coverage: string; timeRange: string; platforms: number; narrativeCategories: number }; lastExport: string; }
interface Methodology { narrativeDetection: any; claimVerification: any; harmScoring: any; correlationAnalysis: any; resilienceScoring: any; earlyWarning: any; }

export default function ResearchPage() {
  const { data: datasets, loading: loadingDatasets } = useApi<Dataset[]>(() => researchApi.datasets(), []);
  const { data: stats, loading: loadingStats } = useApi<ResearchStats>(() => researchApi.stats(), []);
  const { data: methodology, loading: loadingMethodology } = useApi<Methodology>(() => researchApi.methodology(), []);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<any>(null);

  const handleExport = async (datasetId: string) => {
    setExporting(datasetId);
    try {
      const result = await researchApi.exportDataset(datasetId);
      setExportResult(result);
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `truthlens-${datasetId}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* handled */ }
    setExporting(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Research Portal" description="Access datasets, export data, and review methodology for transparent research" />

      {(loadingDatasets || loadingStats) && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard title="Total Records" value={stats.totalRecords.toLocaleString()} subtitle="across all tables" icon={<Database className="w-5 h-5" />} />
          <DashboardCard title="Platforms" value={stats.dataQuality.platforms} subtitle="monitored" icon={<BarChart3 className="w-5 h-5" />} />
          <DashboardCard title="Coverage" value={stats.dataQuality.coverage} icon={<FileText className="w-5 h-5" />} />
          <DashboardCard title="Time Range" value={stats.dataQuality.timeRange} icon={<FileText className="w-5 h-5" />} />
        </div>
      )}

      {/* Record Counts */}
      {stats?.byTable && (
        <div className="bg-card rounded-xl border border-border p-4 sm:p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Record Counts by Table</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(stats.byTable).map(([table, count]) => (
              <div key={table} className="p-3 rounded-lg bg-muted text-center">
                <p className="text-lg font-bold text-card-foreground">{count}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">{table.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Browser */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Available Datasets</h3>
        <div className="space-y-3">
          {(datasets ?? []).map((ds) => (
            <div key={ds.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-sm transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-card-foreground text-sm">{ds.name}</h4>
                  {ds.accessLevel === "restricted" ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700"><Lock className="w-3 h-3" /> Restricted</span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700"><Unlock className="w-3 h-3" /> Public</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{ds.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{ds.records.toLocaleString()} records</span>
                  <span>{ds.format}</span>
                  <span>Updated: {ds.lastUpdated}</span>
                </div>
              </div>
              <button
                onClick={() => handleExport(ds.id)}
                disabled={exporting === ds.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors ml-4"
              >
                {exporting === ds.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                Export JSON
              </button>
            </div>
          ))}
        </div>
        {exportResult && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700">Exported {exportResult.records} records from {exportResult.dataset} at {new Date(exportResult.exportedAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Methodology Documentation */}
      {methodology && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Methodology Documentation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(methodology).map(([key, doc]: [string, any]) => (
              <div key={key} className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium text-sm capitalize mb-2">{key.replace(/([A-Z])/g, " $1").trim()}</h4>
                <p className="text-xs text-muted-foreground mb-2">{doc.method}</p>
                {doc.sources && <p className="text-[11px] text-muted-foreground">Sources: {doc.sources.join(", ")}</p>}
                {doc.factors && <p className="text-[11px] text-muted-foreground">Factors: {doc.factors.join(", ")}</p>}
                {doc.alertLevels && <p className="text-[11px] text-muted-foreground">Levels: {doc.alertLevels.join(", ")}</p>}
                {doc.disclaimer && <p className="text-[11px] text-yellow-600 mt-1 italic">{doc.disclaimer}</p>}
                {doc.limitations && <p className="text-[11px] text-muted-foreground mt-1">Limitations: {doc.limitations.join("; ")}</p>}
                {doc.updateFrequency && <p className="text-[11px] text-muted-foreground">Updated: {doc.updateFrequency}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
