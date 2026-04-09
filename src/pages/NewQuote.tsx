import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Trash2,
  Plus,
  Calendar,
  Users,
  Building,
  Target,
  Copy
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { useProfileCurrency } from "@/hooks/useProfileCurrency";

const quoteSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  ownerId: z.coerce.number().optional(),
  status: z.string().default("draft"),
  team: z.string().optional(),
  carrier: z.string().default("FedEX"),
  dealId: z.coerce.number().optional(),
  validUntil: z.string().optional(),
  contactId: z.coerce.number().optional(),
  accountId: z.coerce.number().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  termsAndConditions: z.string().optional(),
  description: z.string().optional(),
  // Address sub-fields (temporary for concatenation)
  billCountry: z.string().optional(),
  billBuilding: z.string().optional(),
  billStreet: z.string().optional(),
  billCity: z.string().optional(),
  billState: z.string().optional(),
  billZip: z.string().optional(),
  billLat: z.string().optional(),
  billLong: z.string().optional(),
  shipCountry: z.string().optional(),
  shipBuilding: z.string().optional(),
  shipStreet: z.string().optional(),
  shipCity: z.string().optional(),
  shipState: z.string().optional(),
  shipZip: z.string().optional(),
  shipLat: z.string().optional(),
  shipLong: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

