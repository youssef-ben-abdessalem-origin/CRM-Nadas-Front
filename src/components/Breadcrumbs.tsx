import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const routeLabels: Record<string, string> = {
  "/": "nav.dashboard",
  "/leads": "nav.leads",
  "/contacts": "nav.contacts",
  "/accounts": "nav.accounts",
  "/deals": "nav.deals",
  "/quotes": "nav.quotes",
  "/orders": "nav.orders",
  "/invoices": "nav.invoices",
  "/payments": "nav.payments",
  "/products": "nav.products",
  "/activities": "nav.activities",
  "/automations": "nav.labels.automations",
  "/vendors": "nav.vendors",
  "/settings": "nav.labels.settings",
};

export function Breadcrumbs() {
  const { t } = useTranslation();
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs: { label: string; path: string }[] = [
    { label: t("nav.dashboard"), path: "/" },
  ];

  if (segments.length > 0) {
    let accumulated = "";
    for (const seg of segments) {
      accumulated += `/${seg}`;
      const translatedLabel = routeLabels[accumulated] ? t(routeLabels[accumulated]) : null;
      crumbs.push({
        label: translatedLabel || seg.charAt(0).toUpperCase() + seg.slice(1),
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
