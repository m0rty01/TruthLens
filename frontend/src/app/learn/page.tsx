"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { GraduationCap, BookOpen, Globe, DollarSign, Users, Newspaper, Brain, Search, ChevronRight, Clock } from "lucide-react";

const topics = [
  { icon: <Globe className="w-5 h-5" />, title: "Immigration", desc: "Understanding immigration systems, policies, and data", articles: 12, tags: ["policy", "visa", "asylum"], difficulty: "Beginner", lastUpdated: "2026-05-15" },
  { icon: <DollarSign className="w-5 h-5" />, title: "Housing", desc: "Housing economics and affordability factors", articles: 8, tags: ["economics", "rent", "supply"], difficulty: "Intermediate", lastUpdated: "2026-04-20" },
  { icon: <BookOpen className="w-5 h-5" />, title: "Economics", desc: "Economic contributions and labor market dynamics", articles: 15, tags: ["labor", "GDP", "trade"], difficulty: "Intermediate", lastUpdated: "2026-06-01" },
  { icon: <Users className="w-5 h-5" />, title: "Diaspora History", desc: "History of Indian diaspora communities worldwide", articles: 10, tags: ["history", "culture", "migration"], difficulty: "Beginner", lastUpdated: "2026-03-10" },
  { icon: <Newspaper className="w-5 h-5" />, title: "Media Literacy", desc: "How to evaluate news sources and identify bias", articles: 9, tags: ["media", "bias", "fact-checking"], difficulty: "Beginner", lastUpdated: "2026-05-28" },
  { icon: <Brain className="w-5 h-5" />, title: "Misinformation Tactics", desc: "Common techniques used to spread misinformation", articles: 11, tags: ["disinformation", "propaganda", "social media"], difficulty: "Advanced", lastUpdated: "2026-06-05" },
];

const featuredArticles = [
  { title: "Understanding H-1B Visa Statistics", topic: "Immigration", readTime: "8 min", excerpt: "A data-driven look at H-1B visa allocations and their impact on the tech industry." },
  { title: "Housing Supply vs Demand: The Real Story", topic: "Housing", readTime: "12 min", excerpt: "Decades of undersupply, not immigration, is the primary driver of housing unaffordability." },
  { title: "How to Spot Coordinated Disinformation", topic: "Media Literacy", readTime: "6 min", excerpt: "Key indicators of coordinated inauthentic behavior on social media platforms." },
  { title: "The Economic Case for Immigration", topic: "Economics", readTime: "10 min", excerpt: "Research showing immigrants contribute more in taxes than they receive in services." },
];

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const filtered = topics.filter((t) => {
    if (selectedTopic) return t.title === selectedTopic;
    if (searchQuery) return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Educational Knowledge Base" description="Learn about the topics behind the narratives with evidence-based resources" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search topics and articles..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {/* Featured Articles */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Featured Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredArticles.map((article, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted hover:bg-muted/70 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">{article.topic}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{article.readTime}</span>
              </div>
              <h4 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{article.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t, i) => (
          <div
            key={i}
            onClick={() => setSelectedTopic(selectedTopic === t.title ? null : t.title)}
            className={`bg-card rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer ${
              selectedTopic === t.title ? "border-primary shadow-sm" : "border-border"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">{t.icon}</div>
              <div>
                <h3 className="font-semibold text-card-foreground">{t.title}</h3>
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  t.difficulty === "Beginner" ? "bg-green-100 text-green-700" : t.difficulty === "Intermediate" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>{t.difficulty}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{t.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t.articles} articles</span>
              <div className="flex gap-1">
                {t.tags.map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Topic Detail */}
      {selectedTopic && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-card-foreground mb-4">Articles in {selectedTopic}</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/70 cursor-pointer transition-colors group">
                <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">Article {n}: Sample {selectedTopic} Content</p>
                  <p className="text-xs text-muted-foreground">Updated recently · 5 min read</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
