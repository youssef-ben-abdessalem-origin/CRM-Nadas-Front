import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { CRMLayout } from "@/components/CRMLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Video,
  FileText,
  User,
  ExternalLink
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { DynamicAutoSelect } from "@/components/ui/DynamicAutoSelect";

interface Activity {
  id: number;
  subject: string;
  description: string;
  dueDate: string;
  status: string;
  entityType: string;
  entityId: number;
  typeId: number;
  assignedToId: number;
  createdAt: string;
  updatedAt: string;
  type?: {
    id: number;
    name: string;
    icon: string;
  };
  assignedTo?: {
    id: number;
    name: string;
  };
}

const ActivitiesPage = () => {
  const { symbol: currencySymbol } = useDefaultCurrency();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    typeId: "",
    entityType: "lead",
    entityId: "",
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    assignedToId: "",
    status: "todo",
  });

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => api.activities.getAll(),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activityTypes"],
    queryFn: () => api.activities.getTypes(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll(),
  });

  // Queries for the search dropdown
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.leads.getAll(),
    enabled: showDialog && formData.entityType === "lead",
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.getAll(),
    enabled: showDialog && formData.entityType === "contact",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll(),
    enabled: showDialog && formData.entityType === "account",
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: () => api.deals.getAll(),
    enabled: showDialog && formData.entityType === "deal",
  });

  const getEntityOptions = () => {
    switch (formData.entityType) {
      case "lead":
        return leads
          .filter((l: any) => 
            l.stage?.name?.toLowerCase() !== "unqualified" && 
            l.stage?.name?.toLowerCase() !== "lost" && 
            !l.isConverted
          )
          .map((l: any) => ({ value: String(l.id), label: l.name, description: l.email }));
      case "contact":
        return contacts.map((c: any) => ({ value: String(c.id), label: c.name, description: c.title || c.company }));
      case "account":
        return accounts.map((a: any) => ({ value: String(a.id), label: a.name, description: a.website }));
       case "deal":
         return deals.map((d: any) => ({ value: String(d.id), label: d.name, description: d.amount ? `${currencySymbol}${d.amount.toLocaleString()}` : "" }));
       default:
        return [];
    }
  };

  const createMutation = useMutation({
    mutationFn: api.activities.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(t('activities.statusUpdates.created', 'Activity created successfully'));
      setShowDialog(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || t('activities.statusUpdates.createFailed', 'Failed to create activity')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.activities.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(t('activities.statusUpdates.updated', 'Activity updated successfully'));
      setShowDialog(false);
      setEditingActivity(null);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || t('activities.statusUpdates.updateFailed', 'Failed to update activity')),
  });

  const deleteMutation = useMutation({
    mutationFn: api.activities.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(t('activities.statusUpdates.deleted', 'Activity deleted successfully'));
    },
    onError: (err: any) => toast.error(err.message || t('activities.statusUpdates.deleteFailed', 'Failed to delete activity')),
  });

  const completeMutation = useMutation({
    mutationFn: api.activities.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(t('activities.statusUpdates.markedComplete', 'Activity marked as complete'));
    },
    onError: (err: any) => toast.error(err.message || t('activities.statusUpdates.completeFailed', 'Failed to complete activity')),
  });

  const resetForm = () => {
    setFormData({
      subject: "",
      description: "",
      typeId: "",
      entityType: "lead",
      entityId: "",
      dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      assignedToId: "",
      status: "todo",
    });
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      subject: activity.subject,
      description: activity.description || "",
      typeId: String(activity.typeId),
      entityType: activity.entityType,
      entityId: String(activity.entityId),
      dueDate: format(new Date(activity.dueDate), "yyyy-MM-dd'T'HH:mm"),
      assignedToId: String(activity.assignedToId),
      status: activity.status || "todo",
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (!formData.subject || !formData.typeId) {
      toast.error(t('common.errors.fillRequired', 'Please fill in all required fields'));
      return;
    }

    const payload = {
      ...formData,
      typeId: Number.parseInt(formData.typeId),
      entityId: Number.parseInt(formData.entityId) || 0,
      assignedToId: Number.parseInt(formData.assignedToId) || 0,
    };

    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data: payload });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toLowerCase() || "todo";
    switch (s) {
      case "done":
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">{t('activities.status.done')}</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">{t('activities.status.inProgress')}</Badge>;
      case "todo":
      case "pending":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">{t('activities.status.todo')}</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">{t('activities.status.cancelled')}</Badge>;
      case "overdue":
        return <Badge variant="destructive">{t('activities.status.overdue')}</Badge>;
      default:
        return <Badge variant="outline">{status || t('activities.status.todo')}</Badge>;
    }
  };

  const getActivityIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'mail': return <Mail className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'file-text': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredActivities = activities.filter((a: Activity) => 
    a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.type?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <CRMLayout title={t('activities.title')}>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('activities.title')}</h1>
            <p className="text-muted-foreground">{t('activities.desc')}</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingActivity(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> {t('activities.toolbar.add')}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('activities.toolbar.search')} 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>{t('activities.table.subject')}</TableHead>
                <TableHead>{t('activities.table.type')}</TableHead>
                <TableHead>{t('activities.table.dueDate')}</TableHead>
                <TableHead>{t('activities.table.assignedTo')}</TableHead>
                <TableHead>{t('activities.table.relatedTo')}</TableHead>
                <TableHead>{t('activities.table.status')}</TableHead>
                <TableHead className="text-right">{t('activities.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      {t('activities.loading')}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    {t('activities.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity: Activity) => {
                  const isCompleted = activity.status === 'completed';
                  return (
                    <TableRow key={activity.id} className={isCompleted ? 'opacity-60' : ''}>
                      <TableCell>
                        <button 
                          onClick={() => !isCompleted && completeMutation.mutate(activity.id)}
                          className={`transition-colors ${isCompleted ? 'text-green-500 cursor-default' : 'text-muted-foreground hover:text-green-500'}`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                      </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      <div>
                        {activity.subject}
                        {activity.description && (
                          <p className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-muted">
                          {getActivityIcon(activity.type?.icon)}
                        </div>
                        <span className="text-sm">{activity.type?.name || 'Task'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm">{format(new Date(activity.dueDate), "MMM dd, yyyy")}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(activity.dueDate), "hh:mm a")}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {activity.assignedTo?.name?.charAt(0) || <User className="h-3 w-3" />}
                        </div>
                        <span className="text-sm">{activity.assignedTo?.name || t('activities.unassigned')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {activity.entityId > 0 && (
                        <div className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer">
                          <span className="capitalize">{activity.entityType}</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(activity)}>
                            <Pencil className="h-4 w-4 mr-2" /> {t('common.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => { if(confirm(t('common.actions.confirm_delete'))) deleteMutation.mutate(activity.id) }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> {t('common.actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingActivity ? t('activities.forms.edit') : t('activities.forms.new')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">{t('activities.forms.subject')} *</Label>
              <Input 
                id="subject" 
                placeholder={t('activities.forms.placeholder.subject')} 
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">{t('activities.forms.type')} *</Label>
                <Select 
                  value={formData.typeId} 
                  onValueChange={(v) => setFormData({ ...formData, typeId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('activities.forms.placeholder.type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((t: any) => (
                      <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">{t('activities.forms.dueDate')} *</Label>
                <div className="relative">
                  <Input 
                    id="dueDate" 
                    type="datetime-local" 
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="entityType">{t('activities.forms.relatedTo')}</Label>
                <Select 
                  value={formData.entityType} 
                  onValueChange={(v) => setFormData({ ...formData, entityType: v, entityId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('activities.forms.placeholder.entityType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">{t('common.entities.lead')}</SelectItem>
                    <SelectItem value="contact">{t('common.entities.contact')}</SelectItem>
                    <SelectItem value="account">{t('common.entities.account')}</SelectItem>
                    <SelectItem value="deal">{t('common.entities.deal')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('activities.forms.searchEntity', { entity: t(`common.entities.${formData.entityType}`) })}</Label>
                <DynamicAutoSelect
                  options={getEntityOptions()}
                  value={formData.entityId}
                  onSelect={(v) => setFormData({ ...formData, entityId: v })}
                  placeholder={t('activities.forms.placeholder.selectEntity', { entity: t(`common.entities.${formData.entityType}`) })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">{t('activities.forms.assignedTo')}</Label>
              <Select 
                value={formData.assignedToId} 
                onValueChange={(v) => setFormData({ ...formData, assignedToId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('activities.forms.placeholder.user', 'Select user')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t('activities.forms.description')}</Label>
              <Input 
                id="description" 
                placeholder={t('activities.forms.placeholder.description')} 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleSubmit}>
              {editingActivity ? t('activities.forms.submit.update') : t('activities.forms.submit.create')} {t('activities.forms.activitySuffix')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default ActivitiesPage;
