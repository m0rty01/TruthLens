"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Shield, FileText, Camera, Lock, AlertTriangle, Search, Download, ExternalLink, CheckCircle, Phone } from "lucide-react";

const guides = [
  { icon: <Camera className="w-5 h-5" />, title: "Documentation Guide", desc: "How to document incidents effectively with timestamps, screenshots, and evidence chains", steps: ["Take screenshots with date/time visible", "Save original URLs using archive tools", "Create a chronological log of all incidents", "Keep copies in secure cloud storage"], priority: "Essential" },
  { icon: <FileText className="w-5 h-5" />, title: "Platform Reporting", desc: "Step-by-step guides to report harassment to major social media platforms", steps: ["Use platform-specific reporting forms", "Reference community guidelines violations", "Document report confirmation numbers", "Follow up within 48 hours"], priority: "Essential" },
  { icon: <Lock className="w-5 h-5" />, title: "Privacy Protection", desc: "Secure your online presence and reduce your digital footprint", steps: ["Audit social media privacy settings", "Remove personal info from data brokers", "Use unique passwords + 2FA", "Limit location sharing"], priority: "Recommended" },
  { icon: <Shield className="w-5 h-5" />, title: "Anti-Doxxing Guide", desc: "Prevent and respond to doxxing attacks targeting your personal information", steps: ["Google yourself to assess exposure", "Request removal from people-search sites", "Monitor for leaked personal info", "Prepare response plan in advance"], priority: "Critical" },
  { icon: <AlertTriangle className="w-5 h-5" />, title: "Evidence Collection", desc: "Proper evidence collection and preservation for legal proceedings", steps: ["Use certified digital evidence tools", "Maintain chain of custody records", "Get notarized screenshots", "Consult with legal professionals"], priority: "For Legal Cases" },
  { icon: <Phone className="w-5 h-5" />, title: "Emergency Response", desc: "Immediate steps to take if you face physical threats or danger", steps: ["Contact local law enforcement", "Reach out to community organizations", "Secure your physical location", "Inform trusted contacts"], priority: "Urgent" },
];

const emergencyContacts = [
  { org: "National Helpline", phone: "1-800-XXX-XXXX", available: "24/7" },
  { org: "Legal Aid Society", phone: "1-800-XXX-XXXX", available: "Mon-Fri 9am-5pm" },
  { org: "Community Support", phone: "1-800-XXX-XXXX", available: "24/7" },
];

export default function HarassmentToolkitPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const filtered = guides.filter((g) =>
    !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const priorityColors: Record<string, string> = {
    Essential: "bg-blue-100 text-blue-700",
    Recommended: "bg-green-100 text-green-700",
    Critical: "bg-red-100 text-red-700",
    "For Legal Cases": "bg-purple-100 text-purple-700",
    Urgent: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Harassment Toolkit" description="Guides and resources for dealing with harassment and discrimination" />

      {/* Emergency Banner */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-4">
        <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-semibold text-destructive">In immediate danger?</p>
          <p className="text-xs text-muted-foreground">Call emergency services (911) or contact the helplines below</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search guides..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      {/* Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((g, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 cursor-pointer" onClick={() => setExpandedGuide(expandedGuide === g.title ? null : g.title)}>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground">{g.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-card-foreground">{g.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[g.priority]}`}>{g.priority}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{g.desc}</p>
            </div>
            {expandedGuide === g.title && (
              <div className="px-5 pb-5 border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-3">Key Steps</h4>
                <div className="space-y-2">
                  {g.steps.map((step, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-card-foreground">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"><Download className="w-3 h-3" /> Download PDF</button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"><ExternalLink className="w-3 h-3" /> Full Guide</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emergency Contacts */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" /> Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyContacts.map((c) => (
            <div key={c.org} className="p-4 rounded-lg bg-muted">
              <p className="font-medium text-sm">{c.org}</p>
              <p className="text-lg font-bold text-primary mt-1">{c.phone}</p>
              <p className="text-xs text-muted-foreground">{c.available}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
