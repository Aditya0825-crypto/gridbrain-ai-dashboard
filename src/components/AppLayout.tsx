import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AlertBanner } from "./AlertBanner";
import { GridBrainAgent } from "./GridBrainAgent";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function AppLayout() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { language } = useLanguage();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background relative">
        {/* global aurora */}
        <div className="pointer-events-none fixed inset-0 bg-aurora opacity-50" />

        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <AlertBanner />
          {/* System status strip */}
          <div className="h-6 px-4 flex items-center justify-between text-[10px] font-mono text-muted-foreground border-b border-border/40 bg-background/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span>GRIDBRAIN OS · v2.4.1</span>
              <span className="hidden sm:inline">REGION: KA-BLR-01</span>
              <span className="hidden md:inline">UPTIME: 99.982%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">SCADA: SYNCED</span>
              <span className="hidden md:inline">LATENCY: 42ms</span>
              <span>{new Date().toLocaleString(language === "kn" ? "kn-IN" : "en-IN", { timeZone: "Asia/Kolkata", hour12: false }).replace(",", " ·")} IST</span>
            </div>
          </div>
          <header className="h-14 flex items-center gap-3 px-4 border-b border-border/60 backdrop-blur-xl bg-background/40 sticky top-0 z-30">
            <SidebarTrigger className="hover:bg-muted/50" />
            <div className="hidden md:flex items-center gap-2 glass rounded-lg px-3 py-1.5 w-72">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search zones, transformers, alerts…"
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted">⌘K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <LanguageSwitcher />
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
                Live · Bengaluru Grid
              </span>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-danger" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground ml-1">
                BC
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <Outlet />
          </main>
          <GridBrainAgent />
        </div>
      </div>
    </SidebarProvider>
  );
}
