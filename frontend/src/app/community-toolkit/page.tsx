"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Users, Download, Search, FileText, BookOpen, Shield, Globe, Heart, ExternalLink, ChevronRight } from "lucide-react";

const resources = [
  { title: "Student Groups", desc: "Templates and guides for Indian student associations at universities", count: 12, icon: <BookOpen className="w-5 h-5" />, items: ["Meeting agendas", "Event planning templates", "Media response guide", "Anti-harassment policy template", "Social media guidelines"] },
  { title: "Temples & Religious Organizations", desc: "Security frameworks and community communication plans", count: 8, icon: <Shield className="w-5 h-5" />, items: ["Security assessment checklist", "Incident reporting form", "Community alert system setup", "Media statement templates"] },
  { title: "Cultural Organizations", desc: "Event planning, media response, and community advocacy guides", count: 10, icon: <Globe className="w-5 h-5" />, items: ["Cultural event security plan", "Press release templates", "Advocacy letter templates", "Community survey tools"] },
  { title: "Community Associations", desc: "Community organizing, advocacy resources, and coalition building", count: 9, icon: <Users className="w-5 h-5" />, items: ["Coalition building guide", "Grassroots organizing toolkit", "Policy advocacy manual", "Voter engagement resources"] },
  { title: "NGOs & Nonprofits", desc: "Partnership frameworks, grant writing, and reporting tools", count: 7, icon: <Heart className="w-5 h-5" />, items: ["Partnership MOU template", "Impact reporting framework", "Grant proposal template", "Volunteer management guide"] },
  { title: "Professional Networks", desc: "Career resources, mentorship programs, and workplace advocacy", count: 6, icon: <FileText className="w-5 h-5" />, items: ["Mentorship program guide", "Workplace DEI toolkit", "Career development resources", "Networking event templates"] },
];

const featuredDownloads = [
  { title: "Community Incident Response Playbook", format: "PDF", size: "2.4 MB", downloads: 1250 },
  { title: "Student Organization Starter Kit", format: "ZIP", size: "15.2 MB", downloads: 890 },
  { title: "Media Statement Template Pack", format: "DOCX", size: "850 KB", downloads: 2100 },
  { title: "Anti-Discrimination Policy Guide", format: "PDF", size: "3.1 MB", downloads: 1680 },
];

export default function CommunityToolkitPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedResource, setExpandedResource] = useState<string | null>(null);

  const filtered = resources.filter((r) =>
    !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Community Toolkit" description="Resources and templates for community organizations" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-card-foreground">{resources.reduce((sum, r) => sum + r.count, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Resources</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-card-foreground">{resources.length}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-card-foreground">5,920</p>
          <p className="text-xs text-muted-foreground">Downloads</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="text-2xl font-bold text-card-foreground">Free</p>
          <p className="text-xs text-muted-foreground">All Resources</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search resources..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 cursor-pointer" onClick={() => setExpandedResource(expandedResource === r.title ? null : r.title)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{r.icon}</div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{r.title}</h3>
                  <span className="text-xs text-muted-foreground">{r.count} resources</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
            {expandedResource === r.title && (
              <div className="px-5 pb-5 border-t border-border pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Included Resources</h4>
                <div className="space-y-2">
                  {r.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 p-2 rounded-lg bg-muted hover:bg-muted/70 cursor-pointer transition-colors group">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm flex-1 group-hover:text-primary transition-colors">{item}</span>
                      <Download className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Download className="w-4 h-4" /> Download All ({r.count})
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Popular Downloads */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" /> Popular Downloads
        </h3>
        <div className="space-y-3">
          {featuredDownloads.map((d, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group">
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.format} · {d.size} · {d.downloads.toLocaleString()} downloads</p>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
