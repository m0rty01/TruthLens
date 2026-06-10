"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, ClassificationBadge, ScoreGauge } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ClaimClassification } from "@/types/claim";
import { Filter, ArrowUpDown, Plus, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { claimsApi } from "@/lib/api";
import type { Claim } from "@/types";

const classifications: (ClaimClassification | "All")[] = [
  "All", "TRUE", "FALSE", "MISLEADING", "MISSING_CONTEXT", "EXAGGERATED", "UNVERIFIED", "SATIRE",
];

export default function ClaimsPage() {
  const [selectedClass, setSelectedClass] = useState<ClaimClassification | "All">("All");
  const [sortBy, setSortBy] = useState<"confidence" | "checks" | "exaggeration">("confidence");
  const { data: allClaims, loading } = useApi<Claim[]>(() => claimsApi.list(), []);

  const filtered = (allClaims ?? [])
    .filter((c) => selectedClass === "All" || c.classification === selectedClass)
    .sort((a, b) => {
      if (sortBy === "confidence") return b.confidenceScore - a.confidenceScore;
      if (sortBy === "checks") return b.timesChecked - a.timesChecked;
      return (b.exaggerationIndex || 0) - (a.exaggerationIndex || 0);
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Claim Verification Engine"
        description="Verify factual accuracy of viral claims with evidence and counter-evidence"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Submit Claim
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {classifications.map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selectedClass === cls ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
            )}
          >
            {cls === "All" ? "All" : cls.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">Sort by:</span>
        {(["confidence", "checks", "exaggeration"] as const).map((s) => (
          <button key={s} onClick={() => setSortBy(s)} className={cn("px-2 py-1 rounded text-xs font-medium transition-colors", sortBy === s ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {filtered.map((claim) => (
          <Link
            key={claim.id}
            href={`/claims/${claim.id}`}
            className="block bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ClassificationBadge classification={claim.classification} />
                  <span className="text-xs text-muted-foreground">Checked {claim.timesChecked} times</span>
                </div>
                <h3 className="font-medium text-card-foreground mb-2">&ldquo;{claim.text}&rdquo;</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{claim.context}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{claim.evidence.length} evidence</span>
                  <span>{claim.counterEvidence.length} counter-evidence</span>
                  <span>Origin: {claim.originPlatform}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <ScoreGauge score={claim.confidenceScore} label="Confidence" size="sm" />
                {claim.exaggerationIndex !== undefined && (
                  <ScoreGauge score={claim.exaggerationIndex} label="Exaggeration" size="sm" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
