import { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Users,
  Building2,
  Handshake,
  Receipt,
  UserPlus,
  FileText,
  ShoppingCart,
  CreditCard,
  Package,
  User,
  Settings,
  Globe,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Breadcrumbs } from "./Breadcrumbs";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

type Language = "en" | "fr" | "ar";

const translationsData = {
  en: { name: "English", native: "English" },
  fr: { name: "French", native: "Français" },
  ar: { name: "Arabic", native: "العربية" },
};

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function TopBar({ title }: { title: string }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotificationCount", userId],
    queryFn: () => userId ? api.settings.getUnreadNotificationCount(userId).catch(() => 0) : 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const [language, setLanguage] = useState<Language>(
    (i18n.language as Language) || "en"
  );

  const handleNew = (type: string, path: string) => {
    toast.success(`New ${type} form opened`);
    navigate(path);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    Cookies.set("language", lang);
    localStorage.setItem("language", lang);
    toast.success(`${t('common.language')} changed to ${translationsData[lang].native}`);
    
    // Handle RTL and Metadata
    const html = document.documentElement;
    if (lang === 'ar') {
      html.dir = 'rtl';
      html.lang = 'ar';
    } else {
      html.dir = 'ltr';
      html.lang = lang;
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={t('common.searchPlaceholder')}
            className="h-9 w-64 rounded-lg border border-input bg-background ps-9 pe-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative group" onClick={() => navigate("/settings/notifications")}>
          <Bell className="h-4 w-4 group-hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> {t('common.new')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('common.new')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNew("Lead", "/leads?create=true")}>
              <UserPlus className="h-4 w-4 mr-2" /> {t('nav.leads')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Contact", "/contacts?create=true")}>
              <Users className="h-4 w-4 mr-2" /> {t('nav.contacts')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Account", "/accounts?create=true")}>
              <Building2 className="h-4 w-4 mr-2" /> {t('nav.accounts')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Deal", "/deals?create=true")}>
              <Handshake className="h-4 w-4 mr-2" /> {t('nav.deals')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNew("Quote", "/quotes/new")}>
              <FileText className="h-4 w-4 mr-2" /> {t('nav.quotes')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Order", "/orders?create=true")}>
              <ShoppingCart className="h-4 w-4 mr-2" /> {t('nav.orders')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Invoice", "/invoices?create=true")}>
              <Receipt className="h-4 w-4 mr-2" /> {t('nav.invoices')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Payment", "/payments?create=true")}>
              <CreditCard className="h-4 w-4 mr-2" /> {t('nav.payments')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNew("Product", "/products/new")}>
              <Package className="h-4 w-4 mr-2" /> {t('nav.products')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user.name || "User"}</span>
                <span className="text-xs text-muted-foreground">{user.email || ""}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="h-4 w-4 mr-2" /> {t('common.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" /> {t('common.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Globe className="h-4 w-4 mr-2" /> {t('common.language')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                  <span className={language === "en" ? "font-bold" : ""}>{t('common.english')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("fr")}>
                  <span className={language === "fr" ? "font-bold" : ""}>{t('common.french')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("ar")}>
                  <span className={language === "ar" ? "font-bold" : ""}>{t('common.arabic')}</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" /> {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
