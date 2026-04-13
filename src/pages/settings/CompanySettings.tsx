import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
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
    Link2,
    ArrowLeft
} from "lucide-react";

export default function CompanySettings() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<any>({});
    const navigate = useNavigate();

    const { data: company, isLoading: isFetching } = useQuery({
        queryKey: ["company-settings"],
        queryFn: () => api.settings.getCompany(),
    });

    const { data: currencies } = useQuery({
        queryKey: ["currencies"],
        queryFn: () => api.settings.getCurrencies(),
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

    const logoUploadMutation = useMutation({
        mutationFn: (file: File) => api.uploads.uploadLogo(file),
        onSuccess: (res: any) => {
            const logoUrl = res.url || res.path || res.data?.url || res.data?.path;
            if (logoUrl) {
                handleChange("logoUrl", logoUrl);
                toast.success("Corporate branding updated. Transmission complete.");
            }
        },
        onError: () => {
            toast.error("Logo uplink failed. Signal lost.");
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
            <div className="h-screen flex items-center justify-center bg-[#0b0e14]">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse italic opacity-40 text-white">Initializing DNS...</p>
            </div>
        );
    }

    return (
        <CRMLayout title="Company Profile">
            <div className="min-h-screen bg-[#0b0e14] text-slate-200 p-8 font-sans">
                {/* Header matching the image style */}
                <div className="flex items-center gap-6 mb-12 ml-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Company Profile</h1>
                        <p className="text-slate-400 text-sm">Configure your global organizational identity and document defaults</p>
                    </div>
                    <div className="ml-auto">
                        <Button
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-8 rounded-md transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {mutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-8 pb-20">
                    {/* 📦 Section 1: Basic Information */}
                    <div className="bg-[#151921] border border-white/5 rounded-xl p-10 space-y-10 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Basic Information</h2>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-12 items-start">
                            {/* Logo Upload Section */}
                            <div className="space-y-4 shrink-0">
                                <Label className="text-sm font-semibold text-slate-200">Corporate Seal / Logo</Label>
                                <div className="relative group">
                                    <div className="h-40 w-40 bg-[#0b0e14] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 overflow-hidden group-hover:border-primary/50 transition-all cursor-pointer relative shadow-inner">
                                        {formData.logoUrl ? (
                                            <img 
                                                src={formData.logoUrl} 
                                                alt="Company Logo" 
                                                className="w-full h-full object-contain p-4 group-hover:opacity-40 transition-opacity" 
                                            />
                                        ) : (
                                            <>
                                                <UploadCloud className="h-8 w-8 text-slate-600 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center px-4">Initialize<br/>Visual Identity</span>
                                            </>
                                        )}
                                        
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    logoUploadMutation.mutate(file);
                                                }
                                            }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-primary/80 px-4 py-2 rounded-full">New Transmission</span>
                                        </div>
                                    </div>
                                    {logoUploadMutation.isPending && (
                                        <div className="absolute inset-0 bg-[#0b0e14]/80 flex items-center justify-center rounded-2xl">
                                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Recommended: Transparent PNG (400x400px)</p>
                            </div>

                            <div className="flex-1 grid grid-cols-1 gap-8 w-full">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Legal Name *</Label>
                                    <Input
                                        value={formData.legalName || ""}
                                        onChange={(e) => handleChange("legalName", e.target.value)}
                                        placeholder="e.g. Nadas Group SARL"
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary transition-all"
                                    />
                                </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Tax ID / Matricule Fiscale</Label>
                                    <Input
                                        value={formData.taxId || ""}
                                        onChange={(e) => handleChange("taxId", e.target.value)}
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary font-mono"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Commercial Registration (RC)</Label>
                                    <Input
                                        value={formData.commercialRegistration || ""}
                                        onChange={(e) => handleChange("commercialRegistration", e.target.value)}
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Industry</Label>
                                    <Input
                                        value={formData.industry || ""}
                                        onChange={(e) => handleChange("industry", e.target.value)}
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Brand Color Signature</Label>
                                    <div className="flex gap-4">
                                        <div className="h-12 w-20 rounded-lg border border-white/10" style={{ backgroundColor: formData.primaryColor }} />
                                        <Input
                                            value={formData.primaryColor || ""}
                                            onChange={(e) => handleChange("primaryColor", e.target.value)}
                                            className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 📍 Section 2: Contact & HQ */}
                    <div className="bg-[#151921] border border-white/5 rounded-xl p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Headquarters & Contact</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-200">HQ Address</Label>
                                <Input
                                    value={formData.officeAddress || ""}
                                    onChange={(e) => handleChange("officeAddress", e.target.value)}
                                    className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">HQ Phone</Label>
                                    <Input
                                        value={formData.phone || ""}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Corporate Email</Label>
                                    <Input
                                        value={formData.email || ""}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-200">Official Website</Label>
                                    <Input
                                        value={formData.website || ""}
                                        onChange={(e) => handleChange("website", e.target.value)}
                                        className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 💸 Section 3: Financial & Operational */}
                    <div className="bg-[#151921] border border-white/5 rounded-xl p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Protocols</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-200">Default Currency</Label>
                                <Select
                                    value={formData.defaultCurrency || ""}
                                    onValueChange={(val) => handleChange("defaultCurrency", val)}
                                >
                                    <SelectTrigger className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary uppercase font-bold">
                                        <SelectValue placeholder="Select Functional Currency" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#151921] border-white/10 text-slate-200">
                                        {currencies?.map((curr: any) => (
                                            <SelectItem key={curr.code} value={curr.code} className="hover:bg-primary/10 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-primary">{curr.code}</span>
                                                    <span>{curr.name}</span>
                                                    <span className="text-slate-500 ml-auto opacity-50">{curr.symbol}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-200">VAT/Tax Rate (%)</Label>
                                <Input
                                    value={formData.defaultTaxRate || ""}
                                    onChange={(e) => handleChange("defaultTaxRate", e.target.value)}
                                    className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-200">Quote Sequence Template</Label>
                                <Input
                                    value={formData.quoteNumberPrefix || ""}
                                    onChange={(e) => handleChange("quoteNumberPrefix", e.target.value)}
                                    className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-primary focus:border-primary font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-200">Bank Name</Label>
                                <Input
                                    value={formData.bankName || ""}
                                    onChange={(e) => handleChange("bankName", e.target.value)}
                                    className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-slate-200">IBAN / RIB Signature</Label>
                                <Input
                                    value={formData.bankIban || ""}
                                    onChange={(e) => handleChange("bankIban", e.target.value)}
                                    className="bg-[#0b0e14] border-white/10 rounded-lg h-12 text-slate-200 focus:border-primary font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ⚖️ Section 4: Binding Terms */}
                    <div className="bg-[#151921] border border-white/5 rounded-xl p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-3 text-slate-400 mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Binding Protocols (T&C)</h2>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-sm font-semibold text-slate-200">Global Terms and Conditions</Label>
                            <textarea
                                value={formData.termsAndConditions || ""}
                                onChange={(e) => handleChange("termsAndConditions", e.target.value)}
                                className="w-full min-h-[160px] bg-[#0b0e14] border border-white/10 p-6 rounded-lg text-slate-300 text-sm italic leading-relaxed focus:border-primary outline-none transition-all"
                                placeholder="Define your default quote terms..."
                            />
                            <p className="text-[10px] text-slate-500 italic uppercase tracking-wider">Note: These terms will appear on all generated PDF Documents.</p>
                        </div>
                    </div>
                </div>
            </div>
        </CRMLayout>
    );
}
