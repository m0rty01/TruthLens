"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Copy, Star, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { playbooksApi } from "@/lib/api";
import type { ResponsePlaybook } from "@/types";
export default function PlaybookDetailPage() {
  const params = useParams();
  const { data: playbook, loading } = useApi<ResponsePlaybook>(
    () => playbooksApi.getById(params.id as string),
    [params.id]
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!playbook) return <div className="p-8 text-center text-muted-foreground">Playbook not found</div>;
  const handleCopy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  return (
    <div className="space-y-6">
      <Link href="/playbooks" className="flex items-center gap-1 text-sm text-primary hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Playbooks</Link>
      <PageHeader title={playbook.title} description={playbook.situation} />
      <div className="space-y-4">
        {playbook.responses.map((response, idx) => (
          <div key={idx} className={`p-5 rounded-xl border ${response.recommended ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><h3 className="font-semibold">{response.title}</h3>{response.recommended && <span className="flex items-center gap-1 text-xs text-primary"><Star className="w-3 h-3" /> Recommended</span>}</div>
              <button onClick={() => handleCopy(response.content, `${idx}`)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:bg-muted"><Copy className="w-3 h-3" />{copiedId === `${idx}` ? "Copied!" : "Copy"}</button>
            </div>
            <p className="text-sm text-muted-foreground">{response.content}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5"><h3 className="font-semibold text-success mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Do</h3><ul className="space-y-2">{playbook.dos.map((d, i) => (<li key={i} className="text-sm text-muted-foreground">+ {d}</li>))}</ul></div>
        <div className="bg-card rounded-xl border border-border p-5"><h3 className="font-semibold text-destructive mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Don&apos;t</h3><ul className="space-y-2">{playbook.donts.map((d, i) => (<li key={i} className="text-sm text-muted-foreground">- {d}</li>))}</ul></div>
      </div>
    </div>
  );
}
