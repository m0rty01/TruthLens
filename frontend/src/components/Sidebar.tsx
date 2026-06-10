"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Radar,
  Flame,
  ShieldCheck,
  BarChart3,
  Eye,
  GitBranch,
  Network,
  UserCheck,
  Bot,
  Flag,
  MapPin,
  BookOpen,
  Shield,
  Users,
  GraduationCap,
  Trophy,
  Scale,
  TrendingUp,
  FileText,
  BrainCircuit,
  MessageSquare,
  UserCog,
  LayoutDashboard,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
  Plug,
  AlertTriangle,
  Heart,
  Activity,
  Link2,
  ShieldAlert,
  Database,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Intelligence",
    items: [
      { label: "Narrative Radar", href: "/narratives", icon: <Radar className="w-4 h-4" /> },
      { label: "Viral Content", href: "/viral-content", icon: <Flame className="w-4 h-4" /> },
      { label: "Claim Verification", href: "/claims", icon: <ShieldCheck className="w-4 h-4" /> },
      { label: "Exaggeration Index", href: "/exaggeration", icon: <BarChart3 className="w-4 h-4" /> },
      { label: "AI Detection", href: "/ai-detection", icon: <Eye className="w-4 h-4" /> },
      { label: "Narrative Origin", href: "/origin", icon: <GitBranch className="w-4 h-4" /> },
      { label: "Amplification Networks", href: "/networks", icon: <Network className="w-4 h-4" /> },
      { label: "Actor Attribution", href: "/attribution", icon: <UserCheck className="w-4 h-4" /> },
      { label: "Bot Detection", href: "/bot-detection", icon: <Bot className="w-4 h-4" /> },
    ],
  },
  {
    title: "Impact",
    items: [
      { label: "Harm Intelligence", href: "/harm-intelligence", icon: <AlertTriangle className="w-4 h-4" /> },
      { label: "Correlation Engine", href: "/correlation", icon: <Link2 className="w-4 h-4" /> },
      { label: "Early Warning", href: "/early-warning", icon: <ShieldAlert className="w-4 h-4" /> },
      { label: "Resilience Index", href: "/resilience", icon: <Heart className="w-4 h-4" /> },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Reporting Hub", href: "/report", icon: <Flag className="w-4 h-4" /> },
      { label: "Incident Heatmap", href: "/heatmap", icon: <MapPin className="w-4 h-4" /> },
      { label: "Response Playbooks", href: "/playbooks", icon: <BookOpen className="w-4 h-4" /> },
      { label: "Harassment Toolkit", href: "/harassment-toolkit", icon: <Shield className="w-4 h-4" /> },
      { label: "Community Toolkit", href: "/community-toolkit", icon: <Users className="w-4 h-4" /> },
      { label: "Moderator Queue", href: "/moderator", icon: <UserCheck className="w-4 h-4" /> },
    ],
  },
  {
    title: "Knowledge",
    items: [
      { label: "Educational KB", href: "/learn", icon: <GraduationCap className="w-4 h-4" /> },
      { label: "Contributions", href: "/contributions", icon: <Trophy className="w-4 h-4" /> },
      { label: "Myth vs Reality", href: "/myths", icon: <Scale className="w-4 h-4" /> },
      { label: "Economic Impact", href: "/economic-impact", icon: <TrendingUp className="w-4 h-4" /> },
      { label: "Research Portal", href: "/research", icon: <Database className="w-4 h-4" /> },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Monthly Reports", href: "/reports", icon: <FileText className="w-4 h-4" /> },
      { label: "Narrative Forecast", href: "/forecast", icon: <Zap className="w-4 h-4" /> },
      { label: "Harm Dashboard", href: "/harm-dashboard", icon: <Activity className="w-4 h-4" /> },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { label: "AI Copilot", href: "/copilot", icon: <MessageSquare className="w-4 h-4" /> },
      { label: "Personal Advisor", href: "/advisor", icon: <UserCog className="w-4 h-4" /> },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Integrations", href: "/integrations", icon: <Plug className="w-4 h-4" /> },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar-bg text-sidebar-fg h-screen sticky top-0 transition-all duration-300 border-r border-slate-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800 shrink-0">
        <BrainCircuit className="w-7 h-7 text-sidebar-accent shrink-0" />
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">TruthLens</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Dashboard link */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-4",
            pathname === "/"
              ? "bg-sidebar-accent/20 text-white"
              : "text-slate-400 hover:bg-sidebar-muted hover:text-white"
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent/20 text-white"
                      : "text-slate-400 hover:bg-sidebar-muted hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-slate-800 text-slate-400 hover:text-white hover:bg-sidebar-muted transition-colors shrink-0"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
