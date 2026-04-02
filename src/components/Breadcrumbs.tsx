import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/leads": "Leads",
  "/contacts": "Contacts",
  "/accounts": "Accounts",
  "/deals": "Deals",
  "/quotes": "Quotes",
  "/orders": "Orders",
  "/invoices": "Invoices",
  "/payments": "Payments",
  "/products": "Products",
  "/emails": "Emails",
  "/calendar": "Calendar",
  "/activities": "Activities",
  "/reports": "Reports",
  "/automations": "Automations",
  "/team": "Team",
  "/audit-logs": "Audit Logs",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs: { label: string; path: string }[] = [
    { label: "Home", path: "/" },
  ];

  if (segments.length > 0) {
    let accumulated = "";
    for (const seg of segments) {
      accumulated += `/${seg}`;
      crumbs.push({
        label: routeLabels[accumulated] || seg.charAt(0).toUpperCase() + seg.slice(1),
        path: accumulated,
      });
    }
  }

  return (
    <nav className="flex items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <div key={crumb.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            {isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {i === 0 ? (
                  <Home className="h-3.5 w-3.5" />
                ) : (
                  crumb.label
                )}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
