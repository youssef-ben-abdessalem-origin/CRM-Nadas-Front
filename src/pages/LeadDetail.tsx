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
  CheckCircle,
  Clock,
  Tag,
  Layers,
  ArrowLeft,
  Trash2,
  Workflow,
  Link as LinkIcon,
  User,
  Share2,
  Box,
  Calendar,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { LeadCallDialog } from "@/components/leads/LeadCallDialog";
import { LeadLogCallDialog } from "@/components/leads/LeadLogCallDialog";
import { LeadTaskDialog } from "@/components/leads/LeadTaskDialog";
import { LeadTagsDialog } from "@/components/leads/LeadTagsDialog";
import { LeadNotes } from "@/components/leads/LeadNotes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const leadId = Number(id);

  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showLogCallDialog, setShowLogCallDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["leads", leadId],
    queryFn: () => api.leads.getOne(leadId),
    enabled: !!leadId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["activities", "lead", leadId],
    queryFn: () => api.activities.getByEntity("lead", leadId),
    enabled: !!leadId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.leads.delete(id),
    onSuccess: () => {
      toast.success("Lead deleted successfully");
      navigate("/leads");
    },
  });

  if (isLoading) {
    return (
      <CRMLayout title="Lead Details">
        <div className="flex h-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  if (!lead) {
    return (
      <CRMLayout title="Lead Not Found">
        <div className="flex h-full items-center justify-center flex-col gap-4 bg-background">
          <p className="text-muted-foreground font-bold">Lead profile not found</p>
          <Button onClick={() => navigate("/leads")} className="bg-primary hover:bg-primary/90 font-bold">Back to Leads</Button>
        </div>
      </CRMLayout>
    );
  }

  const relatedLists = [
    { label: "Notes", count: lead.notes ? 1 : 0, icon: FileText },
    { label: "Timeline", count: activities.length, icon: Clock },
    { label: "Connected Records", count: 0, icon: Workflow },
    { label: "Cadences", count: 0, icon: Share2 },
    { label: "Attachments", count: lead.attachments?.length || 0, icon: LinkIcon },
    { label: "Products", count: 0, icon: Box },
    { label: "Activities", count: activities.filter((a: any) => !a.completed).length, icon: Calendar },
    { label: "Emails", count: 0, icon: Mail },
  ];

  return (
    <CRMLayout title={`${lead.name}`}>
      <div className="flex flex-col h-full bg-background -m-6 -mt-3">
        {/* Context Bar / Integrated Sub-Header */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-card/40 backdrop-blur-xl border-b border-border sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-5">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5" onClick={() => navigate("/leads")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-11 w-11 border-2 border-primary/20 ring-4 ring-primary/5 active:scale-95 transition-transform duration-300">
                  <AvatarImage src={lead.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-black">
                    {lead.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-background rounded-full shadow-lg" />
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-black tracking-tight text-white leading-none">{lead.name}</h1>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest px-2 h-5 flex items-center mt-0.5">
                    LEAD # {lead.id}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-wider mt-1.5 grayscale opacity-60">
                   {lead.title || "Potential Prospect"}
                   <span className="opacity-30">/</span>
                   <span className="text-primary font-black italic">{lead.company}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-1.5 mr-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 rounded-xl gap-2 tracking-widest text-[11px] active:scale-95 transition-all">
              <Plus className="h-4 w-4" /> CONVERT LEAD
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all rounded-xl">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border backdrop-blur-2xl">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40">Tactical Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowCallDialog(true)} className="text-[11px] font-bold uppercase gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" /> Schedule Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTaskDialog(true)} className="text-[11px] font-bold uppercase gap-2">
                   <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Create Next Action
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2 text-red-500 focus:bg-red-500/10" onClick={() => {
                  if (confirm("Permanently archive lead record?")) deleteMutation.mutate(lead.id);
                }}>
                  <Trash2 className="h-3.5 w-3.5" /> Purge Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Internal Sidebar List - Styled like AppSidebar */}
          <aside className="w-64 shrink-0 border-r border-border bg-[hsl(var(--sidebar-background))] overflow-y-auto hidden lg:block">
            <div className="py-6 space-y-6">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-6 opacity-50">
                  Related Intelligence
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

          {/* Master View Content */}
          <main className="flex-1 overflow-y-auto bg-background/50 p-8 xl:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
              
              <Tabs defaultValue="overview" className="space-y-10">
                <div className="flex items-center justify-between">
                   <TabsList className="bg-white/5 border border-white/5 rounded-2xl p-1 gap-1 h-12 shadow-inner">
                    <TabsTrigger value="overview" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">OVERVIEW</TabsTrigger>
                    <TabsTrigger value="timeline" className="px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-2xl">TIMELINE</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-12 animate-in fade-in duration-500">
                  {/* Executive Overview Sheet */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-card/30 rounded-[3rem] border border-border shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <User className="h-40 w-40 -mr-16 -mt-16" />
                      </div>
                      
                      <div className="space-y-8">
                         <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Direct Email</label>
                          <p className="text-sm font-black text-primary flex items-center gap-2 group/email cursor-pointer">
                             {lead.emails?.[0] || "PROTECTED"}
                             <Mail className="h-3 w-3 opacity-40 group-hover/email:translate-x-1 transition-transform" />
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Operational Lines</label>
                          <p className="text-sm font-black text-white/80">{lead.phones?.[0] || "No Data"}</p>
                        </div>
                        <div className="space-y-2 pt-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Owner Attribution</label>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-white/10">
                              <AvatarFallback className="bg-primary/20 text-[10px] font-black text-primary">{lead.owner?.name?.[0] || "N"}</AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-black text-white/90">{lead.owner?.name || "System"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Acquisition Stage</label>
                          <div className="pt-1">
                            <Badge className="bg-green-500/20 text-green-500 border border-green-500/20 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">
                              {lead.status || "UNSTAGED"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">System Ingestion</label>
                          <p className="text-xs font-black text-white/20 uppercase tracking-tighter italic">{formatDate(lead.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Strategic Health Card */}
                    <div className="p-10 bg-primary/[0.03] rounded-[3rem] border border-primary/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                         <TrendingUp className="h-40 w-40 -mr-20 -mt-20 text-primary" />
                       </div>
                       <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Strategic Potential</h3>
                       <div className="space-y-2 py-6">
                          <div className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">High</div>
                          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Calculated Score: 92/100</p>
                       </div>
                       <Button variant="outline" className="w-full border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] tracking-[0.2em] h-12 hover:bg-primary/20 rounded-[1.25rem] shadow-xl overflow-hidden" onClick={() => setShowTagsDialog(true)}>
                         <Tag className="h-3.5 w-3.5 mr-2" />
                         DEPLOY TAGS
                       </Button>
                    </div>
                  </div>

                  {/* Activity Flow / Directives */}
                  <div className="space-y-10 p-12 bg-card/20 rounded-[3.5rem] border border-border/50 shadow-inner">
                    <div className="flex items-center justify-between pb-10 border-b border-border">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter text-white">Hyper-Directives</h2>
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] inline-block bg-white/5 px-3 py-1 rounded-full">Automated Planning Flow</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-11 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/10 px-8 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5" onClick={() => setShowTaskDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        NEW ACTION
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {activities.length > 0 ? (
                        activities.filter((a: any) => !a.completed).map((activity: any) => (
                          <div key={activity.id} className="flex items-center gap-8 group p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-[2rem] border border-transparent hover:border-white/5 transition-all shadow-sm">
                             <div className="h-16 w-16 shrink-0 rounded-[1.5rem] bg-primary/10 flex flex-col items-center justify-center font-black text-primary shadow-2xl border border-primary/20">
                               <span className="text-[10px] opacity-60 uppercase">{formatDate(activity.dueDate).split(",")[0].substring(0,3)}</span>
                               <span className="text-lg leading-none">{new Date(activity.dueDate).getDate()}</span>
                             </div>
                             <div className="flex-1 space-y-2">
                               <h4 className="text-base font-black text-white shadow-text group-hover:text-primary transition-colors">{activity.subject}</h4>
                               <p className="text-xs text-white/30 font-bold uppercase tracking-tight line-clamp-1">{activity.description || "N/A"}</p>
                             </div>
                             <Button variant="ghost" size="icon" className="h-12 w-12 text-white/10 hover:text-green-500 hover:bg-green-500/10 rounded-2xl transition-all shadow-glow">
                               <CheckCircle className="h-6 w-6" />
                             </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 opacity-10">
                           <div className="h-24 w-24 bg-white/5 rounded-[2rem] flex items-center justify-center">
                              <Layers className="h-12 w-12" />
                           </div>
                           <p className="text-xs font-black uppercase tracking-[0.4em]">Operational Buffer Clear</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="animate-in slide-in-from-bottom-5 duration-700">
                   <div className="bg-white/[0.02] rounded-[3.5rem] border border-white/5 p-32 min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden grayscale opacity-30">
                     <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                     <div className="h-32 w-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center animate-pulse shadow-2xl border border-primary/10">
                        <Clock className="h-16 w-16 text-primary/50" />
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-3xl font-black tracking-tighter text-white uppercase italic">Hyper-Timeline Active</h3>
                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.5em] mt-2">Synchronization in Progress</p>
                     </div>
                   </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>

        {/* Global Overlays */}
        <LeadCallDialog lead={lead} open={showCallDialog} onOpenChange={setShowCallDialog} />
        <LeadLogCallDialog lead={lead} open={showLogCallDialog} onOpenChange={setShowLogCallDialog} />
        <LeadTaskDialog lead={lead} open={showTaskDialog} onOpenChange={setShowTaskDialog} />
        <LeadTagsDialog lead={lead} open={showTagsDialog} onOpenChange={setShowTagsDialog} />
        <LeadNotes lead={lead} open={showNotes} onOpenChange={setShowNotes} />
      </div>
    </CRMLayout>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("animate-spin", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
