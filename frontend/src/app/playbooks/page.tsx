"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { BookOpen, CheckCircle, XCircle, ArrowRight, Copy, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { playbooksApi } from "@/lib/api";
import type { ResponsePlaybook } from "@/types";

export default function PlaybooksPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data: playbooks, loading } = useApi<ResponsePlaybook[]>(() => playbooksApi.list(), []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Response Playbooks"
        description="Generated response templates for addressing harmful narratives effectively"
      />

      <div className="space-y-6">
        {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {(playbooks ?? []).map((playbook) => (
          <div key={playbook.id} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-lg text-card-foreground">{playbook.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{playbook.situation}</p>
            </div>

            {/* Responses */}
            <div className="p-5 space-y-4">
              <h4 className="font-medium text-sm text-foreground">Response Templates</h4>
              {playbook.responses.map((response, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${response.recommended ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium">{response.title}</h5>
                      {response.recommended && (
                        <span className="flex items-center gap-1 text-xs text-primary font-medium">
                          <Star className="w-3 h-3" /> Recommended
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(response.content, `${playbook.id}-${idx}`)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === `${playbook.id}-${idx}` ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{response.content}</p>
                </div>
              ))}
            </div>

            {/* Dos and Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-border">
              <div className="p-5 border-r border-border">
                <h4 className="font-medium text-sm text-success mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Do
                </h4>
                <ul className="space-y-1">
                  {playbook.dos.map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-success mt-1">+</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5">
                <h4 className="font-medium text-sm text-destructive mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Don&apos;t
                </h4>
                <ul className="space-y-1">
                  {playbook.donts.map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive mt-1">-</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
