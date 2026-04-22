import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
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
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerDescription } from "@/components/ui/drawer";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

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
  Plus,
  Building2,
  GripVertical,
  Clock,
  DollarSign,
  List,
  LayoutGrid,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";
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

function DraggableDeal({ deal, onClick, currencyCode }: { deal: Deal, onClick: () => void, currencyCode: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: "deal",
      deal,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const fmt = (v: number) => <CurrencyNumbers amount={v} />;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all p-3 shadow-sm border border-border/50 bg-card group relative ${isDragging ? "ring-2 ring-primary ring-offset-2 z-50" : ""}`}
      onClick={(e) => {
        // Prevent click when dragging
        if (transform) return;
        onClick();
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <span className="font-bold text-xs group-hover:text-primary transition-colors line-clamp-1">{deal.name}</span>
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-sm font-black tracking-tight">{fmt(deal.value || 0)}</div>
        
        <div className="mt-2 flex flex-col gap-1">
          {deal.company && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <Building2 className="h-2.5 w-2.5" />
              <span className="truncate">{deal.company}</span>
            </div>
          )}
          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
              <Clock className="h-2.5 w-2.5" />
              <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function StageColumn({ stage, deals, totalValue, onDealClick, currencyCode }: {
  stage: DealStage;
  deals: Deal[];
  totalValue: number;
  onDealClick: (deal: Deal) => void;
  currencyCode: string;
}) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ 
    id: stage.id,
    data: {
      type: "stage",
      stageId: stage.id,
    }
  });

  const fmt = (v: number) => <CurrencyNumbers amount={v} />;

  return (
    <div className={`flex flex-col w-[280px] shrink-0 bg-muted/20 rounded-xl border border-border/40 overflow-hidden transition-colors ${isOver ? 'bg-muted/40 ring-1 ring-primary/20' : ''}`}>
      <div className="p-3 border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="font-black text-[10px] uppercase tracking-wider">{stage.name}</span>
            <Badge variant="outline" className="h-4 px-1 text-[9px] font-black border-border/50 bg-background">
              {deals.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs font-black tracking-tight flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          {fmt(totalValue)}
        </div>
      </div>

      <div ref={setNodeRef} className="p-2 space-y-2 flex-1 scrollbar-none overflow-y-auto min-h-[500px]">
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DraggableDeal 
              key={deal.id} 
              deal={deal} 
              onClick={() => onDealClick(deal)} 
              currencyCode={currencyCode}
            />
          ))}
        </SortableContext>
        
        {deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/20 rounded-lg m-1">
            <div className="h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center mb-2">
               <Plus className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter">{t('deals.kanban.dropHere')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const Deals = () => {
  const { code: currencyCode } = useDefaultCurrency();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const { t } = useTranslation();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowAddDeal(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
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
  const [newActivity, setNewActivity] = useState({ typeId: 0, subject: "", description: "", dueDate: "" });
  const [targetStageId, setTargetStageId] = useState<number | null>(null);

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
      toast.success("Deal deleted successfully");
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
    return <CurrencyNumbers amount={value} />;
  };

  const handleStageChange = async (dealId: number, newStageId: number) => {
    const newStage = stages.find((s: DealStage) => s.id === newStageId);
    const isWon = newStage?.name?.toLowerCase().includes("won");
    const isLost = newStage?.name?.toLowerCase().includes("lost");
    
    if (isWon || isLost) {
      setSelectedDeal(deals.find((d: Deal) => d.id === dealId));
      setTargetStageId(newStageId);
      setShowReason(true);
    } else {
      await updateMutation.mutateAsync({ id: dealId, data: { dealStageId: newStageId } });
    }
  };

  const handleReasonSelect = async (reasonId: number) => {
    if (!selectedDeal || !targetStageId) return;
    await updateMutation.mutateAsync({
      id: selectedDeal.id,
      data: { dealStageId: targetStageId, dealReasonId: reasonId },
    });
    setShowReason(false);
    setSelectedDeal(null);
    setTargetStageId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveDragId(null);
      return;
    }

    const dealId = active.id;
    const overId = over.id;
    
    // Check if dropped over a stage or another deal
    let newStageId: number | null = null;
    if (over.data.current?.type === "stage") {
      newStageId = overId as number;
    } else if (over.data.current?.type === "deal") {
      newStageId = over.data.current.deal.dealStageId;
    }

    if (newStageId && newStageId !== active.data.current?.deal.dealStageId) {
      await handleStageChange(dealId as number, newStageId);
    }
    
    setActiveDragId(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const handleAddDeal = () => {
    if (!newDeal.name) {
      toast.error(t('deals.forms.errors.nameRequired', 'Deal name is required'));
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
      <CRMLayout title={t('deals.title', 'Deals Pipeline')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t('deals.title', 'Deals Pipeline')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {t('deals.stats.totalPipeline')}: <span className="font-semibold text-foreground">{formatCurrency(totalPipeline)}</span>
            </div>
            <div className="text-sm text-green-600">
              {t('deals.stats.won')}: <span className="font-semibold">{formatCurrency(wonValue)}</span>
            </div>
            <div className="text-sm text-red-600">
              {t('deals.stats.lost')}: <span className="font-semibold">{formatCurrency(lostValue)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('deals.toolbar.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setView(view === "kanban" ? "list" : "kanban")}>
              {view === "kanban" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Button size="sm" onClick={() => setShowAddDeal(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('deals.toolbar.add')}
            </Button>
          </div>
        </div>

        {view === "kanban" ? (
          <DndContext 
            sensors={sensors} 
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 px-1 min-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {sortedStages.map((stage: DealStage) => {
                const stageDeals = groupedDeals[stage.id] || [];
                const stageTotal = stageDeals.reduce((sum: number, d: Deal) => sum + (d.value || 0), 0);
                
                return (
                  <StageColumn
                    key={stage.id}
                    stage={stage}
                    deals={stageDeals}
                    totalValue={stageTotal}
                    currencyCode={currencyCode}
                    onDealClick={(deal) => {
                       navigate(`/deals/${deal.id}`);
                    }}
                  />
                );
              })}
            </div>

            <DragOverlay>
              {activeDragId ? (
                <div className="w-[280px]">
                  <DraggableDeal 
                    deal={deals.find(d => d.id === activeDragId)!} 
                    onClick={() => {}} 
                    currencyCode={currencyCode} 
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('deals.table.name')}</TableHead>
                  <TableHead>{t('deals.table.company')}</TableHead>
                  <TableHead>{t('deals.table.value')}</TableHead>
                  <TableHead>{t('deals.table.stage')}</TableHead>
                  <TableHead>{t('deals.table.expectedClose')}</TableHead>
                  <TableHead>{t('deals.table.probability')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal: Deal) => (
                  <TableRow key={deal.id} className="cursor-pointer" onClick={() => navigate(`/deals/${deal.id}`)}>
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
            <DrawerTitle>{t('deals.forms.title')}</DrawerTitle>
            <DrawerDescription>{t('deals.forms.desc')}</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{t('deals.forms.name')} *</Label>
              <Input
                value={newDeal.name}
                onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                placeholder={t('deals.forms.placeholder.name')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('deals.forms.value')}</Label>
              <Input
                type="number"
                value={newDeal.value}
                onChange={(e) => setNewDeal({ ...newDeal, value: parseFloat(e.target.value) || 0 })}
                placeholder={t('deals.forms.placeholder.value')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('deals.forms.stage')}</Label>
              <Select
                value={String(newDeal.dealStageId)}
                onValueChange={(val) => setNewDeal({ ...newDeal, dealStageId: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('deals.forms.placeholder.stage')} />
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
              <Label>{t('deals.forms.account')}</Label>
              <Select
                value={String(newDeal.accountId)}
                onValueChange={(val) => setNewDeal({ ...newDeal, accountId: val === "none" ? undefined : parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('deals.forms.placeholder.account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('deals.forms.placeholder.none')}</SelectItem>
                  {accounts.map((acc: Account) => (
                    <SelectItem key={acc.id} value={String(acc.id)}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('deals.forms.contact')}</Label>
              <Select
                value={String(newDeal.contactId)}
                onValueChange={(val) => setNewDeal({ ...newDeal, contactId: val === "none" ? undefined : parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('deals.forms.placeholder.contact')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('deals.forms.placeholder.none')}</SelectItem>
                  {contacts.map((cont: Contact) => (
                    <SelectItem key={cont.id} value={String(cont.id)}>
                      {cont.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('deals.forms.expectedCloseDate')}</Label>
              <Input
                type="date"
                value={newDeal.expectedCloseDate}
                onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('deals.forms.notes')}</Label>
              <Textarea
                value={newDeal.notes}
                onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
                placeholder={t('deals.forms.placeholder.notes')}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowAddDeal(false)}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleAddDeal} disabled={createMutation.isPending}>
              {createMutation.isPending ? t('deals.forms.creating') : t('deals.toolbar.add')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Detail logic moved to DealDetail.tsx */}

        <Dialog open={showReason} onOpenChange={setShowReason}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deals.reasons.title')}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              {reasons
                .filter((r: DealReason) => {
                  const stageName = stages.find((s: DealStage) => s.id === targetStageId)?.name || "";
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
