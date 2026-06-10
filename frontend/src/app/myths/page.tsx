"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Scale, CheckCircle, XCircle, Search, ChevronDown, ChevronUp, ExternalLink, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";

const myths = [
  { myth: "Indian students caused the housing crisis", reality: "International students represent ~4% of rental demand. Housing crisis is driven by decades of undersupply, zoning restrictions, and population growth.", sources: ["CMHC", "Statistics Canada", "Bank of Canada"], context: "Canada needs 3.5M additional housing units by 2030. International students are a convenient scapegoat for systemic policy failures.", impact: "High", spread: "X, Reddit, YouTube" },
  { myth: "Indian immigrants don't pay taxes", reality: "Immigrants contribute more in taxes than they receive in services over their lifetime. Studies show net fiscal contribution is positive.", sources: ["Conference Board of Canada", "Statistics Canada", "C.D. Howe Institute"], context: "Tax data shows immigrants pay proportionally more in income and consumption taxes relative to services used.", impact: "Medium", spread: "X, Facebook" },
  { myth: "Most scam calls come from India", reality: "Phone scams are a global phenomenon. India has made 50,000+ arrests in cybercrime crackdowns and actively cooperates with international law enforcement.", sources: ["FTC", "FBI IC3", "Indian MHA"], context: "While some scam operations exist in India, the country has taken significant enforcement action. Scam operations exist globally.", impact: "High", spread: "YouTube, X, TikTok" },
  { myth: "Indian workers displace local workers", reality: "H-1B workers fill documented skill gaps. Tech unemployment remains below national average at 2.1%.", sources: ["BLS", "NFAP", "NBER"], context: "Research shows H-1B workers complement rather than replace domestic workers, and companies that hire H-1B also hire more domestic workers.", impact: "High", spread: "X, Reddit" },
  { myth: "Indian diaspora supports extremism", reality: "Over 85% of Indian diaspora oppose separatist movements per survey data. Most diaspora members are moderate and integration-focused.", sources: ["Environics Institute", "Angus Reid", "Pew Research"], context: "A vocal minority does not represent the broader community. Survey data consistently shows moderate political views.", impact: "Medium", spread: "X, Facebook" },
  { myth: "Indian universities are diploma mills", reality: "Indian IITs and IIMs have acceptance rates below 2%, making them among the most selective institutions globally.", sources: ["QS Rankings", "Times Higher Education", "MHRD India"], context: "While some lower-tier institutions have quality issues, India's top institutions produce world-class graduates.", impact: "Low", spread: "Reddit, X" },
  { myth: "Indian immigrants increase crime rates", reality: "Studies consistently show immigrants have lower crime rates than native-born populations across all countries studied.", sources: ["NBER", "Statistics Canada", "Cato Institute"], context: "The 'immigrant crime' narrative is contradicted by decades of criminological research across multiple countries.", impact: "Critical", spread: "X, YouTube, Facebook" },
];

const impactColors: Record<string, string> = { Critical: "bg-red-100 text-red-700", High: "bg-orange-100 text-orange-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };

export default function MythsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = myths.filter((m) =>
    !searchQuery || m.myth.toLowerCase().includes(searchQuery.toLowerCase()) || m.reality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Myth vs Reality Center" description="Evidence-based comparisons of common myths with verified facts" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search myths or facts..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
      </div>

      {/* Myth Cards */}
      <div className="space-y-4">
        {filtered.map((m, i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-5 bg-red-50 dark:bg-red-950/20 border-r border-border">
                <div className="flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-destructive" /><span className="text-xs font-semibold text-destructive uppercase">Myth</span></div>
                <p className="text-sm font-medium text-foreground">{m.myth}</p>
              </div>
              <div className="p-5 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-success" /><span className="text-xs font-semibold text-success uppercase">Reality</span></div>
                <p className="text-sm text-foreground">{m.reality}</p>
              </div>
            </div>
            <div className="px-5 py-3 bg-muted/50 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Sources: {m.sources.join(", ")}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${impactColors[m.impact]}`}>Impact: {m.impact}</span>
              </div>
              <button onClick={() => setExpanded(expanded === i ? null : i)} className="text-muted-foreground hover:text-foreground">
                {expanded === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {expanded === i && (
              <div className="px-5 py-4 border-t border-border bg-card space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Context</h4>
                  <p className="text-sm text-muted-foreground">{m.context}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1 flex items-center gap-2"><ExternalLink className="w-4 h-4 text-primary" /> Primary Spread</h4>
                  <p className="text-sm text-muted-foreground">{m.spread}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-medium"><ThumbsUp className="w-3 h-3" /> Helpful</button>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium"><ExternalLink className="w-3 h-3" /> Share Fact Card</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
