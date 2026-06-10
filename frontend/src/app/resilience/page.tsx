"use client";
import { useState } from "react";
import { PageHeader, ScoreGauge, DashboardCard } from "@/components/ui";
import { Heart, Loader2, TrendingUp, TrendingDown, Minus, Users, MessageSquareHeart, Handshake, Flag, Brain } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { resilienceApi } from "@/lib/api";

interface ResilienceScore {
  id: string; country: string; city: string | null; overall_score: number;
  participation: number; positive_engagement: number; support_networks: number;
  reporting_behavior: number; sentiment_stability: number; trend: string; updated_at: string;
}
interface Trends {
  averageScore: number; trendDistribution: { improving: number; stable: number; declining: number };
  totalRegions: number; methodology: string; lastUpdated: string;
}

const metricMeta = [
  { key: "participation", label: "Participation", icon: <Users className="w-4 h-4" />, color: "text-blue-500" },
  { key: "positive_engagement", label: "Positive Engagement", icon: <MessageSquareHeart className="w-4 h-4" />, color: "text-green-500" },
  { key: "support_networks", label: "Support Networks", icon: <Handshake className="w-4 h-4" />, color: "text-purple-500" },
  { key: "reporting_behavior", label: "Reporting Behavior", icon: <Flag className="w-4 h-4" />, color: "text-orange-500" },
  { key: "sentiment_stability", label: "Sentiment Stability", icon: <Brain className="w-4 h-4" />, color: "text-teal-500" },
];
const trendIcon: Record<string, React.ReactNode> = {
  improving: <TrendingUp className="w-3 h-3 text-green-500" />,
  declining: <TrendingDown className="w-3 h-3 text-red-500" />,
  stable: <Minus className="w-3 h-3 text-gray-400" />,
};

export default function ResiliencePage() {
  const { data: scores, loading: loadingScores } = useApi<ResilienceScore[]>(() => resilienceApi.list(), []);
  const { data: trends, loading: loadingTrends } = useApi<Trends>(() => resilienceApi.trends(), []);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const { data: countryDetail } = useApi<any>(() => selectedCountry ? resilienceApi.getByCountry(selectedCountry) : Promise.resolve(null), [selectedCountry]);

  const countries = (scores ?? []).filter((s) => !s.city);
  const cities = (scores ?? []).filter((s) => s.city);

  return (
    <div className="space-y-6">
      <PageHeader title="Community Resilience Index" description="Measuring community capacity to respond to harmful narratives through participation, engagement, and support networks" />

      {(loadingScores || loadingTrends) && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Aggregate Trends */}
      {trends && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard title="Average Score" value={trends.averageScore} subtitle="out of 100" icon={<Heart className="w-5 h-5" />} />
          <DashboardCard title="Improving" value={trends.trendDistribution.improving} subtitle="regions" trend="up" icon={<TrendingUp className="w-5 h-5" />} />
          <DashboardCard title="Stable" value={trends.trendDistribution.stable} subtitle="regions" icon={<Minus className="w-5 h-5" />} />
          <DashboardCard title="Declining" value={trends.trendDistribution.declining} subtitle="regions" trend="down" icon={<TrendingDown className="w-5 h-5" />} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Countries</h3>
          {countries.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCountry(c.country)}
              className={`bg-card rounded-xl border p-4 cursor-pointer transition-all ${selectedCountry === c.country ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-card-foreground text-sm">{c.country}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {trendIcon[c.trend]}
                    <span className="text-xs text-muted-foreground capitalize">{c.trend}</span>
                  </div>
                </div>
                <ScoreGauge score={c.overall_score} size="sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedCountry && (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Select a country</h3>
              <p className="text-sm text-muted-foreground">Choose a country to view detailed resilience metrics and city breakdowns</p>
            </div>
          )}

          {countryDetail?.country && (
            <>
              {/* Country Overview */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-card-foreground text-lg">{countryDetail.country.country}</h3>
                  <div className="flex items-center gap-2">
                    {trendIcon[countryDetail.country.trend]}
                    <span className="text-sm capitalize">{countryDetail.country.trend}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <ScoreGauge score={countryDetail.country.overall_score} label="Overall" size="lg" />
                  <div className="flex-1 grid grid-cols-3 sm:grid-cols-5 gap-3 w-full">
                    {metricMeta.map((m) => (
                      <div key={m.key} className="text-center">
                        <div className={`mx-auto mb-1 ${m.color}`}>{m.icon}</div>
                        <ScoreGauge score={(countryDetail.country as any)[m.key]} size="sm" />
                        <p className="text-[10px] text-muted-foreground mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* City Breakdown */}
              {(countryDetail.cities as ResilienceScore[]).length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-semibold text-card-foreground mb-4">City Breakdown</h4>
                  <div className="space-y-3">
                    {(countryDetail.cities as ResilienceScore[]).map((city) => (
                      <div key={city.id} className="p-4 rounded-lg bg-muted">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{city.city}</h5>
                            {trendIcon[city.trend]}
                          </div>
                          <ScoreGauge score={city.overall_score} size="sm" />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {metricMeta.map((m) => {
                            const val = (city as any)[m.key] ?? 0;
                            return (
                              <div key={m.key} className="text-center">
                                <div className="h-2 rounded-full bg-background overflow-hidden mb-1">
                                  <div className={`h-full rounded-full ${val >= 70 ? "bg-green-500" : val >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${val}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">{val}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Methodology */}
              {countryDetail.methodology && (
                <div className="p-4 rounded-xl bg-muted">
                  <p className="text-xs text-muted-foreground">{countryDetail.methodology}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
