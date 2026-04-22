import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  FileText,
  Filter,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileDown
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";

const InvoicesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowAdd(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => api.billing.invoices.getAll()
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[10px] font-bold"><CheckCircle2 className="h-3 w-3 mr-1" /> {t('invoices.status.paid')}</Badge>;
      case "sent":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[10px] font-bold"><Clock className="h-3 w-3 mr-1" /> {t('invoices.status.sent')}</Badge>;
      case "overdue":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 uppercase text-[10px] font-bold"><AlertCircle className="h-3 w-3 mr-1" /> {t('invoices.status.overdue')}</Badge>;
      default:
        return <Badge variant="outline" className="uppercase text-[10px] font-bold text-slate-400 border-white/10 italic">{t('invoices.status.draft')}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter((iv: any) => 
    iv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    iv.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    iv.accountName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CRMLayout title={t('invoices.title')}>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">{t('invoices.header.title')}</h1>
            <p className="text-muted-foreground text-sm font-medium">{t('invoices.header.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-[#151921] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg">
              <FileDown className="h-4 w-4 mr-2" /> {t('invoices.header.exportCsv')}
            </Button>
            <Button 
                className="bg-primary hover:bg-primary/90 text-white font-bold text-[11px] tracking-wider h-10 px-6 rounded-lg shadow-lg shadow-primary/20"
                onClick={() => setShowAdd(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> {t('invoices.header.newInvoice')}
            </Button>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: t('invoices.stats.totalRevenue'), value: invoices.reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0), color: "text-primary" },
            { label: t('invoices.stats.accountsReceivable'), value: invoices.filter((i: any) => i.status !== 'paid').reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0), color: "text-amber-500" },
            { label: t('invoices.stats.settledLogic'), value: invoices.filter((i: any) => i.status === 'paid').reduce((acc: number, cur: any) => acc + (Number(cur.total) || 0), 0), color: "text-emerald-500" },
            { label: t('invoices.stats.dossierCount'), value: invoices.length, isRaw: true, color: "text-slate-400" }
          ].map((stat, i) => (
            <Card key={i} className="bg-[#151921] border-white/5 shadow-xl transition-all hover:border-primary/20">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</p>
                {stat.isRaw ? (
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                ) : (
                  <CurrencyNumbers amount={stat.value} valueClassName={`text-3xl font-black tracking-tighter ${stat.color}`} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Intelligence Table */}
        <Card className="bg-[#151921] border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder={t('invoices.table.searchPlaceholder')} 
                  className="pl-10 bg-[#0b0e14] border-white/5 text-sm h-10 focus:ring-primary/20 rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest"><Filter className="h-3 w-3 mr-2" /> {t('invoices.table.filterTime')}</Button>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest"><Filter className="h-3 w-3 mr-2" /> {t('invoices.table.filterStatus')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#0b0e14]/30">
                <TableRow className="border-b border-white/5 hover:bg-transparent h-14">
                  <TableHead className="pl-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('invoices.table.colId')}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('invoices.table.colContact')}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('invoices.table.colStatus')}</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('invoices.table.colDate')}</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">{t('invoices.table.colValue')}</TableHead>
                  <TableHead className="w-10 pr-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center italic text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] animate-pulse">{t('invoices.table.loading')}</TableCell>
                  </TableRow>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((iv: any) => (
                    <TableRow 
                      key={iv.id} 
                      className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group/row cursor-pointer"
                      onClick={() => navigate(`/invoices/${iv.id}`)}
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-white text-[13px] uppercase tracking-wider group-hover/row:text-primary transition-colors">{iv.invoiceNumber}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase mt-1">Ref: {iv.quoteId ? `Q-${String(iv.quoteId).padStart(4, '0')}` : 'Manual'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-300 text-[13px]">{iv.contactName || t('common.entities.contact')}</span>
                          <span className="text-[10px] text-slate-500 italic">{iv.accountName || t('common.entities.company')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(iv.status)}</TableCell>
                      <TableCell className="text-slate-400 text-sm font-medium tabular-nums italic">
                        {iv.created ? format(new Date(iv.created), "dd MMM yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <CurrencyNumbers amount={iv.total} valueClassName="text-[14px] font-black text-white tabular-nums tracking-tighter" />
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#151921] border-white/10 text-slate-200">
                             <DropdownMenuItem onClick={() => navigate(`/invoices/${iv.id}`)}><FileText className="h-4 w-4 mr-2" /> {t('invoices.table.viewDossier')}</DropdownMenuItem>
                             <DropdownMenuItem><FileDown className="h-4 w-4 mr-2" /> {t('invoices.table.exportPdf')}</DropdownMenuItem>
                             <DropdownMenuItem className="text-emerald-500"><CheckCircle2 className="h-4 w-4 mr-2" /> {t('invoices.table.markPaid')}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center text-slate-500 italic text-[10px] font-black uppercase tracking-widest opacity-40">{t('invoices.table.noInvoices')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogContent className="bg-[#151921] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="uppercase italic tracking-wider">{t('invoices.create.title')}</DialogTitle>
                </DialogHeader>
                <div className="py-6 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
                        <FileText className="h-8 w-8" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">{t('invoices.create.engineTitle')}</h4>
                        <p className="text-slate-400 text-sm">{t('invoices.create.engineDesc')}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white">{t('common.actions.close')}</Button>
                    <Button className="font-bold uppercase tracking-widest text-[11px]">{t('invoices.create.deployEngine')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </CRMLayout>
  );
};

export default InvoicesPage;
