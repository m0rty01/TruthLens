"use client";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui";
import { MapPin, Loader2, Filter, TrendingUp, AlertTriangle, Calendar, Globe } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { incidentsApi } from "@/lib/api";
import type { Incident } from "@/types";

interface ExtendedIncident {
  id: string;
  title: string;
  category: string;
  country: string;
  city: string;
  status: string;
  reportedAt: string;
  severity: string;
  description: string;
  reporter: string;
}

const extendedIncidents: ExtendedIncident[] = [
  { id: "inc-001", title: "Verbal harassment at grocery store", category: "Public Harassment", country: "Canada", city: "Brampton", status: "reviewed", reportedAt: "2026-06-08", severity: "Medium", description: "Individual verbally harassed while shopping, told to 'go back home'", reporter: "Anonymous" },
  { id: "inc-002", title: "Discriminatory rental rejection", category: "Housing", country: "Canada", city: "Toronto", status: "verified", reportedAt: "2026-06-07", severity: "High", description: "Rental application rejected with discriminatory comments about nationality", reporter: "Verified User" },
  { id: "inc-003", title: "Workplace discrimination", category: "Workplace", country: "United States", city: "San Jose", status: "reviewed", reportedAt: "2026-06-06", severity: "High", description: "Passed over for promotion with discriminatory remarks from management", reporter: "Anonymous" },
  { id: "inc-004", title: "Online harassment campaign", category: "Online", country: "Canada", city: "Vancouver", status: "verified", reportedAt: "2026-06-09", severity: "Critical", description: "Coordinated online harassment campaign targeting individual on social media", reporter: "Verified User" },
  { id: "inc-005", title: "Hate graffiti near temple", category: "Hate Crime", country: "Canada", city: "Surrey", status: "verified", reportedAt: "2026-06-05", severity: "Critical", description: "Hate symbols and messages spray-painted near Hindu temple entrance", reporter: "Community Org" },
  { id: "inc-006", title: "Racist comments at university", category: "Education", country: "Canada", city: "Toronto", status: "reviewed", reportedAt: "2026-06-04", severity: "Medium", description: "Racist comments during class discussion about immigration", reporter: "Student" },
  { id: "inc-007", title: "Housing discrimination in rental", category: "Housing", country: "United Kingdom", city: "London", status: "verified", reportedAt: "2026-06-03", severity: "High", description: "Landlord refused to rent citing 'too many Indians in the building'", reporter: "Verified User" },
  { id: "inc-008", title: "Online doxxing attempt", category: "Online", country: "Australia", city: "Melbourne", status: "reviewed", reportedAt: "2026-06-02", severity: "High", description: "Personal information shared online with threatening messages", reporter: "Anonymous" },
];

export default function HeatmapPage() {
  const { data: incidents, loading } = useApi<Incident[]>(() => incidentsApi.list(), []);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const allIncidents: ExtendedIncident[] = [
    ...extendedIncidents,
    ...(incidents ?? [])
      .filter((i) => !extendedIncidents.find((e) => e.id === i.id))
      .map((i) => ({ id: i.id, title: i.title, category: i.category, country: i.country, city: i.city || "Unknown", status: i.status, reportedAt: i.reportedAt, severity: "Medium", description: i.description, reporter: i.reportedBy })),
  ];

  const categories = ["all", ...new Set(allIncidents.map((i) => i.category))];
  const countries = ["all", ...new Set(allIncidents.map((i) => i.country))];

  const filtered = allIncidents.filter((i) => {
    return (categoryFilter === "all" || i.category === categoryFilter) && (countryFilter === "all" || i.country === countryFilter);
  });

  const countryCounts = useMemo(() => {
    const counts: Record<string, { total: number; cities: Record<string, number> }> = {};
    allIncidents.forEach((i) => {
      const country = i.country;
      const city = i.city || "Unknown";
      if (!counts[country]) counts[country] = { total: 0, cities: {} };
      counts[country].total++;
      counts[country].cities[city] = (counts[country].cities[city] || 0) + 1;
    });
    return counts;
  }, [allIncidents]);

  const cityCounts = useMemo(() => {
    const counts: Record<string, { count: number; country: string; categories: string[] }> = {};
    allIncidents.forEach((i) => {
      const city = i.city || "Unknown";
      if (!counts[city]) counts[city] = { count: 0, country: i.country, categories: [] };
      counts[city].count++;
      if (!counts[city].categories.includes(i.category)) counts[city].categories.push(i.category);
    });
    return Object.entries(counts).sort((a, b) => b[1].count - a[1].count);
  }, [allIncidents]);

  const severityColors: Record<string, string> = { Critical: "bg-red-100 text-red-700", High: "bg-orange-100 text-orange-700", Medium: "bg-yellow-100 text-yellow-700", Low: "bg-green-100 text-green-700" };

  return (
    <div className="space-y-6">
      <PageHeader title="Incident Heatmap" description="Geographic distribution of reported incidents across countries and cities" />

      {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}

      {/* Country Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(countryCounts).map(([country, data]) => (
          <div key={country} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">{country}</h3>
            </div>
            <p className="text-3xl font-bold text-card-foreground">{data.total}</p>
            <p className="text-xs text-muted-foreground">{Object.keys(data.cities).length} cities</p>
            <div className="mt-3 space-y-1">
              {Object.entries(data.cities).slice(0, 3).map(([city, count]) => (
                <div key={city} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{city}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* City Hotspots */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> City Hotspots
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cityCounts.map(([city, data]) => (
            <div key={city} className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{city}</span>
                <span className="text-lg font-bold text-primary">{data.count}</span>
              </div>
              <p className="text-xs text-muted-foreground">{data.country}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {data.categories.slice(0, 2).map((cat) => (
                  <span key={cat} className="px-1.5 py-0.5 rounded text-xs bg-card text-muted-foreground">{cat}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="h-72 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Interactive heatmap visualization</p>
            <p className="text-xs text-muted-foreground mt-1">{allIncidents.length} incidents across {Object.keys(countryCounts).length} countries</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
          {countries.map((c) => <option key={c} value={c}>{c === "all" ? "All Countries" : c}</option>)}
        </select>
      </div>

      {/* Incident Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-card-foreground">Incident Details</h3>
          <p className="text-xs text-muted-foreground mt-1">{filtered.length} incidents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Incident</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Location</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Severity</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr key={inc.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-card-foreground">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{inc.description}</p>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{inc.city}, {inc.country}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded text-xs bg-muted">{inc.category}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(inc.reportedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[inc.severity] || "bg-gray-100 text-gray-700"}`}>{inc.severity}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inc.status === "verified" ? "bg-green-100 text-green-700" : inc.status === "reviewed" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{inc.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
