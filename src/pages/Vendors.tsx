import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Building2, 
  Globe, 
  Mail, 
  Download, 
  Filter,
  Edit,
  Trash2,
  Briefcase,
  LayoutGrid,
  List,
  ChevronRight,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { Vendor } from "@/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Kanban Droppable Column
const DroppableColumn = ({ id, children }: { id: string; children: (props: { setNodeRef: (node: HTMLElement | null) => void }) => React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id });
  return children({ setNodeRef });
};

// Sortable Vendor Card
const SortableVendorCard = ({ vendor, onClick }: { vendor: Vendor; onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vendor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="group relative bg-white/[0.03] border border-white/5 p-5 rounded-[2rem] hover:bg-white/[0.05] hover:border-primary/20 transition-all cursor-pointer mb-3 shadow-xl"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-[1.2rem] bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden shadow-inner group-hover:border-primary/40 transition-all"
          style={vendor.image ? { backgroundImage: `url(${vendor.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {!vendor.image && <Briefcase className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />}
        </div>
        <div>
           <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{vendor.name}</p>
           <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{vendor.city || "Global HQ"}</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
         <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest px-2 py-0">PARTNER</Badge>
         {vendor.category && (
           <Badge className="bg-white/5 text-white/40 border-none text-[8px] font-black tracking-widest px-2 py-0 uppercase italic">{vendor.category}</Badge>
         )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium pt-3 border-t border-white/5">
         <div className="flex items-center gap-2">
            <Globe className="h-3 w-3 opacity-30" />
            <span className="truncate max-w-[120px]">{vendor.website || "No digital node"}</span>
         </div>
         <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default function Vendors() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const search = "";
  const category = "all";
  const [view, setView] = useState<"table" | "kanban">("table");

  const categories = [
    { id: "Software", name: "Software Systems", color: "#3b82f6" },
    { id: "Hardware", name: "Hardware Infrastructure", color: "#ef4444" },
    { id: "Logistics", name: "Global Logistics", color: "#10b981" },
    { id: "Consulting", name: "Professional Services", color: "#f59e0b" },
    { id: "Other", name: "General Partners", color: "#6b7280" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["vendors", search, category],
    queryFn: () => api.vendors.getAll(search, category === "all" ? undefined : category),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => api.vendors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor matrix synchronized");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.vendors.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor relationship terminated");
    },
  });

  const handleDelete = async (vendor: Vendor) => {
    if (await confirm({
      title: "Remove Strategic Partner",
      description: `Target: ${vendor.name}. This will archive all associated procurement intelligence. Proceed?`,
      variant: "destructive",
      confirmText: "Purge Partner"
    })) {
      deleteMutation.mutate(vendor.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const vendorId = active.id as string;
    const newCategory = over.id as string;
    
    const vendor = vendors.find((v: Vendor) => v.id === vendorId);
    if (vendor && vendor.category !== newCategory) {
      updateMutation.mutate({ id: vendorId, data: { category: newCategory } });
    }
  };

  const stats = {
    total: vendors.length,
    software: vendors.filter((v: Vendor) => v.category === "Software").length,
    logistics: vendors.filter((v: Vendor) => v.category === "Logistics").length,
    active: vendors.length,
    avgScore: 85,
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <CRMLayout title="Vendors">
        <div className="flex flex-col h-full items-center justify-center">
           <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Synchronizing Global Vendor Matrix</p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Vendors">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Vendors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Building2 className="h-3 w-3 inline mr-1" />
                Active partners
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Software
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats.software}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Systems & SaaS
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Logistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.logistics}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supply chain
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                100%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Verified status
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgScore}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Partner index
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex border rounded-lg overflow-hidden h-9">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "kanban" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none px-3"
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            <Select value={category} onValueChange={(v) => {}}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => navigate("/vendor/new")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Vendor
            </Button>
          </div>
        </div>

        {view === "table" ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                  </TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-sm text-muted-foreground">
                      No vendors found for this view.
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor: Vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-primary" />
                           </div>
                           <div>
                              <p className="font-semibold text-sm">{vendor.name}</p>
                              <p className="text-xs text-muted-foreground">{vendor.email || "No contact info"}</p>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                          {vendor.category || "General"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          {vendor.city || "Remote"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted">
                          {vendor.website || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-600">
                          {92}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(vendor.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(vendor)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                Showing {vendors.length} vendors
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-8" disabled>Next</Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="flex gap-6 h-full min-w-max pb-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="w-[380px] flex flex-col h-full group/col">
                     <div className="flex items-center justify-between px-4 mb-6">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ backgroundColor: cat.color }} />
                           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-hover/col:text-white transition-colors italic">{cat.name}</h3>
                           <Badge variant="secondary" className="text-[9px] px-1.5 h-4 ml-2">{vendors.filter(v => v.category === cat.id).length}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted opacity-0 group-hover/col:opacity-100 transition-opacity">
                           <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                     </div>

                     <DroppableColumn id={cat.id}>
                       {({ setNodeRef }) => (
                         <div ref={setNodeRef} className="flex-1 bg-muted/20 border border-dashed border-border rounded-[2.5rem] p-4 min-h-[500px] transition-colors hover:bg-muted/30">
                            <SortableContext items={vendors.filter(v => v.category === cat.id).map(v => v.id)} strategy={verticalListSortingStrategy}>
                               {vendors.filter(v => v.category === cat.id).map((vendor) => (
                                 <SortableVendorCard
                                   key={vendor.id}
                                   vendor={vendor}
                                   onClick={() => navigate(`/vendors/${vendor.id}`)}
                                 />
                               ))}
                            </SortableContext>
                         </div>
                       )}
                     </DroppableColumn>
                  </div>
                ))}
              </div>
            </DndContext>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
