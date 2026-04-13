import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    Send,
    Check,
    Download,
    Truck,
    Building,
    ShieldCheck,
    Clock,
    User,
    MapPin,
    Calculator,
    FileSignature,
    FileText,
    History,
    Settings2,
    Package,
    Mail,
    Smartphone,
    Plus,
    XCircle,
    FileEdit,
    Repeat,
    ArrowRightLeft,
    Eye,
    UploadCloud,
    Copy,
    RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";
import { Separator } from "@/components/ui/separator";

const QuotePrintTemplate = ({ quote, company }: { quote: any, company: any }) => {
    return (
        <div className="hidden print:block bg-white text-black p-[35px] min-h-[297mm] w-[210mm] mx-auto font-sans leading-tight [print-color-adjust:exact]">
            {/* Header section matching the user image */}
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
                <h1 className="text-4xl font-bold text-[#003366] tracking-[0.2em] uppercase">Quote</h1>
            </div>

            <div className="flex justify-between items-start mb-8">
                {/* Bill to section */}
                <div className="space-y-2">
                    <h3 className="text-[#003366] font-bold uppercase text-[10px] tracking-widest border-b border-[#003366]/20 pb-0.5 w-fit">Bill To:</h3>
                    <div className="space-y-0.5">
                        <p className="font-bold text-md text-slate-800">{quote.customer || "Prospect Entity"}</p>
                        <div className="text-[11px] text-slate-500 max-w-[250px] italic">
                            {quote.billingAddress || "Secondary coordinate validation pending."}
                        </div>
                    </div>
                </div>

                {/* Meta data section */}
                <div className="space-y-2 text-right">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Quote ID</span>
                        <span className="text-slate-600 tabular-nums">{String(quote.quoteNumber || quote.id).padStart(6, '0')}</span>

                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Issue Date</span>
                        <span className="text-slate-600 tabular-nums">{format(new Date(quote.createdAt || Date.now()), "dd-MM-yyyy")}</span>

                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Validity</span>
                        <span className="text-slate-600 tabular-nums">{format(new Date(Date.now() + 2592000000), "dd-MM-yyyy")}</span>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#003366] text-white">
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest w-12">Qty</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest">Description / Specification</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest text-right">Unit Val</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest text-right">Aggregate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items?.map((it: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2.5 px-3 text-[11px] font-bold text-slate-700">{it.quantity}</td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600 italic">
                                    <span className="font-bold text-slate-800 not-italic block">{it.productName || it.description}</span>
                                    <span className="text-[10px] opacity-70 leading-none">Standard deployment protocol.</span>
                                </td>
                                <td className="py-2.5 px-3 text-[11px] text-slate-600 text-right tabular-nums">
                                    {Number(it.unitPrice).toFixed(2)}
                                </td>
                                <td className="py-2.5 px-3 text-[11px] font-bold text-slate-800 text-right tabular-nums">
                                    {(Number(it.unitPrice) * Number(it.quantity)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
                <div className="w-64 space-y-1.5">
                    <div className="flex justify-between text-[11px] py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Net Value</span>
                        <span className="tabular-nums font-bold text-slate-700">{Number(quote.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] py-1 border-b border-slate-50">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Sales Tax ({company?.defaultTaxRate || 19}%)</span>
                        <span className="tabular-nums font-bold text-slate-700">{Number(quote.taxAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#f8faff] p-3 border-l-4 border-[#003366] mt-2 shadow-sm">
                        <span className="font-black text-[#003366] uppercase text-[10px] tracking-[0.2em]">Grand Total ({company?.defaultCurrency || "TND"})</span>
                        <span className="text-xl font-black text-[#003366] tabular-nums tracking-tighter">
                            {Number(quote.grandTotal).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Terms and conditions */}
            <div className="mb-10 space-y-2">
                <h3 className="text-[#003366] font-bold uppercase text-[9px] tracking-widest border-b border-[#003366]/20 pb-0.5 w-fit">Binding Protocols & T&C</h3>
                <div className="text-[10px] text-slate-400 leading-snug space-y-1">
                    <div className="italic opacity-60 text-[9px] whitespace-pre-wrap">
                        {quote.termsAndConditions || company?.termsAndConditions || "Standard binding protocols apply. Document valid for 30 cycles."}
                    </div>
                </div>
            </div>

            {/* Footer / Signature line */}
            <div className="mt-auto flex justify-between items-end pt-4 border-t border-slate-50">
                <div className="space-y-0.5">
                    <div className="text-[9px] font-black text-[#003366] uppercase tracking-[0.2em]">{company?.legalName}</div>
                    <div className="text-[8px] text-slate-400 font-mono">
                        {company?.bankName} | {company?.bankIban}
                    </div>
                </div>
                <div className="w-48 text-center space-y-1">
                    <div className="h-px bg-slate-300 w-full" />
                    <p className="text-[9px] font-bold text-[#003366] uppercase tracking-[0.2em]">Customer Signature</p>
                </div>
            </div>
        </div>
    );
};

export default function QuoteDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: quote, isLoading } = useQuery({
        queryKey: ["quote", id],
        queryFn: () => api.billing.quotes.getOne(Number(id)),
    });

    const { data: company } = useQuery({
        queryKey: ["company-settings"],
        queryFn: () => api.settings.getCompany(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => api.billing.quotes.update(Number(id), { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quote", id] });
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            toast.success("Quote status updated");
        },
    });

    const reviseMutation = useMutation({
        mutationFn: () => api.billing.quotes.revise(Number(id)),
        onSuccess: (newQuote) => {
            toast.success("Strategic revision initialized (v2)");
            navigate(`/quotes/edit/${newQuote.id}`);
        },
    });

    const createInvoiceMutation = useMutation({
        mutationFn: () => api.billing.quotes.createInvoice(Number(id)),
        onSuccess: (invoice) => {
            toast.success("Strategic fulfillment initialized: Invoice Generated");
            navigate(`/invoices/${invoice.id}`);
        },
        onError: (err: any) => toast.error(err.message || "Fulfillment protocol failed"),
    });

    const duplicateMutation = useMutation({
        mutationFn: () => api.billing.quotes.duplicate(Number(id)),
        onSuccess: (newQuote) => {
            toast.success("Dossier duplicated in the shadow registry");
            navigate(`/quotes/edit/${newQuote.id}`);
        },
    });

    const dispatchMutation = useMutation({
        mutationFn: () => api.billing.quotes.dispatch(Number(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quote", id] });
            queryClient.invalidateQueries({ queryKey: ["quotes"] });
            toast.success("Strategic dispatch complete. Client notified.");
        },
        onError: (err: any) => toast.error(err.message || "Dispatch protocol failed"),
    });

    if (isLoading) {
        return (
            <CRMLayout title="Quote Intelligence">
                <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
                    <div className="text-primary italic animate-pulse tracking-[0.3em] uppercase text-[10px] font-black">Decrypting Tactical Dossier...</div>
                </div>
            </CRMLayout>
        );
    }

    if (!quote) {
        return (
            <CRMLayout title="Null Record">
                <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#0b0e14]">
                    <p className="text-muted-foreground italic tracking-widest uppercase text-[10px] font-black opacity-40">Target record not found.</p>
                    <Button onClick={() => navigate("/quotes")} variant="outline" className="rounded-none font-black text-[10px] tracking-widest uppercase">Return to Base</Button>
                </div>
            </CRMLayout>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'accepted': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'sent': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case 'draft': return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            case 'declined': case 'rejected': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            case 'expired': return "bg-zinc-800 text-zinc-400 border-zinc-700";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const isDraft = quote.status?.toLowerCase() === 'draft';
    const isSent = quote.status?.toLowerCase() === 'sent';
    const isAccepted = quote.status?.toLowerCase() === 'accepted';
    const isExpired = quote.status?.toLowerCase() === 'expired';
    const isRejected = ['rejected', 'declined', 'lost'].includes(quote.status?.toLowerCase());

    return (
        <CRMLayout title={quote.subject}>
            <div className="min-h-screen -m-6 flex flex-col print:bg-white overflow-x-hidden bg-[#0b0e14]">
                {/* 🔵 Print View - Styled to match image */}
                <QuotePrintTemplate quote={quote} company={company} />

                {/* 🟢 Main Dashboard UI - Hidden on Print */}
                <div className="print:hidden flex flex-col flex-1 text-slate-200">
                    {/* 🟢 1. HEADER (Quick snapshot) */}
                    <div className="flex items-center gap-6 p-10 border-b border-white/5">
                        <button
                            onClick={() => navigate("/quotes")}
                            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">{quote.subject}</h1>
                                <Badge className={`${getStatusStyles(quote.status)} uppercase font-bold px-3 py-1 rounded-md text-[10px] tracking-widest border shadow-lg shadow-black/20`}>
                                    {quote.status || "DRAFT"}
                                </Badge>
                                {(isAccepted || isSent) && (
                                    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase opacity-40 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                        <ShieldCheck className="h-3 w-3" /> Locked Registry
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span className="text-primary font-bold">{quote.customer || "Prospect"}</span>
                                <span className="opacity-20">•</span>
                                <span>Target Sequence: {String(quote.quoteNumber || quote.id).padStart(6, '0')}</span>
                            </div>
                        </div>

                        <div className="ml-auto text-right space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block opacity-50">Aggregate Value</label>
                            <CurrencyNumbers amount={quote.grandTotal} className="text-white" valueClassName="text-4xl font-black tracking-tighter leading-none" />
                        </div>
                    </div>

                    <div className="p-10 space-y-8 max-w-[1600px] mx-auto w-full">
                        {/* 🎯 Action Bar */}
                        <div className="flex items-center justify-between bg-[#151921] border border-white/5 p-4 px-6 rounded-xl shadow-xl">
                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ISSUED: {format(new Date(quote.createdAt || Date.now()), "dd MMM yy")}</span>
                                <span className="mx-2 opacity-10">|</span>
                                <span className="flex items-center gap-1.5 text-rose-500/50"><XCircle className="h-3.5 w-3.5" /> EXPIRES: {format(new Date(Date.now() + 2592000000), "dd MMM yy")}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="sm" className="bg-[#0b0e14] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg" onClick={() => window.print()}>
                                    <Download className="h-4 w-4 mr-2" /> PDF Export
                                </Button>

                                <div className="w-px h-6 bg-white/5 mx-2" />

                                {isDraft ? (
                                    <>
                                        <Button variant="outline" size="sm" className="bg-[#0b0e14] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg" onClick={() => navigate(`/quotes/edit/${id}`)}>
                                            <FileEdit className="h-4 w-4 mr-2" /> Modify Blueprint
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="bg-primary hover:bg-primary/90 text-white font-bold text-[11px] tracking-wider h-10 px-10 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 ml-2"
                                            onClick={() => dispatchMutation.mutate()}
                                            disabled={dispatchMutation.isPending}
                                        >
                                            <Send className="h-4 w-4 mr-2" /> 
                                            {dispatchMutation.isPending ? "Sending..." : "Dispatch to Client"}
                                        </Button>
                                    </>
                                ) : isSent ? (
                                    <>
                                        <Button variant="outline" size="sm" className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg" onClick={() => reviseMutation.mutate()}>
                                            <RefreshCw className="h-4 w-4 mr-2" /> Forge Revision (v2)
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] tracking-wider h-10 px-10 rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ml-2"
                                            onClick={() => updateStatusMutation.mutate('accepted')}
                                            disabled={updateStatusMutation.isPending}
                                        >
                                            <ShieldCheck className="h-4 w-4 mr-2" /> 
                                            {updateStatusMutation.isPending ? "Processing..." : "Accept Proposal"}
                                        </Button>
                                    </>
                                ) : isAccepted ? (
                                    <>
                                        <Button variant="outline" size="sm" className="bg-[#0b0e14] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg" onClick={() => duplicateMutation.mutate()}>
                                            <Copy className="h-4 w-4 mr-2" /> Duplicate Record
                                        </Button>
                                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold text-[11px] tracking-wider h-10 px-10 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 ml-2" onClick={() => createInvoiceMutation.mutate()}>
                                            <FileSignature className="h-4 w-4 mr-2" /> Generate Invoice
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="outline" size="sm" className="bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg" onClick={() => duplicateMutation.mutate()}>
                                        <RefreshCw className="h-4 w-4 mr-2" /> Renew / Duplicate
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            {/* Main Content */}
                            <div className="col-span-8 space-y-8">
                                {/* 📦 Products Card */}
                                <div className="bg-[#151921] border border-white/5 rounded-xl shadow-2xl overflow-hidden">
                                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-primary" />
                                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Asset Matrix</h2>
                                        </div>
                                        <span className="text-[10px] font-black text-primary/40 bg-primary/5 px-3 py-1 rounded-full">{quote.items?.length || 0} DEPLOYMENTS</span>
                                    </div>
                                    <Table>
                                        <TableHeader className="bg-[#0b0e14]/30">
                                            <TableRow className="border-b border-white/5 hover:bg-transparent h-14">
                                                <TableHead className="pl-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Asset Description</TableHead>
                                                <TableHead className="text-center text-[10px] font-black uppercase text-slate-500 tracking-widest">Qty</TableHead>
                                                <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Unit Val</TableHead>
                                                <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Tax</TableHead>
                                                <TableHead className="pr-8 text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Aggregate</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-transparent">
                                            {quote.items?.map((it: any, idx: number) => (
                                                <TableRow key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group/row">
                                                    <TableCell className="pl-8 py-6">
                                                        <div className="font-bold text-white text-[13px] uppercase tracking-tight group-hover/row:text-primary transition-colors">{it.productName || it.description}</div>
                                                        <div className="text-[9px] font-black text-slate-600 uppercase font-mono mt-1">VECTOR-UNIT-0{idx + 1}</div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-black text-slate-400 text-[13px]">{it.quantity}</TableCell>
                                                    <TableCell className="text-right">
                                                        <CurrencyNumbers amount={it.unitPrice} valueClassName="text-[13px] font-bold text-slate-300" />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="text-[11px] font-black text-blue-500/40 tabular-nums uppercase">19.0%</span>
                                                    </TableCell>
                                                    <TableCell className="pr-8 text-right">
                                                        <CurrencyNumbers amount={it.total || (it.quantity * it.unitPrice)} valueClassName="text-[13px] font-black text-white tabular-nums" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="p-10 flex justify-end bg-black/10 border-t border-white/5">
                                        <div className="w-80 space-y-4">
                                            <div className="flex justify-between items-center text-slate-500">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Net Dossier Val</span>
                                                <CurrencyNumbers amount={quote.subtotal} valueClassName="text-sm font-black text-slate-300" />
                                            </div>
                                            <div className="flex justify-between items-center text-slate-500">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tax Aggregate</span>
                                                <CurrencyNumbers amount={quote.taxAmount} valueClassName="text-sm font-black text-blue-500/50" />
                                            </div>
                                            <div className="h-px bg-white/5 my-2" />
                                            <div className="flex justify-between items-center border-l-2 border-primary pl-4 py-2">
                                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Full Expenditure</span>
                                                <CurrencyNumbers amount={quote.grandTotal} valueClassName="text-2xl font-black text-primary tracking-tighter" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Logistic Protocols */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="bg-[#151921] border border-white/5 p-8 rounded-xl shadow-xl space-y-6">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Billing Coordinate</h3>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed italic opacity-80">{quote.billingAddress || "Standard corporate ledger address."}</p>
                                    </div>
                                    <div className="bg-[#151921] border border-white/5 p-8 rounded-xl shadow-xl space-y-6">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Truck className="h-4 w-4 text-primary" />
                                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Supply Vector</h3>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed italic opacity-80">{quote.shippingAddress || "Physical deployment to headquarters."}</p>
                                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                            <span className="text-[9px] font-black text-slate-600 uppercase">Carrier Method:</span>
                                            <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 bg-primary/5 rounded-md px-3">{quote.carrier || "DHL EXPRESS"}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="col-span-4 space-y-8">
                                {/* Sidepanel: Client Profile */}
                                <div className="bg-[#151921] border border-white/5 p-8 rounded-xl shadow-2xl space-y-8 relative overflow-hidden group">
                                    <div className="absolute -top-12 -right-12 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000 grayscale">
                                        <Building className="h-48 w-48 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="h-16 w-16 bg-[#0b0e14] border border-white/10 rounded-xl flex items-center justify-center text-primary font-black text-2xl italic shadow-inner">
                                            {(quote.customer || "P").slice(0, 1)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{quote.customer || "Prospect"}</h3>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-1 italic">Vetted Corporate Partner</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Industry Intelligence</label>
                                            <div className="flex items-center gap-3 bg-[#0b0e14] border border-white/5 p-4 rounded-lg">
                                                <Building className="h-4 w-4 text-slate-600" />
                                                <span className="text-sm font-semibold text-slate-300">Software Infrastructure</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Primary Decision Maker</label>
                                            <div className="space-y-3 bg-[#0b0e14] border border-white/5 p-5 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <User className="h-4 w-4 text-slate-600" />
                                                    <span className="text-sm font-bold text-slate-300">Karim Ben Ahmed</span>
                                                </div>
                                                <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                                                    <Mail className="h-4 w-4 text-slate-600" />
                                                    <span className="text-xs font-semibold text-slate-400 tabular-nums lowercase">k.benahmed@nadas.tn</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pulse / Activity */}
                                <div className="bg-[#151921] border border-white/5 p-8 rounded-xl shadow-2xl space-y-8">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3 font-sans">
                                        <History className="h-4 w-4 text-primary" /> Intelligence Pulse
                                    </h3>
                                    <div className="space-y-8 relative pl-6">
                                        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/5" />
                                        <div className="relative group">
                                            <div className="absolute -left-[24px] top-1 w-3 h-3 bg-[#151921] border-2 border-primary rounded-full z-10" />
                                            <div className="space-y-1">
                                                <div className="text-[12px] font-bold text-white uppercase tracking-wider italic">Dossier Initialized</div>
                                                <div className="text-[10px] text-slate-500 font-mono italic">{format(new Date(quote.createdAt || Date.now()), "dd MMM yyyy, HH:mm")}</div>
                                            </div>
                                        </div>
                                        <div className="relative group opacity-30">
                                            <div className="absolute -left-[24px] top-1 w-3 h-3 bg-[#151921] border border-white/20 rounded-full z-10" />
                                            <div className="text-[12px] font-bold text-slate-500 uppercase italic">Transmission Pending</div>
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
