"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { UserCog, Send, Loader2, AlertTriangle, BookOpen, Shield, Scale, ExternalLink, CheckCircle } from "lucide-react";
import { useApiMutation } from "@/hooks/useApi";
import { advisorApi } from "@/lib/api";
import Link from "next/link";

interface AdvisorResponse {
  actions: string[];
  resources: { name: string; url: string }[];
}

const quickScenarios = [
  "I'm being harassed online because of my ethnicity",
  "My landlord refused to rent to me based on my nationality",
  "I'm facing discrimination at my workplace",
  "Coordinated smear campaign against my community online",
  "I witnessed a hate crime in my neighborhood",
];

export default function AdvisorPage() {
  const [situation, setSituation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { execute: getAdvice, loading, data: advice, error } = useApiMutation<
    { situation: string },
    AdvisorResponse
  >((input) => advisorApi.submit(input.situation));

  const handleSubmit = async () => {
    if (!situation.trim()) return;
    try {
      await getAdvice({ situation });
      setSubmitted(true);
    } catch { /* handled */ }
  };

  const actionIcons = [Shield, AlertTriangle, BookOpen, Scale];

  return (
    <div className="space-y-6">
      <PageHeader title="Personal Advisor" description="Get personalized recommendations based on your specific situation" />

      {/* Situation Input */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-primary" /> Describe Your Situation
        </h3>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="Describe what happened, where it occurred, who was involved, and what outcome you're looking for..."
          className="w-full h-36 p-4 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30"
        />

        {/* Quick Scenarios */}
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2">Quick scenarios:</p>
          <div className="flex flex-wrap gap-2">
            {quickScenarios.map((s, i) => (
              <button
                key={i}
                onClick={() => setSituation(s)}
                className="px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !situation.trim()}
          className="flex items-center gap-2 mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Get Personalized Advice
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">Failed to get advice. Please try again.</p>
        </div>
      )}

      {/* Advice Results */}
      {submitted && advice && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" /> Recommended Actions
            </h3>
            <div className="space-y-3">
              {(advice.actions ?? []).map((action, i) => {
                const Icon = actionIcons[i % actionIcons.length];
                return (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                    <div className="p-1.5 rounded-lg bg-card text-primary shrink-0"><Icon className="w-4 h-4" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-card-foreground">{action}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {i === 0 && "Take screenshots, save messages, note dates and times of all incidents."}
                        {i === 1 && "Use platform reporting tools to flag harassment. Keep records of report IDs."}
                        {i === 2 && "Review our response playbooks for suggested communication strategies."}
                        {i === 3 && "If the situation involves threats or discrimination, consult legal resources."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linked Resources */}
          {advice.resources && advice.resources.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-card-foreground mb-4">Related Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {advice.resources.map((r, i) => (
                  <Link key={i} href={r.url} className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/70 transition-colors group">
                    <BookOpen className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{r.name}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* How It Works */}
      {!submitted && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-card-foreground mb-4">How the Advisor Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Describe Situation", desc: "Provide details about what happened, including context and any evidence you have." },
              { step: "2", title: "Get Analysis", desc: "Our system analyzes your situation against known patterns and available resources." },
              { step: "3", title: "Take Action", desc: "Receive personalized recommendations with links to relevant tools and resources." },
            ].map((s) => (
              <div key={s.step} className="p-4 rounded-lg bg-muted text-center">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h4 className="text-sm font-medium mb-1">{s.title}</h4>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
