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

type Language = "en" | "fr" | "ar";

const translations = {
  en: { name: "English", native: "English" },
  fr: { name: "French", native: "Français" },
  ar: { name: "Arabic", native: "العربية" },
};

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function TopBar({ title }: { title: string }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotificationCount", userId],
    queryFn: () => userId ? api.settings.getUnreadNotificationCount(userId).catch(() => 0) : 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const [language, setLanguage] = useState<Language>(
    (Cookies.get("language") as Language) || "en"
  );

  const handleNew = (type: string, path: string) => {
    toast.success(`New ${type} form opened`);
    navigate(path);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    Cookies.set("language", lang);
    toast.success(`Language changed to ${translations[lang].native}`);
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative group" onClick={() => navigate("/settings/notifications")}>
          <Bell className="h-4 w-4 group-hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNew("Lead", "/leads")}>
              <UserPlus className="h-4 w-4 mr-2" /> Lead
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Contact", "/contacts")}>
              <Users className="h-4 w-4 mr-2" /> Contact
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Account", "/accounts")}>
              <Building2 className="h-4 w-4 mr-2" /> Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Deal", "/deals")}>
              <Handshake className="h-4 w-4 mr-2" /> Deal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNew("Quote", "/quotes")}>
              <FileText className="h-4 w-4 mr-2" /> Quote
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Order", "/orders")}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Invoice", "/invoices")}>
              <Receipt className="h-4 w-4 mr-2" /> Invoice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNew("Payment", "/payments")}>
              <CreditCard className="h-4 w-4 mr-2" /> Payment
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNew("Product", "/products")}>
              <Package className="h-4 w-4 mr-2" /> Product
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
              <User className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Globe className="h-4 w-4 mr-2" /> Language
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleLanguageChange("en")}>
                  <span className={language === "en" ? "font-bold" : ""}>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("fr")}>
                  <span className={language === "fr" ? "font-bold" : ""}>Français</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange("ar")}>
                  <span className={language === "ar" ? "font-bold" : ""}>العربية</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
