"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { Network, Users, Loader2, Globe, Zap, UserCheck, Bot, Newspaper } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { networksApi, narrativesApi } from "@/lib/api";
import type { Narrative } from "@/types";

const networkData: Record<string, {
  nodes: { id: string; handle: string; platform: string; actorType: string; amplificationCount: number; influence: number }[];
  clusters: { name: string; nodeCount: number; avgInfluence: number; description: string }[];
}> = {
  "nar-1": {
    nodes: [
      { id: "n1", handle: "@news_breaking_daily", platform: "X", actorType: "Media", amplificationCount: 4500, influence: 92 },
      { id: "n2", handle: "u/housing_crisis_watch", platform: "Reddit", actorType: "Organic User", amplificationCount: 890, influence: 45 },
      { id: "n3", handle: "@concerned_citizen42", platform: "X", actorType: "Organic User", amplificationCount: 2300, influence: 67 },
      { id: "n4", handle: "@auto_poster_bot1", platform: "X", actorType: "Bot", amplificationCount: 8900, influence: 23 },
      { id: "n5", handle: "@immigration_policy_hub", platform: "X", actorType: "Organization", amplificationCount: 3200, influence: 85 },
      { id: "n6", handle: "u/toronto_renter", platform: "Reddit", actorType: "Organic User", amplificationCount: 560, influence: 38 },
      { id: "n7", handle: "@canada_news_today", platform: "X", actorType: "Media", amplificationCount: 6700, influence: 88 },
      { id: "n8", handle: "@student_voice_ca", platform: "X", actorType: "Organic User", amplificationCount: 1200, influence: 52 },
      { id: "n9", handle: "u/policy_debater", platform: "Reddit", actorType: "Organic User", amplificationCount: 780, influence: 41 },
      { id: "n10", handle: "@viral_aggregator", platform: "X", actorType: "Bot", amplificationCount: 12000, influence: 15 },
    ],
    clusters: [
      { name: "Media Amplifiers", nodeCount: 12, avgInfluence: 88, description: "News outlets and media personalities sharing the narrative" },
      { name: "Bot Networks", nodeCount: 25, avgInfluence: 18, description: "Coordinated automated accounts amplifying content" },
      { name: "Organic Community", nodeCount: 45, avgInfluence: 52, description: "Genuine user discussions and sharing" },
      { name: "Policy Organizations", nodeCount: 8, avgInfluence: 82, description: "Think tanks and advocacy groups" },
    ],
  },
};

const actorIcons: Record<string, React.ReactNode> = {
  Media: <Newspaper className="w-4 h-4" />,
  "Organic User": <UserCheck className="w-4 h-4" />,
  Bot: <Bot className="w-4 h-4" />,
  Organization: <Globe className="w-4 h-4" />,
};

export default function NetworksPage() {
  const [selectedNarrative, setSelectedNarrative] = useState("nar-1");
  const data = networkData[selectedNarrative];
  const nodes = data?.nodes ?? [];
  const clusters = data?.clusters ?? [];
  const [sortBy, setSortBy] = useState<"amplification" | "influence">("amplification");

  const sortedNodes = [...nodes].sort((a, b) =>
    sortBy === "amplification" ? b.amplificationCount - a.amplificationCount : b.influence - a.influence
  );

  const totalAmplifications = nodes.reduce((sum, n) => sum + n.amplificationCount, 0);
  const botNodes = nodes.filter((n) => n.actorType === "Bot");
  const botPercentage = nodes.length > 0 ? Math.round((botNodes.length / nodes.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Amplification Network Analysis" description="Visualize how narratives spread through connected accounts and communities" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Network className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{nodes.length}</p>
          <p className="text-xs text-muted-foreground">Total Nodes</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Zap className="w-6 h-6 text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold">{totalAmplifications.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Amplifications</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Users className="w-6 h-6 text-success mx-auto mb-2" />
          <p className="text-2xl font-bold">{clusters.length}</p>
          <p className="text-xs text-muted-foreground">Clusters Identified</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <Bot className="w-6 h-6 text-destructive mx-auto mb-2" />
          <p className="text-2xl font-bold">{botPercentage}%</p>
          <p className="text-xs text-muted-foreground">Bot Activity</p>
        </div>
      </div>

      {/* Cluster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusters.map((cluster) => (
          <div key={cluster.name} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Users className="w-4 h-4" /></div>
              <h3 className="font-semibold text-card-foreground text-sm">{cluster.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{cluster.description}</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{cluster.nodeCount} nodes</span>
              <span className="font-medium">Avg influence: {cluster.avgInfluence}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${cluster.avgInfluence}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Network Nodes Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Top Amplifying Nodes</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("amplification")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === "amplification" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >By Amplifications</button>
            <button
              onClick={() => setSortBy("influence")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${sortBy === "influence" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >By Influence</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-muted-foreground font-medium">Account</th>
                <th className="text-left py-3 px-3 text-muted-foreground font-medium">Platform</th>
                <th className="text-left py-3 px-3 text-muted-foreground font-medium">Type</th>
                <th className="text-right py-3 px-3 text-muted-foreground font-medium">Amplifications</th>
                <th className="text-right py-3 px-3 text-muted-foreground font-medium">Influence</th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map((node) => (
                <tr key={node.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{actorIcons[node.actorType]}</span>
                      <span className="font-medium">{node.handle}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3"><span className="px-2 py-0.5 rounded text-xs bg-muted">{node.platform}</span></td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      node.actorType === "Bot" ? "bg-red-100 text-red-700" :
                      node.actorType === "Media" ? "bg-blue-100 text-blue-700" :
                      node.actorType === "Organization" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                    }`}>{node.actorType}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium">{node.amplificationCount.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${node.influence > 80 ? "bg-primary" : node.influence > 50 ? "bg-success" : "bg-muted-foreground/30"}`} style={{ width: `${node.influence}%` }} />
                      </div>
                      <span className="text-xs">{node.influence}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Visualization Placeholder */}
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <Network className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Interactive network graph visualization</p>
            <p className="text-xs text-muted-foreground mt-1">{nodes.length} nodes · {clusters.length} clusters · {totalAmplifications.toLocaleString()} connections</p>
          </div>
        </div>
      </div>
    </div>
  );
}
