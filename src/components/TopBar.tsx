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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Breadcrumbs } from "./Breadcrumbs";

export function TopBar({ title }: { title: string }) {
  const navigate = useNavigate();

  const handleNew = (type: string, path: string) => {
    toast.success(`New ${type} form opened`);
    navigate(path);
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
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
      </div>
    </header>
  );
}
