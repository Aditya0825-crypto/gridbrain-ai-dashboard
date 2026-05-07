import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BarChart3, ShieldAlert, MapPinned, FlaskConical, Settings, Zap,
  Brain, FileText, ScrollText, Landmark, Users, BookOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
};

const sections: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      { title: "Overview", url: "/", icon: LayoutDashboard },
      { title: "Demand Analytics", url: "/demand", icon: BarChart3 },
      { title: "Risk Intelligence", url: "/risk", icon: ShieldAlert, badge: "3" },
      { title: "Infrastructure", url: "/infrastructure", icon: MapPinned },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { title: "Simulation Lab", url: "/simulation", icon: FlaskConical, highlight: true },
      { title: "Explainable AI", url: "/explainable-ai", icon: Brain, badge: "XAI" },
    ],
  },
  {
    label: "Governance",
    items: [
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Audit Log", url: "/audit", icon: ScrollText },
      { title: "Government", url: "/government", icon: Landmark },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Users & Roles", url: "/users", icon: Users },
      { title: "Documentation", url: "/docs", icon: BookOpen },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-base leading-tight tracking-tight">
                GridBrain<span className="text-primary">.AI</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
                EV Grid Intelligence
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mx-2 mb-2 px-2.5 py-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/30">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-muted-foreground uppercase tracking-wider">Tenant</span>
              <span className="text-foreground">BESCOM · KA</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-0.5">
              <span className="text-muted-foreground uppercase tracking-wider">Clearance</span>
              <span className="text-primary">L3 · OPERATOR</span>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2">
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 px-2 mt-2">
                {section.label}
              </SidebarGroupLabel>
            )}
            {collapsed && (
              <div className="h-px mx-2 my-1 bg-sidebar-border/60" />
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "h-9 rounded-md transition-all relative group",
                          active && "bg-sidebar-accent text-sidebar-accent-foreground",
                          item.highlight && !active && "text-primary"
                        )}
                      >
                        <NavLink to={item.url} className="flex items-center gap-3">
                          {active && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gradient-primary glow-primary" />
                          )}
                          <item.icon className={cn("w-4 h-4 shrink-0", active && "text-primary")} />
                          {!collapsed && (
                            <span className="text-[13px] font-medium flex-1 truncate">{item.title}</span>
                          )}
                          {!collapsed && item.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-mono px-1.5 py-0.5 rounded border",
                                item.highlight
                                  ? "bg-primary/15 text-primary border-primary/30"
                                  : item.badge === "XAI"
                                  ? "bg-accent/15 text-accent border-accent/30"
                                  : "bg-danger/15 text-danger border-danger/30"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-2 m-1">
            <div className="glass rounded-lg p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
                <span className="text-[10px] font-mono uppercase text-success tracking-wider">All Systems Operational</span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono">
                <span className="text-muted-foreground">Zones</span><span className="text-right">12 / 12</span>
                <span className="text-muted-foreground">SCADA</span><span className="text-right text-success">SYNC</span>
                <span className="text-muted-foreground">Model</span><span className="text-right">v4.2.1</span>
                <span className="text-muted-foreground">Sync</span><span className="text-right">2s ago</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-1">
              <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground shrink-0">
                BC
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate">BESCOM Control</p>
                <p className="text-[9px] text-muted-foreground font-mono truncate">ops@bescom.gov.in</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-2">
            <span className="w-2 h-2 rounded-full bg-success animate-glow-pulse" />
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
              BC
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
