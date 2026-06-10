"use client";
import { useState } from "react";
import { PageHeader, DashboardCard } from "@/components/ui";
import { Trophy, Award, Star, Search, Briefcase, Lightbulb, Heart, Building } from "lucide-react";

const contributions = [
  { name: "Sundar Pichai", field: "Technology", desc: "CEO of Alphabet/Google, leading one of the world's largest tech companies", category: "Entrepreneurs", impact: "Led Google through AI transformation, employing 180,000+ people globally", year: "2015-present" },
  { name: "Satya Nadella", field: "Technology", desc: "CEO of Microsoft, driving cloud computing transformation", category: "Entrepreneurs", impact: "Grew Microsoft market cap from $300B to $3T+", year: "2014-present" },
  { name: "Dr. Soumya Swaminathan", field: "Health", desc: "Former WHO Chief Scientist leading global health initiatives", category: "Scientists", impact: "Led global COVID-19 vaccine strategy", year: "2019-2022" },
  { name: "Nikesh Arora", field: "Business", desc: "CEO of Palo Alto Networks, cybersecurity industry leader", category: "Entrepreneurs", impact: "Pioneered cybersecurity solutions protecting millions", year: "2018-present" },
  { name: "Dr. Katalin Kariko", field: "Science", desc: "Nobel Prize winner for mRNA research, collaborated with Indian researchers", category: "Researchers", impact: "mRNA technology used in vaccines worldwide", year: "2020" },
  { name: "Dr. Rana Dajani", field: "Medicine", desc: "Molecular biologist advancing stem cell research with Indian partnerships", category: "Researchers", impact: "Stem cell breakthroughs in regenerative medicine", year: "2018" },
  { name: "Shantanu Narayen", field: "Technology", desc: "CEO of Adobe, transforming creative software industry", category: "Entrepreneurs", impact: "Led Adobe's shift to cloud-based subscription model", year: "2007-present" },
  { name: "Arvind Krishna", field: "Technology", desc: "CEO of IBM, driving quantum computing and hybrid cloud", category: "Entrepreneurs", impact: "Leading quantum computing research at IBM", year: "2020-present" },
  { name: "Dr. Ritu Karidhal", field: "Space", desc: "Deputy Operations Director of India's Mars Orbiter Mission", category: "Scientists", impact: "Key role in India's successful Mars mission", year: "2014" },
  { name: "Dr. Kiran Mazumdar-Shaw", field: "Biotech", desc: "Founder of Biocon, India's largest biopharmaceutical company", category: "Entrepreneurs", impact: "Made affordable insulin accessible globally", year: "1978-present" },
  { name: "Vinod Khosla", field: "Venture Capital", desc: "Co-founder of Sun Microsystems, founder of Khosla Ventures", category: "Entrepreneurs", impact: "Funded 100+ startups including Square and Instacart", year: "1982-present" },
  { name: "Dr. Venkatraman Ramakrishnan", field: "Science", desc: "Nobel Prize in Chemistry for ribosome structure research", category: "Scientists", impact: "Breakthrough understanding of protein synthesis", year: "2009" },
];

const fieldIcons: Record<string, React.ReactNode> = {
  Technology: <Building className="w-5 h-5" />,
  Health: <Heart className="w-5 h-5" />,
  Science: <Lightbulb className="w-5 h-5" />,
  Medicine: <Heart className="w-5 h-5" />,
  Business: <Briefcase className="w-5 h-5" />,
  Space: <Star className="w-5 h-5" />,
  Biotech: <Lightbulb className="w-5 h-5" />,
  "Venture Capital": <Briefcase className="w-5 h-5" />,
};

export default function ContributionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", ...new Set(contributions.map((c) => c.category))];
  const filtered = contributions.filter((c) => {
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Positive Contribution Database" description="Showcasing contributions of Indian diaspora to counter stereotype formation" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="Notable Leaders" value={contributions.length} subtitle="Featured profiles" icon={<Trophy className="w-5 h-5" />} />
        <DashboardCard title="Tech Industry" value={contributions.filter((c) => c.field === "Technology").length} subtitle="CEOs and founders" icon={<Building className="w-5 h-5" />} />
        <DashboardCard title="Scientists" value={contributions.filter((c) => c.category === "Scientists").length} subtitle="Nobel laureates + researchers" icon={<Lightbulb className="w-5 h-5" />} />
        <DashboardCard title="Fields" value={new Set(contributions.map((c) => c.field)).size} subtitle="Areas of impact" icon={<Award className="w-5 h-5" />} />
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 relative min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or contribution..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contributions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {fieldIcons[c.field] || <Trophy className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.field} · {c.year}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{c.desc}</p>
            <p className="text-xs text-primary font-medium mb-2">{c.impact}</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{c.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
