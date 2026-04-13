import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    ArrowLeft,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building,
    User,
    Mail,
    FileText,
    History,
    Package,
    MapPin,
    Truck,
    CreditCard
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

const InvoicePrintTemplate = ({ invoice, company }: { invoice: any, company: any }) => {
    return (
        <div className="hidden print:block bg-white text-black p-[35px] min-h-[297mm] w-[210mm] mx-auto font-sans leading-tight [print-color-adjust:exact]">
            <div className="flex justify-between items-start mb-6">
                <div className="space-y-0.5">
                    <h2 className="text-lg font-bold text-[#003366]">{company?.legalName || "Nadas Group"}</h2>
                    <div className="text-[10px] text-slate-500 space-y-0.5">
                        <p>{company?.officeAddress}</p>
                        <p>Phone: {company?.phone} | Email: {company?.email}</p>
                        {company?.taxId && <p className="font-bold text-[9px] text-[#003366]/50 uppercase tracking-widest mt-1">VAT: {company?.taxId}</p>}
                    </div>
                </div>
                <div className="w-48 overflow-hidden">
                    <img
                        src={company?.logoUrl || "https://www.nadas-group.com/wp-content/uploads/2023/07/logo-nadas-avec-contour.webp"}
                        alt="Logo"
                        className="w-full h-auto object-contain grayscale-[0.2] brightness-110"
                    />
                </div>
            </div>

            <div className="flex justify-end mb-4 pt-4 border-t border-slate-50">
                <h1 className="text-4xl font-bold text-[#003366] tracking-[0.2em] uppercase">Invoice</h1>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div className="space-y-2">
                    <h3 className="text-[#003366] font-bold uppercase text-[10px] tracking-widest border-b border-[#003366]/20 pb-0.5 w-fit">Bill To:</h3>
                    <div className="space-y-0.5">
                        <p className="font-bold text-md text-slate-800">{invoice.contactName || "Client Entity"}</p>
                        <div className="text-[11px] text-slate-500 max-w-[250px] italic">
                            {invoice.accountName}
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-right">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Invoice ID</span>
                        <span className="text-slate-600 tabular-nums">{invoice.invoiceNumber}</span>

                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Issue Date</span>
                        <span className="text-slate-600 tabular-nums">{invoice.created ? format(new Date(invoice.created), "dd-MM-yyyy") : "N/A"}</span>

                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Due Date</span>
                        <span className="text-slate-600 tabular-nums">{invoice.dueDate ? format(new Date(invoice.dueDate), "dd-MM-yyyy") : "Upon Receipt"}</span>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#003366] text-white">
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest w-12">Qty</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest">Description</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest text-right">Unit Val</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest text-right">Aggregate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((it: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2.5 px-3 text-[11px] font-bold text-slate-700">{it.quantity}</td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600">
                                    <span className="font-bold text-slate-800 block">{it.productName}</span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600 text-right tabular-nums">
                                    {Number(it.unitPrice).toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] font-bold text-slate-800 text-right tabular-nums">
                                    {Number(it.total).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mb-8">
                <div className="w-64 space-y-1.5">
                    <div className="flex justify-between text-[11px] py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Net Value</span>
                        <span className="tabular-nums font-bold text-slate-700">{Number(invoice.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Sales Tax</span>
                        <span className="tabular-nums font-bold text-slate-700">{Number(invoice.taxAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#f8faff] p-3 border-l-4 border-[#003366] mt-2 shadow-sm">
                        <span className="font-black text-[#003366] uppercase text-[10px] tracking-[0.2em]">Grand Total</span>
                        <span className="text-xl font-black text-[#003366] tabular-nums tracking-tighter">
                            {Number(invoice.total).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-auto flex justify-between items-end pt-4 border-t border-slate-50">
                <div className="space-y-0.5">
                    <div className="text-[9px] font-black text-[#003366] uppercase tracking-[0.2em]">{company?.legalName}</div>
                    <div className="text-[8px] text-slate-400 font-mono">
                         Bank: {company?.bankName} | IBAN: {company?.bankIban}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: invoice, isLoading } = useQuery({
        queryKey: ["invoice", id],
        queryFn: () => api.billing.invoices.getOne(Number(id)),
    });

    const { data: company } = useQuery({
        queryKey: ["company-settings"],
        queryFn: () => api.settings.getCompany(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            // Update invoice status
            await api.billing.invoices.update(Number(id), { status });
            
            // If marking as paid, create a payment record
            if (status === 'paid') {
                await api.billing.payments.create({
                    invoiceId: Number(id),
                    amount: invoice.total,
                    method: "Bank Transfer", // Defaulting to professional standard
                    date: new Date().toISOString(),
                    notes: `Automated fulfillment for invoice ${invoice.invoiceNumber}`
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoice", id] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            toast.success("Settlement registry synchronized");
        },
        onError: () => {
            toast.error("Vortex Link Failure: Unable to sync settlement.");
        }
    });

    if (isLoading) {
        return (
            <CRMLayout title="Invoice Intelligence">
                <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
                    <div className="text-primary italic animate-pulse tracking-[0.3em] uppercase text-[10px] font-black">Decrypting Settlement Dossier...</div>
                </div>
            </CRMLayout>
        );
    }

    if (!invoice) {
        return (
             <CRMLayout title="Null Record">
                <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#0b0e14]">
                    <p className="text-muted-foreground italic tracking-widest uppercase text-[10px] font-black opacity-40">Invoice target not found.</p>
                    <Button onClick={() => navigate("/invoices")} variant="outline" className="rounded-none font-black text-[10px] tracking-widest uppercase text-white border-white/10">Return to Base</Button>
                </div>
            </CRMLayout>
        );
    }

    const getStatusStyles = (status: string) => {
      switch (status?.toLowerCase()) {
        case "paid": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        case "sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "overdue": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
        default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      }
    };

    return (
        <CRMLayout title={`Invoice: ${invoice.invoiceNumber}`}>
            <div className="min-h-screen -m-6 flex flex-col print:bg-white overflow-x-hidden bg-[#0b0e14]">
                <InvoicePrintTemplate invoice={invoice} company={company} />

                <div className="print:hidden flex flex-col flex-1 text-slate-200">
                    {/* Header */}
                    <div className="flex items-center gap-6 p-10 border-b border-white/5">
                        <button
                            onClick={() => navigate("/invoices")}
                            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">{invoice.invoiceNumber}</h1>
                                <Badge className={`${getStatusStyles(invoice.status)} uppercase font-bold px-3 py-1 rounded-md text-[10px] tracking-widest border shadow-lg shadow-black/20`}>
                                    {invoice.status || "DRAFT"}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span className="text-primary font-bold">{invoice.contactName || "Direct Client"}</span>
                                <span className="opacity-20">•</span>
                                <span>Ref Quote: {invoice.quoteId ? `Q-${String(invoice.quoteId).padStart(6, '0')}` : 'Manual'}</span>
                            </div>
                        </div>

                        <div className="ml-auto text-right space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block opacity-50">Settlement Total</label>
                            <CurrencyNumbers amount={invoice.total} className="text-white" valueClassName="text-4xl font-black tracking-tighter leading-none" />
                        </div>
                    </div>

                    <div className="p-10 space-y-8 max-w-[1600px] mx-auto w-full">
                        {/* Action Bar */}
                        <div className="flex items-center justify-between bg-[#151921] border border-white/5 p-4 px-6 rounded-xl shadow-xl">
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ISSUED: {invoice.created ? format(new Date(invoice.created), "dd MMM yy") : "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="bg-[#0b0e14] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg" onClick={() => window.print()}>
                                    <Download className="h-4 w-4 mr-2" /> Download PDF
                                </Button>
                                {invoice.status !== 'paid' && (
                                  <Button 
                                    size="sm" 
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] tracking-wider h-10 px-10 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ml-2"
                                    onClick={() => updateStatusMutation.mutate('paid')}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> 
                                    {updateStatusMutation.isPending ? "Syncing..." : "Record Payment"}
                                  </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                             <div className="col-span-8 space-y-8">
                                {/* Product Table */}
                                <div className="bg-[#151921] border border-white/5 rounded-xl shadow-2xl overflow-hidden">
                                     <Table>
                                        <TableHeader className="bg-[#0b0e14]/30">
                                            <TableRow className="border-b border-white/5 hover:bg-transparent h-14">
                                                <TableHead className="pl-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Description</TableHead>
                                                <TableHead className="text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">Qty</TableHead>
                                                <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Unit Price</TableHead>
                                                <TableHead className="pr-8 text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.items?.map((it: any, idx: number) => (
                                                <TableRow key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group/row">
                                                    <TableCell className="pl-8 py-6 font-bold text-white text-[13px]">{it.productName}</TableCell>
                                                    <TableCell className="text-center font-black text-slate-400 text-[13px]">{it.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        <CurrencyNumbers amount={it.unitPrice} valueClassName="text-[13px] font-bold text-slate-300" />
                                                    </TableCell>
                                                    <TableCell className="pr-8 text-right">
                                                        <CurrencyNumbers amount={it.total} valueClassName="text-[13px] font-black text-white" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                     </Table>
                                     <div className="p-10 flex justify-end bg-black/10 border-t border-white/5">
                                        <div className="w-80 space-y-4">
                                            <div className="flex justify-between items-center text-slate-500">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal</span>
                                                <CurrencyNumbers amount={invoice.subtotal} valueClassName="text-sm font-black text-slate-300" />
                                            </div>
                                            <div className="flex justify-between items-center text-slate-500">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sales Tax</span>
                                                <CurrencyNumbers amount={invoice.taxAmount} valueClassName="text-sm font-black text-blue-500/50" />
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between items-center border-l-2 border-primary pl-4 py-2">
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Grand Total</span>
                                                <CurrencyNumbers amount={invoice.total} valueClassName="text-2xl font-black text-primary tracking-tighter" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>

                             <div className="col-span-4 space-y-8">
                                <div className="bg-[#151921] border border-white/5 p-8 rounded-xl shadow-2xl space-y-8 relative overflow-hidden group">
                                     <div className="flex items-center gap-4 relative z-10">
                                        <div className="h-16 w-16 bg-[#0b0e14] border border-white/10 rounded-xl flex items-center justify-center text-primary font-black text-2xl italic shadow-inner">
                                            {(invoice.contactName || "C").slice(0, 1)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{invoice.contactName || "Client"}</h3>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1 italic italic">{invoice.accountName}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                         <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Billing Coordinate</label>
                                            <div className="flex items-center gap-3 bg-[#0b0e14] border border-white/5 p-4 rounded-lg text-slate-400 text-xs italic">
                                                <MapPin className="h-4 w-4 text-slate-600" />
                                                {invoice.billingAddress || "Standard Corporate Address"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
}
