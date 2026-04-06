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
  ChevronDown,
  UserPlus,
  Package,
  FileText,
  ShoppingCart,
  CreditCard,
  Calendar,
  FileSearch,
  Bell,
  Table2,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: NavItem[];
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
      {
        label: "Leads",
        icon: UserPlus,
        children: [
          { label: "Table", icon: Table2, path: "/leads" },
          { label: "Settings", icon: Settings, path: "/leads/settings" },
        ],
      },
      {
        label: "Contacts",
        icon: Users,
        children: [
          { label: "Table", icon: Table2, path: "/contacts" },
          { label: "Settings", icon: Settings, path: "/contacts/settings" },
        ],
      },
      {
        label: "Accounts",
        icon: Building2,
        children: [
          { label: "Table", icon: Table2, path: "/accounts" },
          { label: "Settings", icon: Settings, path: "/accounts/settings" },
        ],
      },
      {
        label: "Deals",
        icon: Handshake,
        children: [
          { label: "Table", icon: Table2, path: "/deals" },
          { label: "Settings", icon: Settings, path: "/deals/settings" },
        ],
      },
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
    items: [
      {
        label: "Products",
        icon: Package,
        children: [
          { label: "Table", icon: Table2, path: "/products" },
          { label: "Settings", icon: Settings, path: "/products/settings" },
        ],
      },
    ],
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
      { label: "Audit Logs", icon: FileSearch, path: "/settings/audit-logs" },
      { label: "Notifications", icon: Bell, path: "/settings/notifications" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (item: NavItem) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-200 ${
        collapsed ? "w-15" : "w-60"
      }`}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[hsl(var(--sidebar-border))]">
        <img
          src={collapsed ? logoSmall : logoBig}
          alt="CRM Suite"
          className={`shrink-0 brightness-0 invert transition-all duration-200 ${
            collapsed ? "h-8 w-10" : "h-12"
          }`}
        />
      </div>

      <nav
        className="flex-1 p-2 space-y-3 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "hsl(var(--primary)) transparent",
        }}
      >
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {!collapsed && section.label && (
              <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-fg))] opacity-50">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems.includes(item.label);
                const active = isActive(item);

                if (collapsed) {
                  return (
                    <NavLink
                      key={item.label}
                      to={item.children?.[0]?.path || "/"}
                      className={`sidebar-item ${
                        active ? "sidebar-item-active" : "sidebar-item-inactive"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                    </NavLink>
                  );
                }

                if (hasChildren) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`sidebar-item w-full ${
                          active ? "sidebar-item-active" : "sidebar-item-inactive"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-0.5 border-l border-muted pl-2">
                          {item.children?.map((child) => {
                            const childActive =
                              location.pathname === child.path;
                            return (
                              <NavLink
                                key={child.path}
                                to={child.path || "/"}
                                className={`sidebar-item text-sm ${
                                  childActive
                                    ? "sidebar-item-active"
                                    : "sidebar-item-inactive"
                                }`}
                              >
                                <child.icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{child.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.label}
                    to={item.path || "/"}
                    className={`sidebar-item ${
                      active ? "sidebar-item-active" : "sidebar-item-inactive"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
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