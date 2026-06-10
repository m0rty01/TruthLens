"use client";
import { useState } from "react";
import { PageHeader, DashboardCard } from "@/components/ui";
import { UserCheck, Loader2, CheckCircle, XCircle, Clock, FileText, ShieldAlert, History, Flag } from "lucide-react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { moderatorApi } from "@/lib/api";

interface Incident {
  id: string; title: string; category: string; country: string; city: string;
  severity: string; reported_at: string; status: string; verification_notes: string;
}
interface QueueData { pending: Incident[]; appealed: Incident[]; totalPending: number; totalAppealed: number; }
interface ModStats { total: number; verified: number; dismissed: number; pending: number; appealed: number; reviewed: number; moderatorActions: number; }
interface AuditEntry { id: string; action: string; entity_type: string; entity_id: string; user_name: string; details: string; created_at: string; }

const statusColors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", appealed: "bg-purple-100 text-purple-700", verified: "bg-green-100 text-green-700", dismissed: "bg-gray-100 text-gray-700", reviewed: "bg-blue-100 text-blue-700" };

export default function ModeratorPage() {
  const { data: queue, loading: loadingQueue, refetch: refetchQueue } = useApi<QueueData>(() => moderatorApi.queue(), []);
  const { data: stats, loading: loadingStats, refetch: refetchStats } = useApi<ModStats>(() => moderatorApi.stats(), []);
  const { data: auditLog, loading: loadingAudit } = useApi<AuditEntry[]>(() => moderatorApi.auditLog(), []);
  const [tab, setTab] = useState<"pending" | "appealed" | "audit">("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { execute: verifyReport, loading: verifying } = useApiMutation<{ id: string; reason: string }, unknown>(
    ({ id, reason }) => moderatorApi.verify(id, reason)
  );
  const { execute: dismissReport, loading: dismissing } = useApiMutation<{ id: string; reason: string }, unknown>(
    ({ id, reason }) => moderatorApi.dismiss(id, reason)
  );

  const handleAction = async (action: "verify" | "dismiss", id: string) => {
    try {
      if (action === "verify") await verifyReport({ id, reason: reason || "Verified by moderator" });
      else await dismissReport({ id, reason: reason || "Dismissed by moderator" });
      setActionId(null);
      setReason("");
      refetchQueue();
      refetchStats();
    } catch { /* handled */ }
  };

  const currentList = tab === "pending" ? (queue?.pending ?? []) : tab === "appealed" ? (queue?.appealed ?? []) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Moderator Dashboard" description="Review queue, verification workflow, and audit trail" />

      {(loadingQueue || loadingStats) && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard title="Pending Review" value={stats.pending} subtitle="reports" icon={<Clock className="w-5 h-5" />} />
          <DashboardCard title="Verified" value={stats.verified} subtitle="reports" icon={<CheckCircle className="w-5 h-5" />} />
          <DashboardCard title="Dismissed" value={stats.dismissed} subtitle="reports" icon={<XCircle className="w-5 h-5" />} />
          <DashboardCard title="Mod Actions" value={stats.moderatorActions} subtitle="total" icon={<ShieldAlert className="w-5 h-5" />} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "pending" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
          Pending ({queue?.totalPending ?? 0})
        </button>
        <button onClick={() => setTab("appealed")} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "appealed" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
          Appealed ({queue?.totalAppealed ?? 0})
        </button>
        <button onClick={() => setTab("audit")} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${tab === "audit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
          Audit Log
        </button>
      </div>

      {/* Review Queue */}
      {tab !== "audit" && (
        <div className="space-y-3">
          {currentList.map((inc) => (
            <div key={inc.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Flag className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium text-card-foreground text-sm">{inc.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inc.status]}`}>{inc.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{inc.category}</span>
                    <span>{inc.city && `${inc.city}, `}{inc.country}</span>
                    <span>{new Date(inc.reported_at).toLocaleDateString()}</span>
                    <span>Severity: {inc.severity}</span>
                  </div>
                </div>
              </div>

              {actionId === inc.id ? (
                <div className="mt-4 p-4 rounded-lg bg-muted space-y-3">
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for action (optional)..." className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  <div className="flex gap-2">
                    <button onClick={() => handleAction("verify", inc.id)} disabled={verifying} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50">
                      {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Verify
                    </button>
                    <button onClick={() => handleAction("dismiss", inc.id)} disabled={dismissing} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50">
                      {dismissing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />} Dismiss
                    </button>
                    <button onClick={() => { setActionId(null); setReason(""); }} className="px-3 py-1.5 rounded-lg border border-border text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setActionId(inc.id)} className="mt-3 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-secondary transition-colors">
                  Take Action
                </button>
              )}
            </div>
          ))}
          {!currentList.length && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{tab === "pending" ? "No pending reports" : "No appealed reports"}</p>
            </div>
          )}
        </div>
      )}

      {/* Audit Log */}
      {tab === "audit" && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Audit Trail</h3>
          {loadingAudit && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {(auditLog ?? []).map((entry) => (
                <div key={entry.id} className="flex items-start gap-4 pl-8 relative">
                  <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-card ${entry.action === "verify" ? "bg-green-500" : "bg-red-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${entry.action === "verify" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {entry.action}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.entity_type}: {entry.entity_id}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">By {entry.user_name || "system"} · {new Date(entry.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
