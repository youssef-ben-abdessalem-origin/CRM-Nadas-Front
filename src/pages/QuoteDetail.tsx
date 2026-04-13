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
    UploadCloud
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
                    <h2 className="text-lg font-bold text-[#003366]">{company?.name || "Nadas Group"}</h2>
                    <div className="text-[11px] text-slate-500 space-y-0">
                        <p>{company?.officeAddress || "1234 Company St."}</p>
                        <p>{company?.phone || "HQ Command"}</p>
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

            <div className="flex justify-end mb-4">
                <h1 className="text-4xl font-bold text-[#003366] tracking-[0.2em] uppercase">Quote</h1>
            </div>

            <div className="flex justify-between items-start mb-8">
                {/* Bill to section */}
                <div className="space-y-2">
                    <h3 className="text-[#003366] font-bold uppercase text-[10px] tracking-widest border-b border-[#003366]/20 pb-0.5 w-fit">Bill To:</h3>
                    <div className="space-y-0.5">
                        <p className="font-bold text-md text-slate-800">{quote.customer || "Customer Name"}</p>
                        <div className="text-[11px] text-slate-500 max-w-[250px] italic">
                            {quote.billingAddress || "1234 Customer St, Customer Town, ST 12345"}
                        </div>
                    </div>
                </div>

                {/* Meta data section */}
                <div className="space-y-2 text-right">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Quote #</span>
                        <span className="text-slate-600 tabular-nums">Q-{String(quote.quoteNumber || quote.id).padStart(6, '0')}</span>
                        
                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Quote date</span>
                        <span className="text-slate-600 tabular-nums">{format(new Date(quote.createdAt || Date.now()), "dd-MM-yyyy")}</span>
                        
                        <span className="font-bold text-[#003366] uppercase text-[9px] tracking-widest text-left">Due date</span>
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
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest">Description</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest text-right">Unit Price</th>
                            <th className="py-2 px-3 font-bold uppercase text-[9px] tracking-widest text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items?.map((it: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 px-3 text-[11px] font-bold text-slate-700">{it.quantity}</td>
                                <td className="py-2 px-3 text-[11px] text-slate-600 italic">
                                    <span className="font-bold text-slate-800 not-italic block">{it.productName || it.description}</span>
                                    <span className="text-[10px] opacity-70 leading-none">{it.long_description || "Standard vector asset deployment."}</span>
                                </td>
                                <td className="py-2 px-3 text-[11px] text-slate-600 text-right tabular-nums">
                                    {Number(it.unitPrice).toFixed(2)}
                                </td>
                                <td className="py-2 px-3 text-[11px] font-bold text-slate-800 text-right tabular-nums">
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
                    <div className="flex justify-between text-[11px] py-0.5 border-b border-slate-50">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Subtotal</span>
                        <span className="tabular-nums font-bold text-slate-700">{Number(quote.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] py-0.5 border-b border-slate-50">
                        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-widest">Sales Tax (19%)</span>
                        <span className="tabular-nums font-bold text-slate-700">{Number(quote.taxAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#f8faff] p-3 border-l-4 border-[#003366]">
                        <span className="font-black text-[#003366] uppercase text-[10px] tracking-[0.2em]">Total (TND)</span>
                        <span className="text-lg font-black text-[#003366] tabular-nums tracking-tighter">
                            {Number(quote.grandTotal).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Terms and conditions */}
            <div className="mb-10 space-y-2">
                <h3 className="text-[#003366] font-bold uppercase text-[9px] tracking-widest border-b border-[#003366]/20 pb-0.5 w-fit">Terms and Conditions</h3>
                <div className="text-[10px] text-slate-500 leading-snug space-y-1">
                    <div className="italic opacity-60 text-[9px] whitespace-pre-wrap">
                        {quote.termsAndConditions || company?.termsAndConditions || "Standard binding protocols apply."}
                    </div>
                </div>
            </div>

            {/* Footer / Signature line */}
            <div className="mt-auto flex justify-between items-end pt-4">
                <div className="text-[8px] text-slate-400 font-mono">
                    {company?.bankName} | {company?.bankIban}
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

    if (isLoading) {
        return (
            <CRMLayout title="Quote Intelligence">
                <div className="flex h-screen items-center justify-center">
                    <div className="text-muted-foreground italic animate-pulse tracking-[0.3em] uppercase text-[10px] font-black">Decrypting Tactical Dossier...</div>
                </div>
            </CRMLayout>
        );
    }

    if (!quote) {
        return (
            <CRMLayout title="Null Record">
                <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <p className="text-muted-foreground italic tracking-widest uppercase text-[10px] font-black opacity-40">Target record not found.</p>
                    <Button onClick={() => navigate("/quotes")} variant="outline" className="rounded-none font-black text-[10px] tracking-widest uppercase">Return to Base</Button>
                </div>
            </CRMLayout>
        );
    }

    return (
        <CRMLayout title={quote.subject}>
            <div className="min-h-screen -m-6 flex flex-col print:bg-white overflow-x-hidden">
                {/* 🔵 Print View - Styled to match image */}
                <QuotePrintTemplate quote={quote} company={company} />

                {/* 🟢 Main Dashboard UI - Hidden on Print */}
                <div className="print:hidden flex flex-col flex-1">
                    {/* 🟢 1. HEADER (Quick snapshot) - Sticky */}
                    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.05] px-10 py-6 flex flex-col gap-6 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-white/5 rounded-none transition-all" onClick={() => navigate("/quotes")}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                                            {quote.subject}
                                        </h1>
                                        <Badge className={`${getStatusStyles(quote.status)} uppercase font-black px-3 py-0.5 rounded-none text-[9px] tracking-[0.2em] border shadow-sm`}>
                                            {quote.status || "DRAFT"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                        <span className="text-primary/80">{quote.customer || "Anonymous Entity"}</span>
                                        <span className="opacity-20">•</span>
                                        <span>Primary Directive</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 text-right">
                                <div className="space-y-0 text-right">
                                    <label className="text-[9px] font-black text-primary uppercase tracking-[0.4em] block mb-1">Grand Aggregate Value</label>
                                    <CurrencyNumbers amount={quote.grandTotal} className="text-white" valueClassName="text-4xl font-black tracking-tighter leading-none" />
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest mt-1">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> ISSUED: {format(new Date(quote.createdAt || Date.now()), "dd MMM yy")}</span>
                                    <span className="flex items-center gap-1.5"><XCircle className="h-3 w-3 text-rose-500/40" /> EXPIRES: {format(new Date(Date.now() + 2592000000), "dd MMM yy")}</span>
                                </div>
                            </div>
                        </div>

                        {/* 🎯 Action Buttons (Sticky Strip) */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.03]">
                            <Button variant="outline" size="sm" className="rounded-none border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-black text-[9px] tracking-widest uppercase gap-2 h-9 px-4">
                                <FileEdit className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-none border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-black text-[9px] tracking-widest uppercase gap-2 h-9 px-4" onClick={() => window.print()}>
                                <Download className="h-3.5 w-3.5" /> PDF
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-none border-rose-500/20 text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 font-black text-[9px] tracking-widest uppercase gap-2 h-9 px-4">
                                <XCircle className="h-3.5 w-3.5" /> Lost
                            </Button>
                            <div className="w-px h-6 bg-white/5 mx-2" />
                            <Button variant="outline" size="sm" className="rounded-none border-blue-500/20 text-blue-400 hover:bg-blue-500/10 font-black text-[9px] tracking-widest uppercase gap-2 h-9 px-6 group">
                                <Repeat className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" /> Convert to Order
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-none border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 font-black text-[9px] tracking-widest uppercase gap-2 h-9 px-6">
                                <ArrowRightLeft className="h-3.5 w-3.5" /> Invoice
                            </Button>
                            <Button size="sm" className="rounded-none bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[9px] tracking-[0.2em] uppercase gap-2 h-9 px-8 shadow-xl shadow-primary/20 transition-all">
                                <Send className="h-3.5 w-3.5" /> Send to Client
                            </Button>
                        </div>
                    </header>

                    <div className="flex-1 p-10 grid grid-cols-12 gap-10">
                        <div className="col-span-8 space-y-10">
                            {/* 📦 2. PRODUCTS SECTION (Main content) */}
                            <div className=" border border-white/[0.05] rounded-none shadow-2xl relative overflow-hidden group">
                                <div className="p-8 border-b border-white/[0.05] flex items-center justify-between">
                                    <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-none" /> Asset Deployment Matrix
                                    </h3>
                                    <Badge className="bg-primary/10 text-primary rounded-none text-[9px] font-black uppercase tracking-[0.2em] px-3">{quote.items?.length || 0} ITEMS</Badge>
                                </div>
                                <Table>
                                    <TableHeader className="bg-white/[0.02]">
                                        <TableRow className="border-b border-white/[0.05] hover:bg-transparent h-14">
                                            <TableHead className="pl-8 text-[10px] font-black uppercase text-white/30 tracking-widest">Description</TableHead>
                                            <TableHead className="text-center text-[10px] font-black uppercase text-white/30 tracking-widest">Qty</TableHead>
                                            <TableHead className="text-right text-[10px] font-black uppercase text-white/30 tracking-widest">Price</TableHead>
                                            <TableHead className="text-right text-[10px] font-black uppercase text-white/30 tracking-widest">Discount</TableHead>
                                            <TableHead className="text-right text-[10px] font-black uppercase text-white/30 tracking-widest">Tax</TableHead>
                                            <TableHead className="pr-8 text-right text-[10px] font-black uppercase text-white/30 tracking-widest">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quote.items?.map((it: any, idx: number) => (
                                            <TableRow key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group/row">
                                                <TableCell className="pl-8 py-6">
                                                    <div className="font-bold text-white text-[13px] uppercase tracking-tight group-hover/row:text-primary transition-colors">{it.productName || it.description}</div>
                                                    <div className="text-[9px] font-black text-white/20 uppercase font-mono mt-1 tracking-widest">SKU-VECTOR-0{idx + 1}</div>
                                                </TableCell>
                                                <TableCell className="text-center font-black text-white/60 text-[12px]">{it.quantity}</TableCell>
                                                <TableCell className="text-right">
                                                    <CurrencyNumbers amount={it.unitPrice} valueClassName="text-[12px] font-black text-white/80" />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-[12px] font-black text-rose-500/40 tabular-nums uppercase">0.00%</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className="text-[12px] font-black text-blue-500/40 tabular-nums uppercase">19.00%</span>
                                                </TableCell>
                                                <TableCell className="pr-8 text-right">
                                                    <CurrencyNumbers amount={it.total || (it.quantity * it.unitPrice)} valueClassName="text-[13px] font-black text-primary tabular-nums" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="p-10 flex justify-end bg-white/[0.01]">
                                    <div className="w-80 space-y-4">
                                        <div className="flex justify-between items-center text-muted-foreground">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Subtotal</span>
                                            <CurrencyNumbers amount={quote.subtotal} valueClassName="text-sm font-black tabular-nums text-white/80" />
                                        </div>
                                        <div className="flex justify-between items-center text-muted-foreground">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Tax (19%)</span>
                                            <CurrencyNumbers amount={quote.taxAmount} valueClassName="text-sm font-black tabular-nums text-blue-500/60" />
                                        </div>
                                        <div className="h-px bg-white/[0.05] my-2" />
                                        <div className="flex justify-between items-center border-l-2 border-primary pl-4 py-1">
                                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Grand Aggregate</span>
                                            <CurrencyNumbers amount={quote.grandTotal} valueClassName="text-xl font-black tabular-nums text-primary tracking-tighter" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🚚 4. SHIPPING & BILLING */}
                            <div className="grid grid-cols-2 gap-10">
                                <div className=" border border-white/[0.05] p-8 space-y-6">
                                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <MapPin className="h-3 w-3 text-primary" /> Billing Protocol
                                    </h3>
                                    <p className="text-xs font-bold text-white/60 leading-relaxed italic">{quote.billingAddress || "Billing coordinate verification pending in the encrypted ledger."}</p>
                                </div>
                                <div className=" border border-white/[0.05] p-8 space-y-6">
                                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Truck className="h-3 w-3 text-primary" /> Supply Destination
                                    </h3>
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold text-white/60 leading-relaxed italic">{quote.shippingAddress || "Supply symmetry active. Physical delivery protocols operational."}</p>
                                        <div className="flex items-center gap-4 pt-4 border-t border-white/[0.03]">
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Carrier</span>
                                            <span className="text-[10px] font-black text-primary uppercase">{quote.carrier || "DETERMINATION ACTIVE"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 📝 5. TERMS & NOTES */}
                            <div className=" border border-white/[0.05] p-10 space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Binding Terms Protocol</h3>
                                    <div className="pl-6 border-l border-primary/20">
                                        <p className="text-sm font-bold text-white/40 leading-relaxed italic whitespace-pre-wrap">{quote.termsAndConditions || "No restrictive protocols declared."}</p>
                                    </div>
                                </div>
                                {quote.description && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Additional Notes</h3>
                                        <p className="text-sm font-bold text-white/40 leading-relaxed italic whitespace-pre-wrap">{quote.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-4 space-y-10">
                            {/* 👤 3. CLIENT INFO (Side panel) */}
                            <div className=" border border-white/[0.05] p-8 space-y-10 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000">
                                    <Building className="h-40 w-40" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 rounded-none border border-primary/20 p-1 ring-2 ring-primary/[0.05]">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-black italic rounded-none">{(quote.customer || "P").slice(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-lg font-black text-white uppercase tracking-tight">{quote.customer || "Prospect"}</div>
                                        <div className="text-[9px] font-black text-primary uppercase tracking-[0.5em] mt-1">Strategic Corporate Client</div>
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Account Overview</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40"><Building className="h-3.5 w-3.5" /></div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[11px] font-bold text-white/80 block">Software Tech</span>
                                                    <span className="text-[9px] font-black text-white/20 uppercase">Industry Vector</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40"><Eye className="h-3.5 w-3.5" /></div>
                                                <div className="space-y-0.5 text-primary hover:underline cursor-pointer">
                                                    <span className="text-[11px] font-bold block">www.corporate.com</span>
                                                    <span className="text-[9px] font-black opacity-20 uppercase">Digital Origin</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Primary POC</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40"><User className="h-3.5 w-3.5" /></div>
                                                <span className="text-[11px] font-bold text-white/80">Karim Ben Ahmed</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40"><Mail className="h-3.5 w-3.5" /></div>
                                                <span className="text-[11px] font-bold text-white/80 tabular-nums">karim.b@domain.tn</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/40"><Smartphone className="h-3.5 w-3.5" /></div>
                                                <span className="text-[11px] font-bold text-white/80 tabular-nums">+216 71 888 999</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🧠 6. ACTIVITY / TIMELINE (Advanced feel) */}
                            <div className=" border border-white/[0.05] p-8 space-y-8">
                                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <History className="h-4 w-4 text-primary" /> Intelligence Pulse
                                </h3>
                                <div className="space-y-8 relative pl-6">
                                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.05]" />
                                    <div className="relative group">
                                        <div className="absolute -left-[24px] top-1 w-2.5 h-2.5  border border-white/20 rounded-none z-10 group-hover:border-primary transition-colors" />
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-white uppercase tracking-wider italic">Quote Created</div>
                                            <div className="text-[9px] font-bold text-white/20 uppercase tabular-nums tracking-widest">{format(new Date(quote.createdAt || Date.now()), "dd MMM yyyy, HH:mm")}</div>
                                        </div>
                                    </div>
                                    <div className="relative group opacity-40">
                                        <div className="absolute -left-[24px] top-1 w-2.5 h-2.5  border border-white/20 rounded-none z-10" />
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-white uppercase tracking-wider italic">Transmission Pending</div>
                                            <div className="text-[9px] font-bold text-white/20 uppercase">Awaiting manual trigger</div>
                                        </div>
                                    </div>
                                    <div className="relative group opacity-40">
                                        <div className="absolute -left-[24px] top-1 w-2.5 h-2.5  border border-white/20 rounded-none z-10" />
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-black text-white uppercase tracking-wider italic">Client Reconnaissance</div>
                                            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic opacity-40">Observation not yet recorded</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔁 7. RELATED RECORDS */}
                            <div className=" border border-white/[0.05] p-8 space-y-6 flex flex-col items-center justify-center min-h-[160px] group border-dashed border-white/10 hover:border-primary/20 transition-colors">
                                <Plus className="h-6 w-6 text-white/10 group-hover:text-primary transition-colors" />
                                <div className="text-center space-y-2">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] group-hover:text-white/40 transition-colors">Associate Vector</div>
                                    <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest italic leading-relaxed">Cross-link this proposal with a Deal or generated Sales Order for sequence tracking.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
}
