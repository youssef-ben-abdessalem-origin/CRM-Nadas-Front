import { useState } from "react";
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
  defaultDropAnimationSideEffects,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  LayoutGrid,
  List,
  Target,
  FileText,
  ArrowUpRight,
  ClipboardList,
  CheckSquare,
  Timer,
  AlertTriangle,
  Zap,
  Sparkles,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { format, isToday, isBefore, addDays } from "date-fns";
import { DynamicAutoSelect } from "@/components/ui/DynamicAutoSelect";

interface Task {
  id: number;
  subject: string;
  description: string;
  dueDate: string;
  status: string; // todo, in_progress, done, cancelled
  priority: string; // low, medium, high, urgent
  entityType: string;
  entityId: number;
  assignedToId: number;
  assignedTo?: { id: number; name: string };
  typeId: number;
  type?: { id: number; name: string; icon?: string };
}

interface Column {
  id: string;
  title: string;
  color: string;
  icon: React.ReactNode;
}

const columns: Column[] = [
  { id: "todo", title: "To Do", color: "#94a3b8", icon: <ClipboardList className="h-4 w-4" /> },
  { id: "in_progress", title: "In Progress", color: "#6366f1", icon: <Timer className="h-4 w-4" /> },
  { id: "done", title: "Complete", color: "#10b981", icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: "cancelled", title: "Cancelled", color: "#ef4444", icon: <AlertTriangle className="h-4 w-4" /> },
];



