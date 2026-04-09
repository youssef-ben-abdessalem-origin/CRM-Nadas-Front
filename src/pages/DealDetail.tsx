import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  BarChart3
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

export default function DealDetail() {
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
      <CRMLayout title="Deal Details">
        <div className="flex h-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  if (!deal) {
    return (
      <CRMLayout title="Deal Not Found">
        <div className="flex h-full items-center justify-center flex-col gap-4 bg-background">
          <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Target opportunity not found</p>
          <Button onClick={() => navigate("/deals")} className="bg-primary hover:bg-primary/90 font-black tracking-widest text-[10px]">BACK TO REPOSITORY</Button>
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
    <CRMLayout title={`${deal.name}`}>
      <div className="flex flex-col h-full bg-background -m-6 -mt-3">
        {/* Opportunity Context Header */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-card/40 backdrop-blur-xl border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5" onClick={() => navigate("/deals")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="h-11 w-11 border-2 border-primary/20 ring-4 ring-primary/5 shadow-2xl rounded-2xl flex items-center justify-center bg-primary/10">
                   <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-yellow-500 border-2 border-background rounded-full shadow-lg" />
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tight text-white leading-none capitalize">{deal.name}</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 h-5">
                    OPPORTUNITY #{deal.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-wider mt-1.5 grayscale opacity-60">
                   <Building2 className="h-3 w-3" />
                   <span className="hover:text-primary transition-colors cursor-pointer">{deal.account?.name || "Target Account Unassigned"}</span>
                   <span className="opacity-30">/</span>
                   <span className="text-primary/70">{deal.type?.name || "New Business"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-white/50 font-black uppercase text-[10px] tracking-widest px-4 rounded-xl hover:bg-white/10 hover:text-white transition-all">
               <DollarSign className="h-3.5 w-3.5 mr-2" /> ADJUST BUDGET
            </Button>
            
            <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 rounded-xl gap-2 tracking-widest text-[11px] active:scale-95 transition-all">
              <CheckCircle className="h-4 w-4" /> WON OPPORTUNITY
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded-xl">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border backdrop-blur-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Actions</DropdownMenuLabel>
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" /> Forecast Update
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" /> Rush Operation
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2 text-red-500 focus:bg-red-500/10" onClick={() => {
                   if (confirm("Permanently archive opportunity?")) deleteMutation.mutate(deal.id);
                }}>
                  <Trash2 className="h-3.5 w-3.5" /> Purge Opportunity
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Intelligence Sidebar */}
          <aside className="w-64 shrink-0 border-r border-border bg-[hsl(var(--sidebar-background))] overflow-y-auto hidden lg:block">
            <div className="py-6 space-y-6">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-6 opacity-50">
                   Tactical Signals
                </h3>
                <nav className="px-3 space-y-0.5">
                  {relatedLists.map((item) => (
                    <button
                      key={item.label}
                      className="sidebar-item w-full sidebar-item-inactive group"
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />
                      <span className="flex-1 text-left font-bold uppercase tracking-wider text-[11px]">{item.label}</span>
                      {item.count > 0 && (
                        <Badge variant="secondary" className="h-5 min-w-[20px] px-1 bg-white/5 text-white/40 border-none font-black text-[9px]">
                          {item.count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Master Opportunity Content */}
          <main className="flex-1 overflow-y-auto bg-background/50 p-8 xl:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
              <Tabs defaultValue="overview" className="space-y-10">
                <TabsList className="bg-white/5 border border-white/5 rounded-2xl p-1 gap-1 h-12 shadow-inner">
                  <TabsTrigger value="overview" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="products" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">SOLUTIONS</TabsTrigger>
                  <TabsTrigger value="quotes" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">FINANCIALS</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-12 animate-in fade-in duration-500">
                  {/* Pipeline Visualization */}
                  <div className="p-10 bg-card/30 rounded-[3rem] border border-border shadow-2xl">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Current Pipeline Stage</label>
                           <h2 className="text-2xl font-black text-primary tracking-tighter uppercase">{deal.stage?.name || "DISCOVERY"}</h2>
                        </div>
                        <div className="text-right">
                           <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Estimated Value</label>
                           <h2 className="text-2xl font-black text-white tracking-tighter">${(deal.value || 0).toLocaleString()}</h2>
                        </div>
                     </div>
                     <div className="flex gap-2 h-3">
                        {Array.from({ length: totalStages }).map((_, i) => (
                           <div 
                              key={i} 
                              className={cn(
                                 "flex-1 rounded-full transition-all duration-700",
                                 i < stageNumber ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" : "bg-white/5"
                              )} 
                           />
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                     {/* Deal Intelligence Sheet */}
                     <div className="lg:col-span-2 p-10 bg-card/30 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                           <Target className="h-40 w-40 -mr-16 -mt-16" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-8">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Expected Close</label>
                                 <div className="text-xl font-black text-white italic">{formatDate(deal.expectedCloseDate)}</div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Probability Coefficient</label>
                                 <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-green-500 tracking-tighter">{deal.probability || 0}%</span>
                                    <span className="text-[10px] font-black text-white/20 uppercase pb-1.5 self-end">Win Factor</span>
                                 </div>
                              </div>
                           </div>
                           <div className="space-y-8 border-l border-white/5 md:pl-10">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Decision Authority</label>
                                 <div className="flex items-center gap-3 pt-1">
                                    <Avatar className="h-8 w-8">
                                       <AvatarFallback className="bg-primary/20 text-[10px] font-black text-primary">DP</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-black text-white/90">Director Level</span>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Last Signal</label>
                                 <p className="text-xs font-black text-white/40 uppercase tracking-tighter italic">{formatDate(deal.updatedAt)}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Tactical Forecast Card */}
                     <div className="p-10 bg-primary/[0.03] rounded-[3rem] border border-primary/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                           <Zap className="h-40 w-40 -mr-20 -mt-20 text-primary" />
                        </div>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Forecast Status</h3>
                        <div className="space-y-2 py-6">
                           <div className="text-5xl font-black tracking-tighter text-white uppercase italic">COMMIT</div>
                           <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-relaxed">High-confidence opportunity included in primary forecast.</p>
                        </div>
                        <Button variant="outline" className="w-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-[0.2em] h-12 hover:bg-primary/20 rounded-[1.25rem] shadow-xl">
                           <BarChart3 className="h-3.5 w-3.5 mr-2" />
                           CALCULATE ROI
                        </Button>
                     </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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
