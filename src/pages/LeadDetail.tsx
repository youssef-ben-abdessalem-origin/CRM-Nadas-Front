import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Settings2
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
      <div className="flex flex-col h-screen -m-6 bg-[#f4f7f9]">
        {/* Dossier Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={() => navigate("/leads")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                {lead.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800">
                  {lead.name} <span className="text-slate-400 font-medium">- {lead.company}</span>
                </h1>
              </div>
              <button 
                className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => setShowTagsDialog(true)}
              >
                <Tag className="h-3 w-3" /> Add Tags
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-[#3b82f6] hover:bg-blue-600 text-white font-bold h-8 px-4">
              Send Email
            </Button>
            <Button variant="outline" size="sm" className="font-bold h-8 px-4">
              Convert
            </Button>
            <Button variant="outline" size="sm" className="font-bold h-8 px-4">
              Edit
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <div className="flex items-center ml-2 border-l pl-2 gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Dossier Sidebar */}
          <aside className="w-64 bg-white border-r overflow-y-auto shrink-0 py-4">
            <div className="px-4 mb-4">
                <h3 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                    Related List <Settings2 className="h-3 w-3 opacity-40 rotate-90" />
                </h3>
            </div>
            <nav className="space-y-0.5 px-2 mb-8">
                {relatedLists.map((item) => (
                    <button key={item.label} className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 group transition-colors text-left">
                        <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900">{item.label}</span>
                        {item.count !== 0 && (
                            <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                                {item.count}
                            </span>
                        )}
                    </button>
                ))}
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-blue-600 hover:underline">
                    Add Related List
                </button>
            </nav>

            <div className="px-4 mb-2">
                <h3 className="text-[13px] font-bold text-slate-800">Links</h3>
            </div>
            <div className="px-2">
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-blue-600 hover:underline">
                    Add Link
                </button>
            </div>
          </aside>

          {/* Master View */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                            <User className="h-4 w-4" />
                        </div>
                        <TabsList className="bg-[#e2e8f0]/40 p-1 h-9 rounded-full">
                            <TabsTrigger value="overview" className="h-7 px-6 rounded-full text-[13px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                            <TabsTrigger value="timeline" className="h-7 px-6 rounded-full text-[13px] font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Timeline</TabsTrigger>
                        </TabsList>
                    </div>
                    <div className="text-[12px] text-slate-400 font-medium flex items-center gap-1.5 focus:outline-none">
                        <Clock className="h-3.5 w-3.5" /> Last Update : 1 day(s) ago
                    </div>
                </div>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
                    {/* Information Dossier */}
                    <div className="bg-white rounded-xl shadow-sm border p-12 min-h-[400px]">
                        <div className="max-w-xl space-y-6">
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-slate-400 text-right font-medium">Lead Owner</label>
                                <span className="text-[13px] font-bold text-slate-800">{lead.owner?.name || "Unassigned"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-slate-400 text-right font-medium">Email</label>
                                <span className="text-[13px] font-bold text-blue-600 hover:underline cursor-pointer">{lead.emails?.[0] || "No Email"}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-slate-400 text-right font-medium">Phone</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-slate-800">{lead.phones?.[0] || "No Phone"}</span>
                                    <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                        <Phone className="h-3 w-3 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-slate-400 text-right font-medium">Mobile</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-bold text-slate-800">{lead.phones?.[1] || "No Mobile"}</span>
                                    <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                        <Phone className="h-3 w-3 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-[140px_1fr] items-center gap-10">
                                <label className="text-[13px] text-slate-400 text-right font-medium">Lead Status</label>
                                <span className="text-[13px] font-bold text-slate-800">{getStatusName(lead.status)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Next Actions Chronicle */}
                    <div className="bg-white rounded-xl shadow-sm border p-8 space-y-6">
                        <h3 className="text-[15px] font-bold text-slate-800">Next Action</h3>
                        <div className="space-y-4">
                            {[
                                { date: "APR 11", text: "hhhh" },
                                { date: "APR 12", text: "hhhh" },
                                { date: "APR 13", text: "hhhh" },
                                { date: "APR 14", text: "hhhh" },
                                { date: "APR 15", text: "hhhh" },
                            ].map((action, i) => (
                                <div key={i} className="flex items-center gap-6 group">
                                    <div className="flex items-center">
                                        <div className="bg-[#10b981] text-white text-[9px] font-black h-5 px-2 flex items-center rounded-l-[2px] tracking-widest">
                                            {action.date}
                                        </div>
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[8px] border-l-[#10b981]" />
                                    </div>
                                    <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{action.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="animate-in fade-in duration-300">
                    <div className="bg-white rounded-xl shadow-sm border p-20 flex flex-col items-center justify-center text-center opacity-40">
                        <Clock className="h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Timeline Active</p>
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
