import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  Clock,
  Building2,
  MapPin,
  Workflow,
  Link as LinkIcon,
  Users,
  DollarSign,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowLeft,
  Trash2,
  Calendar,
  Layers,
  CheckCircle,
  Tag,
  Zap,
  Target,
  BarChart3,
  Megaphone
} from "lucide-react";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

export default function DealDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dealId = Number(id);

  const { data: deal, isLoading } = useQuery({
    queryKey: ["deals", dealId],
    queryFn: () => api.deals.getOne(dealId),
    enabled: !!dealId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", "deal", dealId],
    queryFn: () => api.activities.getByEntity("deal", dealId),
    enabled: !!dealId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deals.delete(id),
    onSuccess: () => {
      toast.success("Deal deleted successfully");
      navigate("/deals");
    },
  });

  if (isLoading) {
    return (
      <CRMLayout title={t("deals.detail.pageTitle")}>
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground italic">Loading deal record...</div>
        </div>
      </CRMLayout>
    );
  }

  if (!deal) {
    return (
      <CRMLayout title="Deal Not Found">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Deal record not found.</p>
          <Button onClick={() => navigate("/deals")}>Back to Deals</Button>
        </div>
      </CRMLayout>
    );
  }

  const relatedLists = [
    { label: "Contacts", count: 0, icon: Users },
    { label: "Timeline", count: activities.length, icon: Clock },
    { label: "Tasks", count: activities.filter((a: any) => !a.completed).length, icon: CheckCircle },
    { label: "Quotes", count: 0, icon: FileText },
    { label: "Projects", count: 0, icon: Layers },
  ];

  const stageNumber = deal.stage?.order || 1;
  const totalStages = 5; // Assuming 5 stages for visualization

  return (
    <CRMLayout title={deal.name}>
      <div className="flex flex-col h-screen -m-6 bg-background">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => navigate("/deals")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10 border border-border shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {deal.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground capitalize">
                  {deal.name}
                </h1>
                {deal.stage && (
                  <Badge 
                    style={{ 
                      backgroundColor: deal.stage.color + "15", 
                      color: deal.stage.color,
                      borderColor: deal.stage.color + "30" 
                    }}
                    variant="outline"
                  >
                    {deal.stage.name}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Opportunity #{deal.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="font-bold h-8 px-4 border-border text-foreground hover:bg-muted"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1" /> Adjust Budget
            </Button>
            
            <Button 
              size="sm" 
              className="font-bold h-8 px-4 bg-primary hover:bg-primary/95 text-white"
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Won Opportunity
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border border-border">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</DropdownMenuLabel>
                <DropdownMenuItem className="text-[12px] font-semibold gap-2 cursor-pointer text-foreground">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" /> Forecast Update
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[12px] font-semibold gap-2 cursor-pointer text-foreground">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" /> Rush Operation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-[12px] font-semibold gap-2 cursor-pointer text-red-500 focus:bg-red-950/20 focus:text-red-500"
                  onClick={() => {
                    if (confirm("Are you sure you want to permanently delete this opportunity?")) {
                      deleteMutation.mutate(deal.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Purge Opportunity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-card border-r border-border overflow-y-auto shrink-0 py-4">
            <div className="px-4 mb-4">
              <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                Tactical Signals
              </h3>
            </div>
            <nav className="space-y-0.5 px-2">
              {relatedLists.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground group transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-[13px] font-medium">{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 bg-muted text-muted-foreground font-bold border-none text-[10px]">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-card border border-border p-1 rounded-lg">
                <TabsTrigger value="overview" className="font-bold text-xs uppercase px-6">OVERVIEW</TabsTrigger>
                <TabsTrigger value="products" className="font-bold text-xs uppercase px-6">SOLUTIONS</TabsTrigger>
                <TabsTrigger value="quotes" className="font-bold text-xs uppercase px-6">FINANCIALS</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
                {/* Pipeline Stage Visualization */}
                <Card className="bg-card border border-border p-6 shadow-sm rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Pipeline Stage</p>
                      <h2 className="text-xl font-bold text-primary tracking-tight uppercase mt-0.5">{deal.stage?.name || "DISCOVERY"}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated Value</p>
                      <h2 className="text-xl font-bold text-foreground tracking-tight mt-0.5">
                        <CurrencyNumbers amount={deal.value || 0} />
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-2 h-2.5 bg-muted rounded-full p-0.5 overflow-hidden">
                    {Array.from({ length: totalStages }).map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 h-1.5 rounded-full transition-all duration-500",
                          i < stageNumber ? "bg-primary" : "bg-muted/50"
                        )} 
                      />
                    ))}
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Deal Details */}
                  <Card className="lg:col-span-2 bg-card border border-border p-6 shadow-sm rounded-xl space-y-6">
                    <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">Deal Intelligence</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block font-medium">Expected Close</span>
                        <span className="text-sm font-semibold text-foreground">{formatDate(deal.expectedCloseDate)}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block font-medium">Probability Coefficient</span>
                        <span className="text-sm font-bold text-green-500 block">{deal.probability || 0}% Win Factor</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block font-medium">Decision Authority</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">DP</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-semibold text-foreground">Director Level</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block font-medium">Last Signal</span>
                        <span className="text-xs font-semibold text-foreground">{formatDate(deal.updatedAt)}</span>
                      </div>

                      {deal.campaign && (
                        <div className="space-y-1 md:col-span-2 border-t border-border pt-4 mt-2">
                          <span className="text-xs text-muted-foreground block font-medium mb-1">Source Campaign</span>
                          <Link 
                            to={`/campaigns/${deal.campaign.id}`} 
                            className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5"
                          >
                            <Megaphone className="h-4 w-4" />
                            {deal.campaign.name}
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Forecast Card */}
                  <Card className="bg-primary/5 border border-primary/10 p-6 shadow-sm rounded-xl flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-105 transition-transform">
                      <Zap className="h-32 w-32 -mr-16 -mt-16 text-primary" />
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">Forecast Status</h4>
                      <div className="text-3xl font-black tracking-tight text-foreground italic uppercase">COMMIT</div>
                      <p className="text-[11px] font-medium text-muted-foreground mt-2 leading-relaxed">
                        High-confidence opportunity included in primary forecast.
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-6 border-primary/20 bg-card hover:bg-primary/10 text-primary font-bold text-xs h-10 rounded-lg shadow-sm"
                    >
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      Calculate ROI
                    </Button>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </CRMLayout>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("animate-spin", className)}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
