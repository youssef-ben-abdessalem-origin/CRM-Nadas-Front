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
  Calculator
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";

export default function NewQuote() {
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
    team: ""
  });

  const [items, setItems] = useState<any[]>([
    { productId: "", productName: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }
  ]);

  // Queries
  const { data: contacts = [] } = useQuery({ queryKey: ["contacts"], queryFn: () => api.contacts.getAll().catch(() => []) });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: () => api.accounts.getAll().catch(() => []) });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => api.deals.getAll().catch(() => []) });
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => api.users.getAll().catch(() => []) });

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

  const createMutation = useMutation({
    mutationFn: api.billing.quotes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Structural proposal forged successfully");
      navigate("/quotes");
    },
    onError: (err: any) => toast.error(err.message || "Forge failed"),
  });

  const addItem = () => setItems([...items, { productId: "", productName: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]);
  const removeItem = (index: number) => items.length > 1 && setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = () => {
    if (!formData.subject || formData.subject.length < 2) return toast.error("Subject required (min 2 chars)");
    
    createMutation.mutate({
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

  return (
    <CRMLayout title="Quote Forge">
      <div className="space-y-6 max-w-6xl mx-auto pb-20">
        {/* Command Header */}
        <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-4 border-b -mx-4 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/quotes")}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold">Forge New Quote</h1>
              <p className="text-muted-foreground text-sm font-medium italic">Constructing Strategic Asset Proposal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/quotes")}>Discard</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Forging..." : "Finalize Protocol"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Core Blueprint */}
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <FileSignature className="h-4 w-4" /> Core Strategy Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Subject (Minimum 2 Characters) *</Label>
                  <Input 
                    placeholder="e.g. Enterprise Infrastructure Forge" 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Owner Agent</Label>
                        <Select value={formData.ownerId} onValueChange={(v) => setFormData({ ...formData, ownerId: v })}>
                            <SelectTrigger><SelectValue placeholder="Select unit owner" /></SelectTrigger>
                            <SelectContent>
                                {users.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Assigned Team</Label>
                        <Input placeholder="Engineering / Sales" value={formData.team} onChange={(e) => setFormData({ ...formData, team: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Related Contact</Label>
                        <Select value={formData.contactId} onValueChange={(v) => setFormData({ ...formData, contactId: v })}>
                            <SelectTrigger><SelectValue placeholder="Contact" /></SelectTrigger>
                            <SelectContent>
                                {contacts.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.firstName} {c.lastName}</SelectItem>)}
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
                        <Calculator className="h-3 w-3" /> Financial Summation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground uppercase opacity-50">Subtotal</span>
                    <span>{currencySymbol}{totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase opacity-50">Applied Discount</span>
                        <span className="text-destructive">-{currencySymbol}{totals.discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase opacity-50">Calculated Tax</span>
                        <span className="text-primary">+{currencySymbol}{totals.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
                    <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Net Payable</div>
                    <div className="text-3xl font-black text-primary tracking-tighter">{currencySymbol}{totals.grandTotal.toLocaleString()}</div>
                    </div>
                </CardContent>
                </Card>
          </div>
        </div>

        {/* Asset Intelligence Grid - FULL WIDTH */}
        <Card className="z-0">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Asset Inventory Matrix</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-1" /> Add Asset
            </Button>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableHeader className="bg-muted/10 font-bold">
                <TableRow>
                  <TableHead className="pl-6">Product Intel</TableHead>
                  <TableHead className="w-20 text-center">Qty</TableHead>
                  <TableHead className="w-28 text-right">Unit Point</TableHead>
                  <TableHead className="w-24 text-right">Disc (%)</TableHead>
                  <TableHead className="w-24 text-right">Tax (%)</TableHead>
                  <TableHead className="w-40 text-right pr-6">Accumulation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={idx} className="group">
                    <TableCell className="pl-6 py-3">
                      <div className="grid grid-cols-2 gap-4">
                        <Input className="h-8 text-xs font-bold" placeholder="Asset name..." value={it.productName} onChange={(e) => updateItem(idx, "productName", e.target.value)} />
                        <Input className="h-8 text-[10px] text-muted-foreground" placeholder="Asset ID/SKU" value={it.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)} />
                      </div>
                    </TableCell>
                    <TableCell><Input type="number" className="h-8 text-center text-xs" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} /></TableCell>
                    <TableCell><Input type="number" className="h-8 text-right text-xs" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))} /></TableCell>
                    <TableCell><Input type="number" className="h-8 text-right text-xs" value={it.discount} onChange={(e) => updateItem(idx, "discount", Number(e.target.value))} /></TableCell>
                    <TableCell><Input type="number" className="h-8 text-right text-xs" value={it.taxRate} onChange={(e) => updateItem(idx, "taxRate", Number(e.target.value))} /></TableCell>
                    <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-black">{currencySymbol}{((it.quantity * it.unitPrice) * (1 - it.discount/100) * (1 + it.taxRate/100)).toLocaleString()}</span>
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
                        <CardHeader><CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Truck className="h-4 w-4" /> Logistics Channel</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Preferred Carrier</Label>
                                <Select value={formData.carrier} onValueChange={(v) => setFormData({ ...formData, carrier: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FedEX">FedEX</SelectItem>
                                        <SelectItem value="DHL">DHL Express</SelectItem>
                                        <SelectItem value="UPS">UPS Worldwide</SelectItem>
                                        <SelectItem value="Aramex">Aramex</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Valid Until Protocol</Label>
                                <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4" /> Destination Intel</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-[10px]">Strategic Billing Address</Label>
                                <Textarea className="min-h-[60px] text-xs" placeholder="Street, City, Zip, Country..." value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px]">Transmission Hub (Shipping)</Label>
                                <Textarea className="min-h-[60px] text-xs" placeholder="Same as billing or dedicated dock..." value={formData.shippingAddress} onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Protocol Terms & Policy</CardTitle>
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
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Plus className="h-3 w-3" /> Project Intel Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2 text-xs">
                                <Label className="opacity-50 uppercase tracking-tighter">Value Proposition</Label>
                                <Textarea className="min-h-[140px]" placeholder="Summarize for the board..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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
