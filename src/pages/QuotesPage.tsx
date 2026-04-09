import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Eye,
  FileText,
  Send,
  Printer,
  Download,
  Copy,
  Search,
  X,
  Check,
  Loader2,
  Calendar,
  User,
  DollarSign,
  FileSignature,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { useProfileCurrency } from "@/hooks/useProfileCurrency";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Types
interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

interface Quote {
  id: string;
  name: string;
  customerName?: string;
  customer?: string;
  amount: number;
  dueDate: string;
  notes?: string;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdAt?: string;
  items?: QuoteItem[];
}

const QuotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    data: quotes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => api.billing.quotes.getAll(),
  });

  const [openAdd, setOpenAdd] = useState(false);
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [form, setForm] = useState({
    name: "",
    customer: "",
    amount: "",
    dueDate: "",
    notes: "",
  });
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
    },
  ]);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems((arr) => [
      ...arr,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ]);
  };

  const updateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    setItems((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setItems((arr) => arr.filter((_, i) => i !== idx));
  };

  const computeTotals = () => {
    let subtotal = 0;
    let tax = 0;
    for (const it of items) {
      const lineSubtotal = it.quantity * it.unitPrice - it.discount;
      const lineTax = (lineSubtotal * it.taxRate) / 100;
      subtotal += lineSubtotal;
      tax += lineTax;
    }
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onRowClick = (q: Quote) => {
    setDetailQuote(q);
    setOpenDetail(true);
  };

  const createQuote = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a quote name");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.description.trim())) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsSubmitting(true);
    try {
      const totals = computeTotals();
      const payload = {
        name: form.name,
        customerName: form.customer,
        dueDate: form.dueDate,
        notes: form.notes,
        items: items.filter((i) => i.description.trim()),
        amount: totals.total,
        status: "draft",
      };
      await api.billing.quotes.create(payload);
      await refetch();
      setOpenAdd(false);
      resetForm();
      toast.success("Quote created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", customer: "", amount: "", dueDate: "", notes: "" });
    setItems([
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ]);
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      await api.billing.quotes.update(quoteId, { status });
      await refetch();
      if (detailQuote && detailQuote.id === quoteId) {
        setDetailQuote({ ...detailQuote, status: status as any });
      }
      toast.success(`Quote ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const { currency: currencyInfo } = useProfileCurrency();
  const currencyCode = currencyInfo?.currency ?? "TND";
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(v);

  const filteredQuotes = quotes.filter((q: any) => {
    const text = [q.name, q.customerName || q.customer, q.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes((query || "").toLowerCase());
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Draft</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Sent</Badge>;
      case "accepted":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none">Rejected</Badge>;
      case "expired":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Expired</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const totalsSummary = quotes.reduce((acc: any, q: any) => {
    acc.total += Number(q.amount) || 0;
    if (q.status === 'accepted') acc.accepted += Number(q.amount) || 0;
    if (q.status === 'draft' || q.status === 'sent') acc.pending += Number(q.amount) || 0;
    return acc;
  }, { total: 0, accepted: 0, pending: 0 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <CRMLayout title="Quotes Strategy">
      <div className="space-y-8 p-1">
        {/* Stats Section */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 shadow-2xl border-white/5 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Volume</p>
                  <h3 className="text-2xl font-black tracking-tighter text-white">{fmt(totalsSummary.total)}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 shadow-2xl border-white/5 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accepted</p>
                  <h3 className="text-2xl font-black tracking-tighter text-emerald-400">{fmt(totalsSummary.accepted)}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 shadow-2xl border-white/5 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">In Pipeline</p>
                  <h3 className="text-2xl font-black tracking-tighter text-amber-400">{fmt(totalsSummary.pending)}</h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 shadow-2xl border-white/5 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Success Rate</p>
                  <h3 className="text-2xl font-black tracking-tighter text-indigo-400">
                    {quotes.length > 0 ? Math.round((quotes.filter((q:any) => q.status === 'accepted').length / quotes.length) * 100) : 0}%
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap pb-2">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search quotes, customers, notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 h-12 bg-slate-900/50 border-white/5 rounded-2xl focus:bg-slate-900 transition-all shadow-xl"
              />
            </div>
            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/5 bg-slate-900/50 hover:bg-slate-900 shadow-xl">
              <Filter className="h-4 w-4 text-slate-400" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-12 rounded-2xl border-white/5 bg-slate-900/50 hover:bg-slate-900 px-6 font-bold uppercase tracking-widest text-[10px] text-slate-400 shadow-xl">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button
              onClick={() => setOpenAdd(true)}
              className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 font-bold uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" /> New Quote
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <Card className="border-none shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-slate-900/40 backdrop-blur-xl rounded-[32px] overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950/40 border-b border-white/5">
              <TableRow className="hover:bg-transparent h-16">
                <TableHead className="w-12 pl-6">
                  <div className="h-4 w-4 rounded border border-white/20 flex items-center justify-center" />
                </TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Strategy Identity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Customer Domain</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-slate-500">Valuation</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Maturity Date</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">Ops Status</TableHead>
                <TableHead className="text-right pr-6 font-black text-[10px] uppercase tracking-widest text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 opacity-20" />
                  </TableCell>
                </TableRow>
              ) : filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-slate-600">
                       <FileSignature className="h-12 w-12 opacity-10" />
                       <p className="text-sm font-bold uppercase tracking-widest opacity-30">No Strategic Quotes Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((q: any) => (
                  <TableRow
                    key={q.id}
                    className="group border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => onRowClick(q)}
                  >
                    <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                      <div className="h-4 w-4 rounded border border-white/10 group-hover:border-blue-500/50 transition-colors" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-[14px] bg-gradient-to-br from-indigo-500/20 to-blue-500/10 flex items-center justify-center border border-white/10 shadow-inner">
                          <FileSignature className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-200 tracking-tight">{q.name || "Untitled Strategy"}</p>
                          <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{q.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6 rounded-lg border border-white/5 shadow-lg">
                          <AvatarFallback className="bg-slate-800 text-[10px] text-slate-400 font-bold">
                            {getInitials(q.customerName || q.customer)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-slate-400 tracking-tight">{q.customerName || q.customer || "Anonymous"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-blue-400 tracking-tighter">{fmt(Number(q.amount) || 0)}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Gross Point</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {q.dueDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-sm font-bold text-slate-400">{format(new Date(q.dueDate), "MMM dd, yyyy")}</span>
                        </div>
                      ) : (
                        <span className="text-slate-700 italic text-xs">Unscheduled</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(q.status)}</TableCell>
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                       <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100">
                             <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 text-slate-600">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/5 transition-all">
                                <MoreHorizontal className="h-4 w-4 text-slate-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-950 border-white/10 rounded-2xl shadow-2xl p-2 min-w-[180px]">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 p-3">Strategy Control</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl p-3 gap-3 focus:bg-blue-500 focus:text-white group">
                                <Send className="h-4 w-4 text-slate-500 group-focus:text-white" />
                                <span className="text-xs font-bold uppercase tracking-widest">Transmit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl p-3 gap-3 focus:bg-blue-500 focus:text-white group">
                                <Download className="h-4 w-4 text-slate-500 group-focus:text-white" />
                                <span className="text-xs font-bold uppercase tracking-widest">Capture PDF</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
                              <DropdownMenuItem className="rounded-xl p-3 gap-3 focus:bg-rose-500 focus:text-white group text-rose-500">
                                <Trash2 className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Purge</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Detail Dialog Modernized */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border-white/10 rounded-[40px] shadow-2xl">
           {detailQuote && (
             <div className="flex flex-col h-full max-h-[90vh]">
                <div className="p-10 bg-gradient-to-br from-indigo-500/10 via-slate-950 to-slate-950 border-b border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12">
                      <FileSignature className="h-64 w-64" />
                   </div>
                   
                   <div className="relative space-y-4">
                      <div className="flex items-center gap-3">
                         {getStatusBadge(detailQuote.status)}
                         <Badge variant="outline" className="h-7 text-[10px] font-black uppercase tracking-widest border-white/10 bg-white/5 backdrop-blur-md">
                            Live Blueprint
                         </Badge>
                      </div>
                      <h2 className="text-4xl font-black tracking-tight text-white uppercase">{detailQuote.name}</h2>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-xl border border-white/10 shadow-xl">
                               <AvatarFallback className="bg-slate-900 text-xs text-slate-400 font-bold">{getInitials(detailQuote.customerName || detailQuote.customer)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-slate-400 tracking-tight">{detailQuote.customerName || detailQuote.customer}</span>
                         </div>
                         <div className="h-8 w-[1px] bg-white/5" />
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-600" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target: {detailQuote.dueDate ? format(new Date(detailQuote.dueDate), "MMM dd, yyyy") : "ASAP"}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 leading-none">Net Point</p>
                         <h4 className="text-2xl font-black tracking-tighter text-blue-400 leading-none">{fmt(detailQuote.amount)}</h4>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 leading-none">Asset Units</p>
                         <h4 className="text-2xl font-black tracking-tighter text-indigo-400 leading-none">{detailQuote.items?.length || 0} ITEMS</h4>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 leading-none">Last Transmitted</p>
                         <h4 className="text-2xl font-black tracking-tighter text-emerald-400 leading-none lowercase">Never</h4>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner"><ShoppingCart className="h-4 w-4" /></div>
                         <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Inventory Items</h3>
                      </div>
                      
                      <div className="rounded-[32px] border border-white/5 bg-slate-900/40 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-950/40">
                            <TableRow className="hover:bg-transparent border-b border-white/5">
                              <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-600">Metric / Intelligence</TableHead>
                              <TableHead className="text-center font-bold text-[10px] uppercase tracking-widest text-slate-600">Volume</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-600">Unit Point</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-600">Disc (%)</TableHead>
                              <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-slate-600 pr-8">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailQuote.items?.map((it, idx) => (
                              <TableRow key={idx} className="border-b border-white/5 hover:bg-white/[0.01]">
                                <TableCell className="font-bold text-slate-300 text-sm py-4">{it.description}</TableCell>
                                <TableCell className="text-center font-mono text-xs text-slate-500">{it.quantity}</TableCell>
                                <TableCell className="text-right font-bold text-slate-400">{fmt(it.unitPrice)}</TableCell>
                                <TableCell className="text-right font-bold text-slate-500">{it.discount}%</TableCell>
                                <TableCell className="text-right font-black text-blue-400 pr-8">{fmt(it.quantity * it.unitPrice - (it.quantity * it.unitPrice * it.discount / 100))}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                   </div>

                   {detailQuote.notes && (
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner"><AlertCircle className="h-4 w-4" /></div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Strategy Manifest</h3>
                         </div>
                         <div className="p-8 rounded-[32px] bg-slate-900/40 border border-white/5 italic text-slate-500 text-sm leading-relaxed shadow-inner">
                            {detailQuote.notes}
                         </div>
                      </div>
                   )}
                </div>

                <div className="p-10 border-t border-white/5 bg-slate-950 flex flex-col md:flex-row gap-4">
                   <Button className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all" onClick={() => updateQuoteStatus(detailQuote.id, 'sent')}>
                      <Send className="mr-2 h-4 w-4" /> Transmit Quote
                   </Button>
                   <Button variant="outline" className="flex-1 h-14 rounded-2xl border-white/10 bg-slate-900/50 hover:bg-slate-900 font-black uppercase tracking-widest text-[10px] shadow-xl" onClick={() => updateQuoteStatus(detailQuote.id, 'accepted')}>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" /> Accept Logic
                   </Button>
                   <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10 bg-slate-900/50 hover:bg-slate-900 shadow-xl flex items-center justify-center">
                      <Download className="h-5 w-5 text-slate-400" />
                   </Button>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default QuotesPage;