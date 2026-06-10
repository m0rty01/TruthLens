"use client";

import { Search, Bell, User } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 lg:h-16 px-3 lg:px-6 bg-white border-b border-border shrink-0">
      <div className="flex items-center gap-2 lg:gap-4 flex-1 pl-10 lg:pl-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-3">
        <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <button className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Account</span>
        </button>
      </div>
    </header>
  );
}
