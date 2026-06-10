"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PageHeader,
  TrendBadge,
  PlatformBadge,
  ScoreGauge,
} from "@/components/ui";
import { formatNumber } from "@/lib/utils";
import type { NarrativeCategory } from "@/types/narrative";
import { Filter, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApi } from "@/hooks/useApi";
import { narrativesApi } from "@/lib/api";
import type { Narrative } from "@/types";

const categories: (NarrativeCategory | "All")[] = [
  "All", "Housing", "Immigration", "Jobs", "Crime", "Scams",
  "International Students", "Religion", "Khalistan", "India-Pakistan",
  "Geopolitics", "Culture", "Economy",
];

export default function NarrativesPage() {
  const [selectedCategory, setSelectedCategory] = useState<NarrativeCategory | "All">("All");
  const [sortBy, setSortBy] = useState<"trend" | "mentions" | "velocity">("trend");
  const { data: allNarratives, loading } = useApi<Narrative[]>(() => narrativesApi.list(), []);

  const filtered = (allNarratives ?? [])
    .filter((n) => selectedCategory === "All" || n.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "trend") return b.trend.score - a.trend.score;
      if (sortBy === "mentions") return b.totalMentions - a.totalMentions;
      return b.trend.velocity - a.trend.velocity;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Narrative Radar"
        description="Monitor emerging and trending narratives across social media platforms"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-sm">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Sort by:</span>
        {(["trend", "mentions", "velocity"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={cn(
              "px-2 py-1 rounded text-xs font-medium transition-colors",
              sortBy === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Narratives Grid */}
      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((narrative) => (
          <Link
            key={narrative.id}
            href={`/narratives/${narrative.id}`}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                    {narrative.category}
                  </span>
                  <TrendBadge direction={narrative.trend.direction} />
                </div>
                <h3 className="font-semibold text-card-foreground">{narrative.title}</h3>
              </div>
              <ScoreGauge score={narrative.trend.score} size="sm" />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {narrative.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatNumber(narrative.totalMentions)} mentions
                </span>
                <span className="text-xs text-muted-foreground">
                  {narrative.trend.velocity}/hr
                </span>
              </div>
              <div className="flex items-center gap-1">
                {narrative.platformDistribution.slice(0, 3).map((p) => (
                  <PlatformBadge key={p.platform} platform={p.platform} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              {narrative.countryDistribution.slice(0, 3).map((c) => (
                <span key={c.country} className="text-xs text-muted-foreground">
                  {c.country} ({c.percentage}%)
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
