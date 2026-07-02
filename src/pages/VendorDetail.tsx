import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Phone, 
  Globe, 
  Mail, 
  MapPin, 
  History, 
  FileText, 
  User as UserIcon,
  Package,
  DollarSign,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Truck,
  Archive,
  Star,
  Plus,
  ArrowUpRight,
  Settings,
  MoreVertical,
  Calendar,
  Hash,
  Activity
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function VendorDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => api.vendors.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <CRMLayout title="Vendor Intelligence">
        <div className="p-8 space-y-8 animate-pulse">
          <div className="h-48 bg-muted rounded-3xl" />
          <div className="grid grid-cols-3 gap-8">
            <div className="h-96 bg-muted rounded-3xl" />
            <div className="col-span-2 h-96 bg-muted rounded-3xl" />
          </div>
        </div>
      </CRMLayout>
    );
  }

  if (!vendor) {
    return (
      <CRMLayout title="Partner Not Found">
        <div className="flex flex-col items-center justify-center h-full py-20">
          <Building2 className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-black uppercase tracking-tight">Partner Not Found</h2>
          <Button variant="link" onClick={() => navigate("/vendors")}>Back to Registry</Button>
        </div>
      </CRMLayout>
    );
  }

  const sections = [
    {
      title: "Corporate Profile",
      icon: <Building2 className="h-4 w-4" />,
      fields: [
        { label: "Vendor Owner", value: vendor.owner?.name || "Unassigned", icon: <UserIcon className="h-3.5 w-3.5" /> },
        { label: "Category", value: vendor.category || "General", icon: <Briefcase className="h-3.5 w-3.5" /> },
        { label: "GL Account", value: vendor.glAccount || "Sales-Software", icon: <Hash className="h-3.5 w-3.5" /> },
        { label: "Opt-Out Status", value: vendor.emailOptOut ? "Opted Out" : "Enrolled", type: "badge", variant: vendor.emailOptOut ? "secondary" : "default" },
      ]
    },
    {
      title: "Connectivity Matrix",
      icon: <Activity className="h-4 w-4" />,
      fields: [
        { label: "Phone", value: vendor.phone || "N/A", icon: <Phone className="h-3.5 w-3.5" /> },
        { label: "Email", value: vendor.email || "N/A", icon: <Mail className="h-3.5 w-3.5" />, highlight: true },
        { label: "Website", value: vendor.website || "N/A", icon: <Globe className="h-3.5 w-3.5" /> },
      ]
    },
    {
      title: "Geography / HQ",
      icon: <MapPin className="h-4 w-4" />,
      fields: [
        { label: "Country / Region", value: vendor.country || "-None-", icon: <Globe className="h-3.5 w-3.5" /> },
        { label: "Address Line 1", value: vendor.street || vendor.flatNo || "N/A" },
        { label: "City", value: vendor.city || "N/A" },
        { label: "Postal / Zip", value: vendor.zip || "N/A" },
        { label: "Coordinates", value: vendor.coordinates || "0.00, 0.00" },
      ]
    }
  ];

  return (
    <CRMLayout title={`Partner: ${vendor.name}`}>
      <div className="max-w-[1600px] mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Modern Header Artifact */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card to-background border-2 border-primary/10 rounded-[40px] p-10 shadow-2xl group transition-all duration-500 hover:shadow-primary/5">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Building2 className="h-64 w-64" />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="relative h-40 w-40 rounded-[32px] overflow-hidden border-4 border-background shadow-2xl group/img shadow-primary/20 bg-muted flex items-center justify-center bg-cover bg-center" style={vendor.image ? { backgroundImage: `url(${vendor.image})` } : {}}>
               {!vendor.image && <Building2 className="h-20 w-20 text-muted-foreground/30" />}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                 <ExternalLink className="h-8 w-8 text-white" />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-2 bg-background/50 backdrop-blur-md shadow-sm">
                  {vendor.category || "General"} Partner
                </Badge>
                <div className="flex gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-muted-foreground/30" />
                </div>
              </div>

              <h1 className="text-5xl font-black tracking-tight uppercase leading-none">
                {vendor.name}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 pt-2">
                <div className="flex items-center gap-3 bg-muted/30 px-5 py-2.5 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-inner group/stat">
                   <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover/stat:scale-110 transition-transform">
                     <Mail className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">HQ Connectivity</p>
                     <p className="text-lg font-black tracking-tighter leading-none">{vendor.email || "N/A"}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 px-5 py-2.5 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-inner group/stat">
                   <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm group-hover/stat:scale-110 transition-transform">
                     <Package className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Catalog Depth</p>
                     <p className="text-lg font-black tracking-tighter leading-none">24 <span className="text-[10px] text-muted-foreground ml-1">PRODUCTS</span></p>
                   </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 px-5 py-2.5 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-inner group/stat">
                   <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm group-hover/stat:scale-110 transition-transform">
                     <Hash className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">GL Allocation</p>
                     <p className="text-lg font-black tracking-tighter leading-none uppercase">{vendor.glAccount || "Software"}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[240px]">
              <Button className="h-14 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group/btn relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
                <span className="relative flex items-center gap-2">
                   Generate PO <Plus className="h-4 w-4" />
                </span>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-2 hover:bg-muted transition-all duration-300 shadow-xl group/icon">
                   <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-2 hover:bg-primary/10 transition-all duration-300 shadow-xl group/icon">
                   <ShieldCheck className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-2 hover:bg-destructive/10 transition-all duration-300 shadow-xl group/icon">
                   <Archive className="h-5 w-5 text-destructive group-hover:scale-125 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">
            <Tabs defaultValue="intelligence" className="w-full">
              <TabsList className="bg-muted/30 p-1.5 rounded-3xl border-2 border-primary/5 backdrop-blur-xl h-auto flex flex-wrap gap-1 mb-8">
                <TabsTrigger value="intelligence" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Core Intel
                </TabsTrigger>
                <TabsTrigger value="catalog" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Catalog
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="risk" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Risk & Compliance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intelligence" className="mt-0 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-10">
                   {/* Summary Widget */}
                   <Card className="rounded-[40px] border-2 overflow-hidden shadow-xl bg-gradient-to-br from-card to-background">
                     <CardContent className="p-10 space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                         {sections.map((section, sIdx) => (
                           <div key={sIdx} className="space-y-8">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                                 {section.icon}
                               </div>
                               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">{section.title}</h3>
                             </div>
                             
                             <div className="space-y-6">
                               {section.fields.map((field, fIdx) => (
                                 <div key={fIdx} className="group/field relative">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">{field.label}</p>
                                   <div className="flex items-center gap-2">
                                     {field.icon && <div className="text-muted-foreground/30 group-hover/field:text-primary transition-colors">{field.icon}</div>}
                                     {field.type === 'badge' ? (
                                       <Badge variant={field.variant as any} className="text-[9px] font-black px-3 py-0.5 uppercase tracking-tighter">
                                         {field.value}
                                       </Badge>
                                     ) : (
                                       <p className={`text-sm font-bold tracking-tight ${field.highlight ? 'text-lg font-black' : ''}`}>
                                         {field.value}
                                       </p>
                                     )}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         ))}
                       </div>

                       <div className="pt-10 border-t-2 border-dashed">
                         <div className="flex items-center gap-3 mb-6">
                           <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                             <FileText className="h-4 w-4" />
                           </div>
                           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Strategy Description</h3>
                         </div>
                         <div className="p-8 rounded-[32px] bg-muted/20 border-2 font-medium italic text-muted-foreground leading-relaxed shadow-inner">
                           {vendor.description || "No strategic overview provided for this partner. Maintaining baseline relationship metrics until further qualification."}
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                </div>
              </TabsContent>

              <TabsContent value="catalog" className="mt-0">
                 <Card className="rounded-[40px] border-2 shadow-xl p-10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-black uppercase tracking-tight">Supplied Asset Catalog</h2>
                      <Button size="sm" variant="outline" className="rounded-full border-2 text-[10px] font-black uppercase tracking-widest h-9 px-6">
                         Link Existing Product
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1,2,3,4].map((v) => (
                        <div key={v} className="p-6 rounded-3xl border-2 bg-muted/5 group hover:border-primary transition-all cursor-pointer flex gap-4">
                           <div className="h-20 w-20 rounded-2xl bg-background border flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground/20" />
                           </div>
                           <div className="flex-1 space-y-2">
                              <p className="text-xs font-black uppercase tracking-tight">Sample Product {v}</p>
                              <p className="text-[10px] font-mono text-muted-foreground tracking-tighter uppercase">SKU: PROD-SET-{v}00</p>
                              <div className="flex justify-between items-end pt-2">
                                <p className="text-lg font-black tracking-tighter">TND 150.00</p>
                                <Badge className="text-[8px] font-black h-4 px-1.5 uppercase tracking-widest">Active Asset</Badge>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-4 space-y-10">
             {/* Procurement Insights */}
             <Card className="rounded-[40px] border-2 shadow-xl bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
                <div className="p-8 space-y-8">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                       <DollarSign className="h-4 w-4" />
                     </div>
                     <h2 className="text-sm font-black uppercase tracking-widest">Spend Analytics</h2>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-background border shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Yearly Volume</span>
                           <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black tracking-tighter">TND 12.5k</p>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-[45%]" />
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-background border shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Payment Reliability</span>
                           <ShieldCheck className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-black tracking-tighter">98.4%</p>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 w-[98%]" />
                        </div>
                      </div>

                   </div>
                </div>
             </Card>

             {/* Supply Chain Status */}
             <Card className="rounded-[40px] border-2 shadow-xl overflow-hidden relative group">
                <div className="p-8 space-y-6">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border shadow-inner">
                       <Truck className="h-4 w-4" />
                     </div>
                     <h2 className="text-sm font-black uppercase tracking-widest">Supply Health</h2>
                   </div>
                   
                   <div className="space-y-6">
                     <div className="flex justify-between items-center p-4 rounded-3xl border-2 border-primary/10 bg-primary/[0.02]">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                             <CreditCard className="h-4 w-4" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest">Terms</p>
                        </div>
                        <p className="text-sm font-black uppercase tracking-tight">Net 30</p>
                     </div>

                     <div className="flex justify-between items-center p-4 rounded-3xl border-2 border-orange-500/10 bg-orange-500/[0.02]">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                             <Truck className="h-4 w-4" />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest">Avg Delivery</p>
                        </div>
                        <p className="text-sm font-black uppercase tracking-tight">12 Days</p>
                     </div>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
