import { CRMLayout } from "@/components/CRMLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  Send,
  Check,
  Download,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Building,
  Users
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "@/hooks/use-confirm";
import { Label } from "@/components/ui/label";


export default function QuotesPage() {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailQuote, setDetailQuote] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { symbol: currencySymbol } = useDefaultCurrency();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => api.billing.quotes.getAll().catch(() => []),

  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      api.billing.quotes.update(id, { status }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Quote status updated");
      setOpenDetail(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.billing.quotes.delete,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      toast.success("Quote removed from system");
    },
  });

  const fmt = (val: number) => `${currencySymbol}${Number(val).toLocaleString()}`;

  const filteredQuotes = quotes.filter((q: any) =>
    (q.subject || q.title || "").toLowerCase().includes(query.toLowerCase()) ||
    (q.customer || q.contactName || "").toLowerCase().includes(query.toLowerCase())
  );

  const stats = {
    total: quotes.length,
    volume: quotes.reduce((acc: number, q: any) => acc + (q.total || 0), 0),
    accepted: quotes.filter((q: any) => q.status === 'accepted').length,
    pending: quotes.filter((q: any) => q.status === 'sent').length,
    successRate: quotes.length > 0 ? Math.round((quotes.filter((q: any) => q.status === 'accepted').length / quotes.length) * 100) : 0
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case 'sent': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Sent</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'declined': return <Badge variant="destructive">Declined</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm({
      title: "Delete Quote",
      description: "Are you sure you want to delete this quote record? This action cannot be undone.",
      variant: "destructive",
      confirmText: "Delete Record"
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Quotes">
        <div className="flex items-center justify-center h-64">
           <div className="text-muted-foreground italic">Syncing business records...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Quotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Quotes</h1>
                <p className="text-muted-foreground">Manage and track customer proposals</p>
            </div>
            <Button onClick={() => navigate("/quotes/new")}>
                <Plus className="h-4 w-4 mr-2" /> New Quote
            </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Quotes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Volume</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-blue-600">{fmt(stats.volume)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accepted</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Win Rate</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{stats.successRate}%</div>
                </CardContent>
            </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-2 rounded-lg border">
            <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-sm ml-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search proposals..." 
                        className="pl-9 h-9 bg-background"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-3.5 w-3.5 mr-2" /> Filter
                </Button>
            </div>
        </div>

        {/* Records Table */}
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px] pl-4">
                            <input type="checkbox" className="h-4 w-4 rounded" />
                        </TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Valuation</TableHead>
                        <TableHead className="text-center">Valid Until</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredQuotes.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                No proposals found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredQuotes.map((q: any) => (
                            <TableRow key={q.id} className="cursor-pointer group" onClick={() => { setDetailQuote(q); setOpenDetail(true); }}>
                                <TableCell className="pl-4">
                                    <input type="checkbox" className="h-4 w-4 rounded" onClick={(e) => e.stopPropagation()} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{q.subject || q.title || "Untitled Quote"}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase">{String(q.quoteNumber || q.id)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 rounded">
                                            <AvatarFallback className="text-[8px] font-bold">{(q.customer || "A").slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium">{q.customer || q.contactName || "Draft Customer"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold text-foreground">
                                    {fmt(q.total || 0)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {q.validUntil ? format(new Date(q.validUntil), "MMM dd, yyyy") : "ASAP"}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {getStatusBadge(q.status)}
                                </TableCell>
                                <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailQuote(q); setOpenDetail(true); }}>
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(q.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
      </div>

      {/* Detail View */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-3xl">
            {detailQuote && (
                <div className="space-y-6">
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold">{detailQuote.subject || "Quote Details"}</DialogTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>#{detailQuote.quoteNumber || detailQuote.id}</span>
                                    <span>•</span>
                                    <span>{getStatusBadge(detailQuote.status)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Grand Total</div>
                                <div className="text-3xl font-bold text-primary">{fmt(detailQuote.total || 0)}</div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-8 border-y py-6">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Bill To</Label>
                            <div className="font-bold text-lg">{detailQuote.customer || "Draft Customer"}</div>
                            <div className="text-sm text-muted-foreground italic">Strategic Account</div>
                        </div>
                        <div className="space-y-1 text-right">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Expiration</Label>
                            <div className="font-bold">{detailQuote.validUntil ? format(new Date(detailQuote.validUntil), "MMMM dd, yyyy") : "Valid for 30 days"}</div>
                        </div>
                    </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-muted/30 rounded-2xl p-4 border shadow-sm">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Net Valuation</p>
                         <h4 className="text-2xl font-bold text-primary leading-none">{fmt(Number(detailQuote.grandTotal || detailQuote.total || 0))}</h4>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4 border shadow-sm">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Carrier Channel</p>
                         <h4 className="text-xl font-bold flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-500" />
                            {detailQuote.carrier || "FedEX"}
                         </h4>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4 border shadow-sm">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Tax Amount</p>
                         <h4 className="text-xl font-bold text-blue-600">+{fmt(Number(detailQuote.taxAmount || 0))}</h4>
                      </div>
                      <div className="bg-muted/30 rounded-2xl p-4 border shadow-sm">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Units</p>
                         <h4 className="text-xl font-bold">{detailQuote.items?.length || 0} Assets</h4>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Building className="h-3 w-3" /> Billing Intel
                         </h3>
                         <div className="text-sm p-4 bg-muted/20 border rounded-xl italic">
                            {detailQuote.billingAddress || "Street, City, Zip - Global Region"}
                         </div>
                      </div>
                      <div className="space-y-3">
                         <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Truck className="h-3 w-3" /> Transmission Hub
                         </h3>
                         <div className="text-sm p-4 bg-muted/20 border rounded-xl italic">
                            {detailQuote.shippingAddress || "Docking Center / Customer Hub"}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-primary" />
                         <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Asset Inventory Matrix</h3>
                      </div>
                      
                      <div className="rounded-2xl border border shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead className="pl-6 font-bold text-[10px] uppercase">Asset Intel</TableHead>
                              <TableHead className="text-center font-bold text-[10px] uppercase">Qty</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase">Rate</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase">Tax %</TableHead>
                              <TableHead className="text-right pr-6 font-bold text-[10px] uppercase">Accumulation</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailQuote.items && detailQuote.items.length > 0 ? (
                               detailQuote.items.map((it: any, idx: number) => (
                                <TableRow key={idx} className="hover:bg-muted/10">
                                  <TableCell className="font-bold text-sm py-4 pl-6 uppercase tracking-tight">{it.productName || it.description}</TableCell>
                                  <TableCell className="text-center font-medium text-xs text-muted-foreground">{it.quantity}</TableCell>
                                  <TableCell className="text-right font-bold text-xs">{fmt(it.unitPrice)}</TableCell>
                                  <TableCell className="text-right font-bold text-xs text-blue-500 italic">{it.taxRate}%</TableCell>
                                  <TableCell className="text-right font-bold text-primary pr-6 tracking-tight">{fmt(it.total || (it.quantity * it.unitPrice))}</TableCell>
                                </TableRow>
                               ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center opacity-20 italic text-xs uppercase tracking-widest">
                                  No assets registered in this strategy
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                   </div>

                   {detailQuote.termsAndConditions && (
                      <div className="space-y-4 pt-4 border-t">
                         <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" /> Strategic Terms & Protocol
                         </h3>
                         <div className="p-6 rounded-2xl bg-muted/10 border italic text-muted-foreground text-sm leading-relaxed">
                            {detailQuote.termsAndConditions}
                         </div>
                      </div>
                   )}
                </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <Button className="flex-1 h-12 gap-2" onClick={() => updateStatusMutation.mutate({ id: detailQuote.id, status: 'sent'})}>
                            <Send className="h-4 w-4" /> Finalize & Send
                        </Button>
                        <Button variant="outline" className="flex-1 h-12 gap-2 text-green-600" onClick={() => updateStatusMutation.mutate({ id: detailQuote.id, status: 'accepted'})}>
                            <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button variant="outline" className="h-12 w-12 flex items-center justify-center p-0">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}