"use client";
import { useState } from "react";
import { PageHeader, ScoreGauge } from "@/components/ui";
import { Bot, Search, AlertTriangle, Clock, Activity, Users, ChevronDown, ChevronUp } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { botDetectionApi } from "@/lib/api";

const sampleAccounts = [
  { handle: "@user_892347", score: 92, classification: "Likely Automated", posts: 1567, followers: 12, platform: "X", joined: "2026-03-01", bio: "" },
  { handle: "@daily_news_bot", score: 78, classification: "Bot-Like", posts: 890, followers: 4500, platform: "X", joined: "2025-06-15", bio: "Breaking news and updates" },
  { handle: "u/pattern_poster", score: 85, classification: "Likely Automated", posts: 2345, followers: 120, platform: "Reddit", joined: "2026-01-10", bio: "" },
  { handle: "@engaged_citizen", score: 35, classification: "Human", posts: 234, followers: 12000, platform: "X", joined: "2020-03-22", bio: "Just a regular person sharing thoughts" },
  { handle: "@viral_content_daily", score: 88, classification: "Likely Automated", posts: 4567, followers: 67000, platform: "X", joined: "2025-11-01", bio: "Viral content aggregator" },
  { handle: "u/housing_debate", score: 72, classification: "Bot-Like", posts: 678, followers: 890, platform: "Reddit", joined: "2026-02-20", bio: "Housing policy discussions" },
  { handle: "@immigration_watch", score: 81, classification: "Bot-Like", posts: 1234, followers: 23000, platform: "X", joined: "2025-09-05", bio: "Monitoring immigration policy" },
];

const signalLabels: Record<string, string> = {
  postingFrequency: "Posting Frequency",
  languageConsistency: "Language Consistency",
  followerPattern: "Follower Pattern",
  temporalActivity: "Temporal Activity",
};

export default function BotDetectionPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");

  const filtered = sampleAccounts.filter((a) => {
    const matchesSearch = !searchQuery || a.handle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterClass === "all" || a.classification === filterClass;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: sampleAccounts.length,
    automated: sampleAccounts.filter((a) => a.classification === "Likely Automated").length,
    botLike: sampleAccounts.filter((a) => a.classification === "Bot-Like").length,
    human: sampleAccounts.filter((a) => a.classification === "Human").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bot Detection"
        description="Identify automated accounts and coordinated inauthentic behavior"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Bot className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Accounts Analyzed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
          <p className="text-2xl font-bold text-destructive">{stats.automated}</p>
          <p className="text-xs text-muted-foreground">Likely Automated</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Activity className="w-6 h-6 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-warning">{stats.botLike}</p>
          <p className="text-xs text-muted-foreground">Bot-Like</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Users className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-success">{stats.human}</p>
          <p className="text-xs text-muted-foreground">Human</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by handle..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex gap-2">
          {["all", "Likely Automated", "Bot-Like", "Human"].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterClass === cls ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cls === "all" ? "All" : cls}
            </button>
          ))}
        </div>
      </div>

      {/* Account List */}
      <div className="space-y-3">
        {filtered.map((account, i) => (
          <div key={account.handle} className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="flex items-center gap-4 p-5 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedAccount(expandedAccount === account.handle ? null : account.handle)}
            >
              <ScoreGauge score={account.score} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-card-foreground">{account.handle}</p>
                  <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{account.platform}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{account.posts.toLocaleString()} posts · {account.followers.toLocaleString()} followers · Joined {new Date(account.joined).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                account.classification === "Likely Automated" ? "bg-red-100 text-red-700" :
                account.classification === "Bot-Like" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
              }`}>{account.classification}</span>
              {expandedAccount === account.handle ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>

            {/* Expanded Details */}
            {expandedAccount === account.handle && (
              <div className="border-t border-border p-5 bg-muted/20">
                <h4 className="text-sm font-semibold mb-3">Bot Signals Analysis</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Posting Frequency", score: Math.min(100, Math.round(account.score * 1.1)), desc: account.posts > 1000 ? "Very high posting rate" : "Normal posting rate" },
                    { label: "Language Consistency", score: Math.round(account.score * 0.85), desc: "Repetitive language patterns" },
                    { label: "Follower Pattern", score: Math.round(account.score * 0.75), desc: account.followers < 100 ? "Suspicious follower ratio" : "Normal follower pattern" },
                    { label: "Temporal Activity", score: Math.min(100, Math.round(account.score * 1.05)), desc: "Activity at unusual hours" },
                  ].map((signal) => (
                    <div key={signal.label} className="p-3 rounded-lg bg-card border border-border">
                      <p className="text-xs text-muted-foreground mb-2">{signal.label}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${signal.score > 70 ? "bg-destructive" : signal.score > 40 ? "bg-warning" : "bg-success"}`} style={{ width: `${signal.score}%` }} />
                        </div>
                        <span className="text-xs font-medium">{signal.score}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{signal.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Full Report</button>
                  <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">Flag Account</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detection Methods */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Detection Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Clock className="w-5 h-5" />, title: "Temporal Analysis", desc: "Detects accounts posting at inhuman speeds or during unusual hours" },
            { icon: <Activity className="w-5 h-5" />, title: "Behavioral Patterns", desc: "Identifies repetitive posting patterns and copy-paste content" },
            { icon: <Users className="w-5 h-5" />, title: "Network Analysis", desc: "Examines follower/following ratios and coordinated amplification" },
            { icon: <Bot className="w-5 h-5" />, title: "Language Analysis", desc: "Detects template-based content and low linguistic diversity" },
          ].map((method, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted">
              <div className="text-primary mb-2">{method.icon}</div>
              <h4 className="text-sm font-medium mb-1">{method.title}</h4>
              <p className="text-xs text-muted-foreground">{method.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
