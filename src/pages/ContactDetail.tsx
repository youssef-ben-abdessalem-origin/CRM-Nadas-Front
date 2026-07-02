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
  Globe,
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
  MessageSquare,
  Zap
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
import { useTranslation } from "react-i18next";

export default function ContactDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const contactId = Number(id);

  const { data: contact, isLoading } = useQuery({
    queryKey: ["contacts", contactId],
    queryFn: () => api.contacts.getOne(contactId),
    enabled: !!contactId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", "contact", contactId],
    queryFn: () => api.activities.getByEntity("contact", contactId),
    enabled: !!contactId,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["contact-deals", contactId],
    queryFn: () => api.deals.getByContact(contactId),
    enabled: !!contactId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.contacts.delete(id),
    onSuccess: () => {
      toast.success("Contact deleted successfully");
      navigate("/contacts");
    },
  });

  if (isLoading) {
    return (
      <CRMLayout title={t("contacts.detail.pageTitle")}>
        <div className="flex h-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  if (!contact) {
    return (
      <CRMLayout title="Contact Not Found">
        <div className="flex h-full items-center justify-center flex-col gap-4 bg-background">
          <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Target individual not found</p>
          <Button onClick={() => navigate("/contacts")} className="bg-primary hover:bg-primary/90 font-black tracking-widest text-[10px]">BACK TO REPOSITORY</Button>
        </div>
      </CRMLayout>
    );
  }

  const relatedLists = [
    { label: "Deals", count: deals.length, icon: Briefcase },
    { label: "Timeline", count: activities.length, icon: Clock },
    { label: "Notes", count: contact.notes ? 1 : 0, icon: FileText },
    { label: "Projects", count: 0, icon: Layers },
    { label: "Financials", count: 0, icon: DollarSign },
  ];

  return (
    <CRMLayout title={`${contact.name}`}>
      <div className="flex flex-col h-full bg-background -m-6 -mt-3">
        {/* Contact Context Header */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-card/40 backdrop-blur-xl border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5" onClick={() => navigate("/contacts")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-11 w-11 border-2 border-primary/20 ring-4 ring-primary/5 shadow-2xl transition-transform duration-300">
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-black">
                    {contact.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-background rounded-full shadow-lg" />
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tight text-white leading-none capitalize">{contact.name}</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 h-5">
                    {contact.tier?.name || "VIP TIER"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-wider mt-1.5 grayscale opacity-60">
                   <Mail className="h-3 w-3" />
                   <span className="hover:text-primary transition-colors cursor-pointer">{contact.email}</span>
                   <span className="opacity-30">/</span>
                   <span className="text-primary/70">{contact.company}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 mr-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg">
                <Zap className="h-4 w-4" />
              </Button>
            </div>
            
            <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 rounded-xl gap-2 tracking-widest text-[11px] active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> NEW DEAL
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded-xl">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border backdrop-blur-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40">Intelligence Actions</DropdownMenuLabel>
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2">
                  <Users className="h-3.5 w-3.5 text-blue-500" /> Share Access
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2">
                  <Phone className="h-3.5 w-3.5 text-green-500" /> VoIP Connection
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2 text-red-500 focus:bg-red-500/10" onClick={() => {
                   if (confirm("Permanently archive individual profile?")) deleteMutation.mutate(contact.id);
                }}>
                  <Trash2 className="h-3.5 w-3.5" /> Purge Individual
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
                   Related Signals
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
                  <div className="pt-4 mt-4 border-t border-white/5">
                    <button className="sidebar-item w-full sidebar-item-inactive text-primary/60 hover:text-primary hover:bg-primary/10">
                      <Plus className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left font-bold uppercase tracking-wider text-[11px]">Deploy Field List</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </aside>

          {/* Core Personnel Analytics Content */}
          <main className="flex-1 overflow-y-auto bg-background/50 p-8 xl:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
              <Tabs defaultValue="overview" className="space-y-10">
                <TabsList className="bg-white/5 border border-white/5 rounded-2xl p-1 gap-1 h-12 shadow-inner">
                  <TabsTrigger value="overview" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">OVERVIEW</TabsTrigger>
                  <TabsTrigger value="deals" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">DEAL FLOW</TabsTrigger>
                  <TabsTrigger value="activities" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">INTERACTIONS</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-10 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Engagement Analytics Snapshot */}
                     <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-card/30 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                           <Users className="h-40 w-40 -mr-16 -mt-16" />
                        </div>
                        <div className="space-y-8">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Lifecycle Value</label>
                              <div className="text-4xl font-black text-white tracking-tighter">${(contact.revenueTotal || 0).toLocaleString()}</div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Communication Channel</label>
                              <div className="flex items-center gap-2">
                                 <Phone className="h-3.5 w-3.5 text-primary" />
                                 <p className="text-sm font-black text-white/90">{contact.phone || "UNREGISTERED"}</p>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Owner Attribution</label>
                              <p className="text-xs font-black text-white/50">{contact.owner?.name || "Shared Record"}</p>
                           </div>
                        </div>
                        <div className="space-y-8 border-l border-white/5 md:pl-10">
                           <div className="space-y-4">
                              <div className="space-y-1">
                                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Personnel Status</label>
                                 <div className="pt-1">
                                    <Badge className="bg-blue-500/20 text-blue-500 border border-blue-500/20 font-black uppercase text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full">
                                       {contact.status?.name || "ACTIVE TARGET"}
                                    </Badge>
                                 </div>
                              </div>
                              <div className="space-y-1 pt-4">
                                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Win Probability</label>
                                 <div className="text-2xl font-black text-green-500">84%</div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Relationship Index Card */}
                     <div className="p-10 bg-primary/[0.03] rounded-[3rem] border border-primary/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                           <TrendingUp className="h-40 w-40 -mr-20 -mt-20 text-primary" />
                        </div>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Strategic Index</h3>
                        <div className="space-y-2 py-6">
                           <div className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">VIP</div>
                           <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest leading-relaxed">Top-tier decision maker with high influence coefficient.</p>
                        </div>
                        <Button variant="outline" className="w-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-[0.2em] h-12 hover:bg-primary/20 rounded-[1.25rem] shadow-xl">
                           <Clock className="h-3.5 w-3.5 mr-2" />
                           PRIORITIZE REACH
                        </Button>
                     </div>
                  </div>

                  {/* Firmographic / Personal Intel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-inner">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Physical Ingress</h3>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-primary/60 mt-0.5" />
                            <div className="space-y-1">
                               <p className="text-sm font-black text-white/90 leading-tight">{contact.location || "Location Protected"}</p>
                               <p className="text-[10px] font-bold text-white/20 uppercase">Tactical Primary Address</p>
                            </div>
                         </div>
                     </div>
                     <div className="p-10 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-inner">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">Professional Context</h3>
                        <div className="space-y-1">
                           <div className="text-lg font-black text-white">{contact.title || "Executive Role"}</div>
                           <div className="text-xs font-black text-primary/60 uppercase tracking-widest">{contact.industry || "Market Vertical Unrecognized"}</div>
                        </div>
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
