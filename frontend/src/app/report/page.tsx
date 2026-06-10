"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Flag, Plus, Loader2, X, AlertTriangle, CheckCircle, MapPin, Calendar, Upload, ShieldAlert, RotateCcw, FileText } from "lucide-react";
import { useApi, useApiMutation } from "@/hooks/useApi";
import { incidentsApi, communityReportApi, enhancedReportApi } from "@/lib/api";
import type { Incident } from "@/types";

const categoryOptions = ["Public Harassment", "Housing", "Workplace", "Online", "Hate Crime", "Education", "Other"];
const statusColors: Record<string, string> = { verified: "bg-green-100 text-green-700", reviewed: "bg-blue-100 text-blue-700", pending: "bg-yellow-100 text-yellow-700", dismissed: "bg-gray-100 text-gray-700", appealed: "bg-purple-100 text-purple-700" };

export default function ReportPage() {
  const { data: incidents, loading, refetch } = useApi<Incident[]>(() => incidentsApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Public Harassment", country: "", city: "" });
  const [evidenceModal, setEvidenceModal] = useState<string | null>(null);
  const [evidenceData, setEvidenceData] = useState({ type: "screenshot", description: "" });
  const [appealModal, setAppealModal] = useState<string | null>(null);
  const [appealReason, setAppealReason] = useState("");

  const { execute: submitReport, loading: submitting } = useApiMutation<
    Record<string, unknown>,
    { status: string; id: string }
  >((data) => communityReportApi.submit(data));

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.country.trim()) return;
    try {
      await submitReport(formData);
      setShowForm(false);
      setFormData({ title: "", description: "", category: "Public Harassment", country: "", city: "" });
      refetch();
    } catch { /* handled */ }
  };

  const { execute: addEvidence, loading: addingEvidence } = useApiMutation(
    ({ id, evidence }: { id: string; evidence: { type: string; description: string } }) => enhancedReportApi.addEvidence(id, evidence)
  );
  const { execute: appealReport, loading: appealing } = useApiMutation(
    ({ id, reason }: { id: string; reason: string }) => enhancedReportApi.appeal(id, reason)
  );

  const handleEvidence = async () => {
    if (!evidenceModal || !evidenceData.description.trim()) return;
    try {
      await addEvidence({ id: evidenceModal, evidence: evidenceData });
      setEvidenceModal(null);
      setEvidenceData({ type: "screenshot", description: "" });
      refetch();
    } catch { /* handled */ }
  };

  const handleAppeal = async () => {
    if (!appealModal || !appealReason.trim()) return;
    try {
      await appealReport({ id: appealModal, reason: appealReason });
      setAppealModal(null);
      setAppealReason("");
      refetch();
    } catch { /* handled */ }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Reporting Hub"
        description="Report incidents, narratives, and coordinated campaigns"
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Report
          </button>
        }
      />

      {/* Submission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground text-lg">Submit Incident Report</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Anti-Doxxing Warning */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <ShieldAlert className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-yellow-800">Privacy Notice</p>
                  <p className="text-[11px] text-yellow-600 mt-0.5">Do not include personal identifying information (names, phone numbers, addresses) of other individuals. Reports containing PII will be redacted.</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Brief description of the incident" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed description of what happened..." className="w-full h-24 px-4 py-2.5 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                    {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Country *</label>
                  <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="e.g., Canada" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">City</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="e.g., Toronto" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !formData.title.trim() || !formData.country.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-card-foreground">{(incidents ?? []).length}</p>
          <p className="text-xs text-muted-foreground">Total Reports</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-success">{(incidents ?? []).filter((i) => i.status === "verified").length}</p>
          <p className="text-xs text-muted-foreground">Verified</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-warning">{(incidents ?? []).filter((i) => i.status === "reviewed").length}</p>
          <p className="text-xs text-muted-foreground">Under Review</p>
        </div>
      </div>

      {/* Recent Reports */}
      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {(incidents ?? []).map((inc) => (
            <div key={inc.id} className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <Flag className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{inc.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.city && `${inc.city}, `}{inc.country}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(inc.reportedAt).toLocaleDateString()}</span>
                    <span className="px-1.5 py-0.5 rounded bg-muted">{inc.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[inc.status] || "bg-gray-100 text-gray-700"}`}>{inc.status}</span>
                </div>
              </div>

              {/* Verification Status Timeline */}
              <div className="mt-3 ml-9">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(inc.status as string) === "verified" ? "bg-green-500" : (inc.status as string) === "dismissed" ? "bg-red-500" : (inc.status as string) === "appealed" ? "bg-purple-500" : "bg-yellow-500"}`} />
                  <span className="text-[11px] text-muted-foreground">
                    {(inc.status as string) === "verified" ? "Verified by moderator" : (inc.status as string) === "dismissed" ? "Dismissed" : (inc.status as string) === "appealed" ? "Under re-review (appealed)" : (inc.status as string) === "reviewed" ? "Reviewed" : "Pending review"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 ml-9 flex items-center gap-2">
                <button onClick={() => setEvidenceModal(inc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-muted hover:bg-secondary transition-colors">
                  <Upload className="w-3 h-3" /> Add Evidence
                </button>
                {(inc.status as string) === "dismissed" && (
                  <button onClick={() => setAppealModal(inc.id)} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Appeal
                  </button>
                )}
              </div>
            </div>
          ))}

          {!(incidents ?? []).length && !loading && (
            <div className="text-center py-8">
              <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reports submitted yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Upload Modal */}
      {evidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Add Evidence</h3>
              <button onClick={() => setEvidenceModal(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Evidence Type</label>
                <select value={evidenceData.type} onChange={(e) => setEvidenceData({ ...evidenceData, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="screenshot">Screenshot</option>
                  <option value="url">URL / Link</option>
                  <option value="document">Document</option>
                  <option value="witness">Witness Statement</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea value={evidenceData.description} onChange={(e) => setEvidenceData({ ...evidenceData, description: e.target.value })} placeholder="Describe the evidence..." className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
              <div className="flex items-start gap-2 p-2 rounded bg-muted">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground">File upload support coming soon. For now, provide a URL or description of the evidence.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEvidenceModal(null)} className="flex-1 px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={handleEvidence} disabled={addingEvidence || !evidenceData.description.trim()} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">
                {addingEvidence ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {appealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Appeal Dismissed Report</h3>
              <button onClick={() => { setAppealModal(null); setAppealReason(""); }} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Reason for Appeal</label>
              <textarea value={appealReason} onChange={(e) => setAppealReason(e.target.value)} placeholder="Explain why this report should be re-reviewed..." className="w-full h-24 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setAppealModal(null); setAppealReason(""); }} className="flex-1 px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
              <button onClick={handleAppeal} disabled={appealing || !appealReason.trim()} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white text-sm disabled:opacity-50">
                {appealing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reporting Guidelines */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Reporting Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Be Specific", desc: "Include dates, times, locations, and any evidence like screenshots or URLs." },
            { title: "Stay Objective", desc: "Describe facts without embellishment. Our team will verify and classify each report." },
            { title: "Follow Up", desc: "Check back on your report status. You may be contacted for additional information." },
          ].map((g, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mb-2">{i + 1}</div>
              <h4 className="text-sm font-medium mb-1">{g.title}</h4>
              <p className="text-xs text-muted-foreground">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
