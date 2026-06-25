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
  Shield,
  Lock,
  CheckSquare,
  TrendingUp,
  Megaphone,
  Clock,
  Timer,
  AlarmCheck,
  FileSpreadsheet,
  Download,
  Landmark,
  Gift,
  PenLine,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type NavItem = {
  label: string; // T-key
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: NavItem[];
  locked?: boolean;
};

type NavSection = {
  label: string; // T-key
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "",
    items: [{ label: "nav.dashboard", icon: LayoutDashboard, path: "/" }],
  },
  {
    label: "nav.sections.sales",
    items: [
      {
        label: "nav.campaigns",
        icon: Megaphone,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/campaigns" },
          // { label: "nav.labels.settings", icon: Settings, path: "/campaigns/settings" },
        ],
      },
      {
        label: "nav.leads",
        icon: UserPlus,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/leads" },
          { label: "nav.labels.settings", icon: Settings, path: "/leads/settings" },
        ],
      },
      {
        label: "nav.contacts",
        icon: Users,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/contacts" },
          { label: "nav.labels.settings", icon: Settings, path: "/contacts/settings" },
        ],
      },
      {
        label: "nav.accounts",
        icon: Building2,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/accounts" },
          { label: "nav.labels.settings", icon: Settings, path: "/accounts/settings" },
        ],
      },
      {
        label: "nav.deals",
        icon: Handshake,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/deals" },
          { label: "nav.labels.settings", icon: Settings, path: "/deals/settings" },
        ],
      },
    ],
  },
  {
    label: "nav.sections.salesDocuments",
    items: [
      { label: "nav.quotes", icon: FileText, path: "/quotes" },
      { label: "nav.invoices", icon: Receipt, path: "/invoices" },
      { label: "nav.payments", icon: CreditCard, path: "/payments" },
    ],
  },
  {
    label: "nav.sections.catalog",
    items: [
      {
        label: "nav.products",
        icon: Package,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/products" },
          { label: "nav.labels.settings", icon: Settings, path: "/products/settings" },
        ],
      },
      {
        label: "nav.vendors",
        icon: Building2,
        children: [
          { label: "nav.labels.table", icon: Table2, path: "/vendors" },
          { label: "nav.labels.settings", icon: Settings, path: "/vendors/settings" },
        ],
      },
    ],
  },
  {
    label: "nav.sections.communication",
    items: [{ label: "nav.emails", icon: Mail, path: "/emails" }],
  },
  {
    label: "nav.sections.productivity",
    items: [
      { label: "nav.calendar", icon: Calendar, path: "/calendar" },
      { label: "nav.tasks", icon: CheckSquare, path: "/tasks" },
      { label: "nav.activities", icon: Zap, path: "/activities" },
    ],
  },
  {
    label: "nav.sections.hrPayroll",
    items: [
      {
        label: "nav.hr.title",
        icon: Users,
        children: [
          { label: "nav.hr.employees", icon: Users, path: "/hr/employees" },
          { label: "nav.hr.positions", icon: Building2, path: "/hr/positions" },
          { label: "Cost Centers", icon: Landmark, path: "/hr/cost-centers" },
          { label: "nav.hr.contracts", icon: FileText, path: "/hr/contracts" },
          { label: "nav.hr.documents", icon: FileText, path: "/hr/documents" },
          { label: "nav.hr.signatures", icon: PenLine, path: "/signatures" },
          { label: "nav.hr.cnssProfiles", icon: Shield, path: "/hr/cnss-profiles" },
          { label: "nav.hr.irppTaxProfiles", icon: Receipt, path: "/hr/irpp-tax-profiles" },
          { label: "nav.hr.shifts", icon: Clock, path: "/hr/shifts" },
          { label: "nav.hr.shiftAssignments", icon: Calendar, path: "/hr/shift-assignments" },
          { label: "nav.hr.overtimeRequests", icon: Timer, path: "/hr/overtime-requests" },
          { label: "nav.hr.hrSettings", icon: Settings, path: "/hr/hr-settings" },
          { label: "nav.hr.leaveBalances", icon: AlarmCheck, path: "/hr/leave-balances" },
          { label: "nav.hr.attendance", icon: Calendar, path: "/hr/attendance" },
          { label: "nav.hr.leaves", icon: FileText, path: "/hr/leaves" },
          { label: "nav.hr.employeePortal", icon: UserPlus, path: "/hr/portal" },
          { label: "nav.hr.reports", icon: BarChart3, path: "/hr/reports" },
          { label: "nav.hr.documentsGeneration", icon: FileText, path: "/hr/document-generation" },
        ],
      },
      {
        label: "nav.payroll.title",
        icon: Receipt,
        children: [
          { label: "nav.payroll.components", icon: Table2, path: "/payroll/components" },
          { label: "nav.payroll.periods", icon: Calendar, path: "/payroll/periods" },
          { label: "nav.payroll.loansAdvances", icon: CreditCard, path: "/payroll/loans-advances" },
          { label: "nav.payroll.settings", icon: Settings, path: "/payroll/settings" },
          { label: "nav.payroll.cnssDeclarations", icon: FileSpreadsheet, path: "/payroll/cnss-declarations" },
          { label: "nav.payroll.irppDeclarations", icon: FileSpreadsheet, path: "/payroll/irpp-declarations" },
          { label: "nav.payroll.bankTransfers", icon: Download, path: "/payroll/bank-transfers" },
          { label: "nav.payroll.stcSettlements", icon: Landmark, path: "/payroll/stc-settlements" },
          { label: "nav.payroll.thirteenthMonth", icon: Gift, path: "/payroll/thirteenth-month" },
        ],
      },
    ],
  },
  {
    label: "nav.sections.admin",
    items: [
      {
        label: "nav.team",
        icon: Users,
        children: [
          { label: "nav.users", icon: Users, path: "/team/users" },
          { label: "nav.departments", icon: Building2, path: "/team/departments" },
          { label: "nav.roles", icon: Shield, path: "/team/roles" },
          { label: "nav.privileges", icon: Lock, path: "/team/privileges" },
        ]
      },
      { label: "nav.labels.companyProfile", icon: Building2, path: "/settings/company" },
      { label: "nav.labels.auditLogs", icon: FileSearch, path: "/settings/audit-logs" },
      { label: "nav.labels.notifications", icon: Bell, path: "/settings/notifications" },
      { label: "nav.labels.automations", icon: Zap, path: "/automations" },
      { label: "nav.labels.settings", icon: Settings, path: "/settings" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { t } = useTranslation();
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
      className={`flex flex-col h-screen bg-[hsl(var(--sidebar-bg))] border-e border-[hsl(var(--sidebar-border))] transition-all duration-200 ${collapsed ? "w-15" : "w-60"
        }`}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[hsl(var(--sidebar-border))]">
        <img
          src={collapsed ? logoSmall : logoBig}
          alt="CRM Suite"
          className={`shrink-0 brightness-0 invert transition-all duration-200 ${collapsed ? "h-8 w-10" : "h-12"
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
                {t(section.label)}
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
                      className={`sidebar-item ${active ? "sidebar-item-active" : "sidebar-item-inactive"
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
                        className={`sidebar-item w-full ${active ? "sidebar-item-active" : "sidebar-item-inactive"
                          }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-start">{t(item.label)}</span>
                        <ChevronDown
                          className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ms-4 mt-1 space-y-0.5 border-s border-muted ps-2">
                          {item.children?.map((child) => {
                            const childActive =
                              location.pathname === child.path;
                            return (
                              <NavLink
                                key={child.path}
                                to={child.path || "/"}
                                className={`sidebar-item text-sm ${childActive
                                  ? "sidebar-item-active"
                                  : "sidebar-item-inactive"
                                  }`}
                              >
                                <child.icon className="h-3.5 w-3.5 shrink-0" />
                                <span>{t(child.label)}</span>
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
                    to={item.locked ? "#" : (item.path || "/")}
                    onClick={item.locked ? (e) => e.preventDefault() : undefined}
                    className={`sidebar-item group relative ${active ? "sidebar-item-active" : "sidebar-item-inactive"
                      } ${item.locked ? "opacity-60 cursor-not-allowed grayscale" : ""}`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{t(item.label)}</span>
                    {item.locked && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Lock className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-[9px] font-bold uppercase tracking-tighter px-1 py-0.5 rounded bg-muted/40 text-muted-foreground leading-none hidden group-hover:inline-block">Soon</span>
                      </div>
                    )}
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
