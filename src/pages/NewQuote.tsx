import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  FileSignature,
  Building,
  Users,
  Calendar,
  Truck,
  MapPin,
  ShieldCheck,
  Percent,
  Calculator,
  RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export default function NewQuote() {
  const { id } = useParams();
  const isEdit = !!id;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { symbol: currencySymbol } = useDefaultCurrency();

  const [formData, setFormData] = useState({
    subject: "",
    status: "draft",
    carrier: "FedEX",
    validUntil: "",
    termsAndConditions: "",
    description: "",
    billingAddress: "",
    shippingAddress: "",
    contactId: "",
    accountId: "",
    dealId: "",
    ownerId: "",
    team: "",
    globalTax: 0
  });

  const [items, setItems] = useState<any[]>([
    { productId: "", productName: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }
  ]);

  // Queries
  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ["quote", id],
    queryFn: () => api.billing.quotes.getOne(Number(id)),
    enabled: isEdit
  });

  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.contacts.getAll().catch(() => []) });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => api.accounts.getAll().catch(() => []) });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => api.deals.getAll().catch(() => []) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.users.getAll().catch(() => []) });
  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: () => api.departments.getAll().catch(() => []) });
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => api.products.getAll().catch(() => []) });
  const { data: carriers = [] } = useQuery({ queryKey: ["carriers"], queryFn: () => api.settings.getCarriers().catch(() => []) });
  const { data: taxClasses = [] } = useQuery({ queryKey: ["tax-classes"], queryFn: () => api.products.getTaxClasses().catch(() => []) });

  useEffect(() => {
    if (quote && isEdit) {
      setFormData({
        subject: quote.subject || "",
        status: quote.status || "draft",
        carrier: quote.carrier || "FedEX",
        validUntil: quote.validUntil || "",
        termsAndConditions: quote.termsAndConditions || "",
        description: quote.description || "",
        billingAddress: quote.billingAddress || "",
        shippingAddress: quote.shippingAddress || "",
        contactId: quote.contactId ? String(quote.contactId) : "",
        accountId: quote.accountId ? String(quote.accountId) : "",
        dealId: quote.dealId ? String(quote.dealId) : "",
        ownerId: quote.ownerId ? String(quote.ownerId) : "",
        team: quote.team || "",
        globalTax: quote.items?.[0]?.taxRate || 0
      });
      if (quote.items?.length > 0) {
        setItems(quote.items.map((it: any) => ({
          ...it,
          productId: it.productId || "",
          productName: it.productName || ""
        })));
      }
    }
  }, [quote, isEdit]);

  // Calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const discountVal = lineTotal * (item.discount / 100);
      const taxVal = (lineTotal - discountVal) * (item.taxRate / 100);
      
      subtotal += lineTotal;
      totalDiscount += discountVal;
      totalTax += taxVal;
    });

    return {
      subtotal,
      discount: totalDiscount,
      taxAmount: totalTax,
      grandTotal: subtotal - totalDiscount + totalTax
    };
  }, [items]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => isEdit ? api.billing.quotes.update(Number(id), data) : api.billing.quotes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quote", id] });
      toast.success(isEdit ? "Proposal refined in the encrypted ledger" : "Structural proposal forged successfully");
      navigate(isEdit ? `/quotes/${id}` : "/quotes");
    },
    onError: (err: any) => toast.error(err.message || "Operation failed"),
  });

  const addItem = () => setItems([...items, { productId: "", productName: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: formData.globalTax }]);
  const removeItem = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    if (!formData.subject || formData.subject.length < 2) return toast.error("Subject required (min 2 chars)");
    
    saveMutation.mutate({
      ...formData,
      contactId: formData.contactId ? Number(formData.contactId) : undefined,
      accountId: formData.accountId ? Number(formData.accountId) : undefined,
      dealId: formData.dealId ? Number(formData.dealId) : undefined,
      ownerId: formData.ownerId ? Number(formData.ownerId) : undefined,
      items: items.map(it => ({
          ...it,
          total: (it.quantity * it.unitPrice) * (1 - it.discount/100) * (1 + it.taxRate/100)
      })),
      ...totals,
      adjustment: 0
    });
  };

  if (isEdit && isQuoteLoading) {
    return (
        <CRMLayout title="Decrypting Proposal...">
            <div className="flex h-screen items-center justify-center">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            </div>
        </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Quote Forge">
      <div className="space-y-6 max-w-6xl mx-auto pb-20">
        {/* Command Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b -mx-4 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/quotes")}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold">{isEdit ? `Refine Quote: Q-${String(quote?.quoteNumber || quote?.id).padStart(6, '0')}` : "New Quote"}</h1>
              <p className="text-muted-foreground text-sm font-medium">{isEdit ? "Update tactical specifications" : "Prepare a proposal for your client"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(isEdit ? `/quotes/${id}` : "/quotes")}>Discard</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Syncing..." : isEdit ? "Update Registry" : "Save Quote"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Core Blueprint */}
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <FileSignature className="h-4 w-4" /> Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Quote Subject *</Label>
                  <Input 
                    placeholder="e.g. Enterprise Solution" 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Assigned To</Label>
                        <Select value={formData.ownerId} onValueChange={(v) => setFormData({ ...formData, ownerId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select assigned agent" /></SelectTrigger>
                            <SelectContent>
                                {users.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Department</Label>
                        <Select 
                          value={formData.team} 
                          onValueChange={(v) => {
                            const dept = departments.find((d: any) => String(d.id) === v);
                            setFormData({ 
                                ...formData, 
                                team: v,
                                ownerId: dept?.representativeId ? String(dept.representativeId) : formData.ownerId
                            });
                          }}
                        >
                            <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                            <SelectContent>
                                {departments.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Related Contact</Label>
                        <Select value={formData.contactId} onValueChange={(v) => setFormData({ ...formData, contactId: v })}>
                            <SelectTrigger><SelectValue placeholder="Contact" /></SelectTrigger>
                            <SelectContent>
                                {contacts.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Related Account</Label>
                        <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
                            <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                            <SelectContent>
                                {accounts.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Linked Deal</Label>
                        <Select value={formData.dealId} onValueChange={(v) => setFormData({ ...formData, dealId: v })}>
                            <SelectTrigger><SelectValue placeholder="Link deal" /></SelectTrigger>
                            <SelectContent>
                                {deals.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             {/* Financial Intelligence Summation - TOP RIGHT */}
             <Card className="border-primary/20 shadow-xl h-full">
                <CardHeader className="bg-primary/[0.02]">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Calculator className="h-3 w-3" /> Quote Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase opacity-50">Subtotal</span>
                    <CurrencyNumbers amount={totals.subtotal} />
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase opacity-50">Applied Discount</span>
                        <div className="flex items-center gap-1 text-destructive font-bold">
                            - <CurrencyNumbers amount={totals.discount} valueClassName="text-destructive" />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase opacity-50">Calculated Tax</span>
                        <div className="flex items-center gap-1 text-primary font-bold">
                            + <CurrencyNumbers amount={totals.taxAmount} valueClassName="text-primary" />
                        </div>
                    </div>
                    <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Grand Total</div>
                    <CurrencyNumbers 
                        amount={totals.grandTotal} 
                        className="text-primary tracking-tighter" 
                        valueClassName="text-3xl font-black" 
                    />
                    </div>
                </CardContent>
                </Card>
          </div>
        </div>

        {/* Asset Intelligence Grid - FULL WIDTH */}
        <Card className="z-0">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Products & Services</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableHeader className="bg-muted/10 font-bold">
                <TableRow>
                  <TableHead className="pl-6">Item Selection</TableHead>
                  <TableHead className="w-20 text-center">Qty</TableHead>
                  <TableHead className="w-28 text-right">Price</TableHead>
                  <TableHead className="w-24 text-right">Disc (%)</TableHead>
                  <TableHead className="w-24 text-right">Tax (%)</TableHead>
                  <TableHead className="w-40 text-right pr-6">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={idx} className="group">
                    <TableCell className="pl-6 py-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Select 
                          value={it.productId} 
                          onValueChange={(v) => {
                            const product = products.find((p: any) => p.productCode === v || String(p.id) === v);
                            const updatedItems = [...items];
                            updatedItems[idx] = {
                              ...updatedItems[idx],
                              productName: product?.name || "",
                              productId: product?.productCode || "",
                              unitPrice: product?.unitPrice || 0,
                              quantity: 1,
                              taxRate: formData.globalTax,
                              maxQty: product?.quantityInStock || 999
                            };
                            setItems(updatedItems);
                          }}
                        >
                            <SelectTrigger className="h-8 text-xs font-bold"><SelectValue placeholder="Asset..." /></SelectTrigger>
                            <SelectContent>
                                {products.map((p: any) => <SelectItem key={p.id} value={p.productCode || String(p.id)}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input className="h-8 text-[10px] text-muted-foreground bg-muted/20" placeholder="SKU" value={it.productId} readOnly />
                      </div>
                    </TableCell>
                    <TableCell>
                        <Input 
                            type="number" 
                            className="h-8 text-center text-xs" 
                            value={it.quantity} 
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (it.maxQty && val > it.maxQty) {
                                    toast.error(`Exceeds inventory (${it.maxQty} units)`);
                                    return;
                                }
                                updateItem(idx, "quantity", val);
                            }} 
                        />
                    </TableCell>
                    <TableCell><Input type="number" className="h-8 text-right text-xs bg-muted/20" value={it.unitPrice} readOnly /></TableCell>
                    <TableCell><Input type="number" className="h-8 text-right text-xs" value={it.discount} onChange={(e) => updateItem(idx, "discount", Number(e.target.value))} /></TableCell>
                    <TableCell><Input type="number" className="h-8 text-right text-xs bg-muted/20" value={it.taxRate} readOnly /></TableCell>
                    <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                             <CurrencyNumbers 
                                amount={((it.quantity * it.unitPrice) * (1 - it.discount/100) * (1 + it.taxRate/100))} 
                                valueClassName="text-sm font-black" 
                             />
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Logistics & Documentation */}
                <div className="grid grid-cols-2 gap-6">
                    <Card>
                         <CardHeader><CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Truck className="h-4 w-4" /> Shipping & Delivery</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Shipping Carrier</Label>
                                 <Select value={formData.carrier} onValueChange={(v) => setFormData({ ...formData, carrier: v })}>
                                    <SelectTrigger><SelectValue placeholder="Carrier" /></SelectTrigger>
                                    <SelectContent>
                                        {carriers.map((c: any) => (
                                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Expiry Date</Label>
                                <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-primary font-bold">Tax Setting (%)</Label>
                                 <Select 
                                    value={String(formData.globalTax)} 
                                    onValueChange={(v) => {
                                        const tax = Number(v);
                                        setFormData({ ...formData, globalTax: tax });
                                        setItems(items.map(it => ({ ...it, taxRate: tax })));
                                    }}
                                >
                                    <SelectTrigger className="border-primary/50"><SelectValue placeholder="Select protocol" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">0% (Exempt)</SelectItem>
                                        {taxClasses.map((t: any) => (
                                            <SelectItem key={t.id} value={String(t.rate)}>{t.name} ({t.rate}%)</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Address Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px]">Billing Address</Label>
                                <Textarea className="min-h-[60px] text-xs" placeholder="Street, City, Zip, Country..." value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px]">Shipping Address</Label>
                                <Textarea className="min-h-[60px] text-xs" placeholder="Enter shipping destination..." value={formData.shippingAddress} onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Terms & Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea className="min-h-[100px] text-xs italic" placeholder="Standard net-30, delivery schedules..." value={formData.termsAndConditions} onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })} />
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-1">
                {/* Project Intel Summary - BOTTOM RIGHT */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Plus className="h-3 w-3" /> Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2 text-xs">
                                <Label className="opacity-50 uppercase tracking-tighter">Quote Description</Label>
                                <Textarea className="min-h-[140px]" placeholder="Add any extra details or internal notes..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </CRMLayout>
  );
}
