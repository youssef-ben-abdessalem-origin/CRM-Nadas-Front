import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Layers, 
  Settings, 
  CreditCard,
  Box,
} from "lucide-react";
import { TagInput } from "@/components/ui/TagInput";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DynamicAutoSelect } from "@/components/ui/DynamicAutoSelect";

interface ProductFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  brands: any[];
  productTypes?: any[];
}

export const ProductForm = ({ formData, setFormData, categories, brands, productTypes = [] }: ProductFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");

  const { data: allCurrencies = [] } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.settings.getCurrencies().catch(() => []),
  });

  const { data: taxClasses = [] } = useQuery({
    queryKey: ["product-tax-classes"],
    queryFn: () => api.products.getTaxClasses().catch(() => []),
  });

  const addVariant = () => {
    const newVariants = [
      ...(formData.variants || []),
      { name: "", sku: "", price: 0, attributes: {} }
    ];
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...(formData.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-muted/20 p-1 mb-8 rounded-2xl h-14 border-2 border-dashed">
          <TabsTrigger value="basic" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
            <Tag className="h-3.5 w-3.5" /> Basic Info
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
            <DollarSign className="h-3.5 w-3.5" /> Pricing
          </TabsTrigger>
          <TabsTrigger value="variants" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
            <Layers className="h-3.5 w-3.5" /> Variants
          </TabsTrigger>
          {formData.type === "service" && (
            <TabsTrigger value="subscription" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Subscription
            </TabsTrigger>
          )}
          {(formData.type === "physical" || !formData.type) && (
            <TabsTrigger value="inventory" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
              <Box className="h-3.5 w-3.5" /> Inventory
            </TabsTrigger>
          )}
          <TabsTrigger value="media" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
            <ImageIcon className="h-3.5 w-3.5" /> Media
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1 rounded-xl data-[state=active]:shadow-lg data-[state=active]:bg-background text-[10px] font-black uppercase tracking-widest gap-2">
            <Settings className="h-3.5 w-3.5" /> Advanced
          </TabsTrigger>
        </TabsList>

        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Product Name <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Enter name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 border-2 rounded-2xl focus-visible:ring-primary/20 text-lg font-black tracking-tight"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Product Type</Label>
                  <DynamicAutoSelect
                    placeholder="Select product type"
                    value={formData.type || "physical"}
                    onSelect={(v) => setFormData({ ...formData, type: v })}
                    options={
                      productTypes.length > 0 
                        ? productTypes.map((t: any) => ({
                            value: t.code,
                            label: t.name,
                            description: t.description
                          }))
                        : [
                            { value: "physical", label: "Physical Good", description: "Tangible commodities and stocked items" },
                            { value: "service", label: "Professional Service", description: "Time-based consulting or managed solutions" },
                            { value: "digital", label: "Digital Product", description: "Software licenses and downloadable assets" },
                          ]
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                  <DynamicAutoSelect
                    placeholder="Select category"
                    value={formData.categoryId || ""}
                    onSelect={(v) => setFormData({ ...formData, categoryId: v })}
                    options={categories.map(cat => ({
                      value: cat.id,
                      label: cat.name
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Brand</Label>
                  <DynamicAutoSelect
                    placeholder="Select brand"
                    value={formData.brandId || ""}
                    onSelect={(v) => setFormData({ ...formData, brandId: v })}
                    options={brands.map(brand => ({
                      value: brand.id,
                      label: brand.name
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tags</Label>
                  <TagInput
                    placeholder="Type and press Enter..."
                    value={formData.tags || []}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                <Textarea
                  placeholder="Provide a detailed description of the product..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="border-2 rounded-3xl focus-visible:ring-primary/20 resize-none p-6 leading-relaxed"
                />
              </div>
            </TabsContent>

            {/* Pricing */}
            <TabsContent value="pricing" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Base Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.basePrice || ""}
                      onChange={(e) => setFormData({ ...formData, basePrice: Number.parseFloat(e.target.value) || 0 })}
                      className="h-14 pl-10 text-xl font-black border-2 rounded-2xl focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Unit Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.cost || ""}
                      onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) || 0 })}
                      className="h-14 pl-10 text-xl font-black border-2 rounded-2xl focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Currency</Label>
                  <Select
                    value={formData.currency || "USD"}
                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger className="h-11 border-2 rounded-xl bg-background font-bold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      {allCurrencies.map((c: any) => (
                        <SelectItem key={c.id} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tax Classification</Label>
                  <Select
                    value={formData.taxClass || ""}
                    onValueChange={(v) => setFormData({ ...formData, taxClass: v })}
                  >
                    <SelectTrigger className="h-11 border-2 rounded-xl bg-background font-bold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2">
                      {taxClasses.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} ({t.rate}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Subscription */}
            <TabsContent value="subscription" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-8 border-2 border-dashed rounded-3xl bg-primary/5 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Billing Type</Label>
                    <Select
                      value={formData.billingType || "recurring"}
                      onValueChange={(v) => setFormData({ ...formData, billingType: v })}
                    >
                      <SelectTrigger className="h-12 border-2 rounded-2xl bg-background shadow-lg shadow-primary/5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2">
                        <SelectItem value="one_time">One-Time</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Billing Cycle</Label>
                    <Select
                      value={formData.billingCycle || "monthly"}
                      onValueChange={(v) => setFormData({ ...formData, billingCycle: v })}
                    >
                      <SelectTrigger className="h-12 border-2 rounded-2xl bg-background shadow-lg shadow-primary/5">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2">
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Trial Threshold (Days)</Label>
                    <Input
                      type="number"
                      value={formData.trialPeriodDays || 0}
                      onChange={(e) => setFormData({ ...formData, trialPeriodDays: Number.parseInt(e.target.value) || 0 })}
                      className="h-12 border-2 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Institutional Setup Fee</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
                      <Input
                        type="number"
                        value={formData.setupFee || 0}
                        onChange={(e) => setFormData({ ...formData, setupFee: Number.parseFloat(e.target.value) || 0 })}
                        className="h-12 pl-10 border-2 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Inventory */}
            <TabsContent value="inventory" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-8 border-2 border-dashed rounded-3xl bg-muted/20 space-y-8">
                <div className="flex items-center justify-between p-6 bg-background rounded-2xl border-2 shadow-sm">
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-tight">Active Stock Tracking</Label>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Enable real-time inventory reconciliation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.trackInventory || false}
                    onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                    className="h-6 w-6 rounded-lg border-gray-300 accent-primary cursor-pointer"
                  />
                </div>

                {formData.trackInventory && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in zoom-in-95 duration-200">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest">Available Quantity</Label>
                      <Input
                        type="number"
                        value={formData.quantity || 0}
                        onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                        className="h-11 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest">Critical Reorder Level</Label>
                      <Input
                        type="number"
                        value={formData.reorderLevel || 0}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) || 0 })}
                        className="h-11 border-2 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest">Hub / Warehouse</Label>
                      <Select
                        value={formData.warehouseId || ""}
                        onValueChange={(v) => setFormData({ ...formData, warehouseId: v })}
                      >
                        <SelectTrigger className="h-11 border-2 rounded-xl bg-background">
                          <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2">
                          <SelectItem value="central">Central Distribution Center</SelectItem>
                          <SelectItem value="north">Northern Fulfillment Hub</SelectItem>
                          <SelectItem value="remote">Remote Edge Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Variants */}
            <TabsContent value="variants" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest ml-1">Product Variations</h3>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-tighter ml-1">Define SKU-level differences</p>
                </div>
                <Button size="sm" onClick={addVariant} className="h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <Plus className="h-3.5 w-3.5 mr-2" /> Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.variants || []).map((v: any, idx: number) => (
                  <div key={idx} className="p-6 border-2 rounded-2xl bg-background hover:border-primary/50 transition-all group relative animate-in slide-in-from-left-2 duration-300">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-60">Variant Identity</Label>
                        <Input 
                          placeholder="e.g. XL / Blue" 
                          value={v.name} 
                          onChange={(e) => updateVariant(idx, "name", e.target.value)} 
                          className="h-9 border-0 bg-muted/30 focus-visible:ring-primary/20 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-60">SKU</Label>
                        <Input 
                          placeholder="Unique ID" 
                          value={v.sku} 
                          onChange={(e) => updateVariant(idx, "sku", e.target.value)} 
                          className="h-9 border-0 bg-muted/30 font-mono text-xs rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-60">Specific Price</Label>
                        <Input 
                          type="number" 
                          placeholder="Override" 
                          value={v.price} 
                          onChange={(e) => updateVariant(idx, "price", Number.parseFloat(e.target.value) || 0)} 
                          className="h-9 border-0 bg-muted/30 font-bold text-xs rounded-lg text-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-60">Attributes (JSON)</Label>
                        <Input 
                          placeholder='{"size": "L"}' 
                          value={JSON.stringify(v.attributes)} 
                          onChange={(e) => {
                            try {
                              updateVariant(idx, "attributes", JSON.parse(e.target.value));
                            } catch (err) {}
                          }} 
                          className="h-9 border-0 bg-muted/30 font-mono text-[10px] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(formData.variants || []).length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl opacity-40">
                    <Layers className="h-8 w-8 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">No specialized variants defined.<br/>Master SKU defaults will apply.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Media */}
            <TabsContent value="media" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-12 border-4 border-dashed rounded-3xl flex flex-col items-center justify-center bg-muted/10 group cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all">
                       <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                          <Plus className="h-8 w-8" />
                       </div>
                       <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Deploy Visual Assets</p>
                       <p className="text-[9px] text-muted-foreground opacity-60 uppercase mt-1">PNG, JPG, WebP up to 10MB</p>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Asset Link (Internal/External)</Label>
                       <div className="flex gap-2">
                          <Input 
                            placeholder="https://visuals.nexus.com/asset-01.jpg" 
                            className="h-11 border-2 rounded-xl focus-visible:ring-primary/20 font-mono text-xs"
                          />
                          <Button size="icon" className="h-11 w-11 rounded-xl shrink-0 shadow-lg">
                            <Plus className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                  </div>

                  <div className="bg-muted/5 rounded-3xl border-2 p-6">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <ImageIcon className="h-3.5 w-3.5" /> Deployed Visual Repository
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        {(formData.media || []).map((m: any, i: number) => (
                           <div key={i} className="aspect-square rounded-2xl bg-muted relative overflow-hidden border-2 group shadow-inner">
                              <img src={m.url} alt="Strategic Asset" className="object-cover w-full h-full" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {m.isPrimary && <Badge className="absolute top-2 left-2 text-[8px] bg-primary border-0 font-black">PRIMARY</Badge>}
                           </div>
                        ))}
                        <div className="aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center opacity-30 text-muted-foreground italic text-[10px] font-bold text-center p-4">
                           Operational assets pending deployment
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Strategic Slug <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="enterprise-pro-plan"
                          value={formData.slug || ""}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="h-12 border-2 rounded-2xl font-mono text-xs focus-visible:ring-primary/20 bg-muted/20"
                        />
                     </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Status</Label>
                        <Select
                          value={formData.status || "draft"}
                          onValueChange={(v) => setFormData({ ...formData, status: v })}
                        >
                          <SelectTrigger className="h-12 border-2 rounded-2xl bg-background font-black uppercase tracking-tight">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-2">
                            <SelectItem value="draft" className="uppercase font-bold text-xs">Draft</SelectItem>
                            <SelectItem value="active" className="uppercase font-bold text-xs">Active</SelectItem>
                            <SelectItem value="archived" className="uppercase font-bold text-xs">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </div>

                  <div className="space-y-6 p-8 bg-muted/10 rounded-3xl border-2 border-dashed">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Operational Entitlements</h3>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-background rounded-2xl border-2 shadow-sm">
                          <Label htmlFor="isSellable_adv" className="text-xs font-black uppercase tracking-widest cursor-pointer">Sellable Entity</Label>
                          <input
                            type="checkbox"
                            id="isSellable_adv"
                            checked={formData.isSellable ?? true}
                            onChange={(e) => setFormData({ ...formData, isSellable: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-gray-300 accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background rounded-2xl border-2 shadow-sm">
                          <Label htmlFor="isPurchasable_adv" className="text-xs font-black uppercase tracking-widest cursor-pointer">Purchasable Asset</Label>
                          <input
                            type="checkbox"
                            id="isPurchasable_adv"
                            checked={formData.isPurchasable ?? true}
                            onChange={(e) => setFormData({ ...formData, isPurchasable: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-gray-300 accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-background rounded-2xl border-2 shadow-sm">
                          <Label htmlFor="isActive_adv" className="text-xs font-black uppercase tracking-widest cursor-pointer">Lifecycle Active</Label>
                          <input
                            type="checkbox"
                            id="isActive_adv"
                            checked={formData.isActive ?? true}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-gray-300 accent-primary cursor-pointer"
                          />
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};
