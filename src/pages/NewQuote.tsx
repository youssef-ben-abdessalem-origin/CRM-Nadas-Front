import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  FileSignature,
  Save,
  Calendar,
  Truck,
  DollarSign,
  Package,
  Info,
  Briefcase,
  Plus,
  X,
  ChevronLeft
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

const NewQuote = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useProfileCurrency();
  const currencyCode = currency?.currency ?? "USD";
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

  const dealId = form.watch("dealId");
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

  useEffect(() => {
    if (dealId) {
      const deal = deals.find((d: any) => d.id === dealId);
      if (deal) {
        setSelectedDeal(deal);
        form.setValue("contactId", deal.contactId);
        form.setValue("accountId", deal.accountId);
        if (deal.account?.billingAddress) {
           form.setValue("billingAddress", deal.account.billingAddress);
        }
      }
    }
  }, [dealId, deals, form]);

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
      toast.success("Blueprint finalized successfully");
      navigate("/quotes");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to finalize blueprint");
    }
  });

  const onSubmit = (values: QuoteFormValues) => {
    const validItems = items.filter(i => i.productId);
    if (validItems.length === 0) {
      toast.error("Please add at least one asset to the blueprint");
      return;
    }

    const payload = {
      ...values,
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <CRMLayout title="Forge Strategy Blueprint">
      <div className="max-w-[1600px] mx-auto space-y-6 px-8">
        {/* Top Header Match ProductForm exactly */}
        <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate("/quotes")} className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to List
            </Button>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate("/quotes")} className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-2">
                    <X className="h-3.5 w-3.5 mr-2" /> Cancel
                </Button>
                <Button size="sm" onClick={form.handleSubmit(onSubmit)} className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest shadow-xl bg-indigo-600 hover:bg-indigo-500" disabled={createMutation.isPending}>
                    <Save className="h-3.5 w-3.5 mr-2" /> {createMutation.isPending ? "Finalizing..." : "Save Quote"}
                </Button>
            </div>
        </div>

        {/* Master Card Wrapper like EditProduct */}
        <Card className="border-2 shadow-2xl rounded-[32px] overflow-hidden bg-slate-900/40 backdrop-blur-xl">
           <CardHeader className="bg-muted/30 border-b-2 border-dashed p-8">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 Quote Details
              </CardTitle>
           </CardHeader>
           <CardContent className="p-8">
              <Form {...form}>
                <div className="space-y-10">
                  <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Image Identity & Basic Info */}
                    <div className="lg:col-span-1 space-y-8">
                      <motion.div variants={itemAnim}>
                        <Card className="overflow-hidden border-none shadow-2xl bg-slate-800/40 group rounded-3xl">
                          <CardContent className="p-0">
                            <div className="aspect-square flex flex-col items-center justify-center relative group">
                              <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border-2 border-dashed border-white/10 group-hover:border-indigo-500/50 transition-all shadow-inner">
                                  <FileSignature className="h-10 w-10" />
                              </div>
                              <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">Document Blueprint</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div variants={itemAnim} className="space-y-6 pt-2">
                         <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Info className="h-4 w-4 text-blue-500" /></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Basic Information</h3>
                         </div>

                         <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Strategy Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="Subject Name" className="bg-slate-900/50 border-white/10 h-12 rounded-xl focus:border-blue-500/50 font-bold text-slate-200" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                         )} />

                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="status" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Stage</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-900/50 border-white/10 h-10 rounded-xl text-xs font-bold uppercase">
                                      <SelectValue placeholder="Stage" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                                    {["draft", "negotiation", "delivered", "confirmed", "closed_won"].map(s => (
                                      <SelectItem key={s} value={s} className="rounded-xl uppercase text-[10px] font-bold py-3">{s.replace('_', ' ')}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )} />

                            <FormField control={form.control} name="ownerId" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Owner</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number.parseInt(v))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-900/50 border-white/10 h-10 rounded-xl text-xs font-bold">
                                      <SelectValue placeholder="Owner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                                    {users.map((u: any) => (
                                      <SelectItem key={u.id} value={u.id.toString()} className="rounded-xl py-3 text-xs font-bold">{u.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )} />
                         </div>
                      </motion.div>
                    </div>

                    {/* Right Column: Details & Matrices */}
                    <div className="lg:col-span-2 space-y-10">
                      <motion.div variants={itemAnim} className="space-y-6">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Briefcase className="h-4 w-4 text-emerald-500" /></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Additional Information</h3>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="dealId" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Associated Won Deal</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number.parseInt(v))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                                      <SelectValue placeholder="Select Deal" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                                    {deals.map((d: any) => (
                                      <SelectItem key={d.id} value={d.id.toString()} className="rounded-xl py-3 text-sm font-bold">{d.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )} />

                            <div className="flex items-center gap-4 bg-slate-950/30 p-4 rounded-2xl border border-white/5 mt-auto h-12">
                               <Avatar className="h-8 w-8 border border-white/10">
                                  <AvatarFallback className="bg-slate-800 text-[10px] font-bold">{selectedDeal ? selectedDeal.contact?.name?.[0] : "?"}</AvatarFallback>
                               </Avatar>
                               <div className="flex-1">
                                  <p className="text-[9px] font-bold uppercase text-slate-600 mb-1 leading-none">Target Account</p>
                                  <p className="text-xs font-bold text-slate-300 leading-none">{selectedDeal?.account?.name || "Unselected"}</p>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-3 mt-4">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Calendar className="h-4 w-4 text-indigo-500" /></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Important Dates</h3>
                         </div>

                         <div className="p-5 rounded-2xl bg-slate-950/30 border border-white/5 shadow-inner">
                            <FormField control={form.control} name="validUntil" render={({ field }) => (
                              <FormItem className="max-w-xs">
                                <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Valid Until</FormLabel>
                                <FormControl>
                                  <Input type="date" className="bg-transparent border-none h-8 p-0 text-[11px] font-bold text-slate-300 uppercase cursor-pointer focus:ring-0" {...field} />
                                </FormControl>
                              </FormItem>
                            )} />
                         </div>
                      </motion.div>

                      <motion.div variants={itemAnim} className="space-y-6 pt-6 border-t border-white/5">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Package className="h-4 w-4 text-amber-500" /></div>
                               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Quoted Items</h3>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-9 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest">
                               <Plus className="h-3 w-3 mr-2" /> Add Selection
                            </Button>
                         </div>

                         <div className="rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                            <Table>
                              <TableHeader className="bg-slate-950/40 border-b border-white/5">
                                 <TableRow className="hover:bg-transparent h-12">
                                    <TableHead className="w-16 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">#</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Asset Selection</TableHead>
                                    <TableHead className="w-20 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Vol</TableHead>
                                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 pr-8">Valuation</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {items.map((it, idx) => (
                                   <TableRow key={it.id} className="border-b border-white/5 hover:bg-white/[0.02] group/row h-14">
                                     <TableCell className="text-center font-bold text-[11px] text-slate-600">{idx + 1}</TableCell>
                                     <TableCell>
                                        <Select value={it.productId} onValueChange={(v) => updateItem(idx, "productId", v)}>
                                           <SelectTrigger className="bg-transparent border-none p-0 h-8 focus:ring-0 text-[12px] font-bold text-slate-300">
                                              <SelectValue placeholder="Select Asset..." />
                                           </SelectTrigger>
                                           <SelectContent className="bg-slate-950 border-white/10 rounded-2xl p-2 shadow-2xl">
                                              {products.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id.toString()} className="rounded-xl py-2.5 text-xs font-bold">{p.name}</SelectItem>
                                              ))}
                                           </SelectContent>
                                        </Select>
                                     </TableCell>
                                     <TableCell>
                                        <Input type="number" className="h-8 bg-slate-950/20 border-white/5 rounded-lg text-center text-[11px] font-bold" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
                                     </TableCell>
                                     <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-3">
                                           <span className="text-sm font-bold text-indigo-400">{fmt(it.total)}</span>
                                           <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} className="h-7 w-7 rounded-lg opacity-0 group-hover/row:opacity-100 text-rose-500 hover:bg-rose-500/10">
                                              <Trash2 className="h-3.5 w-3.5" />
                                           </Button>
                                        </div>
                                     </TableCell>
                                   </TableRow>
                                 ))}
                              </TableBody>
                            </Table>
                         </div>
                      </motion.div>

                      <motion.div variants={itemAnim} className="space-y-6 pt-6 border-t border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center"><DollarSign className="h-4 w-4 text-indigo-500" /></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Price Information</h3>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 shadow-inner space-y-4">
                               <div className="flex justify-between items-center h-8">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subtotal ({currencyCode})</span>
                                  <span className="font-bold text-slate-300 text-sm">{fmt(totals.subtotal)}</span>
                               </div>
                               <div className="flex justify-between items-center h-8 border-t border-white/5 pt-4 mt-2">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Adjustment ({currencyCode})</span>
                                  <Input type="number" className="h-7 w-20 bg-slate-900/50 border-white/5 text-right font-bold text-amber-500 p-1 rounded-md text-[11px]" value={adjustment} onChange={(e) => setAdjustment(Number(e.target.value))} />
                               </div>
                               <div className="pt-6 border-t border-white/10 text-center">
                                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2">Grand Total ({currencyCode})</p>
                                  <h2 className="text-4xl font-bold tracking-tighter text-white leading-none">{fmt(totals.grandTotal)}</h2>
                               </div>
                            </div>

                            <div className="space-y-6">
                               <FormField control={form.control} name="carrier" render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Carrier</FormLabel>
                                   <Select onValueChange={field.onChange} value={field.value}>
                                     <FormControl>
                                       <SelectTrigger className="bg-slate-900/50 border-white/10 h-10 rounded-xl text-xs font-bold">
                                          <div className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-slate-500" /><SelectValue placeholder="Carrier" /></div>
                                       </SelectTrigger>
                                     </FormControl>
                                     <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                                       {["FedEX", "DHL", "UPS", "Local Delivery"].map(c => (
                                         <SelectItem key={c} value={c} className="rounded-xl py-3 text-xs font-bold">{c}</SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                 </FormItem>
                               )} />
                               
                               <FormField control={form.control} name="billingAddress" render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Address Information</FormLabel>
                                   <FormControl><Textarea className="bg-slate-900/50 border-white/10 rounded-xl p-4 text-[11px] font-bold leading-relaxed min-h-[100px] resize-none focus:border-blue-500/50" placeholder="Billing details..." {...field} /></FormControl>
                                 </FormItem>
                               )} />
                            </div>
                         </div>
                      </motion.div>

                      <motion.div variants={itemAnim} className="pt-6 border-t border-white/5">
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description Information</FormLabel>
                            <FormControl><Textarea placeholder="Quote internal mission notes..." className="bg-slate-900/50 border-white/10 min-h-[140px] resize-none rounded-2xl p-5 text-slate-300 text-sm focus:border-blue-500/50 leading-relaxed shadow-inner" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </Form>
           </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default NewQuote;