const getPriorityInfo = (priority: string) => {
  switch (priority) {
    case "urgent": return { color: "text-red-400 bg-red-400/10 border-red-400/20", label: "Urgent" };
    case "high": return { color: "text-orange-400 bg-orange-400/10 border-orange-400/20", label: "High" };
    case "medium": return { color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20", label: "Medium" };
    default: return { color: "text-slate-400 bg-slate-400/10 border-slate-400/20", label: "Low" };
  }
};

const SortableTaskCard = ({ task, onClick }: { task: Task; onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.status !== 'done' && task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate));

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="opacity-30 cursor-grabbing">
        <div className="task-card border-dashed border-primary/40 bg-primary/5 h-24 rounded-xl" />
      </div>
    );
  }

  const pInfo = getPriorityInfo(task.priority);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="group"
      onClick={onClick}
    >
      <div className="task-card group/card bg-[#1a1f2e] border border-border/40 hover:border-primary/40 p-4 rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${pInfo.color.split(' ')[0].replace('text-', 'bg-')}`} />
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-slate-200 group-hover/card:text-primary transition-colors line-clamp-1 leading-tight">
              {task.subject || "Untitled Task"}
            </h4>
            <Badge variant="outline" className={`text-[9px] font-bold tracking-tight uppercase px-1.5 py-0 shrink-0 ${pInfo.color}`}>
              {pInfo.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {task.entityType && (
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                {task.entityType === 'lead' ? <Target className="h-3 w-3" /> :
                  task.entityType === 'contact' ? <User className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                <span className="capitalize">{task.entityType}</span>
              </div>
            )}
            {task.dueDate && (
              <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), "MMM dd")}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-border/60">
                {task.assignedTo?.name?.charAt(0) || "U"}
              </div>
              <span className="text-[10px] font-medium text-slate-400 truncate max-w-[80px]">
                {task.assignedTo?.name || "Unassigned"}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium",
    status: "todo",
    typeId: "1",
    entityType: "lead",
    entityId: "",
    assignedToId: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { data: tasks = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.activities.getAll(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.leads.getAll(),
    enabled: showCreate && formData.entityType === "lead",
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.getAll(),
    enabled: showCreate && formData.entityType === "contact",
  });

  const createMutation = useMutation({
    mutationFn: api.activities.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Strategic Protocol Initialized");
      setShowCreate(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || "Failed to create task"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      console.log('Updating task:', id, data);
      return api.activities.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Status updated");
    },
    onError: (err: any) => {
      console.error('Update failed:', err);
      toast.error(err.message || "Failed to update status");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;
    const taskId = active.id as number;
    const overId = over.id as string;
    const task = tasks.find((t: Task) => t.id === taskId);
    if (task && overId && columns.some(c => c.id === overId) && task.status !== overId) {
      updateMutation.mutate({ id: taskId, data: { status: overId } });
      toast.success(`Moved to ${columns.find(c => c.id === overId)?.title}`);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: "",
      description: "",
      priority: "medium",
      status: "todo",
      typeId: "1",
      entityType: "lead",
      entityId: "",
      assignedToId: "",
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const filteredTasks = tasks.filter((t: Task) =>
    t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnTasks = (columnId: string) =>
    filteredTasks.filter((t: Task) => (t.status || "todo") === columnId);

  const getEntityOptions = () => {
    if (formData.entityType === "lead") {
      // Filter out duplicates by ID and map to options with description
      const uniqueLeads = Array.from(new Map(leads.map((l: any) => [l.id, l])).values());
      return uniqueLeads.map((l: any) => ({
        value: String(l.id),
        label: l.name,
        description: l.email || l.company || 'Lead'
      }));
    }
    if (formData.entityType === "contact") {
      // Filter out duplicates by ID and map to options with description
      const uniqueContacts = Array.from(new Map(contacts.map((c: any) => [c.id, c])).values());
      return uniqueContacts.map((c: any) => ({
        value: String(c.id),
        label: c.name,
        description: c.email || c.title || 'Contact'
      }));
    }
    return [];
  };

  const totalOpen = tasks.filter((t: Task) => t.status !== 'done' && t.status !== 'cancelled').length;
  const dueSoon = tasks.filter((t: Task) => t.status !== 'done' && t.dueDate && isBefore(new Date(t.dueDate), addDays(new Date(), 3)) && !isBefore(new Date(t.dueDate), new Date())).length;
  const completedToday = tasks.filter((t: Task) => t.status === 'done' && isToday(new Date())).length;
  const overdueCount = tasks.filter((t: Task) => t.status !== 'done' && t.dueDate && isBefore(new Date(t.dueDate), new Date()) && !isToday(new Date(t.dueDate))).length;

  return (
    <CRMLayout title="Task Management">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
        <div className="flex flex-wrap gap-4 p-2 bg-[#1a1f2e]/40 border border-white/5 rounded-2xl backdrop-blur-xl">
          <div className="flex-1 min-w-[140px] px-4 py-3 bg-[#11141d]/60 rounded-xl border border-white/5 flex items-center justify-between group">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</p>
              <p className="text-xl font-bold text-slate-200 tracking-tight">{totalOpen}</p>
            </div>
            <CheckSquare className="h-7 w-7 text-primary/40" />
          </div>
          <div className="flex-1 min-w-[140px] px-4 py-3 bg-[#11141d]/60 rounded-xl border border-white/5 flex items-center justify-between group">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</p>
              <p className="text-xl font-bold text-slate-200 tracking-tight">{dueSoon}</p>
            </div>
            <Timer className="h-7 w-7 text-orange-500/40" />
          </div>
          <div className="flex-1 min-w-[140px] px-4 py-3 bg-[#11141d]/60 rounded-xl border border-white/5 flex items-center justify-between group">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Critical</p>
              <p className="text-xl font-bold text-red-400 tracking-tight">{overdueCount}</p>
            </div>
            <AlertCircle className="h-7 w-7 text-red-500/40" />
          </div>
          <div className="flex-1 min-w-[140px] px-4 py-3 bg-[#11141d]/60 rounded-xl border border-white/5 flex items-center justify-between group">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Impact</p>
              <p className="text-xl font-bold text-emerald-400 tracking-tight">{completedToday}</p>
            </div>
            <CheckCircle2 className="h-7 w-7 text-emerald-500/40" />
          </div>
          <div className="hidden lg:flex flex-col justify-center px-4">
            <Button onClick={() => { resetForm(); setShowCreate(true); }} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-slate-200 tracking-tight flex items-center gap-2">

              Task Pipeline
            </h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide">Managing {tasks.length} strategic objectives</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                placeholder="Find anything..."
                className="pl-9 h-9 w-60 bg-[#11141d]/60 border border-white/5 rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all outline-none text-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-[#11141d]/80 p-1 rounded-lg border border-white/5 shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-3 gap-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'kanban' ? 'bg-[#1a1f2e] text-primary shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}
                onClick={() => setView("kanban")}
              >
                <LayoutGrid className="h-3 w-3" />
                Kanban
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-3 gap-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${view === 'table' ? 'bg-[#1a1f2e] text-primary shadow-sm' : 'text-slate-500 hover:text-slate-200'}`}
                onClick={() => setView("table")}
              >
                <List className="h-3 w-3" />
                Table
              </Button>
            </div>
          </div>
        </div>

        {view === "kanban" ? (
          <DndContext sensors={sensors} onDragStart={(e) => setActiveDragId(e.active.id as number)} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-h-[calc(100vh-320px)] overflow-x-auto pb-8 custom-scrollbar">
              {columns.map((column) => (
                <div key={column.id} className="flex flex-col gap-4 bg-[#11141d]/40 rounded-2xl p-4 border border-white/5 min-w-[300px] max-w-[300px] group/col hover:bg-[#11141d]/60 transition-colors">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-[#1a1f2e] border border-white/5 flex items-center justify-center text-slate-500 group-hover/col:text-primary group-hover/col:border-primary/20 transition-all duration-500">
                        {column.icon}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-xs tracking-tight text-slate-300 group-hover/col:text-slate-100 transition-colors uppercase italic">{column.title}</h3>
                        <span className="text-[10px] font-bold text-slate-600 group-hover/col:text-primary/60 transition-colors uppercase tracking-widest">{getColumnTasks(column.id).length} Items</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    <SortableContext id={column.id} items={getColumnTasks(column.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4 pt-1 pb-4">
                        {getColumnTasks(column.id).map((task) => (
                          <SortableTaskCard key={task.id} task={task} onClick={() => { setSelectedTask(task); setShowDetail(true); }} />
                        ))}
                        <div onClick={() => { resetForm(); setFormData({ ...formData, status: column.id }); setShowCreate(true); }} className="h-20 border-2 border-dashed border-white/[0.03] hover:border-primary/20 rounded-xl transition-all duration-300 flex items-center justify-center group cursor-pointer hover:bg-primary/[0.02] mt-2">
                          <Plus className="h-5 w-5 text-slate-700 group-hover:text-primary/60" />
                        </div>
                      </div>
                    </SortableContext>
                  </div>
                  <Droppable id={column.id}>{({ setNodeRef }) => <div ref={setNodeRef} className="absolute inset-0 z-[-1]" />}</Droppable>
                </div>
              ))}
            </div>
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) }}>
              {activeDragId ? (
                <div className="w-[280px] shadow-2xl shadow-black/80 rotate-1 scale-105 transition-transform"><SortableTaskCard task={tasks.find((t: Task) => t.id === activeDragId)!} onClick={() => { }} /></div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="bg-[#11141d]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Subject</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Assignee</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Due Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Relation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredTasks.length > 0 ? filteredTasks.map((task: Task) => {
                    const pInfo = getPriorityInfo(task.priority);
                    const isOverdue = task.status !== 'done' && task.dueDate && isBefore(new Date(task.dueDate), new Date()) && !isToday(new Date(task.dueDate));
                    
                    return (
                      <tr 
                        key={task.id} 
                        onClick={() => { setSelectedTask(task); setShowDetail(true); }}
                        className="group hover:bg-primary/[0.02] cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-1 h-6 rounded-full ${pInfo.color.split(' ')[0].replace('text-', 'bg-')}`} />
                            <span className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors">{task.subject}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Select value={task.status} onValueChange={(val) => { updateMutation.mutate({ id: task.id, data: { status: val } }); }}>
                             <SelectTrigger className="h-8 bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-slate-400 p-0 focus:ring-0 shadow-none hover:text-slate-200 transition-colors">
                                <SelectValue />
                             </SelectTrigger>
                             <SelectContent className="bg-[#1a1f2e] border-white/10 text-slate-300 font-bold uppercase text-[10px]">
                               {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                             </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-tighter px-2 py-0.5 ${pInfo.color}`}>
                            {pInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-white/5">
                               {task.assignedTo?.name?.charAt(0) || "U"}
                             </div>
                             <span className="text-[11px] font-medium text-slate-400">{task.assignedTo?.name || "Unassigned"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 text-[11px] font-bold ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                             <Calendar className="h-3 w-3" />
                             {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.entityType ? (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                               {task.entityType === 'lead' ? <Target className="h-3 w-3" /> : <User className="h-3 w-3" />}
                               {task.entityType}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-700 italic">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                           <Zap className="h-8 w-8 text-slate-700" />
                           <p className="text-sm font-medium text-slate-500">No strategic objectives found in current filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Task Create - Activity Style Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl bg-[#0B0E14] rounded-2xl max-h-[85vh] flex flex-col">
            {/* Header - Cleaner, less cramped */}
            <div className="relative px-8 pt-8 pb-5 border-b border-slate-800/80 flex-shrink-0">
              <DialogHeader className="space-y-2">
                <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span>New Objective Initiative</span>
                </DialogTitle>
                <p className="text-sm text-slate-400 font-normal tracking-wide pl-12">
                  Define mission parameters and allocate resources.
                </p>
              </DialogHeader>
            </div>

            {/* Form Body - Increased spacing for readability - Scrollable */}
            <div className="grid gap-5 p-8 bg-[#0B0E14] overflow-y-auto flex-1 custom-scrollbar">
              {/* Subject Row */}
              <div className="space-y-2">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Subject</Label>
                <Input
                  placeholder="e.g., Follow-up on project proposal"
                  className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/30 rounded-lg px-4 text-sm shadow-sm transition-all duration-200"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              {/* 2-Column Grid: Stage & Priority */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 shadow-sm">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141822] border-slate-700 text-slate-200 backdrop-blur-sm">
                      {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141822] border-slate-700 text-slate-200">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 2-Column Grid: Date & Officer */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due Date</Label>
                  <Input
                    type="date"
                    className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg px-4 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all duration-200"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Assignee</Label>
                  <Select value={formData.assignedToId} onValueChange={(v) => setFormData({ ...formData, assignedToId: v })}>
                    <SelectTrigger className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 shadow-sm">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141822] border-slate-700 text-slate-200">
                      {users.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 2-Column Grid: Sector & Identifier */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Relate To</Label>
                  <Select value={formData.entityType} onValueChange={(v) => setFormData({ ...formData, entityType: v, entityId: "" })}>
                    <SelectTrigger className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 shadow-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141822] border-slate-700 text-slate-200">
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Search Record</Label>
                  <DynamicAutoSelect
                    options={getEntityOptions()}
                    value={formData.entityId}
                    onSelect={(v) => setFormData({ ...formData, entityId: v })}
                    placeholder={`Find ${formData.entityType || 'record'}...`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-1">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Description</Label>
                <Textarea
                  placeholder="Enter task details and notes..."
                  className="bg-[#141822] border-slate-700/50 text-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/50 min-h-[110px] p-4 text-sm leading-relaxed resize-none shadow-sm transition-all duration-200"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Footer - Professional alignment */}
            <DialogFooter className="px-8 py-5 bg-[#0F131C] border-t border-slate-800/80 flex flex-row items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Terminal className="h-4 w-4" />
                <span className="tracking-wide">Protocol v2.4 · Awaiting command</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="h-9 px-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
                <Button
                  disabled={createMutation.isPending}
                  className="h-9 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-900/20 transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
                  onClick={() => {
                    const payload = {
                      ...formData,
                      typeId: Number(formData.typeId),
                      entityId: Number(formData.entityId) || 0,
                      assignedToId: Number(formData.assignedToId) || 0,
                    };
                    createMutation.mutate(payload as any);
                  }}
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Syncing...
                    </span>
                  ) : (
                    "Initialize Protocol"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Detail - Modern Strategic View */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl bg-[#0B0E14] rounded-2xl max-h-[85vh] flex flex-col">
            {selectedTask && (
              <div className="flex flex-col flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-400">
                {/* Header - Matching Create Style */}
                <div className="relative px-8 pt-8 pb-5 border-b border-slate-800/80 flex-shrink-0">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-white">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        {selectedTask.priority === 'urgent' ? <Zap className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                      </div>
                      <span>Task Intelligence</span>
                    </DialogTitle>
                    <p className="text-sm text-slate-400 font-normal tracking-wide pl-12 flex items-center gap-2">
                      Protocol REF: <span className="text-indigo-400 font-bold tracking-widest">#{selectedTask.id}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-700" />
                      <span className="capitalize">{selectedTask.priority} Mission</span>
                    </p>
                  </DialogHeader>
                </div>

                {/* Content Body - Matching Create Grid - Scrollable */}
                <div className="grid gap-6 p-8 bg-[#0B0E14] overflow-y-auto flex-1 custom-scrollbar min-h-0">
                  {/* Subject Row */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Subject</Label>
                    <p className="text-xl font-bold text-white italic tracking-tight leading-snug">
                      {selectedTask.subject}
                    </p>
                  </div>

                  {/* 2-Column Grid: Status & Priority */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</Label>
                      <Select value={selectedTask.status} onValueChange={(val) => updateMutation.mutate({ id: selectedTask.id, data: { status: val } })}>
                        <SelectTrigger className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 shadow-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141822] border-slate-700 text-slate-200">
                          {columns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Priority</Label>
                      <div className="h-11 flex items-center px-4 bg-[#141822] border border-slate-700/50 rounded-lg">
                        <span className={`text-xs font-bold uppercase tracking-widest ${selectedTask.priority === 'urgent' ? 'text-red-400' :
                            selectedTask.priority === 'high' ? 'text-orange-400' : 'text-indigo-400'
                          }`}>
                          {selectedTask.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Grid: Date & Assignee */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Due Date</Label>
                      <div className="h-11 flex items-center px-4 bg-[#141822] border border-slate-700/50 rounded-lg gap-3">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-200">
                          {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), "MMM dd, yyyy") : "No deadline"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Assignee</Label>
                      <Select
                        value={selectedTask.assignedToId ? String(selectedTask.assignedToId) : ""}
                        onValueChange={(val) => updateMutation.mutate({ id: selectedTask.id, data: { assignedToId: Number(val) } })}
                      >
                        <SelectTrigger className="h-11 bg-[#141822] border-slate-700/50 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/50 shadow-sm font-medium">
                          <SelectValue placeholder="Select officer..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141822] border-slate-700 text-slate-200">
                          {users.map((u: any) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded bg-indigo-500/10 flex items-center justify-center text-[8px] font-bold text-indigo-400 uppercase">{u.name?.charAt(0)}</div>
                                {u.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 2-Column Grid: Relate To & Record */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Relate To</Label>
                      <div className="h-11 flex items-center px-4 bg-[#141822] border border-slate-700/50 rounded-lg gap-2">
                        <Target className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-300 capitalize">
                          {selectedTask.entityType || "None"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Linked Record</Label>
                      <div className="h-11 flex items-center px-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg group cursor-pointer hover:bg-indigo-500/10 transition-colors">
                        <span className="text-sm font-bold text-indigo-400 truncate">
                          {selectedTask.entityType} Nexus Ref
                        </span>
                        <ArrowUpRight className="ml-auto h-3 w-3 text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 pt-1">
                    <Label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Description</Label>
                    <div className="p-4 bg-[#141822] border border-slate-700/50 rounded-lg text-sm text-slate-300 leading-relaxed italic min-h-[110px]">
                      {selectedTask.description || "No mission intelligence documented for this objective."}
                    </div>
                  </div>
                </div>

                {/* Footer - Matching Create Style */}
                <DialogFooter className="px-8 py-5 bg-[#0F131C] border-t border-slate-800/80 flex flex-row items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Terminal className="h-4 w-4" />
                    <span className="tracking-wide italic">Protocol Active · v2.4</span>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="ghost" className="h-9 px-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg text-sm font-medium transition-colors" onClick={() => setShowDetail(false)}>Dismiss</Button>
                    <Button
                      className="h-9 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-indigo-900/20"
                      onClick={() => setShowDetail(false)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

const Droppable = ({ id, children }: { id: string | number; children: (props: { setNodeRef: (node: HTMLElement | null) => void }) => React.ReactNode }) => {
  const { setNodeRef } = useDroppable({ id });
  return <>{children({ setNodeRef })}</>;
};

export default TasksPage;
