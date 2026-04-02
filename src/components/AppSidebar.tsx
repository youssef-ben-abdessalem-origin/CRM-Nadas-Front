import { NavLink, useLocation } from "react-router-dom";
import logoBig from "@/assets/logo-big.png";
import logoSmall from "@/assets/logo-small.png";
import {
  LayoutDashboard,
  Users,
  Building2,
  Handshake,
  Receipt,
  Mail,
  Settings,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Package,
  FileText,
  ShoppingCart,
  CreditCard,
  Calendar,
  FileSearch,
  Bell,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "",
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/" }],
  },
  {
    label: "Sales",
    items: [
      { label: "Leads", icon: UserPlus, path: "/leads" },
      { label: "Contacts", icon: Users, path: "/contacts" },
      { label: "Accounts", icon: Building2, path: "/accounts" },
      { label: "Deals", icon: Handshake, path: "/deals" },
    ],
  },
  {
    label: "Sales Documents",
    items: [
      { label: "Quotes", icon: FileText, path: "/quotes" },
      { label: "Orders", icon: ShoppingCart, path: "/orders" },
      { label: "Invoices", icon: Receipt, path: "/invoices" },
      { label: "Payments", icon: CreditCard, path: "/payments" },
    ],
  },
  {
    label: "Catalog",
    items: [{ label: "Products", icon: Package, path: "/products" }],
  },
  {
    label: "Communication",
    items: [{ label: "Emails", icon: Mail, path: "/emails" }],
  },
  {
    label: "Productivity",
    items: [
      { label: "Calendar", icon: Calendar, path: "/calendar" },
      { label: "Activities", icon: Zap, path: "/activities" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Reports", icon: BarChart3, path: "/reports" },
      { label: "Automations", icon: Zap, path: "/automations" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Team", icon: Users, path: "/team" },
      { label: "Audit Logs", icon: FileSearch, path: "/audit-logs" },
      { label: "Notifications", icon: Bell, path: "/notifications" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`flex flex-col h-screen bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[hsl(var(--sidebar-border))]">
        <img
          src={collapsed ? logoSmall : logoBig}
          alt="CRM Suite"
          className={`shrink-0 brightness-0 invert transition-all duration-200 ${collapsed ? "h-8 w-10" : "h-12"}`}
        />
      </div>

      <nav className="flex-1 p-2 space-y-3 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!collapsed && section.label && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-fg))] opacity-50">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`sidebar-item ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 mx-2 mb-2 rounded-lg text-[hsl(var(--sidebar-fg))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
