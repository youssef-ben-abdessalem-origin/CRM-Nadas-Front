import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Trash2,
  Eye,
  FileText,
  Send,
  Download,
  Search,
  Check,
  Loader2,
  Calendar,
  FileSignature,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Users,
  Building
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { useProfileCurrency } from "@/hooks/useProfileCurrency";
import { toast } from "sonner";

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
  quoteNumber?: string;
  subject?: string;
  title?: string;
  contactName?: string;
  customerName?: string;
  accountName?: string;
  total: number;
  grandTotal?: number;
  validUntil?: string;
  dueDate?: string;
  notes?: string;
  status?: string;
  items?: QuoteItem[];
}

const QuotesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: quotes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => api.billing.quotes.getAll(),
  });

  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [query, setQuery] = useState("");

  const onRowClick = (q: Quote) => {
    setDetailQuote(q);
    setOpenDetail(true);
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      await api.billing.quotes.update(Number(quoteId), { status });
      await refetch();
      if (detailQuote?.id === quoteId) {
        setDetailQuote({ ...detailQuote, status });
      }
      toast.success(`Quote ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const { currency: currencyInfo, loading: currencyLoading } = useProfileCurrency();
  const currencyCode = currencyInfo?.currency ?? "TND";
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(v);

  const filteredQuotes = quotes.filter((q: any) => {
    const text = [
      q.subject,
      q.title,
      q.quoteNumber,
      q.contactName,
      q.accountName,
      q.customerName,
      q.customer
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes((query || "").toLowerCase());
  });

  const getStatusBadge = (status?: string) => {
    const s = (status || "draft").toLowerCase();
    switch (s) {
      case "draft":
        return <Badge variant="outline" className="bg-slate-100/5 text-slate-400 border-white/5 uppercase text-[9px] font-black tracking-widest px-2 py-0.5">Draft</Badge>;
      case "sent":
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase text-[9px] font-black tracking-widest px-2 py-0.5">Sent</Badge>;
      case "accepted":
      case "confirmed":
      case "closed_won":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase text-[9px] font-black tracking-widest px-2 py-0.5">Approved</Badge>;
      case "rejected":
      case "closed_lost":
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase text-[9px] font-black tracking-widest px-2 py-0.5">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest px-2 py-0.5">{s}</Badge>;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const totalsSummary = quotes.reduce((acc: any, q: any) => {
    const amt = Number(q.total || q.grandTotal || q.amount) || 0;
    acc.total += amt;
    if (['accepted', 'closed_won', 'confirmed'].includes(q.status)) acc.accepted += amt;
    if (['draft', 'sent', 'negotiation'].includes(q.status)) acc.pending += amt;
    return acc;
  }, { total: 0, accepted: 0, pending: 0 });

  const stats = {
    total: quotes.length,
    volume: totalsSummary.total,
    accepted: totalsSummary.accepted,
    pending: totalsSummary.pending,
    successRate: quotes.length > 0 ? Math.round((quotes.filter((q:any) => ['accepted', 'closed_won', 'confirmed'].includes(q.status)).length / quotes.length) * 100) : 0
  };

  return (
    <CRMLayout title="Forge Registry">
      <div className="space-y-8 p-1">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="bg-slate-900/40 border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500">
               <FileSignature className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tracking-tighter">{stats.total}</div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tight">Active Proposals</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500 text-blue-500">
               <TrendingUp className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tracking-tighter">{fmt(stats.volume)}</div>
              <p className="text-[10px] text-blue-500/80 mt-1 uppercase font-bold tracking-tight">Projected Wealth</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500 text-emerald-500">
               <CheckCircle2 className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Closing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tracking-tighter">{fmt(stats.accepted)}</div>
              <p className="text-[10px] text-emerald-500/80 mt-1 uppercase font-bold tracking-tight">Verified Returns</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/5 shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500 text-amber-500">
               <Clock className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Negotiation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tracking-tighter">{fmt(stats.pending)}</div>
              <p className="text-[10px] text-amber-500/80 mt-1 uppercase font-bold tracking-tight">Live Discussion</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500 text-indigo-500">
               <ArrowUpRight className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white tracking-tighter">{stats.successRate}%</div>
              <p className="text-[10px] text-indigo-500/80 mt-1 uppercase font-bold tracking-tight">Conversion Index</p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 flex-1">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <Input
                  placeholder="Search forge strategies..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-10 bg-slate-950/50 border-white/5 text-xs font-bold tracking-tight focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
             </div>
             <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-white/5 bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-xl">
               <Filter className="h-3 w-3 mr-2" /> Filter
             </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-white/5 bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all shadow-xl">
              <Download className="h-3 w-3 mr-2" /> Export
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/quotes/new")}
              className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="h-3 w-3" /> New Strategy
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <Card className="bg-slate-900/40 border-white/5 shadow-3xl overflow-hidden rounded-3xl backdrop-blur-xl">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-b border-white/5 transition-none">
                <TableHead className="w-12 pl-6">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-slate-900/50" />
                </TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">Proposal</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">Counterparty</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">Valuation ({currencyCode})</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">Target Date</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-4">Lifecycle</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500 pr-6">Commands</TableHead>
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
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 italic">No Strategic Records Found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuotes.map((q: any) => (
                  <TableRow
                    key={q.id}
                    className="group border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all duration-300"
                    onClick={() => onRowClick(q)}
                  >
                    <TableCell className="pl-6">
                      <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-slate-900/50" onClick={(e) => e.stopPropagation()} />
                    </TableCell>
                    <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                              <FileSignature className="h-4 w-4 text-blue-400" />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-100 group-hover:text-blue-400 transition-colors tracking-tight">
                                 {q.subject || q.title || "Untitled Strategy"}
                              </span>
                              <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">
                                 {String(q.quoteNumber || q.id).slice(0, 12)}
                              </span>
                           </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-7 w-7 rounded-lg border border-white/5 shadow-lg group-hover:rotate-6 transition-transform">
                              <AvatarFallback className="bg-slate-800 text-[10px] font-black text-slate-400">
                                 {getInitials(q.contactName || q.accountName || q.customerName || q.customer)}
                              </AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-300">
                                 {q.contactName || q.accountName || q.customerName || q.customer || "Anonymous"}
                              </span>
                              <div className="flex items-center gap-1 opacity-50">
                                {q.accountName ? <Building className="h-2 w-2" /> : <Users className="h-2 w-2" />}
                                <span className="text-[8px] font-black uppercase tracking-tighter">Strategic Lead</span>
                              </div>
                           </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right px-4">
                        <span className="text-sm font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                           {fmt(Number(q.total || q.grandTotal || q.amount || 0))}
                        </span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                        <div className="flex items-center justify-center gap-2">
                           <Calendar className="h-3 w-3 text-slate-600" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {q.validUntil || q.dueDate ? format(new Date(q.validUntil || q.dueDate!), "MMM dd") : "Unset"}
                           </span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                        {getStatusBadge(q.status)}
                    </TableCell>
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-900/50 hover:bg-blue-500/20 hover:text-blue-400 border border-white/5 rounded-lg transition-all" onClick={() => onRowClick(q)}>
                              <Eye className="h-3.5 w-3.5" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-900/50 hover:bg-rose-500/20 hover:text-rose-400 border border-white/5 rounded-lg text-slate-600 transition-all">
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border-white/10 rounded-[40px] shadow-3xl backdrop-blur-3xl">
           {detailQuote && (
             <div className="flex flex-col h-full max-h-[90vh]">
                <div className="p-10 bg-gradient-to-br from-blue-500/10 via-slate-950 to-slate-950 border-b border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.02] scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                      <FileSignature className="h-64 w-64" />
                   </div>
                   
                   <div className="relative space-y-4">
                      <div className="flex items-center gap-3">
                         {getStatusBadge(detailQuote.status)}
                         <Badge variant="outline" className="h-7 text-[9px] font-black uppercase tracking-[0.2em] border-white/10 bg-white/5 backdrop-blur-md px-3 text-slate-400">
                            Proposal Forge
                         </Badge>
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                        {detailQuote.subject || detailQuote.title || "Untitled Strategy"}
                      </h2>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-xl border border-white/10 shadow-xl">
                               <AvatarFallback className="bg-slate-900 text-xs text-slate-400 font-black">
                                  {getInitials(detailQuote.contactName || detailQuote.accountName || detailQuote.customerName || detailQuote.customer)}
                               </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-black text-slate-300 tracking-tight">
                              {detailQuote.contactName || detailQuote.accountName || detailQuote.customerName || detailQuote.customer || "Anonymous Counterparty"}
                            </span>
                         </div>
                         <div className="h-6 w-[1px] bg-white/10" />
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-600" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target: {detailQuote.validUntil || detailQuote.dueDate ? format(new Date(detailQuote.validUntil || detailQuote.dueDate!), "MMM dd, yyyy") : "ASAP"}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 backdrop-blur-md shadow-inner">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 leading-none opacity-50">Net Valuation</p>
                         <h4 className="text-3xl font-black tracking-tighter text-blue-400 leading-none">{fmt(Number(detailQuote.total || detailQuote.grandTotal || 0))}</h4>
                      </div>
                      <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 backdrop-blur-md shadow-inner">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 leading-none opacity-50">Strategy Units</p>
                         <h4 className="text-3xl font-black tracking-tighter text-indigo-400 leading-none uppercase">{detailQuote.items?.length || 0} Assets</h4>
                      </div>
                      <div className="bg-white/[0.03] rounded-3xl p-6 border border-white/5 backdrop-blur-md shadow-inner">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 leading-none opacity-50">Transmission Status</p>
                         <h4 className="text-3xl font-black tracking-tighter text-emerald-400 leading-none lowercase italic opacity-80 font-serif">Original</h4>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex items-center gap-3 pl-2">
                         <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                         <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Inventory Matrix</h3>
                      </div>
                      
                      <div className="rounded-[32px] border border-white/5 bg-slate-900/20 overflow-hidden shadow-2xl backdrop-blur-md">
                        <Table>
                          <TableHeader className="bg-slate-950/40">
                            <TableRow className="hover:bg-transparent border-b border-white/5 transition-none">
                              <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-600 pl-8">Asset Intel</TableHead>
                              <TableHead className="text-center font-black text-[9px] uppercase tracking-widest text-slate-600">Volume</TableHead>
                              <TableHead className="text-right font-black text-[9px] uppercase tracking-widest text-slate-600">Unit Point</TableHead>
                              <TableHead className="text-right font-black text-[9px] uppercase tracking-widest text-slate-600">Off (%)</TableHead>
                              <TableHead className="text-right font-black text-[9px] uppercase tracking-widest text-slate-600 pr-10">Total Accumulation</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detailQuote.items && detailQuote.items.length > 0 ? (
                               detailQuote.items.map((it, idx) => (
                                <TableRow key={idx} className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors">
                                  <TableCell className="font-black text-slate-100 text-sm py-4 pl-8 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{it.description}</TableCell>
                                  <TableCell className="text-center font-mono text-xs text-slate-500">{it.quantity}</TableCell>
                                  <TableCell className="text-right font-bold text-slate-400 text-xs">{fmt(it.unitPrice)}</TableCell>
                                  <TableCell className="text-right font-bold text-slate-500 text-xs italic">{it.discount}%</TableCell>
                                  <TableCell className="text-right font-black text-blue-400 pr-10 tracking-tight">{fmt(it.quantity * it.unitPrice - (it.quantity * it.unitPrice * (it.discount / 100)))}</TableCell>
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

                   {detailQuote.notes && (
                      <div className="space-y-4">
                         <div className="flex items-center gap-3 pl-2">
                             <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Executive Brief</h3>
                         </div>
                         <div className="p-10 rounded-[40px] bg-slate-900/30 border border-white/5 italic text-slate-400 text-sm leading-relaxed shadow-inner font-serif">
                            "{detailQuote.notes}"
                         </div>
                      </div>
                   )}
                </div>

                <div className="p-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl flex flex-col md:flex-row gap-4">
                   <Button className="flex-1 h-14 rounded-[20px] bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 transition-all transform active:scale-95" onClick={() => updateQuoteStatus(detailQuote.id, 'sent')}>
                      <Send className="mr-3 h-4 w-4" /> Finalize & Transmit
                   </Button>
                   <Button variant="outline" className="flex-1 h-14 rounded-[20px] border-white/10 bg-slate-900/50 hover:bg-white/5 font-black uppercase tracking-widest text-[10px] text-slate-300 transition-all transform active:scale-95" onClick={() => updateQuoteStatus(detailQuote.id, 'accepted')}>
                      <Check className="mr-3 h-4 w-4 text-emerald-400" /> Approve Strategy
                   </Button>
                   <Button variant="outline" className="h-14 w-14 rounded-[20px] border-white/10 bg-slate-900/50 hover:bg-white/5 shadow-xl flex items-center justify-center transition-all group active:scale-95">
                      <Download className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
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