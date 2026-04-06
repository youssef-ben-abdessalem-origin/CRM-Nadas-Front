import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  ArrowRight,
  X,
  ExternalLink,
  Building2,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  LayoutGrid,
  List,
  Trash2,
  GripVertical,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Copy,
  Circle,
  CheckSquare,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

interface Deal {
  id: number;
  name: string;
  company: string;
  value: number;
  contact: string;
  probability: number;
  daysInStage: number;
  expectedCloseDate: string;
  notes: string;
  dealStageId: number;
  stage: { id: number; name: string; color: string; order: number };
  dealReasonId: number;
  reason: { id: number; name: string; color: string };
  leadId: number;
  accountId: number;
  contactId: number;
  ownerId: number;
  owner: { id: number; name: string; email: string };
  createdAt: string;
}

interface DealStage {
  id: number;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

interface DealReason {
  id: number;
  name: string;
  color: string;
  type: string;
}

interface Account {
  id: number;
  name: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
}

function StageColumn({ stage, deals, totalValue, isWon, isLost, onDealClick }: {
  stage: DealStage;
  deals: Deal[];
  totalValue: number;
  isWon: boolean;
  isLost: boolean;
  onDealClick: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);

  return (
    <div className={`min-w-[300px] w-[300px] flex-shrink-0 ${isOver ? 'bg-muted/50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="font-medium text-sm">{stage.name}</span>
          <Badge variant="secondary" className="text-xs">{deals.length}</Badge>
        </div>
      </div>
      <div ref={setNodeRef} className="space-y-2 min-h-[200px] p-1">
        {deals.map((deal) => (
          <Card key={deal.id} className="cursor-pointer hover:bg-muted/80 transition-colors p-3" onClick={() => onDealClick(deal)}>
            <div className="font-medium text-sm mb-1">{deal.name}</div>
            <div className="text-lg font-semibold">{fmt(deal.value || 0)}</div>
            {deal.contact && <div className="text-xs text-muted-foreground">{deal.contact}</div>}
            {deal.expectedCloseDate && <div className="text-xs text-muted-foreground">Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</div>}
          </Card>
        ))}
        {deals.length === 0 && (
          <div className="text-center text-muted-foreground py-4 text-sm">No deals</div>
        )}
      </div>
      <div className="mt-2 pt-2 border-t">
        <span className="text-sm font-medium">{fmt(totalValue)}</span>
      </div>
    </div>
  );
}

const Deals = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "",
    value: 0,
    dealStageId: 0 as number | undefined,
    accountId: undefined as number | undefined,
    contactId: undefined as number | undefined,
    expectedCloseDate: "",
    notes: "",
  });
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({
    typeId: 0,
    subject: "",
    description: "",
    dueDate: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: () => api.deals.getAll().catch(() => []),
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["deal-stages"],
    queryFn: () => api.deals.getStages().catch(() => []),
  });

  const { data: reasons = [] } = useQuery({
    queryKey: ["deal-reasons"],
    queryFn: () => api.deals.getReasons().catch(() => []),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts-all"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts-all"],
    queryFn: () => api.contacts.getAll().catch(() => []),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api.activities.getTypes().catch(() => []),
  });

  const { data: dealActivities = [] } = useQuery({
    queryKey: ["deal-activities", selectedDeal?.id],
    queryFn: () => selectedDeal ? api.activities.getByEntity("deal", selectedDeal.id).catch(() => []) : [],
    enabled: !!selectedDeal,
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: any) => api.activities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-activities"] });
      toast.success("Activity added");
      setShowActivity(false);
      setNewActivity({ typeId: 0, subject: "", description: "", dueDate: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const completeActivityMutation = useMutation({
    mutationFn: (id: number) => api.activities.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deal-activities"] });
      toast.success("Activity completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: api.deals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal created");
      setShowAddDeal(false);
      setNewDeal({ name: "", value: 0, dealStageId: undefined, accountId: undefined, contactId: undefined, expectedCloseDate: "", notes: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.deals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deals.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Deal deleted");
      setShowDetail(false);
      setSelectedDeal(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filteredDeals = deals.filter((deal: Deal) => {
    if (!search) return true;
    return (
      deal.name.toLowerCase().includes(search.toLowerCase()) ||
      (deal.company?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (deal.contact?.toLowerCase() || "").includes(search.toLowerCase())
    );
  });

  const sortedStages = [...stages].sort((a: DealStage, b: DealStage) => a.order - b.order);

  const groupedDeals = sortedStages.reduce((acc, stage: DealStage) => {
    acc[stage.id] = filteredDeals.filter((d: Deal) => d.dealStageId === stage.id);
    return acc;
  }, {} as Record<number, Deal[]>);

  const totalPipeline = deals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);
  const wonDeals = deals.filter((d: Deal) => d.stage?.name?.toLowerCase().includes("won"));
  const lostDeals = deals.filter((d: Deal) => d.stage?.name?.toLowerCase().includes("lost"));
  const wonValue = wonDeals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);
  const lostValue = lostDeals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  };

  const handleStageChange = async (dealId: number, newStageId: number) => {
    const newStage = stages.find((s: DealStage) => s.id === newStageId);
    const isWon = newStage?.name?.toLowerCase().includes("won");
    const isLost = newStage?.name?.toLowerCase().includes("lost");
    
    if (isWon || isLost) {
      setSelectedDeal(deals.find((d: Deal) => d.id === dealId));
      setShowReason(true);
    } else {
      await updateMutation.mutateAsync({ id: dealId, data: { dealStageId: newStageId } });
    }
  };

  const handleReasonSelect = async (reasonId: number) => {
    if (!selectedDeal) return;
    await updateMutation.mutateAsync({
      id: selectedDeal.id,
      data: { dealStageId: selectedDeal.dealStageId, dealReasonId: reasonId },
    });
    setShowReason(false);
    setSelectedDeal(null);
    setShowDetail(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = active.id;
    const newStageId = over.id;

    if (newStageId !== active.data.current?.stageId) {
      await handleStageChange(dealId as number, newStageId as number);
    }
    setActiveDragId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const handleAddDeal = () => {
    if (!newDeal.name) {
      toast.error("Deal name is required");
      return;
    }
    createMutation.mutate({
      name: newDeal.name,
      value: newDeal.value || 0,
      dealStageId: newDeal.dealStageId,
      accountId: newDeal.accountId,
      contactId: newDeal.contactId,
      expectedCloseDate: newDeal.expectedCloseDate || undefined,
      notes: newDeal.notes,
    });
  };

  if (isLoading) {
    return (
      <CRMLayout title="Deals Pipeline">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading deals...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Deals Pipeline">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Total pipeline: <span className="font-semibold text-foreground">{formatCurrency(totalPipeline)}</span>
            </div>
            <div className="text-sm text-green-600">
              Won: <span className="font-semibold">{formatCurrency(wonValue)}</span>
            </div>
            <div className="text-sm text-red-600">
              Lost: <span className="font-semibold">{formatCurrency(lostValue)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setView(view === "kanban" ? "list" : "kanban")}>
              {view === "kanban" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={() => setShowAddDeal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Deal
            </Button>
          </div>
        </div>

        {view === "kanban" ? (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {sortedStages.map((stage: DealStage) => {
                const stageDeals = groupedDeals[stage.id] || [];
                const stageTotal = stageDeals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);
                const isWon = stage.name.toLowerCase().includes("won");
                const isLost = stage.name.toLowerCase().includes("lost");
                
                return (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    deals={stageDeals}
                    totalValue={stageTotal}
                    isWon={isWon}
                    isLost={isLost}
                    onDealClick={(deal) => {
                      setSelectedDeal(deal);
                      setShowDetail(true);
                    }}
                  />
                );
              })}
            </div>
          </DndContext>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Expected Close</TableHead>
                  <TableHead>Probability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal: Deal) => (
                  <TableRow key={deal.id} className="cursor-pointer" onClick={() => { setSelectedDeal(deal); setShowDetail(true); }}>
                    <TableCell className="font-medium">{deal.name}</TableCell>
                    <TableCell>{deal.company || "—"}</TableCell>
                    <TableCell>{formatCurrency(deal.value || 0)}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: deal.stage?.color + "20", color: deal.stage?.color }}>
                        {deal.stage?.name || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{deal.probability || 0}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Drawer open={showAddDeal} onOpenChange={setShowAddDeal}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Deal</DrawerTitle>
            <DrawerDescription>Add a new deal to your pipeline.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Deal Name *</Label>
              <Input
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                placeholder="Enter deal name"
              />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                type="number"
                value={newDeal.value}
                onChange={(e) => setNewDeal({ ...newDeal, value: parseFloat(e.target.value) || 0 })}
                placeholder="Enter deal value"
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={String(newDeal.dealStageId)}
                onValueChange={(val) => setNewDeal({ ...newDeal, dealStageId: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage: DealStage) => (
                    <SelectItem key={stage.id} value={String(stage.id)}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={String(newDeal.accountId)}
                onValueChange={(val) => setNewDeal({ ...newDeal, accountId: val === "none" ? undefined : parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {accounts.map((acc: Account) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select
                value={String(newDeal.contactId)}
                onValueChange={(val) => setNewDeal({ ...newDeal, contactId: val === "none" ? undefined : parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((cont: Contact) => (
                    <SelectItem key={cont.id} value={String(cont.id)}>
                      {cont.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={newDeal.expectedCloseDate}
                onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newDeal.notes}
                onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                placeholder="Add notes..."
              />
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowAddDeal(false)}>Cancel</Button>
            <Button onClick={handleAddDeal} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Deal"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={showDetail && !!selectedDeal} onOpenChange={(open) => { setShowDetail(open); if (!open) setSelectedDeal(null); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedDeal?.name}</DialogTitle>
            <DialogDescription>
              {selectedDeal?.company || "No company"} · {selectedDeal?.contact || "No contact"}
            </DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="text-lg font-semibold">{formatCurrency(selectedDeal.value || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="text-lg font-semibold">{selectedDeal.probability || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stage</p>
                  <Badge style={{ backgroundColor: selectedDeal.stage?.color + "20", color: selectedDeal.stage?.color }}>
                    {selectedDeal.stage?.name || "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Close</p>
                  <p className="text-lg font-semibold">
                    {selectedDeal.expectedCloseDate ? new Date(selectedDeal.expectedCloseDate).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
              {selectedDeal.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedDeal.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Activities</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowActivity(true)}>
                    <Plus className="h-4 w-4" /><span className="ml-1">Add</span>
                  </Button>
                </div>
                {dealActivities && dealActivities.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {dealActivities.map((activity: any) => (
                      <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <button onClick={() => !activity.completed && completeActivityMutation.mutate(activity.id)}>
                            {activity.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                          </button>
                          <div>
                            <p className={`text-sm ${activity.completed ? "line-through text-muted-foreground" : ""}`}>{activity.subject || "Activity"}</p>
                            <p className="text-xs text-muted-foreground">{activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : "No due date"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No activities</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => deleteMutation.mutate(selectedDeal?.id)}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        <Dialog open={showReason} onOpenChange={setShowReason}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Reason</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              {reasons
                .filter((r: DealReason) => {
                  const stageName = stages.find((s: DealStage) => s.id === selectedDeal?.dealStageId)?.name || "";
                  return stageName.toLowerCase().includes("won") ? r.type === "win" : r.type === "lost";
                })
                .map((reason: DealReason) => (
                  <Button
                    key={reason.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleReasonSelect(reason.id)}
                  >
                    <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: reason.color }} />
                    {reason.name}
                  </Button>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

export default Deals;
