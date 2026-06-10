"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { PageHeader, PlatformBadge, ScoreGauge, DashboardCard } from "@/components/ui";
import { formatNumber, timeAgo } from "@/lib/utils";
import { Eye, Heart, Share2, MessageCircle } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { viralContentApi, narrativesApi } from "@/lib/api";
import type { ViralContent, Narrative } from "@/types";

export default function ViralContentDetailPage() {
  const params = useParams();
  const { data: content, loading } = useApi<ViralContent>(
    () => viralContentApi.getById(params.id as string),
    [params.id]
  );
  const { data: allNarratives } = useApi<Narrative[]>(() => narrativesApi.list(), []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!content) return <div className="p-8 text-center text-muted-foreground">Content not found</div>;

  const relatedNarratives = (allNarratives ?? []).filter((n) => content.narrativeIds.includes(n.id));

  return (
    <div className="space-y-6">
      <Link href="/viral-content" className="flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Viral Content
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <PlatformBadge platform={content.platform} />
            <span className="text-sm text-muted-foreground">{timeAgo(content.postedAt)}</span>
          </div>
          <p className="text-lg text-foreground">{content.content}</p>
          <p className="text-sm text-muted-foreground mt-2">by {content.authorHandle} ({formatNumber(content.authorFollowers)} followers)</p>
        </div>
        <ScoreGauge score={content.viralityScore} label="Virality Score" size="lg" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardCard title="Views" value={formatNumber(content.engagement.views)} icon={<Eye className="w-5 h-5" />} />
        <DashboardCard title="Likes" value={formatNumber(content.engagement.likes)} icon={<Heart className="w-5 h-5" />} />
        <DashboardCard title="Shares" value={formatNumber(content.engagement.shares)} icon={<Share2 className="w-5 h-5" />} />
        <DashboardCard title="Comments" value={formatNumber(content.engagement.comments)} icon={<MessageCircle className="w-5 h-5" />} />
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-2">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Platform:</span> {content.platform}</div>
          <div><span className="text-muted-foreground">Content Type:</span> {content.contentType}</div>
          <div><span className="text-muted-foreground">Sentiment:</span> <span className={content.sentiment === "negative" ? "text-destructive" : content.sentiment === "positive" ? "text-success" : ""}>{content.sentiment}</span></div>
          <div><span className="text-muted-foreground">Country:</span> {content.country}</div>
          <div><span className="text-muted-foreground">Language:</span> {content.language}</div>
          <div><span className="text-muted-foreground">Engagement Rate:</span> {content.engagement.engagementRate}%</div>
        </div>
        <a href={content.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline mt-4">
          <ExternalLink className="w-4 h-4" /> View original post
        </a>
      </div>

      {relatedNarratives.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-3">Related Narratives</h3>
          <div className="space-y-2">
            {relatedNarratives.map((n) => (
              <Link key={n.id} href={`/narratives/${n.id}`} className="block p-3 rounded-lg hover:bg-muted transition-colors">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.category} - {formatNumber(n.totalMentions)} mentions</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
