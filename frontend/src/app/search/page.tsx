"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui";
import { Search, Flame, Radar, ShieldCheck, FileText, Loader2, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { narrativesApi, viralContentApi, claimsApi, reportsApi } from "@/lib/api";
import type { Narrative, ViralContent, Claim, IntelligenceReport } from "@/types";

type TabKey = "all" | "narratives" | "viral" | "claims" | "reports";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "All Results", icon: <Search className="w-4 h-4" /> },
  { key: "narratives", label: "Narratives", icon: <Radar className="w-4 h-4" /> },
  { key: "viral", label: "Viral Content", icon: <Flame className="w-4 h-4" /> },
  { key: "claims", label: "Claims", icon: <ShieldCheck className="w-4 h-4" /> },
  { key: "reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
];

interface SearchResult {
  id: string;
  type: "narrative" | "viral" | "claim" | "report";
  title: string;
  description: string;
  href: string;
  meta?: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [debounced, setDebounced] = useState("");

  const { data: narratives } = useApi<Narrative[]>(() => narrativesApi.list(), []);
  const { data: viral } = useApi<ViralContent[]>(() => viralContentApi.list(), []);
  const { data: claims } = useApi<Claim[]>(() => claimsApi.list(), []);
  const { data: reports } = useApi<IntelligenceReport[]>(() => reportsApi.list(), []);

  const handleSearch = (value: string) => {
    setQuery(value);
    const timer = setTimeout(() => setDebounced(value), 300);
    return () => clearTimeout(timer);
  };

  const results = useMemo(() => {
    if (!debounced.trim()) return [];
    const q = debounced.toLowerCase();
    const items: SearchResult[] = [];

    (narratives ?? []).forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) || n.tags?.some((t) => t.toLowerCase().includes(q))) {
        items.push({ id: n.id, type: "narrative", title: n.title, description: n.description, href: `/narratives/${n.id}`, meta: `${n.category} · ${n.totalMentions?.toLocaleString()} mentions` });
      }
    });

    (viral ?? []).forEach((v) => {
      if (v.content?.toLowerCase().includes(q) || v.authorHandle?.toLowerCase().includes(q)) {
        items.push({ id: v.id, type: "viral", title: v.content?.slice(0, 80) + (v.content?.length > 80 ? "..." : ""), description: `By ${v.authorHandle} on ${v.platform}`, href: `/viral-content/${v.id}`, meta: `${v.platform} · Virality: ${v.viralityScore}` });
      }
    });

    (claims ?? []).forEach((c) => {
      if (c.text?.toLowerCase().includes(q)) {
        items.push({ id: c.id, type: "claim", title: c.text, description: c.context || "", href: `/claims/${c.id}`, meta: `${c.classification} · Confidence: ${c.confidenceScore}%` });
      }
    });

    (reports ?? []).forEach((r) => {
      if (r.title?.toLowerCase().includes(q) || r.summary?.toLowerCase().includes(q)) {
        items.push({ id: r.id, type: "report", title: r.title, description: r.summary, href: `/reports/${r.id}`, meta: `${r.month} ${r.year}` });
      }
    });

    return items;
  }, [debounced, narratives, viral, claims, reports]);

  const filtered = activeTab === "all" ? results : results.filter((r) => r.type === activeTab.slice(0, -1) || (activeTab === "viral" && r.type === "viral") || (activeTab === "claims" && r.type === "claim"));

  const typeColors: Record<string, string> = {
    narrative: "bg-blue-100 text-blue-700",
    viral: "bg-red-100 text-red-700",
    claim: "bg-orange-100 text-orange-700",
    report: "bg-green-100 text-green-700",
  };

  const counts = useMemo(() => ({
    all: results.length,
    narratives: results.filter((r) => r.type === "narrative").length,
    viral: results.filter((r) => r.type === "viral").length,
    claims: results.filter((r) => r.type === "claim").length,
    reports: results.filter((r) => r.type === "report").length,
  }), [results]);

  return (
    <div className="space-y-6">
      <PageHeader title="Global Search" description="Search across narratives, claims, viral content, and reports" />

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search narratives, claims, viral content, reports..."
          className="w-full pl-12 pr-12 py-4 rounded-xl border border-border bg-card text-card-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring/30 shadow-sm"
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(""); setDebounced(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {debounced.trim() && (
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.key ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {filtered.map((result) => (
          <Link key={result.id} href={result.href} className="block bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[result.type]}`}>
                    {result.type}
                  </span>
                  {result.meta && <span className="text-xs text-muted-foreground">{result.meta}</span>}
                </div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">{result.title}</h3>
                {result.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{result.description}</p>}
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-2" />
            </div>
          </Link>
        ))}
      </div>

      {/* Empty States */}
      {debounced.trim() && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No results found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search terms or browse by category</p>
        </div>
      )}

      {!debounced.trim() && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-1">Start typing to search</h3>
          <p className="text-sm text-muted-foreground">Search across all narratives, claims, viral content, and intelligence reports</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["housing crisis", "scam calls", "H-1B", "khalistan", "job displacement"].map((term) => (
              <button key={term} onClick={() => handleSearch(term)} className="px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors">
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
