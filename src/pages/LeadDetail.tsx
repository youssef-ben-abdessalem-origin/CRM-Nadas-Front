import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  Tag,
  Edit,
  User,
  Clock,
  Link as LinkIcon,
  FileText,
  Calendar,
  Box,
  Share2,
  Workflow,
  Globe,
  Settings2,
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
import { LeadCallDialog } from "@/components/leads/LeadCallDialog";
import { LeadTaskDialog } from "@/components/leads/LeadTaskDialog";
import { LeadTagsDialog } from "@/components/leads/LeadTagsDialog";
import { LeadNotes } from "@/components/leads/LeadNotes";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const leadId = Number(id);

  const [showCallDialog, setShowCallDialog] = useState(false);
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

  if (isLoading) {
    return (
      <CRMLayout title="Lead Details">
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground italic">Loading lead record...</div>
        </div>
      </CRMLayout>
    );
  }

  if (!lead) {
    return (
      <CRMLayout title="Not Found">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Lead record not found.</p>
          <Button onClick={() => navigate("/leads")}>Back to Leads</Button>
        </div>
      </CRMLayout>
    );
  }

  const relatedLists = [
    { label: "Notes", count: 2, icon: FileText },
    { label: "Connected Records", count: 0, icon: Workflow },
    { label: "Cadences", count: 0, icon: Share2 },
    { label: "Attachments", count: 0, icon: LinkIcon },
    { label: "Products", count: 0, icon: Box },
    { label: "Open Activities", count: "10+", icon: Calendar },
    { label: "Closed Activities", count: 0, icon: Clock },
    { label: "Invited Meetings", count: 0, icon: Plus },
    { label: "Emails", count: 0, icon: Mail },
    { label: "Campaigns", count: 0, icon: Globe },
    { label: "Social", count: 0, icon: Settings2 },
  ];

  const getStatusName = (status: any) => (typeof status === 'object' ? status?.name : status) || 'New Lead';

  return (
    <CRMLayout title={lead.name}>
      <div className="flex flex-col h-screen -m-6 bg-background">
        {/* Dossier Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => navigate("/leads")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10 border border-border shadow-sm">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                {lead.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">
                  {lead.name} <span className="text-muted-foreground font-medium">- {lead.company}</span>
                </h1>
              </div>
              <button 
                className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:opacity-90 transition-colors"
                onClick={() => setShowTagsDialog(true)}
              >
                <Tag className="h-3 w-3" /> Add Tags
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8 px-4">
              Send Email
            </Button>
            <Button variant="outline" size="sm" className="font-bold h-8 px-4 border-border">
              Convert
            </Button>
            <Button variant="outline" size="sm" className="font-bold h-8 px-4 border-border">
              Edit
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 border-border">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <div className="flex items-center ml-2 border-l border-border pl-2 gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Dossier Sidebar */}
          <aside className="w-64 bg-card border-r border-border overflow-y-auto shrink-0 py-4">
            <div className="px-4 mb-4">
                <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                    Related List <Settings2 className="h-3 w-3 opacity-40 rotate-90" />
                </h3>
            </div>
            <nav className="space-y-0.5 px-2 mb-8">
                {relatedLists.map((item) => (
                    <button key={item.label} className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 group transition-colors text-left">
                        <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground">{item.label}</span>
                        {item.count !== 0 && (
                            <span className="text-[11px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-primary hover:underline">
                    Add Related List
                </button>
            </nav>

            <div className="px-4 mb-2">
                <h3 className="text-[13px] font-bold text-foreground">Links</h3>
            </div>
            <div className="px-2">
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-primary hover:underline">
                    Add Link
                </button>
            </div>
          </aside>

          {/* Master View */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <User className="h-4 w-4" />
                        </div>
                        <TabsList className="bg-muted p-1 h-9 rounded-full">
                            <TabsTrigger value="overview" className="h-7 px-6 rounded-full text-[13px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground">Overview</TabsTrigger>
                            <TabsTrigger value="timeline" className="h-7 px-6 rounded-full text-[13px] font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm text-muted-foreground data-[state=active]:text-foreground">Timeline</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="text-[12px] text-muted-foreground font-medium flex items-center gap-1.5 focus:outline-none">
                        <Clock className="h-3.5 w-3.5" /> Last Update : 1 day(s) ago
                    </div>
                </div>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
                    {/* Information Dossier */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-12 min-h-[400px]">
                        <div className="max-w-xl space-y-6">
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-muted-foreground text-right font-medium">Lead Owner</label>
                                <span className="text-[13px] font-bold text-foreground">{lead.owner?.name || "Unassigned"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-muted-foreground text-right font-medium">Email</label>
                                <span className="text-[13px] font-bold text-primary hover:underline cursor-pointer">{lead.emails?.[0] || "No Email"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-muted-foreground text-right font-medium">Phone</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-foreground">{lead.phones?.[0] || "No Phone"}</span>
                                    <div className="h-5 w-5 rounded-full bg-green-950/20 flex items-center justify-center border border-green-500/20">
                                        <Phone className="h-3 w-3 text-green-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-muted-foreground text-right font-medium">Mobile</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-foreground">{lead.phones?.[1] || "No Mobile"}</span>
                                    <div className="h-5 w-5 rounded-full bg-green-950/20 flex items-center justify-center border border-green-500/20">
                                        <Phone className="h-3 w-3 text-green-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-muted-foreground text-right font-medium">Lead Status</label>
                                <span className="text-[13px] font-bold text-foreground">{getStatusName(lead.status)}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-muted-foreground text-right font-medium">Last Contact Date</label>
                                <span className="text-[13px] font-bold text-foreground">{lead.lastContactDate ? formatDate(lead.lastContactDate) : "-"}</span>
                            </div>
                            {lead.campaign && (
                                <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                    <label className="text-[13px] text-muted-foreground text-right font-medium">Campaign</label>
                                    <Link to={`/campaigns/${lead.campaign.id}`} className="text-[13px] font-bold text-primary hover:underline flex items-center gap-1.5">
                                        <Megaphone className="h-3.5 w-3.5" />
                                        {lead.campaign.name}
                                    </Link>
                                </div>
                            )}
                            {(lead.street || lead.city || lead.state || lead.zipCode || lead.country) && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-10">
                                    <label className="text-[13px] text-muted-foreground text-right font-medium mt-0.5">Address Details</label>
                                    <div className="text-[13px] font-bold text-foreground flex flex-col gap-0.5">
                                        {lead.street && <span>{lead.street}</span>}
                                        {(lead.city || lead.state || lead.zipCode) && (
                                            <span>
                                                {[lead.city, lead.state, lead.zipCode].filter(Boolean).join(", ")}
                                            </span>
                                        )}
                                        {lead.country && <span>{lead.country}</span>}
                                    </div>
                                </div>
                            )}
                            {lead.address && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-10">
                                    <label className="text-[13px] text-muted-foreground text-right font-medium mt-0.5">Full Address</label>
                                    <span className="text-[13px] font-bold text-foreground whitespace-pre-wrap">{lead.address}</span>
                                </div>
                            )}
                            {lead.description && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-10">
                                    <label className="text-[13px] text-muted-foreground text-right font-medium mt-0.5">Description</label>
                                    <span className="text-[13px] font-bold text-foreground whitespace-pre-wrap">{lead.description}</span>
                                </div>
                            )}
                            {lead.notes && (
                                <div className="grid grid-cols-[140px_1fr] items-start gap-10">
                                    <label className="text-[13px] text-muted-foreground text-right font-medium mt-0.5">Notes</label>
                                    <span className="text-[13px] font-bold text-foreground whitespace-pre-wrap">{lead.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Next Actions Chronicle */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-8 space-y-6">
                        <h3 className="text-[15px] font-bold text-foreground">Next Action</h3>
                        <div className="space-y-4">
                            {activities.length > 0 ? (
                              activities.slice(0, 5).map((action: any, i) => {
                                const dueDate = action.dueDate || action.createdAt;
                                const dateObj = new Date(dueDate);
                                const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                                const day = dateObj.getDate();
                                return (
                                  <div key={i} className="flex items-center gap-6 group">
                                    <div className="flex items-center">
                                      <div className="bg-emerald-600 text-white text-[9px] font-black h-5 px-2 flex items-center rounded-l-[2px] tracking-widest shrink-0">
                                        {month} {day}
                                      </div>
                                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[8px] border-l-emerald-600" />
                                    </div>
                                    <span className="text-[13px] font-medium text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight truncate">
                                      {action.subject} ({action.type?.name || "Task"})
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-sm text-muted-foreground py-2 italic">No upcoming actions</div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="animate-in fade-in duration-300">
                    <div className="bg-card rounded-xl shadow-sm border border-border p-20 flex flex-col items-center justify-center text-center opacity-40">
                        <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Timeline Active</p>
                    </div>
                </TabsContent>
            </Tabs>
          </main>
        </div>

        {/* Action Handlers */}
        <LeadCallDialog lead={lead} open={showCallDialog} onOpenChange={setShowCallDialog} />
        <LeadTaskDialog lead={lead} open={showTaskDialog} onOpenChange={setShowTaskDialog} />
        <LeadTagsDialog lead={lead} open={showTagsDialog} onOpenChange={setShowTagsDialog} />
        <LeadNotes lead={lead} open={showNotes} onOpenChange={setShowNotes} />
      </div>
    </CRMLayout>
  );
}
