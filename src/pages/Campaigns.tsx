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
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Megaphone, Loader2, MoreVertical, Trash2,
  Copy, Play, Pause, CheckCircle2, Search, Filter,
  ChevronDown, Calendar, Tag, LayoutGrid, List
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
import { useConfirm } from "@/hooks/use-confirm";

export default function CampaignsPage() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { symbol: currencySymbol } = useDefaultCurrency();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api.campaigns.getAll().catch(() => []),
  });

  const { data: types = [] } = useQuery({
    queryKey: ["campaign-types"],
    queryFn: () => api.campaigns.getTypes().catch(() => []),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["campaign-statuses"],
    queryFn: () => api.campaigns.getStatuses().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.campaigns.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setIsOpen(false);
      toast.success("Campaign created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.campaigns.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.campaigns.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success("Campaign deleted");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return Promise.all(ids.map(id => api.campaigns.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedIds([]);
      toast.success("Batch operations complete");
    },
  });

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status?.name.toLowerCase() === statusFilter.toLowerCase();
      const matchesType = typeFilter === "all" || c.campaignType?.name.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [campaigns, searchQuery, statusFilter, typeFilter]);

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filteredCampaigns.length ? [] : filteredCampaigns.map((c: any) => c.id));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    createMutation.mutate({
      ...data,
      statusId: data.statusId ? Number(data.statusId) : undefined,
      campaignTypeId: data.campaignTypeId ? Number(data.campaignTypeId) : undefined,
      budgetedCost: data.budgetedCost ? Number(data.budgetedCost) : 0,
    });
  };

  if (isLoading) {
    return (
      <CRMLayout title="Campaigns">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading campaigns...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Campaigns">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Manage and track your marketing efforts</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded-lg p-0.5 bg-muted/30">
                <Button variant={view === "table" ? "secondary" : "ghost"} size="sm" className="h-7 px-3" onClick={() => setView("table")}>
                    <List className="h-3.5 w-3.5 mr-2" /> Table
                </Button>
                <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" className="h-7 px-3" onClick={() => setView("kanban")}>
                    <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Kanban
                </Button>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campaign Name *</Label>
                    <Input name="name" required placeholder="Summer Sale 2026" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select name="campaignTypeId">
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {types.map((t: any) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select name="statusId">
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          {statuses.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget ({currencySymbol})</Label>
                    <Input name="budgetedCost" type="number" placeholder="5000" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Campaign"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 bg-muted/20 p-2 rounded-lg border">
            <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search campaigns..." 
                        className="pl-9 h-9 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                        <Filter className="h-3 w-3 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statuses.map((s: any) => <SelectItem key={s.id} value={s.name.toLowerCase()}>{s.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            {selectedIds.length > 0 && (
                <Button variant="destructive" size="sm" onClick={() => bulkDeleteMutation.mutate(selectedIds)}>
                    <Trash2 className="h-3 w-3 mr-2" /> Delete {selectedIds.length}
                </Button>
            )}
        </div>

        {/* Table View */}
        {view === "table" ? (
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px] pl-4">
                                <Checkbox checked={selectedIds.length === filteredCampaigns.length} onCheckedChange={toggleSelectAll} />
                            </TableHead>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead className="text-right pr-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCampaigns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No campaigns found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCampaigns.map((c: any) => (
                                <TableRow key={c.id}>
                                    <TableCell className="pl-4">
                                        <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => toggleSelect(c.id)} />
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{c.campaignType?.name || "None"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={c.status?.name.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                                            {c.status?.name || "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {c.budgetedCost ? `${currencySymbol}${Number(c.budgetedCost).toLocaleString()}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-right pr-4">
                                        <CampaignActions campaign={c} deleteMutation={deleteMutation} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        ) : (
            /* Kanban View */
            <div className="flex gap-4 overflow-x-auto pb-4">
                {statuses.map((status: any) => {
                    const statusCampaigns = filteredCampaigns.filter((c: any) => c.status?.id === status.id);
                    return (
                        <div key={status.id} className="min-w-[300px] bg-muted/20 border rounded-xl p-3 h-fit">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-2 font-semibold">
                                    <span className="text-sm">{status.name}</span>
                                    <Badge variant="secondary" className="h-5 px-1.5">{statusCampaigns.length}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {statusCampaigns.map((c: any) => (
                                    <Card key={c.id} className="shadow-sm hover:ring-1 hover:ring-primary/20 transition-all cursor-pointer">
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-semibold mb-1 line-clamp-1">{c.name}</h4>
                                                <CampaignActions campaign={c} deleteMutation={deleteMutation} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-[10px] py-0">{c.campaignType?.name}</Badge>
                                                <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {c.startDate ? new Date(c.startDate).toLocaleDateString() : "No date"}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </CRMLayout>
  );
}

function CampaignActions({ campaign, deleteMutation }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Copy className="h-4 w-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem 
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => deleteMutation.mutate(campaign.id)}
                >
                    <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
