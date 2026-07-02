import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Clock, 
  Tag, 
  User as UserIcon, 
  Building2, 
  History, 
  FileText, 
  Settings,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Layers,
  Archive,
  Star,
  ShieldCheck,
  Calendar,
  Box,
  Truck,
  CreditCard,
  Percent,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatCurrencyValue } from "@/utils/number";
import { useProfileCurrency } from "@/hooks/useProfileCurrency";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export default function ProductDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency } = useProfileCurrency();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.products.getOne(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <CRMLayout title="Product Intelligence">
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

  if (!product) {
    return (
      <CRMLayout title="Product Not Found">
        <div className="flex flex-col items-center justify-center h-full py-20">
          <Box className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-black uppercase tracking-tight">Product Not Found</h2>
          <Button variant="link" onClick={() => navigate("/products")}>Back to Products</Button>
        </div>
      </CRMLayout>
    );
  }

  const sections = [
    {
      title: "Product Information",
      icon: <Box className="h-4 w-4" />,
      fields: [
        { label: "Product Owner", value: product.owner?.name || "Unassigned", icon: <UserIcon className="h-3.5 w-3.5" /> },
        { label: "Product Code", value: product.productCode || "N/A", icon: <Tag className="h-3.5 w-3.5" /> },
        { label: "Product Active", value: product.isActive ? "Yes" : "No", type: "badge", variant: product.isActive ? "default" : "secondary" },
        { label: "Product Category", value: product.category?.name || "Software", icon: <Layers className="h-3.5 w-3.5" /> },
        { label: "Sales Start Date", value: product.salesStartDate ? new Date(product.salesStartDate).toLocaleDateString() : "N/A" },
        { label: "Sales End Date", value: product.salesEndDate ? new Date(product.salesEndDate).toLocaleDateString() : "N/A" },
        { label: "Support Start Date", value: product.supportStartDate ? new Date(product.supportStartDate).toLocaleDateString() : "N/A" },
        { label: "Support End Date", value: product.supportEndDate ? new Date(product.supportEndDate).toLocaleDateString() : "N/A" },
        { label: "Product Name", value: product.name, highlight: true },
        { label: "Vendor Name", value: product.vendorName || "spin", icon: <Building2 className="h-3.5 w-3.5" /> },
        { label: "Manufacturer", value: product.manufacturer || "-None-" },
      ]
    },
    {
      title: "Price Information",
      icon: <DollarSign className="h-4 w-4" />,
      fields: [
        { label: "Unit Price", value: formatCurrencyValue(product.unitPrice || 0, currency?.currency || 'USD'), highlight: true },
        { label: "Tax", value: `${product.tax || 0}%`, icon: <Percent className="h-3.5 w-3.5" /> },
        { label: "Commission Rate", value: formatCurrencyValue(product.commissionRate || 0, currency?.currency || 'USD') },
        { label: "Taxable", value: product.taxable ? "Yes" : "No", type: "badge", variant: product.taxable ? "success" : "secondary" },
      ]
    },
    {
      title: "Stock Information",
      icon: <Package className="h-4 w-4" />,
      fields: [
        { label: "Usage Unit", value: product.usageUnit || "Box", icon: <ShoppingCart className="h-3.5 w-3.5" /> },
        { label: "Quantity in Stock", value: product.quantityInStock || 0, highlight: true },
        { label: "Handler", value: product.handler || "None", icon: <UserIcon className="h-3.5 w-3.5" /> },
        { label: "Qty Ordered", value: product.qtyOrdered || 0 },
        { label: "Reorder Level", value: product.reorderLevel || 0, icon: <AlertCircle className="h-3.5 w-3.5" /> },
        { label: "Quantity in Demand", value: product.quantityInDemand || 0 },
      ]
    }
  ];

  return (
    <CRMLayout title={`Product: ${product.name}`}>
      <div className="max-w-[1600px] mx-auto p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Modern Header Artifact */}
        <div className="relative overflow-hidden bg-gradient-to-br from-card to-background border-2 border-primary/10 rounded-[40px] p-10 shadow-2xl group transition-all duration-500 hover:shadow-primary/5">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Box className="h-64 w-64" />
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="relative h-40 w-40 rounded-[32px] overflow-hidden border-4 border-background shadow-2xl group/img shadow-primary/20 bg-muted flex items-center justify-center bg-cover bg-center" style={product.image ? { backgroundImage: `url(${product.image})` } : {}}>
               {!product.image && <Box className="h-20 w-20 text-muted-foreground/30" />}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                 <Package className="h-8 w-8 text-white" />
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-2 bg-background/50 backdrop-blur-md shadow-sm">
                  {product.type}
                </Badge>
                <Badge variant={product.status === 'active' ? "default" : "secondary"} className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg h-7">
                  {product.status}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-2 bg-background overflow-hidden flex gap-2 items-center h-7">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Live Sync
                </Badge>
              </div>

              <h1 className="text-5xl font-black tracking-tight uppercase leading-none">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 pt-2">
                <div className="flex items-center gap-3 bg-muted/30 px-5 py-2.5 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-inner group/stat">
                   <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm group-hover/stat:scale-110 transition-transform">
                     <DollarSign className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Unit Price</p>
                     <p className="text-lg font-black tracking-tighter leading-none">{formatCurrencyValue(product.unitPrice || 0, currency?.currency || 'USD')}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 px-5 py-2.5 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-inner group/stat">
                   <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm group-hover/stat:scale-110 transition-transform">
                     <Package className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Inventory</p>
                     <p className="text-lg font-black tracking-tighter leading-none">{product.quantityInStock || 0} <span className="text-[10px] text-muted-foreground ml-1">UNITS</span></p>
                   </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/30 px-5 py-2.5 rounded-2xl border border-primary/5 backdrop-blur-sm shadow-inner group/stat">
                   <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm group-hover/stat:scale-110 transition-transform">
                     <Layers className="h-4 w-4" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Category</p>
                     <p className="text-lg font-black tracking-tighter leading-none uppercase">{product.category?.name || "Software"}</p>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
              <Button 
                className="h-14 rounded-[20px] text-xs font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group/btn relative overflow-hidden"
                onClick={() => navigate(`/products/edit/${product.id}`)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <span className="relative flex items-center gap-2">
                   Edit Blueprint <Settings className="h-4 w-4" />
                </span>
              </Button>
              <div className="flex gap-2">
                <Button className="flex-1 h-14 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl group border-2 hover:bg-primary/5 transition-all">
                   <div className="flex items-center justify-center gap-2">
                     <ShoppingCart className="h-4 w-4" /> Add to Order
                   </div>
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-[20px] border-2 hover:bg-destructive/10 transition-all duration-300 shadow-xl group/icon" onClick={() => {/* Delete logic */}}>
                   <Archive className="h-5 w-5 text-destructive group-hover/icon:scale-125 transition-transform" />
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
                  Intelligence
                </TabsTrigger>
                <TabsTrigger value="variants" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Variants
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Orders
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1 md:flex-none h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all px-8">
                  Analytics
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
                           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">Description</h3>
                         </div>
                         <div className="p-8 rounded-[32px] bg-muted/20 border-2 font-medium italic text-muted-foreground leading-relaxed shadow-inner">
                           {product.description || "No strategic description provided for this catalog asset. Please update to improve procurement insights."}
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                </div>
              </TabsContent>

              <TabsContent value="variants" className="mt-0">
                 <Card className="rounded-[40px] border-2 shadow-xl p-10">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-black uppercase tracking-tight">Product Variants</h2>
                      <Button size="sm" variant="outline" className="rounded-full border-2 text-[10px] font-black uppercase tracking-widest h-9 px-6">
                        <Plus className="h-3.5 w-3.5 mr-2" /> Add SKU
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.variants?.map((v: any) => (
                        <div key={v.id} className="p-6 rounded-3xl border-2 bg-muted/5 group hover:border-primary transition-all cursor-pointer">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                               <p className="text-xs font-black uppercase tracking-tight">{v.name}</p>
                               <p className="text-[10px] font-mono text-muted-foreground mt-1 tracking-tighter uppercase">SKU: {v.sku}</p>
                            </div>
                            {v.isDefault && <Badge className="text-[8px] font-black px-2 py-0 h-4 uppercase">Master</Badge>}
                          </div>
                          
                          <div className="flex justify-between items-end">
                             <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">In Stock</p>
                               <p className="text-lg font-black tracking-tighter">{v.inventory?.[0]?.quantityAvailable || 0} UNITS</p>
                             </div>
                             <div className="text-right">
                               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Rate</p>
                               <p className="text-lg font-black tracking-tighter text-primary">{formatCurrencyValue(v.price || product.unitPrice, currency?.currency || 'USD')}</p>
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
             {/* Supply Chain Insights */}
             <Card className="rounded-[40px] border-2 shadow-xl bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
                <div className="p-8 space-y-8">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                       <TrendingUp className="h-4 w-4" />
                     </div>
                     <h2 className="text-sm font-black uppercase tracking-widest">Supply Insights</h2>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 rounded-3xl bg-background border shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Global Order Qty</span>
                           <Truck className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black tracking-tighter">{product.qtyOrdered || 0}</p>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-[45%]" />
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-background border shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Demand Forecast</span>
                           <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-black tracking-tighter">{product.quantityInDemand || 0}</p>
                        <div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 w-[65%]" />
                        </div>
                      </div>

                      <div className="p-6 rounded-3xl bg-background border-2 border-dashed group hover:border-primary transition-colors cursor-pointer text-center py-10">
                         <Star className="h-6 w-6 text-yellow-500 mx-auto mb-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Generate Production AI Report</p>
                      </div>
                   </div>
                </div>
             </Card>

             {/* Vendor Context */}
             <Card className="rounded-[40px] border-2 shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent' opacity-90" />
                <div className="relative p-8 space-y-6">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border shadow-inner">
                       <Building2 className="h-4 w-4" />
                     </div>
                     <h2 className="text-sm font-black uppercase tracking-widest">Vendor Matrix</h2>
                   </div>
                   
                   <div className="space-y-4">
                     <div className="flex items-center gap-4 p-4 rounded-3xl bg-muted/30 border border-primary/5">
                        <div className="h-12 w-12 rounded-2xl bg-background border flex items-center justify-center font-black text-xs shadow-sm">
                           SP
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">Primary Source</p>
                           <p className="text-sm font-black uppercase tracking-tight">{product.vendorName || "Spin Solutions"}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                           <ArrowUpRight className="h-4 w-4" />
                        </Button>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-3xl bg-muted/20 border shadow-inner text-center">
                           <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-1">Lead Time</p>
                           <p className="text-sm font-black tracking-tighter">14 DAYS</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-muted/20 border shadow-inner text-center text-green-600 font-bold">
                           <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-1">Score</p>
                           <p className="text-sm font-black tracking-tighter">9.8/10</p>
                        </div>
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
