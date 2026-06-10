"use client";
import { useState } from "react";
import { PageHeader, DashboardCard } from "@/components/ui";
import { TrendingUp, Building, Briefcase, DollarSign, Lightbulb, GraduationCap, Heart, Globe, Award } from "lucide-react";

const countryData = [
  { country: "United States", businesses: 18000, jobs: 890000, taxBillions: 45, patents: 5200, students: 260000 },
  { country: "Canada", businesses: 12000, jobs: 520000, taxBillions: 22, patents: 3100, students: 320000 },
  { country: "United Kingdom", businesses: 8500, jobs: 340000, taxBillions: 12, patents: 2200, students: 95000 },
  { country: "Australia", businesses: 4200, jobs: 180000, taxBillions: 6, patents: 1200, students: 120000 },
  { country: "Germany", businesses: 2300, jobs: 170000, taxBillions: 4, patents: 700, students: 45000 },
];

const sectorBreakdown = [
  { sector: "Technology", percentage: 35, companies: 15600, jobs: 780000 },
  { sector: "Healthcare", percentage: 18, companies: 8100, jobs: 340000 },
  { sector: "Finance", percentage: 15, companies: 6700, jobs: 290000 },
  { sector: "Education", percentage: 12, companies: 5400, jobs: 250000 },
  { sector: "Manufacturing", percentage: 10, companies: 4500, jobs: 210000 },
  { sector: "Other", percentage: 10, companies: 4700, jobs: 230000 },
];

const notableStats = [
  { label: "Fortune 500 CEOs", value: "5", icon: <Award className="w-5 h-5" /> },
  { label: "Unicorn Founders", value: "78+", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Nobel Laureates", value: "12", icon: <Lightbulb className="w-5 h-5" /> },
  { label: "Patent Holders", value: "12,400+", icon: <Globe className="w-5 h-5" /> },
];

export default function EconomicImpactPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const selected = countryData.find((c) => c.country === selectedCountry);

  return (
    <div className="space-y-6">
      <PageHeader title="Economic Impact Dashboard" description="Data-driven view of economic contributions by Indian diaspora" />

      {/* Top-Level Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard title="Businesses Founded" value="45,000+" subtitle="In last decade" icon={<Building className="w-5 h-5" />} trend="up" />
        <DashboardCard title="Jobs Created" value="2.1M+" subtitle="Direct employment" icon={<Briefcase className="w-5 h-5" />} trend="up" />
        <DashboardCard title="Tax Contributions" value="$89B" subtitle="Annual contribution" icon={<DollarSign className="w-5 h-5" />} trend="up" />
        <DashboardCard title="Patents Filed" value="12,400+" subtitle="Innovation output" icon={<Lightbulb className="w-5 h-5" />} trend="up" />
      </div>

      {/* Notable Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {notableStats.map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-card-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Country Breakdown */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Contribution by Country</h3>
        <div className="space-y-4">
          {countryData.map((c) => (
            <div key={c.country}>
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setSelectedCountry(selectedCountry === c.country ? null : c.country)}
              >
                <span className="text-sm font-medium w-32 group-hover:text-primary transition-colors">{c.country}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all" style={{ width: `${(c.taxBillions / 45) * 100}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-20 text-right">${c.taxBillions}B</span>
              </div>
              {selectedCountry === c.country && (
                <div className="ml-32 mt-2 mb-2 grid grid-cols-4 gap-3">
                  <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Businesses</p><p className="text-sm font-semibold">{c.businesses.toLocaleString()}</p></div>
                  <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Jobs</p><p className="text-sm font-semibold">{c.jobs.toLocaleString()}</p></div>
                  <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Patents</p><p className="text-sm font-semibold">{c.patents.toLocaleString()}</p></div>
                  <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">Students</p><p className="text-sm font-semibold">{c.students.toLocaleString()}</p></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-card-foreground mb-4">Sector Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectorBreakdown.map((s) => (
            <div key={s.sector} className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{s.sector}</span>
                <span className="text-lg font-bold text-primary">{s.percentage}%</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden mb-2">
                <div className="h-full bg-primary rounded-full" style={{ width: `${s.percentage}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{s.companies.toLocaleString()} companies</span>
                <span>{s.jobs.toLocaleString()} jobs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> Education Impact</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Indian students contribute <span className="font-semibold text-card-foreground">$17.8B</span> annually to host country economies</p>
            <p>Over <span className="font-semibold text-card-foreground">840,000</span> Indian students study abroad</p>
            <p>Indian students are the <span className="font-semibold text-card-foreground">#1 source</span> of international students in US, Canada, and Australia</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-card-foreground mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Healthcare Impact</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Indian-origin doctors represent <span className="font-semibold text-card-foreground">8%</span> of US physicians</p>
            <p>Over <span className="font-semibold text-card-foreground">25,000</span> Indian nurses work in UK's NHS</p>
            <p>Indian pharmaceutical industry supplies <span className="font-semibold text-card-foreground">20%</span> of global generic medicines</p>
          </div>
        </div>
      </div>
    </div>
  );
}
