import { CRMLayout } from "@/components/CRMLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus, Megaphone, Loader2, MoreVertical, Trash2,
  Copy, Play, Pause, CheckCircle2, Search, Filter,
  ChevronDown, Calendar, Tag,
  ArrowUpDown, LayoutGrid, List
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CampaignsPage() {
  const [view, setView] = useState<"table" | "kanban">("kanban");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const queryClient = useQueryClient();
  const { symbol: currencySymbol } = useDefaultCurrency();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.campaigns.getAll,
  });

  const { data: types } = useQuery({
    queryKey: ["campaign-types"],
    queryFn: api.campaigns.getTypes,
  });

  const { data: statuses } = useQuery({
    queryKey: ["campaign-statuses"],
    queryFn: api.campaigns.getStatuses,
  });

  const createMutation = useMutation({
    mutationFn: api.campaigns.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setIsOpen(false);
      toast.success("Campaign created successfully");
    },
    onError: () => toast.error("Failed to create campaign"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.campaigns.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign updated");
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: api.campaigns.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success("Campaign deleted");
    },
    onError: () => toast.error("Delete failed"),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, data }: { ids: number[], data: any }) => {
      return Promise.all(ids.map(id => api.campaigns.update(id, data)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success("Bulk update successful");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return Promise.all(ids.map(id => api.campaigns.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success("Bulk delete successful");
    },
  });

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status?.name.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === "all" || c.campaignType?.name.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [campaigns, searchQuery, statusFilter, typeFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map((c: any) => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "planning": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "inactive": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "complete": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    createMutation.mutate({
      ...data,
      statusId: data.statusId ? Number.parseInt(data.statusId as string) : undefined,
      campaignTypeId: data.campaignTypeId ? Number.parseInt(data.campaignTypeId as string) : undefined,
      budgetedCost: data.budgetedCost ? Number.parseFloat(data.budgetedCost as string) : undefined,
      actualCost: data.actualCost ? Number.parseFloat(data.actualCost as string) : undefined,
    });
  };

  return (
    <CRMLayout title="Campaigns">
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              <Megaphone className="h-6 w-6 text-primary" />
              Campaigns
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Manage and track your marketing efforts.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl mr-4 border border-white/5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setView("kanban")}
                  className={cn("h-8 gap-2 font-bold text-[10px] rounded-lg", view === "kanban" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> KANBAN
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setView("table")}
                  className={cn("h-8 gap-2 font-bold text-[10px] rounded-lg", view === "table" ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white")}
                >
                  <List className="h-3.5 w-3.5" /> TABLE
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white gap-2 font-black px-6 shadow-lg shadow-primary/20 rounded-xl h-10 tracking-widest text-[11px]">
                  <Plus className="h-4 w-4" />
                  NEW CAMPAIGN
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-[#0A0C10] border-white/5">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Create Campaign
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider opacity-50">Campaign Name</Label>
                      <Input name="name" required placeholder="Project Alpha Release" className="bg-white/5 border-white/5 focus:border-primary/50 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider opacity-50">Type</Label>
                      <Select name="campaignTypeId">
                        <SelectTrigger className="bg-white/5 border-white/5 uppercase font-bold text-[11px]">
                          <SelectValue placeholder="SELECT TYPE" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0C10] border-white/5">
                          {types?.map((t: any) => (
                            <SelectItem key={t.id} value={t.id.toString()} className="uppercase font-bold text-[11px]">{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider opacity-50">Status</Label>
                      <Select name="statusId">
                        <SelectTrigger className="bg-white/5 border-white/5 uppercase font-bold text-[11px]">
                          <SelectValue placeholder="SELECT STATUS" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0A0C10] border-white/5">
                          {statuses?.map((s: any) => (
                            <SelectItem key={s.id} value={s.id.toString()} className="uppercase font-bold text-[11px]">{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11">
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Campaign
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-2 px-4 rounded-xl border border-white/5">
          <div className="flex flex-1 items-center gap-4 min-w-0">
            {selectedIds.length > 0 && view === "table" ? (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 font-black px-3 py-1">
                  {selectedIds.length} SELECTED
                </Badge>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 text-[11px] font-bold gap-1 uppercase hover:bg-white/5">
                        Status <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0A0C10] border-white/5">
                      {statuses?.map((s: any) => (
                        <DropdownMenuItem
                          key={s.id}
                          className="text-[11px] font-bold uppercase"
                          onClick={() => bulkUpdateMutation.mutate({ ids: selectedIds, data: { statusId: s.id } })}
                        >
                          {s.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    className="h-8 text-[11px] font-bold gap-1 uppercase hover:bg-white/5"
                    onClick={() => {
                      toast.promise(bulkDeleteMutation.mutateAsync(selectedIds), {
                        loading: 'Deleting...',
                        success: 'Deleted successfully',
                        error: 'Failed to delete'
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/50 h-9 font-medium text-white"
                  />
                </div>
                <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                <div className="hidden md:flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] border-none bg-transparent hover:bg-white/5 h-8 font-bold text-[11px] uppercase text-white/60 hover:text-white">
                      <Filter className="h-3 w-3 mr-2 text-primary" />
                      <SelectValue placeholder="STATUS" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0C10] border-white/5">
                      <SelectItem value="all" className="uppercase font-bold text-[11px]">ALL STATUSES</SelectItem>
                      {statuses?.map((s: any) => (
                        <SelectItem key={s.id} value={s.name.toLowerCase()} className="uppercase font-bold text-[11px]">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px] border-none bg-transparent hover:bg-white/5 h-8 font-bold text-[11px] uppercase text-white/60 hover:text-white">
                      <Tag className="h-3 w-3 mr-2 text-primary" />
                      <SelectValue placeholder="TYPE" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0C10] border-white/5">
                      <SelectItem value="all" className="uppercase font-bold text-[11px]">ALL TYPES</SelectItem>
                      {types?.map((t: any) => (
                        <SelectItem key={t.id} value={t.name.toLowerCase()} className="uppercase font-bold text-[11px]">{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-8 font-bold text-[11px] gap-2 hover:bg-white/5 text-white/40 hover:text-white">
              <ArrowUpDown className="h-3.5 w-3.5" />
              SORT
            </Button>
          </div>
        </div>

        {/* View Content */}
        {(() => {
          if (isLoading) {
            return (
              <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-full rounded-xl bg-white/5" />
                <Skeleton className="h-20 w-full rounded-xl bg-white/5" />
                <Skeleton className="h-20 w-full rounded-xl bg-white/5" />
              </div>
            );
          }
          
          if (view === "table") {
            return (
              /* Table View */
              <div className="glass-card overflow-hidden border border-white/5 rounded-2xl">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="w-[40px] py-4 pl-6">
                    <Checkbox
                      checked={selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onCheckedChange={toggleSelectAll}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/20 py-4">Campaign Name</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/20 py-4">Type</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/20 py-4">Status</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/20 py-4">Start Date</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/20 py-4">Budget</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-white/20 py-4 text-right">Actual Cost</TableHead>
                  <TableHead className="w-[50px] py-4 pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 opacity-30">
                        <Megaphone className="h-12 w-12 text-white" />
                        <p className="font-medium text-white">No campaigns found matching your filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign: any) => (
                    <TableRow key={campaign.id} className={cn(
                      "hover:bg-white/5 border-white/5 transition-colors group",
                      selectedIds.includes(campaign.id) && "bg-primary/5 hover:bg-primary/10"
                    )}>
                      <TableCell className="py-4 pl-6">
                        <Checkbox
                          checked={selectedIds.includes(campaign.id)}
                          onCheckedChange={() => toggleSelect(campaign.id)}
                          className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="font-black text-white group-hover:text-primary transition-colors py-4">
                        {campaign.name}
                      </TableCell>
                      <TableCell className="text-white/40 font-bold text-[11px] uppercase tracking-tighter py-4">
                        {campaign.campaignType?.name || "-"}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={cn("font-black uppercase text-[9px] tracking-widest px-2 py-0.5 rounded-sm border-none shadow-none", getStatusColor(campaign.status?.name))}>
                          {campaign.status?.name || "NONE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/30 font-bold text-[11px] py-4">
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="font-black text-white text-[12px] py-4">
                        {campaign.budgetedCost ? `${currencySymbol}${Number(campaign.budgetedCost).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="font-black text-white text-[12px] text-right py-4">
                        {campaign.actualCost ? `${currencySymbol}${Number(campaign.actualCost).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <CampaignActions campaign={campaign} statuses={statuses} updateMutation={updateMutation} deleteMutation={deleteMutation} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
              </div>
            );
          }
          
          return (
            /* Kanban View */
            <div className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] snap-x">
             {statuses?.map((status: any) => {
               const statusCampaigns = filteredCampaigns.filter((c: any) => c.status?.id === status.id);
               return (
                 <div key={status.id} className="flex-shrink-0 w-80 flex flex-col gap-4 snap-start">
                   <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", (() => {
                            const name = status.name.toLowerCase();
                            if (name === 'active') return 'bg-green-500';
                            if (name === 'planning') return 'bg-blue-500';
                            if (name === 'complete') return 'bg-slate-500';
                            return 'bg-red-500';
                          })())} />
                        <h3 className="font-black text-[10px] tracking-[0.2em] uppercase text-white/40">{status.name}</h3>
                        <Badge variant="secondary" className="bg-white/5 text-white/30 border-none font-black text-[9px] h-5 px-1.5">{statusCampaigns.length}</Badge>
                     </div>
                     <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-white/20 hover:text-white hover:bg-white/5">
                        <MoreVertical className="h-3 w-3" />
                     </Button>
                   </div>

                   <div className="flex-1 flex flex-col gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5 min-h-[500px]">
                      {statusCampaigns.map((campaign: any) => (
                        <div 
                          key={campaign.id} 
                          className="bg-[#0D0F14] border border-white/5 p-4 rounded-xl space-y-4 hover:border-primary/30 transition-all group relative shadow-2xl hover:translate-y-[-2px]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-[13px] font-black leading-tight text-white/90 group-hover:text-primary transition-colors line-clamp-2">
                              {campaign.name}
                            </h4>
                            <CampaignActions campaign={campaign} statuses={statuses} updateMutation={updateMutation} deleteMutation={deleteMutation} variant="ghost" />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black uppercase tracking-widest h-5">
                              {campaign.campaignType?.name || "UNSET"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div className="text-[10px] font-black text-white">
                                {campaign.budgetedCost ? `${currencySymbol}${Number(campaign.budgetedCost).toLocaleString()}` : "-"}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20">
                              <Calendar className="h-3 w-3" />
                              {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "-"}
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button 
                        variant="ghost" 
                        className="w-full h-10 border border-dashed border-white/10 text-white/30 hover:text-white hover:bg-white/5 hover:border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                        onClick={() => {
                          // Handle creation in this specific status if needed
                          setIsOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" /> ADD CAMPAIGN
                      </Button>
                   </div>
                 </div>
               );
             })}
            </div>
          );
        })()}
      </div>
    </CRMLayout>
  );
}

function CampaignActions({ campaign, statuses, updateMutation, deleteMutation, variant = "ghost" }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#0A0C10] border-white/10 w-[180px] backdrop-blur-xl shadow-2xl">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Quick Actions</DropdownMenuLabel>
        <DropdownMenuItem
          className="text-[11px] font-bold uppercase gap-2 transition-all"
          onClick={() => {
            const activeStatus = statuses?.find((s: any) => s.name.toLowerCase() === 'active');
            if (activeStatus) {
              toast.promise(updateMutation.mutateAsync({ id: campaign.id, data: { statusId: activeStatus.id } }), {
                loading: 'Activating...',
                success: 'Campaign ACTIVE',
                error: 'Failed to start'
              });
            }
          }}
        >
          <Play className="h-3.5 w-3.5 text-green-500" /> Start Campaign
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-[11px] font-bold uppercase gap-2"
          onClick={() => {
            const inactiveStatus = statuses?.find((s: any) => s.name.toLowerCase() === 'inactive');
            if (inactiveStatus) {
              toast.promise(updateMutation.mutateAsync({ id: campaign.id, data: { statusId: inactiveStatus.id } }), {
                loading: 'Pausing...',
                success: 'Campaign PAUSED',
                error: 'Failed to pause'
              });
            }
          }}
        >
          <Pause className="h-3.5 w-3.5 text-yellow-500" /> Pause
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-[11px] font-bold uppercase gap-2"
          onClick={() => {
            const completeStatus = statuses?.find((s: any) => s.name.toLowerCase() === 'complete');
            if (completeStatus) {
              toast.promise(updateMutation.mutateAsync({ id: campaign.id, data: { statusId: completeStatus.id } }), {
                loading: 'Closing...',
                success: 'Campaign COMPLETE',
                error: 'Failed to complete'
              });
            }
          }}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Complete
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Management</DropdownMenuLabel>
        <DropdownMenuItem className="text-[11px] font-bold uppercase gap-2">
          <Copy className="h-3.5 w-3.5" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-[11px] font-bold uppercase gap-2 text-red-500 focus:text-red-500"
          onClick={() => {
            toast.promise(deleteMutation.mutateAsync(campaign.id), {
              loading: 'Deleting...',
              success: 'Campaign removed',
              error: 'Failed'
            });
          }}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