const HorizontalField = ({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) => (
  <div className="grid grid-cols-4 items-center gap-4">
    <div className="col-span-1 flex justify-end">
      <Label className="text-xs font-medium text-slate-400 text-right whitespace-nowrap">
        {label}
      </Label>
    </div>
    <div className="col-span-3 relative">
      {required && <div className="absolute left-[-8px] top-0 bottom-0 w-[2px] bg-rose-500 rounded-full" />}
      {children}
    </div>
  </div>
);

const NewQuote = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency: currencyInfo } = useProfileCurrency();
  const currencyCode = currencyInfo?.currency ?? "TND";
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: `item-${Date.now()}`,
      productId: "",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      total: 0,
    },
  ]);
  const [adjustment, setAdjustment] = useState(0);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      status: "draft",
      carrier: "FedEX",
      subject: "",
      team: "",
      validUntil: "",
      billingAddress: "",
      shippingAddress: "",
      termsAndConditions: "",
      description: "",
      billCountry: "United States",
      shipCountry: "-None-",
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.getAll().catch(() => []),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: () => api.deals.getAll().catch(() => []),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.getAll().catch(() => []),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => api.contacts.getAll().catch(() => []),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.accounts.getAll().catch(() => []),
  });

  const dealId = form.watch("dealId");
  const accountId = form.watch("accountId");

  useEffect(() => {
    if (dealId) {
      const deal = deals.find((d: any) => d.id === dealId);
      if (deal) {
        form.setValue("contactId", deal.contactId);
        form.setValue("accountId", deal.accountId);
      }
    }
  }, [dealId, deals, form]);

  useEffect(() => {
    if (accountId) {
      const account = accounts.find((a: any) => a.id === accountId);
      if (account && account.billingAddress) {
         form.setValue("billStreet", account.billingAddress);
      }
    }
  }, [accountId, accounts, form]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      
      if (field === "productId") {
        const prod = products.find((p: any) => p.id.toString() === value.toString());
        if (prod) {
          item.productName = prod.name;
          item.unitPrice = prod.unitPrice || 0;
          item.taxRate = prod.tax || 0;
        }
      }

      const sub = item.quantity * item.unitPrice;
      const disc = (sub * item.discount) / 100;
      const tax = ((sub - disc) * item.taxRate) / 100;
      item.total = sub - disc + tax;
      
      next[idx] = item;
      return next;
    });
  };

  const computeTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    
    items.forEach((it) => {
      const sub = it.quantity * it.unitPrice;
      const disc = (sub * it.discount) / 100;
      const tax = ((sub - disc) * it.taxRate) / 100;
      
      subtotal += sub;
      totalDiscount += disc;
      totalTax += tax;
    });

    const grandTotal = subtotal - totalDiscount + totalTax + adjustment;
    return { subtotal, totalDiscount, totalTax, grandTotal };
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(v);

  const totals = computeTotals();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.billing.quotes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Quote finalized successfully");
      navigate("/quotes");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to finalize quote");
    }
  });

  const onSubmit = (values: QuoteFormValues) => {
    const validItems = items.filter(i => i.productId);
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Concatenate address
    const bill = `${values.billStreet || ""}, ${values.billCity || ""}, ${values.billState || ""} ${values.billZip || ""}, ${values.billCountry || ""}`.trim();
    const ship = `${values.shipStreet || ""}, ${values.shipCity || ""}, ${values.shipState || ""} ${values.shipZip || ""}, ${values.shipCountry || ""}`.trim();

    const payload = {
      ...values,
      billingAddress: bill,
      shippingAddress: ship,
      title: values.subject,
      items: validItems.map(it => ({
         productId: typeof it.productId === 'string' && it.productId.includes('-') ? it.productId : Number(it.productId),
         productName: it.productName,
         quantity: Number(it.quantity),
         unitPrice: Number(it.unitPrice),
         discount: Number(it.discount),
         taxRate: Number(it.taxRate),
         total: Number(it.total)
      })),
      ownerId: values.ownerId ? Number(values.ownerId) : null,
      dealId: values.dealId ? Number(values.dealId) : null,
      contactId: values.contactId ? Number(values.contactId) : null,
      accountId: values.accountId ? Number(values.accountId) : null,
      subtotal: totals.subtotal,
      discount: totals.totalDiscount,
      taxAmount: totals.totalTax,
      adjustment: Number(adjustment),
      grandTotal: totals.grandTotal,
      total: totals.grandTotal
    };

    createMutation.mutate(payload);
  };

  const copyAddress = () => {
    const vals = form.getValues();
    form.setValue("shipCountry", vals.billCountry);
    form.setValue("shipBuilding", vals.billBuilding);
    form.setValue("shipStreet", vals.billStreet);
    form.setValue("shipCity", vals.billCity);
    form.setValue("shipState", vals.billState);
    form.setValue("shipZip", vals.billZip);
    form.setValue("shipLat", vals.billLat);
    form.setValue("shipLong", vals.billLong);
    toast.info("Billing address copied to shipping");
  };

  return (
    <CRMLayout title="Forge Strategy Blueprint">
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20">
        <Form {...form}>
          <div className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">Create Quote</h1>
              <Button variant="link" className="text-indigo-400 text-xs p-0 h-auto">Edit Page Layout</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate("/quotes")} className="h-8 px-4 text-xs font-bold uppercase tracking-widest bg-slate-800 hover:bg-slate-700">
                Cancel
              </Button>
              <Button variant="secondary" size="sm" className="h-8 px-4 text-xs font-bold uppercase tracking-widest bg-slate-800 hover:bg-slate-700">
                Save and New
              </Button>
              <Button size="sm" onClick={form.handleSubmit(onSubmit)} className="h-8 px-6 text-xs font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <div className="px-8 space-y-12 mt-8">
            {/* Section 1: Quote Information */}
            <section className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500 border-l-4 border-indigo-500 pl-4">Quote Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
                <HorizontalField label="Quote Owner">
                  <FormField control={form.control} name="ownerId" render={({ field }) => (
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <SelectTrigger className="h-9 bg-slate-900/50 border-white/5 focus:ring-indigo-500/50">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <SelectValue placeholder="Select Owner" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </HorizontalField>

                <HorizontalField label="Deal Name">
                  <FormField control={form.control} name="dealId" render={({ field }) => (
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <SelectTrigger className="h-9 bg-slate-900/50 border-white/5">
                        <div className="flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-slate-500" />
                          <SelectValue placeholder="Select Deal" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {deals.map((d: any) => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </HorizontalField>

                <HorizontalField label="Subject" required>
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <Input className="h-9 bg-slate-900/50 border-white/5" {...field} />
                  )} />
                </HorizontalField>

                <HorizontalField label="Valid Until">
                  <FormField control={form.control} name="validUntil" render={({ field }) => (
                    <div className="relative">
                      <Input type="date" className="h-9 bg-slate-900/50 border-white/5 pl-10" {...field} />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  )} />
                </HorizontalField>

                <HorizontalField label="Quote Stage">
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 bg-slate-900/50 border-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["draft", "negotiation", "delivered", "confirmed", "closed_won"].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </HorizontalField>

                <HorizontalField label="Contact Name">
                  <FormField control={form.control} name="contactId" render={({ field }) => (
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <SelectTrigger className="h-9 bg-slate-900/50 border-white/5">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-500" />
                          <SelectValue placeholder="Select Contact" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </HorizontalField>

                <HorizontalField label="Team">
                  <FormField control={form.control} name="team" render={({ field }) => (
                    <Input className="h-9 bg-slate-900/50 border-white/5" {...field} />
                  )} />
                </HorizontalField>

                <HorizontalField label="Account Name">
                  <FormField control={form.control} name="accountId" render={({ field }) => (
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                      <SelectTrigger className="h-9 bg-slate-900/50 border-white/5">
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-slate-500" />
                          <SelectValue placeholder="Select Account" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((a: any) => (
                          <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </HorizontalField>

                <HorizontalField label="Carrier">
                  <FormField control={form.control} name="carrier" render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 bg-slate-900/50 border-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["FedEX", "DHL", "UPS", "Local Delivery"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                </HorizontalField>
              </div>
            </section>

            {/* Section 2: Address Information */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500 border-l-4 border-indigo-500 pl-4">Address Information</h2>
                <Button variant="secondary" size="sm" onClick={copyAddress} className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-slate-800 hover:bg-slate-700">
                  <Copy className="h-3 w-3 mr-2" /> Copy Address
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Billing Address */}
                <Card className="bg-slate-900/20 border-white/5">
                  <CardHeader className="py-3 px-4 bg-white/5">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-400">Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <HorizontalField label="Country / Region">
                      <FormField control={form.control} name="billCountry" render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-8 bg-black/20 border-white/5 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["United States", "Tunisia", "France", "Germany"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )} />
                    </HorizontalField>
                    <HorizontalField label="Flat / House No./ Building">
                      <FormField control={form.control} name="billBuilding" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <HorizontalField label="Street Address">
                      <FormField control={form.control} name="billStreet" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <HorizontalField label="City">
                      <FormField control={form.control} name="billCity" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <HorizontalField label="State / Province">
                      <FormField control={form.control} name="billState" render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-8 bg-black/20 border-white/5 text-xs">
                            <SelectValue placeholder="-None-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </HorizontalField>
                    <HorizontalField label="Zip / Postal Code">
                      <FormField control={form.control} name="billZip" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <div className="flex justify-end">
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-indigo-400" onClick={() => {
                        ["billCountry", "billBuilding", "billStreet", "billCity", "billState", "billZip"].forEach(f => form.setValue(f as any, ""));
                      }}>Clear All</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card className="bg-slate-900/20 border-white/5">
                  <CardHeader className="py-3 px-4 bg-white/5">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-slate-400">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <HorizontalField label="Country / Region">
                      <FormField control={form.control} name="shipCountry" render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-8 bg-black/20 border-white/5 text-xs">
                            <SelectValue placeholder="-None-" />
                          </SelectTrigger>
                          <SelectContent>
                            {["United States", "Tunisia", "France", "Germany"].map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )} />
                    </HorizontalField>
                    <HorizontalField label="Flat / House No./ Building">
                      <FormField control={form.control} name="shipBuilding" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <HorizontalField label="Street Address">
                      <FormField control={form.control} name="shipStreet" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <HorizontalField label="City">
                      <FormField control={form.control} name="shipCity" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <HorizontalField label="State / Province">
                      <FormField control={form.control} name="shipState" render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-8 bg-black/20 border-white/5 text-xs">
                            <SelectValue placeholder="-None-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MD">Maryland</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="CA">California</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </HorizontalField>
                    <HorizontalField label="Zip / Postal Code">
                      <FormField control={form.control} name="shipZip" render={({ field }) => (
                        <Input className="h-8 bg-black/20 border-white/5 text-xs" {...field} />
                      )} />
                    </HorizontalField>
                    <div className="flex justify-end">
                      <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-indigo-400" onClick={() => {
                        ["shipCountry", "shipBuilding", "shipStreet", "shipCity", "shipState", "shipZip"].forEach(f => form.setValue(f as any, ""));
                      }}>Clear All</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 3: Quoted Items */}
            <section className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500 border-l-4 border-indigo-500 pl-4">Quoted Items</h2>
              <div className="rounded-xl border border-white/5 overflow-hidden bg-slate-900/30 shadow-2xl overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="w-16 text-center text-[10px] font-black uppercase">S.NO</TableHead>
                      <TableHead className="pl-6 text-[10px] font-black uppercase border-l border-white/5 min-w-[300px]">Product Name</TableHead>
                      <TableHead className="w-24 text-center text-[10px] font-black uppercase border-l border-white/5">Quantity</TableHead>
                      <TableHead className="w-32 text-center text-[10px] font-black uppercase border-l border-white/5">List Price({currencyCode})</TableHead>
                      <TableHead className="w-32 text-center text-[10px] font-black uppercase border-l border-white/5">Amount({currencyCode})</TableHead>
                      <TableHead className="w-24 text-center text-[10px] font-black uppercase border-l border-white/5">Discount({currencyCode})</TableHead>
                      <TableHead className="w-24 text-center text-[10px] font-black uppercase border-l border-white/5">Tax({currencyCode})</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((it, idx) => (
                      <TableRow key={it.id} className="border-t border-white/5 hover:bg-white/[0.01]">
                        <TableCell className="text-center font-bold text-xs text-slate-500">{idx + 1}</TableCell>
                        <TableCell className="pl-4 py-3 border-l border-white/5">
                           <div className="space-y-2">
                             <Select value={it.productId} onValueChange={(v) => updateItem(idx, "productId", v)}>
                                <SelectTrigger className="h-10 bg-black/40 border-white/10 text-xs font-bold shadow-inner">
                                   <SelectValue placeholder="Select Asset..." />
                                </SelectTrigger>
                                <SelectContent>
                                   {products.map((p: any) => (
                                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                   ))}
                                </SelectContent>
                             </Select>
                             <Textarea className="min-h-[60px] max-h-[80px] bg-black/20 border-white/5 text-[11px] leading-relaxed resize-none" placeholder="Product description..." readOnly value={it.productName} />
                           </div>
                        </TableCell>
                        <TableCell className="border-l border-white/5">
                           <Input type="number" className="h-8 bg-black/20 border-white/5 text-center text-xs font-bold" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="border-l border-white/5">
                           <Input type="number" className="h-8 bg-black/20 border-white/5 text-center text-xs font-bold" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="border-l border-white/5 text-center text-xs font-bold text-slate-300">
                           {fmt(it.quantity * it.unitPrice)}
                        </TableCell>
                        <TableCell className="border-l border-white/5">
                           <Input type="number" className="h-8 bg-black/20 border-white/5 text-center text-xs" value={it.discount} onChange={(e) => updateItem(idx, "discount", Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="border-l border-white/5">
                           <Input type="number" className="h-8 bg-black/20 border-white/5 text-center text-xs" value={it.taxRate} onChange={(e) => updateItem(idx, "taxRate", Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-center">
                           <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-7 w-7 text-rose-500 hover:bg-rose-500/10">
                              <Trash2 className="h-3.5 w-3.5" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-8 text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10">
                 <Plus className="h-3 w-3 mr-2 text-indigo-400" /> Add row
              </Button>
            </section>

            {/* Totals & Bottom Sections */}
            <div className="flex flex-col md:flex-row gap-12">
               <div className="flex-1 space-y-12">
                  <section className="space-y-4">
                     <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Terms and Conditions</h2>
                     <FormField control={form.control} name="termsAndConditions" render={({ field }) => (
                        <Textarea className="min-h-[120px] bg-slate-900/30 border-white/5 p-4 text-sm leading-relaxed" {...field} />
                     )} />
                  </section>
                  <section className="space-y-4">
                     <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Description Information</h2>
                     <FormField control={form.control} name="description" render={({ field }) => (
                        <Textarea className="min-h-[120px] bg-slate-900/30 border-white/5 p-4 text-sm leading-relaxed" {...field} />
                     )} />
                  </section>
               </div>

               <div className="w-full md:w-[400px]">
                  <Card className="bg-slate-900/40 border-indigo-500/20 shadow-2xl sticky top-24">
                     <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                           <div className="flex items-center justify-between p-4">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Sub Total ({currencyCode})</span>
                              <div className="h-8 w-32 bg-black/20 rounded flex items-center justify-end px-3 text-xs font-bold text-slate-300">
                                 {fmt(totals.subtotal)}
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-4">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Discount ({currencyCode})</span>
                              <div className="h-8 w-32 bg-black/20 rounded flex items-center justify-end px-3 text-xs font-bold text-slate-400">
                                 {fmt(totals.totalDiscount)}
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-4">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Tax ({currencyCode})</span>
                              <div className="h-8 w-32 bg-black/20 rounded flex items-center justify-end px-3 text-xs font-bold text-slate-400">
                                 {fmt(totals.totalTax)}
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-4">
                              <span className="text-[10px] font-bold uppercase text-slate-500">Adjustment ({currencyCode})</span>
                              <Input type="number" className="h-8 w-32 bg-black/40 border-white/10 text-right text-xs font-bold text-amber-500" value={adjustment} onChange={(e) => setAdjustment(Number(e.target.value))} />
                           </div>
                           <div className="flex items-center justify-between p-6 bg-indigo-500/5">
                              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Grand Total ({currencyCode})</span>
                              <div className="text-xl font-black text-white px-3">
                                 {fmt(totals.grandTotal)}
                              </div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>
            
            <div className="pt-12 border-t border-white/5 flex items-center justify-center gap-4">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Create Form Views</span>
                  <Select defaultValue="standard">
                     <SelectTrigger className="h-8 bg-slate-800 border-white/10 text-[10px] font-bold uppercase">
                        <SelectValue />
                      </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="standard">Standard View</SelectItem>
                        <SelectItem value="detailed">Detailed View</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <Button variant="outline" size="sm" className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-slate-800 border-white/10">
                  Create a custom form page
               </Button>
            </div>
          </div>
        </Form>
      </div>
    </CRMLayout>
  );
};

export default NewQuote;
