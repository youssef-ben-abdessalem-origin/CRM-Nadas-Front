import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Building2,
  UserPlus,
  Check,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Target,
  ArrowRight,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Twitter
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface DynamicOption {
  id: number;
  name: string;
  color?: string;
}

interface LeadFormProps {
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
  initialData?: any;
}

const STEPS = [
  { id: 1, title: "Identity", icon: User, description: "Personal details" },
  { id: 2, title: "Company", icon: Building2, description: "Organization" },
  { id: 3, title: "Strategy", icon: Target, description: "Sales categorization" },
  { id: 4, title: "Action", icon: CalendarDays, description: "Engagement & Notes" },
];

export const LeadForm = ({ onCancel, onSubmit, isPending, initialData }: LeadFormProps) => {
  const { symbol: currencySymbol } = useDefaultCurrency();
  const [currentStep, setCurrentStep] = useState(1);
  const [useExistingAccount, setUseExistingAccount] = useState(false);
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);
  const [newLead, setNewLead] = useState({
    // Identity
    firstName: "",
    lastName: "",
    name: "",
    title: "",
    emails: [""] as string[],
    phones: [""] as string[],
    mobile: "",
    fax: "",
    skypeId: "",
    secondaryEmail: "",
    twitter: "",
    emailOptOut: false,
    // Company
    company: "",
    website: "",
    industry: "",
    location: "",
    employees: 0,
    annualRevenue: "",
    // Address
    address: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    latitude: 0,
    longitude: 0,
    // Strategy
    sourceId: 0,
    value: "",
    stageId: 0,
    scoreCategoryId: 0,
    priorityId: 0,
    qualificationStageId: 0,
    notes: "",
    tags: [] as string[],
    ownerId: undefined as number | undefined,
    nextFollowUp: "",
    accountId: null as number | null,
  });

  const [initialDataProcessed, setInitialDataProcessed] = useState(false);

  useEffect(() => {
    if (initialData && !initialDataProcessed) {
      setNewLead({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        name: initialData.name || "",
        title: initialData.title || "",
        emails: (initialData.emails && initialData.emails.length > 0) ? initialData.emails : [""],
        phones: (initialData.phones && initialData.phones.length > 0) ? initialData.phones : [""],
        mobile: initialData.mobile || "",
        fax: initialData.fax || "",
        skypeId: initialData.skypeId || "",
        secondaryEmail: initialData.secondaryEmail || "",
        twitter: initialData.twitter || "",
        emailOptOut: initialData.emailOptOut || false,
        company: initialData.company || "",
        website: initialData.website || "",
        industry: initialData.industry || "",
        location: initialData.location || "",
        employees: initialData.employees || 0,
        annualRevenue: initialData.annualRevenue || "",
        address: initialData.address || "",
        street: initialData.street || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        country: initialData.country || "",
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        sourceId: initialData.sourceId || 0,
        value: initialData.value ? String(initialData.value) : "",
        stageId: initialData.stageId || 0,
        scoreCategoryId: initialData.scoreCategoryId || 0,
        priorityId: initialData.priorityId || 0,
        qualificationStageId: initialData.qualificationStageId || 0,
        notes: initialData.notes || "",
        tags: initialData.tags || [],
        ownerId: initialData.ownerId,
        nextFollowUp: initialData.nextFollowUp ? new Date(initialData.nextFollowUp).toISOString().split('T')[0] : "",
        accountId: initialData.accountId || null,
      });
      setInitialDataProcessed(true);
      if (initialData.name) {
        setIsNameManuallyEdited(true);
      }
    }
  }, [initialData, initialDataProcessed]);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll().catch(() => []),
  });

  const { data: sources = [] } = useQuery({
    queryKey: ["lead-sources"],
    queryFn: () => api.leads.getSources().catch(() => []),
  });

  const { data: stages = [] } = useQuery({
    queryKey: ["lead-stages"],
    queryFn: () => api.leads.getStages().catch(() => []),
  });

  const { data: scores = [] } = useQuery({
    queryKey: ["lead-scores"],
    queryFn: () => api.leads.getScores().catch(() => []),
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ["lead-priorities"],
    queryFn: () => api.leads.getPriorities().catch(() => []),
  });

  const { data: qualifications = [] } = useQuery({
    queryKey: ["lead-qualifications"],
    queryFn: () => api.leads.getQualifications().catch(() => []),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: () => api.settings.getCountries().catch(() => []),
  });

  const validateStep = () => {
    if (currentStep === 1) {
      if (!newLead.firstName.trim() && !newLead.lastName.trim() && !newLead.name.trim()) {
        toast.error("At least one name field is required");
        return false;
      }
      if (!newLead.emails[0]?.trim()) {
        toast.error("Primary email is required");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!useExistingAccount && !newLead.company.trim()) {
        toast.error("Company name is required");
        return false;
      }
      if (useExistingAccount && !newLead.accountId) {
        toast.error("Please select an existing account");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      handleNext();
      return;
    }

    if (validateStep()) {
      const fullName = newLead.name || `${newLead.firstName} ${newLead.lastName}`.trim();
      onSubmit({
        ...newLead,
        name: fullName,
        useExistingAccount,
      });
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stepper Header - Aligned with Sidebar/Navbar theme */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-card border border-border p-6 rounded-xl">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex items-center gap-4 flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isCompleted ? "bg-success/20 text-success" :
                  isActive ? "bg-primary text-white shadow-lg shadow-primary/20" :
                    "bg-muted text-muted-foreground"
                  }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? "text-foreground" : "text-muted-foreground opacity-60"}`}>
                    {step.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground/40 font-medium hidden lg:block italic">
                    {step.description}
                  </span>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block flex-1 h-[1px] bg-border mx-4" />
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        <div className="p-8">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Lead Identity</h2>
                <p className="text-sm text-muted-foreground">Primary information for this prospect.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name & Last Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">First Name</Label>
                  <Input
                    placeholder="e.g. John"
                    className="bg-background border-border h-11"
                    value={newLead.firstName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewLead(prev => ({
                        ...prev,
                        firstName: val,
                        name: isNameManuallyEdited === false ? `${val} ${prev.lastName}`.trim() : prev.name
                      }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Last Name</Label>
                  <Input
                    placeholder="e.g. Smith"
                    className="bg-background border-border h-11"
                    value={newLead.lastName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewLead(prev => ({
                        ...prev,
                        lastName: val,
                        name: isNameManuallyEdited === false ? `${prev.firstName} ${val}`.trim() : prev.name
                      }));
                    }}
                  />
                </div>

                {/* Alternative Full Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Full Name (Alternative) *</Label>
                  <Input
                    placeholder="e.g. John Smith"
                    className="bg-background border-border h-11"
                    value={newLead.name}
                    onChange={(e) => {
                      setIsNameManuallyEdited(true);
                      setNewLead({ ...newLead, name: e.target.value });
                    }}
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Title</Label>
                  <Input
                    placeholder="e.g. Director of Procurement"
                    className="bg-background border-border h-11"
                    value={newLead.title}
                    onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Mobile</Label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    className="bg-background border-border h-11"
                    value={newLead.mobile}
                    onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value })}
                  />
                </div>

                {/* Email Channels */}
                <div className="space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground">Email *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] font-bold text-primary hover:bg-primary/10"
                      onClick={() => setNewLead({ ...newLead, emails: [...newLead.emails, ""] })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Email
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {newLead.emails.map((email, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="primary@company.com"
                          className="bg-background border-border h-11 flex-1"
                          value={email}
                          onChange={(e) => {
                            const next = [...newLead.emails];
                            next[idx] = e.target.value;
                            setNewLead({ ...newLead, emails: next });
                          }}
                          required={idx === 0}
                        />
                        {idx > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-destructive hover:bg-destructive/10"
                            onClick={() => setNewLead({ ...newLead, emails: newLead.emails.filter((_, i) => i !== idx) })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
                  <div className="space-y-3">
                    {newLead.phones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="+1 (555) 000-0000"
                          className="bg-background border-border h-11 flex-1"
                          value={phone}
                          onChange={(e) => {
                            const next = [...newLead.phones];
                            next[idx] = e.target.value;
                            setNewLead({ ...newLead, phones: next });
                          }}
                        />
                        {idx > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 text-destructive hover:bg-destructive/10"
                            onClick={() => setNewLead({ ...newLead, phones: newLead.phones.filter((_, i) => i !== idx) })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] font-bold text-success hover:bg-success/10"
                      onClick={() => setNewLead({ ...newLead, phones: [...newLead.phones, ""] })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Phone
                    </Button>
                  </div>
                </div>

                {/* Fax */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Fax</Label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    className="bg-background border-border h-11"
                    value={newLead.fax}
                    onChange={(e) => setNewLead({ ...newLead, fax: e.target.value })}
                  />
                </div>

                {/* Lead Source */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Lead Source</Label>
                  <Select
                    value={String(newLead.sourceId)}
                    onValueChange={(v) => setNewLead({ ...newLead, sourceId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source: DynamicOption) => (
                        <SelectItem key={source.id} value={String(source.id)}>{source.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Industry</Label>
                  <Input
                    placeholder="e.g. Technology"
                    className="h-11 bg-background border-border"
                    value={newLead.industry}
                    onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                  />
                </div>

                {/* Annual Revenue */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Annual Revenue</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-11 bg-background border-border pl-12"
                      value={newLead.annualRevenue}
                      onChange={(e) => setNewLead({ ...newLead, annualRevenue: e.target.value })}
                    />
                  </div>
                </div>

                {/* No. of Employees */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">No. of Employees</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100"
                    className="h-11 bg-background border-border"
                    value={newLead.employees || ""}
                    onChange={(e) => setNewLead({ ...newLead, employees: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* Email Opt Out */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="emailOptOut"
                    checked={newLead.emailOptOut}
                    onCheckedChange={(checked) => setNewLead({ ...newLead, emailOptOut: checked === true })}
                  />
                  <Label htmlFor="emailOptOut" className="text-xs font-semibold text-muted-foreground cursor-pointer">
                    Email Opt Out
                  </Label>
                </div>

                {/* Skype ID */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Skype ID</Label>
                  <Input
                    placeholder="skype:username"
                    className="h-11 bg-background border-border"
                    value={newLead.skypeId}
                    onChange={(e) => setNewLead({ ...newLead, skypeId: e.target.value })}
                  />
                </div>

                {/* Secondary Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Secondary Email</Label>
                  <Input
                    type="email"
                    placeholder="secondary@company.com"
                    className="h-11 bg-background border-border"
                    value={newLead.secondaryEmail}
                    onChange={(e) => setNewLead({ ...newLead, secondaryEmail: e.target.value })}
                  />
                </div>

                {/* Twitter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Twitter</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">@</span>
                    <Input
                      placeholder="username"
                      className="h-11 bg-background border-border flex-1"
                      value={newLead.twitter}
                      onChange={(e) => setNewLead({ ...newLead, twitter: e.target.value })}
                    />
                  </div>
                </div>

                {/* Owner */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Lead Owner</Label>
                  <Select
                    value={String(newLead.ownerId)}
                    onValueChange={(v) => setNewLead({ ...newLead, ownerId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user.id} value={String(user.id)}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}



          {/* Step 2: Company */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Organization Context</h2>
                <p className="text-sm text-muted-foreground">Define the company background and digital presence.</p>
              </div>

              <div className="space-y-6">
                <div className="inline-flex p-1 bg-muted rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setUseExistingAccount(false)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${!useExistingAccount ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    New Company
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseExistingAccount(true)}
                    className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${useExistingAccount ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Existing Account
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      {useExistingAccount ? "Select Account *" : "Organization Name *"}
                    </Label>
                    {useExistingAccount ? (
                      <Select
                        value={newLead.accountId?.toString() || ""}
                        onValueChange={(v) => setNewLead({ ...newLead, accountId: Number.parseInt(v) })}
                      >
                        <SelectTrigger className="h-11 bg-background border-border">
                          <SelectValue placeholder="Search accounts..." />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account: any) => (
                            <SelectItem key={account.id} value={String(account.id)}>{account.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="e.g. Acme Corp"
                        className="h-11 bg-background border-border"
                        value={newLead.company}
                        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Website</Label>
                    <Input
                      placeholder="https://company.com"
                      className="h-11 bg-background border-border"
                      value={newLead.website}
                      onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Industry Vertical</Label>
                    <Input
                      placeholder="e.g. Technology"
                      className="h-11 bg-background border-border"
                      value={newLead.industry}
                      onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground">Operational HQ</Label>
                    <Input
                      placeholder="e.g. Paris, FR"
                      className="h-11 bg-background border-border"
                      value={newLead.location}
                      onChange={(e) => setNewLead({ ...newLead, location: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Strategy */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Sales Strategy</h2>
                <p className="text-sm text-muted-foreground">Categorize the lead value and strategic importance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Source</Label>
                  <Select
                    value={String(newLead.sourceId)}
                    onValueChange={(v) => setNewLead({ ...newLead, sourceId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source: DynamicOption) => (
                        <SelectItem key={source.id} value={String(source.id)}>{source.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Est. Pipeline Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-11 bg-background border-border pl-12"
                      value={newLead.value}
                      onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Funnel Stage</Label>
                  <Select
                    value={String(newLead.stageId)}
                    onValueChange={(v) => setNewLead({ ...newLead, stageId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Current stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage: DynamicOption) => (
                        <SelectItem key={stage.id} value={String(stage.id)}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color || '#3b82f6' }} />
                            {stage.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Engagement Score</Label>
                  <Select
                    value={String(newLead.scoreCategoryId)}
                    onValueChange={(v) => setNewLead({ ...newLead, scoreCategoryId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Select score" />
                    </SelectTrigger>
                    <SelectContent>
                      {scores.map((score: DynamicOption) => (
                        <SelectItem key={score.id} value={String(score.id)}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: score.color || "#6b7280" }} />
                            {score.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Lead Priority</Label>
                  <Select
                    value={String(newLead.priorityId)}
                    onValueChange={(v) => setNewLead({ ...newLead, priorityId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority: DynamicOption) => (
                        <SelectItem key={priority.id} value={String(priority.id)}>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: priority.color || "#6b7280" }} />
                            {priority.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Qualification Status</Label>
                  <Select
                    value={String(newLead.qualificationStageId)}
                    onValueChange={(v) => setNewLead({ ...newLead, qualificationStageId: Number.parseInt(v) })}
                  >
                    <SelectTrigger className="h-11 bg-background border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualifications.map((qual: DynamicOption) => (
                        <SelectItem key={qual.id} value={String(qual.id)}>{qual.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Action */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Retention & Action</h2>
                <p className="text-sm text-muted-foreground">Document critical context and set next engagement dates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Next Follow-up Date</Label>
                  <Input
                    type="date"
                    className="h-11 bg-background border-border"
                    value={newLead.nextFollowUp}
                    onChange={(e) => setNewLead({ ...newLead, nextFollowUp: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Tags (comma separated)</Label>
                  <Input
                    placeholder="e.g. enterprise, important, trade-fair"
                    className="h-11 bg-background border-border"
                    value={newLead.tags.join(", ")}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        tags: e.target.value.split(",").map((t) => t.trim()).filter((t) => t !== ""),
                      })
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground">Lead Intelligence Brief (Notes)</Label>
                  <Textarea
                    placeholder="Provide detailed context..."
                    className="bg-background border-border min-h-[150px] resize-none"
                    value={newLead.notes}
                    onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar - Matching Navbar theme */}
        <div className="bg-muted/50 p-6 border-t border-border flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={currentStep === 1 ? onCancel : handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          <Button
            type={currentStep === STEPS.length ? "submit" : "button"}
            onClick={currentStep === STEPS.length ? undefined : handleNext}
            disabled={isPending}
            className="bg-primary text-white hover:bg-primary/90 min-w-[120px]"
          >
            {currentStep === STEPS.length ? (
              <>
                {isPending ? "Processing..." : "Finish Acquisition"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
