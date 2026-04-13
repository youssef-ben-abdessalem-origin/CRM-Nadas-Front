import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import api from "@/lib/api";
import { 
    Building2, 
    Palette, 
    Globe, 
    CreditCard, 
    Scale, 
    FileText, 
    Save, 
    UploadCloud,
    Phone,
    Mail,
    MapPin,
    BadgePercent,
    Hash,
    Link2
} from "lucide-react";

export default function CompanySettings() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({});

    const { data: company, isLoading: isFetching } = useQuery({
        queryKey: ["company-settings"],
        queryFn: () => api.settings.getCompany(),
    });

    useEffect(() => {
        if (company) {
            setFormData(company);
        }
    }, [company]);

    const mutation = useMutation({
        mutationFn: (data: any) => api.settings.updateCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company-settings"] });
            toast.success("Corporate architecture synchronized successfully.");
        },
        onError: () => {
            toast.error("Transmission failed. System synchronization aborted.");
        }
    });

    const handleSave = () => {
        mutation.mutate(formData);
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    if (isFetching) {
        return (
            <CRMLayout title="Initializing DNA...">
                <div className="h-screen flex items-center justify-center bg-background">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse italic opacity-40">Decrypting Corporate Core...</p>
                </div>
            </CRMLayout>
        );
    }

    return (
        <CRMLayout title="Company Management">
            <div className="flex flex-col h-screen -m-6 bg-background overflow-hidden font-sans">
                {/* Executive Sticky Header */}
                <header className="h-20 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-10 shrink-0 z-20 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="h-10 w-10 bg-primary/10 rounded-none flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-sm font-black tracking-tight text-foreground uppercase italic">
                                Company Management <span className="text-muted-foreground font-bold italic tracking-normal normal-case ml-1 opacity-40">- Corporate Identity Control</span>
                            </h1>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">System-wide Organizational DNA</p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={mutation.isPending} 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-11 px-10 gap-3 shadow-2xl shadow-primary/20 uppercase text-[10px] tracking-[0.2em] transition-all rounded-none border-b-2 border-primary-foreground/20 active:translate-y-0.5"
                    >
                        <Save className="h-4 w-4" /> {mutation.isPending ? "Synchronizing..." : "Commit Changes"}
                    </Button>
                </header>

                <main className="flex-1 overflow-y-auto p-10 space-y-12 bg-muted/20 scrollbar-hide pb-32">
                    {/* 🏛️ Section 1: Legal Identity */}
                    <section className="bg-card border border-border p-12 space-y-10 rounded-none shadow-2xl relative overflow-hidden group transition-all hover:border-primary/20">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
                            <Building2 className="h-40 w-40" />
                        </div>
                        <div className="flex items-center gap-4 border-b border-border/60 pb-8">
                            <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary rounded-none border border-primary/20"><Scale className="h-5 w-5" /></div>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-foreground italic">Legal Identity & Vector</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Legal Entity Name</Label>
                                <Input value={formData.legalName || ""} onChange={(e) => handleChange("legalName", e.target.value)} placeholder="e.g. Nadas Group SARL" className="rounded-none border-border bg-muted/10 font-black uppercase text-[13px] h-12 focus:bg-white transition-all border-l-2 focus:border-l-primary" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tax ID / Matricule Fiscale</Label>
                                <Input value={formData.taxId || ""} onChange={(e) => handleChange("taxId", e.target.value)} className="rounded-none border-border bg-muted/10 font-mono font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Commercial Registration (RC)</Label>
                                <Input value={formData.commercialRegistration || ""} onChange={(e) => handleChange("commercialRegistration", e.target.value)} className="rounded-none border-border bg-muted/10 font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Industry Sector</Label>
                                <Input value={formData.industry || ""} onChange={(e) => handleChange("industry", e.target.value)} className="rounded-none border-border bg-muted/10 font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                            </div>
                        </div>
                    </section>

                    {/* 🎨 Section 2: Branding Engine */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <section className="bg-card border border-border p-12 space-y-12 rounded-none shadow-2xl overflow-hidden group transition-all hover:border-blue-500/20">
                            <div className="flex items-center gap-4 border-b border-border/60 pb-8">
                                <div className="h-10 w-10 bg-blue-500/10 flex items-center justify-center text-blue-500 rounded-none border border-blue-500/20"><Palette className="h-5 w-5" /></div>
                                <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-foreground italic">Visual Asset Engine</h2>
                            </div>
                            <div className="space-y-12">
                                <div className="flex items-center gap-10">
                                    <div className="h-32 w-32 border border-border bg-muted/30 flex items-center justify-center relative group/logo cursor-pointer overflow-hidden rounded-none shadow-inner">
                                        <img src={formData.logoUrl || "https://www.nadas-group.com/wp-content/uploads/2023/07/logo-nadas-avec-contour.webp"} className="w-20 h-auto opacity-90 group-hover/logo:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-all duration-300">
                                            <UploadCloud className="text-white h-7 w-7 animate-bounce" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-[12px] font-black uppercase tracking-widest italic">Primary Brand Vector</h3>
                                        <p className="text-[11px] text-muted-foreground font-bold italic leading-relaxed opacity-60">Used for high-fidelity Quotes & Global Invoicing.<br/>Preferred format: WebP or Scalable Vector (SVG).</p>
                                        <div className="flex items-center gap-3">
                                            <Input 
                                                value={formData.logoUrl || ""} 
                                                onChange={(e) => handleChange("logoUrl", e.target.value)}
                                                placeholder="Vector Remote URL"
                                                className="h-9 text-[10px] font-mono rounded-none bg-muted/10"
                                            />
                                            <Button variant="outline" size="sm" className="rounded-none h-9 text-[9px] font-black uppercase tracking-widest px-6 border-primary/20 text-primary hover:bg-primary/5">Refresh</Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-border/40">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Primary Brand Color Signature</Label>
                                    <div className="flex items-center gap-8">
                                        <div className="h-14 w-24 border-2 border-border/20 rounded-none shadow-xl transition-colors duration-500" style={{ backgroundColor: formData.primaryColor }} />
                                        <Input value={formData.primaryColor || ""} onChange={(e) => handleChange("primaryColor", e.target.value)} className="w-40 rounded-none border-border bg-muted/10 font-mono font-black text-[13px] h-12 uppercase" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 📍 Section 3: Global Headquarters */}
                        <section className="bg-card border border-border p-12 space-y-12 rounded-none shadow-2xl overflow-hidden group transition-all hover:border-emerald-500/20">
                            <div className="flex items-center gap-4 border-b border-border/60 pb-8">
                                <div className="h-10 w-10 bg-emerald-500/10 flex items-center justify-center text-emerald-500 rounded-none border border-emerald-500/20"><MapPin className="h-5 w-5" /></div>
                                <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-foreground italic">Command HQ & Contacts</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Registered HQ Address</Label>
                                    <Input value={formData.officeAddress || ""} onChange={(e) => handleChange("officeAddress", e.target.value)} className="rounded-none border-border bg-muted/10 font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">General HQ Phone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                                            <Input value={formData.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} className="pl-12 rounded-none border-border bg-muted/10 font-mono font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Corporate Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                                            <Input value={formData.email || ""} onChange={(e) => handleChange("email", e.target.value)} className="pl-12 rounded-none border-border bg-muted/10 font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Official Website URL Vector</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40" />
                                        <Input value={formData.website || ""} onChange={(e) => handleChange("website", e.target.value)} className="pl-12 rounded-none border-border bg-muted/10 font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ⚙️ Section 4: Operational Pulse */}
                    <section className="bg-card border border-border p-12 space-y-12 rounded-none shadow-2xl relative group pb-16 transition-all hover:border-amber-500/20">
                         <div className="flex items-center gap-4 border-b border-border/60 pb-8">
                            <div className="h-10 w-10 bg-amber-500/10 flex items-center justify-center text-amber-500 rounded-none border border-amber-500/20"><CreditCard className="h-5 w-5" /></div>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-foreground italic">Operational Pulse & Defaults</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Default Currency</Label>
                                <Input value={formData.defaultCurrency || ""} onChange={(e) => handleChange("defaultCurrency", e.target.value)} className="rounded-none border-border bg-muted/10 font-black text-[13px] h-12 border-l-2 focus:border-l-primary" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">Standard Tax Vector <BadgePercent className="h-3.5 w-3.5 text-primary" /></Label>
                                <Input value={formData.defaultTaxRate || ""} onChange={(e) => handleChange("defaultTaxRate", e.target.value)} className="rounded-none border-border bg-muted/10 font-black text-[13px] h-12 border-l-2 focus:border-l-primary" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">Sequence Formatting <Hash className="h-3.5 w-3.5 text-primary" /></Label>
                                <Input value={formData.quoteNumberPrefix || ""} onChange={(e) => handleChange("quoteNumberPrefix", e.target.value)} className="rounded-none border-border bg-muted/10 font-mono font-black text-[13px] h-12 border-l-2 focus:border-l-primary text-primary" />
                            </div>
                        </div>

                        <Separator className="bg-border/60" />

                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary rounded-none border border-primary/20"><FileText className="h-5 w-5" /></div>
                                <h3 className="text-[13px] font-black uppercase tracking-[0.3em] font-sans">Global Binding Protocols (T&C)</h3>
                            </div>
                            <div className="pl-14 border-l-2 border-primary/20 relative">
                                <div className="absolute -left-1.5 top-0 w-3 h-3 bg-primary border border-white" />
                                <textarea 
                                    value={formData.termsAndConditions || ""}
                                    onChange={(e) => handleChange("termsAndConditions", e.target.value)}
                                    className="w-full min-h-[160px] bg-muted/5 border border-border p-8 rounded-none font-bold text-[14px] italic leading-relaxed text-muted-foreground focus:bg-white focus:text-foreground focus:ring-0 outline-none transition-all border-b-2 border-b-border focus:border-b-primary shadow-inner"
                                    placeholder="Define standard binding protocols..."
                                />
                            </div>
                        </div>

                        <div className="space-y-8 pt-12 relative">
                             <div className="absolute top-12 right-0 opacity-[0.02] pointer-events-none transform rotate-12">
                                <CreditCard className="h-48 w-48" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-10 w-10 bg-[#003366]/10 flex items-center justify-center text-[#003366] rounded-none border border-[#003366]/20"><CreditCard className="h-5 w-5" /></div>
                                <h3 className="text-[13px] font-black uppercase tracking-[0.3em]">Bank Remittance Intelligence</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pl-14 relative z-10">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Primary Bank Entity</Label>
                                    <Input value={formData.bankName || ""} onChange={(e) => handleChange("bankName", e.target.value)} className="rounded-none border-border bg-muted/10 font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 font-mono italic">IBAN / RIB Signature</Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-40" />
                                        <Input value={formData.bankIban || ""} onChange={(e) => handleChange("bankIban", e.target.value)} className="pl-14 rounded-none border-border bg-muted/10 font-mono font-black text-[13px] h-12 focus:bg-white border-l-2 focus:border-l-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </CRMLayout>
    );
}
