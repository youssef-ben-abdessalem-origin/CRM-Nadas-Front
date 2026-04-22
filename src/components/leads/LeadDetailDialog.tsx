import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Star,
  User,
  History,
  CheckSquare,
  StickyNote,
  MoreHorizontal,
  Plus,
  Tag,
  MapPin,
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Pencil,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import api, { Lead } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { LeadNotes } from "./LeadNotes";
import { LeadTaskDialog } from "./LeadTaskDialog";
import { LeadCallDialog } from "./LeadCallDialog";
import { LeadTagsDialog } from "./LeadTagsDialog";
import { toast } from "sonner";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

interface LeadDetailDialogProps {
  leadId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lead: Lead) => void;
  onAddTask?: (lead: Lead) => void;
}

export function LeadDetailDialog({ leadId, open, onOpenChange, onEdit, onAddTask }: LeadDetailDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: lead, isLoading } = useQuery({
    queryKey: ["leads", leadId],
    queryFn: () => (leadId ? api.leads.getOne(leadId) : null),
    enabled: !!leadId && open,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: () => (leadId ? api.activities.getByEntity("lead", leadId) : []),
    enabled: !!leadId && open,
  });

  if (!lead && !isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-border/50 shadow-2xl bg-card flex flex-col h-[85vh]">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-border bg-muted/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border shadow-sm ring-2 ring-primary/5">
                <AvatarImage src={lead?.avatar} />
                <AvatarFallback className="bg-primary/5 text-primary text-base font-bold">
                  {lead?.name?.split(" ").map(n => n[0]).join("") || "L"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {lead?.name || "Lead Details"}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-tighter h-5">
                    {typeof lead?.status === 'object' ? lead?.status?.name : lead?.status || "Active"}
                  </Badge>
                  <span className="text-[12px] text-muted-foreground font-medium flex items-center gap-1">
                    <Building2 className="h-3 w-3 opacity-60" /> {lead?.company}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => lead && onEdit?.(lead)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
            <div className="px-8 bg-muted/10 border-b border-border shrink-0">
              <TabsList className="bg-transparent border-none p-0 h-12 gap-6">
                <TabsTrigger value="overview" className="px-0 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none text-muted-foreground data-[state=active]:text-primary font-bold text-[12px] uppercase tracking-wider transition-all">Overview</TabsTrigger>
                <TabsTrigger value="activities" className="px-0 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none text-muted-foreground data-[state=active]:text-primary font-bold text-[12px] uppercase tracking-wider transition-all">Activities ({activities.length})</TabsTrigger>
                <TabsTrigger value="notes" className="px-0 h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none text-muted-foreground data-[state=active]:text-primary font-bold text-[12px] uppercase tracking-wider transition-all">Notes</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium italic">Loading lead record...</p>
                  </div>
                ) : lead ? (
                  <>
                    <TabsContent value="overview" className="mt-0 space-y-10 animate-in fade-in duration-300">
                      <section className="space-y-6">
                        <h3 className="text-[11px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4">Core Identification</h3>
                        <div className="grid gap-4">
                          <DetailRow icon={User} label="Lead Owner" value={lead.owner?.name || "Unassigned"} />
                          <DetailRow icon={Mail} label="Email Address" value={lead.emails?.[0] || "No Email"} className="text-primary hover:underline cursor-pointer" />
                          <DetailRow icon={Phone} label="Primary Phone" value={lead.phones?.[0] || "No Phone"} />
                          <DetailRow icon={DollarSign} label="Lead Value" value={<CurrencyNumbers amount={lead.value || 0} />} />
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h3 className="text-[11px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4">Qualification & Source</h3>
                        <div className="grid gap-4">
                          <DetailRow icon={History} label="Current Stage" value={lead.stage?.name || "New"} color={lead.stage?.color} />
                          <DetailRow icon={Star} label="Score Category" value={lead.scoreCategory?.name || "None"} color={lead.scoreCategory?.color} />
                          <DetailRow icon={ExternalLink} label="Lead Source" value={lead.source?.name || "Direct"} />
                          <DetailRow icon={Calendar} label="Last Activity" value={lead.lastActivity || "Just now"} />
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h3 className="text-[11px] font-black text-primary/40 uppercase tracking-[0.2em] mb-4">Company Overview</h3>
                        <div className="grid gap-4">
                          <DetailRow icon={Globe} label="Website" value={lead.website || "—"} className="text-primary hover:underline cursor-pointer" />
                          <DetailRow icon={Users} label="Employees" value={lead.employees || "—"} />
                          <DetailRow icon={TrendingUp} label="Annual Revenue" value={<CurrencyNumbers amount={lead.annualRevenue || 0} />} />
                          <DetailRow icon={MapPin} label="Industry" value={lead.industry || "—"} />
                        </div>
                      </section>
                    </TabsContent>

                    <TabsContent value="activities" className="mt-0 space-y-6 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-black text-primary/40 uppercase tracking-[0.2em]">Planned Engagements</h4>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-[11px] font-bold uppercase tracking-tight border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                          onClick={() => lead && onAddTask?.(lead)}
                        >
                          <Plus className="h-3 w-3 mr-1.5" /> New Task
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {activities.map((activity: any, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/50 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-background border border-border text-primary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                {activity.type?.name?.toLowerCase().includes('call') ? <Phone className="h-5 w-5 opacity-70" /> : <CheckSquare className="h-5 w-5 opacity-70" />}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-foreground">{activity.subject}</div>
                                <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                                  <Calendar className="h-3 w-3 opacity-60" /> {formatDate(activity.dueDate || activity.createdAt)}
                                  <span className="h-1 w-1 rounded-full bg-border" />
                                  {activity.type?.name}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {activities.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-2xl bg-muted/5 border-2 border-dashed border-border/40">
                            <div className="h-16 w-16 bg-background rounded-2xl flex items-center justify-center text-muted-foreground/20 shadow-sm border border-border/50">
                              <Calendar className="h-8 w-8" />
                            </div>
                            <div className="max-w-[200px]">
                              <p className="text-sm font-bold text-muted-foreground/80">No active activities</p>
                              <p className="text-[12px] text-muted-foreground/40 font-medium">Create a new task or log a call to keep the momentum going.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0 h-full animate-in fade-in duration-300">
                      <div className="-mx-8 -my-8">
                        <LeadNotes lead={lead} open={true} onOpenChange={() => { }} inline />
                      </div>
                    </TabsContent>
                  </>
                ) : null}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="px-8 py-6 bg-muted/10 border-t border-border shrink-0 flex items-center gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-10 px-6 text-muted-foreground hover:text-foreground font-semibold transition-all">
            Close
          </Button>
          <Button 
            className="h-10 px-8 bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95 ml-auto"
            onClick={() => lead && onEdit?.(lead)}
          >
            Edit Information
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon: Icon, label, value, color, className }: { icon: any; label: string; value: any; color?: string; className?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-8 group">
      <div className="text-right flex items-center justify-end gap-3 pr-2 border-r border-border/50 h-full py-1">
        <label className="text-[12px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</label>
        <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/50 group-hover:bg-primary/5 group-hover:text-primary/50 transition-colors">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex items-center gap-2.5 pl-2 overflow-hidden">
        {color && <div className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />}
        <span className={`text-[13px] font-bold text-foreground truncate ${className}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
