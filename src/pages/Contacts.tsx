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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Star,
  Trash2,
  Edit,
  Copy,
  Handshake,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Check,
  User,
  Briefcase,
  FileText,
  Eye,
  Circle,
  CheckCircle,
  CheckSquare,
  Tag,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { ContactDetailDialog } from "@/components/contacts/ContactDetailDialog";
import { useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";
import { useTranslation } from "react-i18next";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

interface ContactStatus {
  id: number;
  name: string;
  color: string;
}

interface ContactTier {
  id: number;
  name: string;
  color: string;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: ContactStatus | string;
  statusId?: number;
  tier: ContactTier | string;
  tierId?: number;
  dealValue: number;
  lastContact: string;
  created: string;
  location: string;
  industry: string;
  website: string;
  notes: string;
  dealsWon: number;
  dealsTotal: number;
  revenueTotal: number;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  statusId: number | null;
  tierId: number | null;
  dealValue: string;
  location: string;
  industry: string;
  website: string;
  notes: string;
}

const initialContacts: Contact[] = [];

const Contacts = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [selectedContactId, setSelectedContactId] = useState<number | null>(id ? parseInt(id) : null);
  const [showDetail, setShowDetail] = useState(!!id);

  useEffect(() => {
    if (id) {
      setSelectedContactId(parseInt(id));
      setShowDetail(true);
    }
  }, [id]);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowAdd(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleRowClick = (contactId: number) => {
    navigate(`/contacts/${contactId}`);
  };
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.getAll().catch(() => []),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["contact-statuses"],
    queryFn: () => api.contacts.getStatuses().catch(() => []),
  });

  const { data: tiers = [] } = useQuery({
    queryKey: ["contact-tiers"],
    queryFn: () => api.contacts.getTiers().catch(() => []),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api.activities.getTypes().catch(() => []),
  });

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    statusId: null,
    tierId: null,
    dealValue: "",
    location: "",
    industry: "",
    website: "",
    notes: "",
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addStep, setAddStep] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [newActivity, setNewActivity] = useState({
    typeId: 0,
    subject: "",
    description: "",
    dueDate: "",
  });

  const { data: contactActivities = [] } = useQuery({
    queryKey: ["contact-activities", selectedContact?.id],
    queryFn: () => selectedContact ? api.activities.getByEntity("contact", selectedContact.id).catch(() => []) : [],
    enabled: !!selectedContact,
  });

  const { data: contactDeals = [] } = useQuery({
    queryKey: ["contact-deals", selectedContact?.id],
    queryFn: () => selectedContact ? api.deals.getByContact(selectedContact.id).catch(() => []) : [],
    enabled: !!selectedContact,
  });

  const createActivityMutation = useMutation({
    mutationFn: (data: any) => api.activities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-activities"] });
      toast.success("Activity added");
      setShowActivity(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const completeActivityMutation = useMutation({
    mutationFn: (id: number) => api.activities.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-activities"] });
      toast.success("Activity completed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: api.contacts.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact created");
      setShowAdd(false);
      setAddStep(0);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.contacts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.contacts.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const steps = [
    { label: "Personal", icon: User, description: "Name & contact details" },
    { label: "Company", icon: Briefcase, description: "Organization info" },
    { label: "Details", icon: FileText, description: "Status, tier & notes" },
    { label: "Review", icon: Eye, description: "Confirm & create" },
  ];

  const getStatusId = (contact: Contact) => {
    if (typeof contact.status === 'object' && contact.status !== null) {
      return (contact.status as ContactStatus).id;
    }
    return contact.statusId;
  };

  const getTierId = (contact: Contact) => {
    if (typeof contact.tier === 'object' && contact.tier !== null) {
      return (contact.tier as ContactTier).id;
    }
    return contact.tierId;
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const contactStatusId = getStatusId(c);
    const contactTierId = getTierId(c);
    const matchesStatus = filterStatus === "all" || contactStatusId?.toString() === filterStatus;
    const matchesTier = filterTier === "all" || contactTierId?.toString() === filterTier;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getStatusName = (contact: Contact) => {
    if (contact.status && typeof contact.status === 'object') {
      return (contact.status as ContactStatus).name;
    }
    const found = statuses.find(s => s.id === contact.contactStatusId);
    return found?.name || 'Unknown';
  };

  const getTierName = (contact: Contact) => {
    if (contact.tier && typeof contact.tier === 'object') {
      return (contact.tier as ContactTier).name;
    }
    const found = tiers.find(t => t.id === contact.contactTierId);
    return found?.name || 'Unknown';
  };

  const getStatusColor = (contact: Contact) => {
    if (contact.status && typeof contact.status === 'object') {
      return (contact.status as ContactStatus).color;
    }
    const found = statuses.find(s => s.id === contact.contactStatusId);
    return found?.color || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getTierColor = (contact: Contact) => {
    if (contact.tier && typeof contact.tier === 'object') {
      return (contact.tier as ContactTier).color;
    }
    const found = tiers.find(t => t.id === contact.contactTierId);
    return found?.color || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const stats = {
    total: contacts.length,
    active: contacts.filter((c) => {
      const name = getStatusName(c).toLowerCase();
      return name === 'active';
    }).length,
    totalRevenue: contacts.reduce((sum, c) => sum + (c.revenueTotal || 0), 0),
    avgDealSize:
      contacts.filter((c) => c.dealsWon > 0).length > 0
        ? Math.round(
            contacts.reduce((sum, c) => sum + (c.revenueTotal || 0), 0) /
              contacts.filter((c) => c.dealsWon > 0).reduce(
                (sum, c) => sum + (c.dealsWon || 0),
                0
              )
          )
        : 0,
    churnRate: Math.round(
      (contacts.filter((c) => {
        const name = getStatusName(c).toLowerCase();
        return name === 'churned';
      }).length / Math.max(contacts.length, 1)) * 100
    ),
  };

  const formatCurrency = (value: number) => <CurrencyNumbers amount={value} />;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      title: "",
      statusId: statuses[0]?.id || null,
      tierId: tiers[0]?.id || null,
      dealValue: "",
      location: "",
      industry: "",
      website: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.name || !formData.email || !formData.company) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      title: formData.title,
      statusId: formData.statusId,
      tierId: formData.tierId,
      dealValue: parseInt(formData.dealValue) || 0,
      location: formData.location,
      industry: formData.industry,
      website: formData.website,
      notes: formData.notes,
    });
  };

  const handleEdit = () => {
    if (!editingContact || !formData.name || !formData.email) return;
    updateMutation.mutate({
      id: editingContact.id,
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        title: formData.title,
        statusId: formData.statusId,
        tierId: formData.tierId,
        dealValue: parseInt(formData.dealValue) || 0,
        location: formData.location,
        industry: formData.industry,
        website: formData.website,
        notes: formData.notes,
      },
    });
    setShowEdit(false);
    setEditingContact(null);
    resetForm();
  };

  const handleDelete = (contact: Contact) => {
    deleteMutation.mutate(contact.id);
  };

  const handleStatusChange = (contactId: number, newStatusId: number) => {
    updateMutation.mutate({ id: contactId, data: { statusId: newStatusId } });
    const found = statuses.find(s => s.id === newStatusId);
    toast.success(`Status updated to ${found?.name || 'Unknown'}`);
  };

  const openEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      title: contact.title,
      statusId: getStatusId(contact),
      tierId: getTierId(contact),
      dealValue: contact.dealValue.toString(),
      location: contact.location,
      industry: contact.industry,
      website: contact.website,
      notes: contact.notes,
    });
    setShowEdit(true);
  };

  const ContactForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: () => void;
    submitLabel: string;
  }) => (
    <div className="grid grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label>
          {t('contacts.forms.name')} <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder={t('contacts.forms.placeholder.name')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('contacts.forms.email')} <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder={t('contacts.forms.placeholder.email')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.phone')}</Label>
        <Input
          placeholder={t('contacts.forms.placeholder.phone')}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          {t('contacts.forms.company')} <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder={t('contacts.forms.placeholder.company')}
          value={formData.company}
          onChange={(e) =>
            setFormData({ ...formData, company: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.title')}</Label>
        <Input
          placeholder={t('contacts.forms.placeholder.title')}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.status')}</Label>
        <Select
          value={formData.statusId?.toString() || ""}
          onValueChange={(v) =>
            setFormData({ ...formData, statusId: parseInt(v) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('contacts.forms.placeholder.status')} />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.tier')}</Label>
        <Select
          value={formData.tierId?.toString() || ""}
          onValueChange={(v) =>
            setFormData({ ...formData, tierId: parseInt(v) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('contacts.forms.placeholder.tier')} />
          </SelectTrigger>
          <SelectContent>
            {tiers.map((tier) => (
              <SelectItem key={tier.id} value={tier.id.toString()}>
                {tier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.dealValue')}</Label>
        <Input
          type="number"
          placeholder={t('contacts.forms.placeholder.dealValue')}
          value={formData.dealValue}
          onChange={(e) =>
            setFormData({ ...formData, dealValue: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.location')}</Label>
        <Input
          placeholder={t('contacts.forms.placeholder.location')}
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.industry')}</Label>
        <Input
          placeholder={t('contacts.forms.placeholder.industry')}
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>{t('contacts.forms.website')}</Label>
        <Input
          placeholder={t('contacts.forms.placeholder.website')}
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
      </div>
      <div className="space-y-2 col-span-2">
        <Label>{t('contacts.forms.notes')}</Label>
        <Textarea
          placeholder={t('contacts.forms.placeholder.notes')}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="resize-none"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <CRMLayout title={t('contacts.title')}>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('contacts.stats.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Users className="h-3 w-3 inline mr-1" />
                {t('common.stats.inDatabase')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('contacts.stats.active')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('common.stats.engaged')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('contacts.stats.revenue')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <DollarSign className="h-3 w-3 inline mr-1" />
                {t('common.stats.wonDeals')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('contacts.stats.avgDealSize')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.avgDealSize)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {t('contacts.stats.perClosedDeal', 'Per closed deal')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('contacts.stats.churnRate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {stats.churnRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('contacts.stats.churnDesc', 'Lost contacts')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('contacts.toolbar.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder={t('contacts.toolbar.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allStatuses', 'All Statuses')}</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.id} value={status.id.toString()}>
                    {t(`contacts.statuses.${status.name.toLowerCase().replace(/\s+/g, '_')}`, status.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder={t('contacts.toolbar.tier')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allTiers', 'All Tiers')}</SelectItem>
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id.toString()}>
                    {t(`contacts.tiers.${tier.name.toLowerCase().replace(/\s+/g, '_')}`, tier.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> {t('contacts.toolbar.filter')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> {t('contacts.toolbar.export')}
            </Button>
            {selectedContacts.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setShowBulkActions(true)}>
                <CheckSquare className="h-3.5 w-3.5 mr-1" /> {t('contacts.toolbar.bulk')} ({selectedContacts.length})
              </Button>
            )}
            <Button size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
              <Plus className="h-3.5 w-3.5 mr-1" /> {t('contacts.toolbar.add')}
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedContacts.length > 0 && selectedContacts.length === filtered.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContacts(filtered.map((c: Contact) => c.id));
                        } else {
                          setSelectedContacts([]);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>{t('contacts.table.contact')}</TableHead>
                <TableHead>{t('contacts.table.company')}</TableHead>
                <TableHead>{t('contacts.table.tier')}</TableHead>
                <TableHead>{t('contacts.table.status')}</TableHead>
                <TableHead className="text-right">{t('contacts.table.dealValue')}</TableHead>
                <TableHead>{t('contacts.table.wonTotal')}</TableHead>
                <TableHead>{t('contacts.table.lastContact')}</TableHead>
                <TableHead className="text-right">{t('contacts.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">{t('contacts.empty.title')}</p>
                    <p className="text-sm">{t('contacts.empty.desc')}</p>
                  </TableCell>
                </TableRow>
              ) : filtered.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(contact.id)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedContacts([...selectedContacts, contact.id]);
                        } else {
                          setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {contact.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{contact.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getTierColor(contact)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {t(`contacts.tiers.${getTierName(contact).toLowerCase().replace(/\s+/g, '_')}`, getTierName(contact))}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(contact)}
                    >
                      {t(`contacts.statuses.${getStatusName(contact).toLowerCase().replace(/\s+/g, '_')}`, getStatusName(contact))}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(contact.dealValue)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[60px]">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${contact.dealsTotal > 0 ? (contact.dealsWon / contact.dealsTotal) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {contact.dealsWon}/{contact.dealsTotal}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {contact.lastContact}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Email sent to ${contact.name}`);
                        }}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Calling ${contact.name}...`);
                        }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(contact);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {t('common.actions.edit', 'Edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Task created for ${contact.name}`);
                            }}
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            {t('leads.actions.createTask', 'Create Task')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Add tags for ${contact.name}`);
                            }}
                          >
                            <Tag className="h-4 w-4 mr-2" />
                            {t('leads.actions.addTags', 'Add Tags')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `${globalThis.location.origin}/contacts/${contact.id}`;
                              navigator.clipboard.writeText(url);
                              toast.success(`Contact URL copied to clipboard`);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {t('leads.actions.copyUrl', 'Copy URL')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {statuses.map((status) => (
                            <DropdownMenuItem
                              key={status.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(contact.id, status.id);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t('contacts.actions.markAs', { status: t(`contacts.statuses.${status.name.toLowerCase().replace(/\s+/g, '_')}`, status.name) })}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(contact);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.actions.delete', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <ContactDetailDialog
            contactId={selectedContactId}
            open={showDetail}
            onOpenChange={(open) => {
                setShowDetail(open);
                if (!open) {
                    navigate("/contacts", { replace: true });
                }
            }}
            onEdit={(contact) => {
              openEdit(contact);
            }}
          />

        {/* Add Contact Drawer */}
        <Drawer open={showAdd} onOpenChange={(open) => {
          setShowAdd(open);
          if (!open) {
            setAddStep(0);
            resetForm();
          }
        }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Add New Contact</DrawerTitle>
              <DrawerDescription>Fill in the details to create a new contact.</DrawerDescription>
            </DrawerHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 px-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {/* Personal Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1">Personal Info</div>
              
              <div className="space-y-2">
                <Label>Name <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Company Info */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">Company Info</div>
              
              <div className="space-y-2">
                <Label>Company <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="VP of Engineering"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  placeholder="Technology"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  placeholder="company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Deal Value</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.dealValue}
                  onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                />
              </div>

              {/* Details */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-sm font-semibold text-foreground border-b pb-1 mt-2">Details</div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.statusId?.toString() || ""}
                  onValueChange={(v) => setFormData({ ...formData, statusId: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={formData.tierId?.toString() || ""}
                  onValueChange={(v) => setFormData({ ...formData, tierId: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id.toString()}>
                        {tier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Any additional context..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => { setShowAdd(false); resetForm(); }}>{t('common.actions.cancel')}</Button>
              <Button onClick={handleAdd} disabled={createMutation.isPending}>
                <Check className="h-4 w-4 mr-2" />
                {createMutation.isPending ? t('common.actions.creating') : t('contacts.toolbar.add')}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Edit Contact Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('common.actions.edit')}</DialogTitle>
              <DialogDescription>
                {t('contacts.detail.updateContact', 'Update contact information.')}
              </DialogDescription>
            </DialogHeader>
            <ContactForm onSubmit={handleEdit} submitLabel={t('common.actions.save')} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdit(false)}>
                {t('common.actions.cancel')}
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showActivity} onOpenChange={setShowActivity}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Activity Type *</Label>
                <Select value={String(newActivity.typeId)} onValueChange={(val) => setNewActivity({ ...newActivity, typeId: parseInt(val) })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type: any) => (
                      <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={newActivity.subject} onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })} placeholder="Call follow-up" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })} placeholder="Details..." />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={newActivity.dueDate} onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActivity(false)}>{t('common.actions.cancel')}</Button>
              <Button onClick={() => {
                if (!selectedContact || !newActivity.typeId) { toast.error(t('activities.forms.placeholder.type')); return; }
                createActivityMutation.mutate({ entityType: "contact", entityId: selectedContact.id, typeId: newActivity.typeId, subject: newActivity.subject, description: newActivity.description, dueDate: newActivity.dueDate || undefined });
              }} disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? t('common.actions.saving') : t('activities.toolbar.add')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('common.actions.bulkActions')}</DialogTitle>
              <DialogDescription>
                {t('common.actions.bulkDesc', { count: selectedContacts.length })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  api.contacts.bulkUpdate(selectedContacts, { contactStatusId: 1 }).then(() => {
                    toast.success(t('contacts.bulkActions.updateSuccess'));
                    setSelectedContacts([]);
                    setShowBulkActions(false);
                    queryClient.invalidateQueries({ queryKey: ["contacts"] });
                  }).catch((err: Error) => toast.error(err.message));
                }}
              >
                <Star className="h-4 w-4 mr-2" /> {t('contacts.toolbar.bulkUpdate', 'Update Status')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-500"
                onClick={async () => {
                  if (await confirm({ 
                    title: t('common.actions.deleteSelected'), 
                    description: t('contacts.bulkActions.confirmDelete', { count: selectedContacts.length }),
                    variant: "destructive",
                    confirmText: t('common.actions.delete')
                  })) {
                    api.contacts.bulkDelete(selectedContacts).then(() => {
                      toast.success(t('contacts.bulkActions.deleteSuccess'));
                      setSelectedContacts([]);
                      setShowBulkActions(false);
                      queryClient.invalidateQueries({ queryKey: ["contacts"] });
                    }).catch((err: Error) => toast.error(err.message));
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> {t('common.actions.deleteSelected')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

export default Contacts;
