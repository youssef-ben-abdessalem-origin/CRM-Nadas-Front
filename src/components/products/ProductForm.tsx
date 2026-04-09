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
  X,
  Type,
  Percent
} from "lucide-react";
import { TagInput } from "@/components/ui/TagInput";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DynamicAutoSelect } from "@/components/ui/DynamicAutoSelect";
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from "@/components/ui/popover";

interface ProductFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  brands: any[];
  productTypes?: any[];
}

export const ProductForm = ({ formData, setFormData, categories, brands, productTypes = [] }: ProductFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrVal, setNewAttrVal] = useState("");

  const { data: allCurrencies = [] } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.settings.getCurrencies().catch(() => []),
  });

  const { data: taxClasses = [] } = useQuery({
    queryKey: ["product-tax-classes"],
    queryFn: () => api.products.getTaxClasses().catch(() => []),
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.vendors.getAll().catch(() => []),
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

  const addAttribute = (variantIdx: number) => {
    if (!newAttrKey || !newAttrVal) return;
    const variants = [...(formData.variants || [])];
    const attributes = { ...(variants[variantIdx].attributes || {}) };
    attributes[newAttrKey] = newAttrVal;
    variants[variantIdx].attributes = attributes;
    setFormData({ ...formData, variants });
    setNewAttrKey("");
    setNewAttrVal("");
  };

  const removeAttribute = (variantIdx: number, key: string) => {
    const variants = [...(formData.variants || [])];
    const attributes = { ...(variants[variantIdx].attributes || {}) };
    delete attributes[key];
    variants[variantIdx].attributes = attributes;
    setFormData({ ...formData, variants });
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
                    className="h-12 border-2 rounded-2xl focus-visible:ring-primary/20 text-lg font-black tracking-tight text-white"
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
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Product Code</Label>
                  <Input
                    placeholder="PROD-001"
                    value={formData.productCode || ""}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="h-11 border-2 rounded-xl focus-visible:ring-primary/20 bg-[#0D0F14] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Manufacturer</Label>
                  <Input
                    placeholder="Aegis Corp"
                    value={formData.manufacturer || ""}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="h-11 border-2 rounded-xl focus-visible:ring-primary/20 bg-[#0D0F14] text-white"
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Vendor Partner</Label>
                   <DynamicAutoSelect
                    placeholder="Link Partner..."
                    value={formData.vendorName || ""}
                    onSelect={(v) => setFormData({ ...formData, vendorName: v })}
                    options={vendors.map((v: any) => ({
                      value: v.name,
                      label: v.name
                    }))}
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black tracking-widest text-white/30 uppercase">Sales Start</Label>
                   <Input type="date" value={formData.salesStartDate || ""} onChange={(e) => setFormData({...formData, salesStartDate: e.target.value})} className="h-10 border-none bg-white/5 rounded-xl text-white font-bold" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black tracking-widest text-white/30 uppercase">Sales End</Label>
                   <Input type="date" value={formData.salesEndDate || ""} onChange={(e) => setFormData({...formData, salesEndDate: e.target.value})} className="h-10 border-none bg-white/5 rounded-xl text-white font-bold" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black tracking-widest text-white/30 uppercase">Support Start</Label>
                   <Input type="date" value={formData.supportStartDate || ""} onChange={(e) => setFormData({...formData, supportStartDate: e.target.value})} className="h-10 border-none bg-white/5 rounded-xl text-white font-bold" />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black tracking-widest text-white/30 uppercase">Support End</Label>
                   <Input type="date" value={formData.supportEndDate || ""} onChange={(e) => setFormData({...formData, supportEndDate: e.target.value})} className="h-10 border-none bg-white/5 rounded-xl text-white font-bold" />
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
                  className="border-2 rounded-3xl focus-visible:ring-primary/20 resize-none p-6 leading-relaxed bg-[#0D0F14] text-white"
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
                      className="h-14 pl-10 text-xl font-black border-2 rounded-2xl focus-visible:ring-primary/20 bg-[#0D0F14] text-white"
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
                      className="h-14 pl-10 text-xl font-black border-2 rounded-2xl focus-visible:ring-primary/20 bg-[#0D0F14] text-white"
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
                    <SelectTrigger className="h-11 border-2 rounded-xl bg-[#0D0F14] font-bold text-white">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 bg-background border-white/10 text-white">
                      {allCurrencies.map((c: any) => (
                        <SelectItem key={c.id} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Commission Rate</Label>
                   <div className="relative">
                     <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
                     <Input
                       type="number"
                       placeholder="0.00"
                       value={formData.commissionRate || ""}
                       onChange={(e) => setFormData({ ...formData, commissionRate: Number.parseFloat(e.target.value) || 0 })}
                       className="h-11 pl-10 border-2 rounded-xl focus-visible:ring-primary/20 bg-[#0D0F14] text-white"
                     />
                   </div>
                </div>
                <div className="flex items-center gap-4 mt-6">
                   <div className="flex items-center gap-2 bg-muted/20 p-4 rounded-2xl border-2 border-dashed flex-1">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">Taxable Asset</Label>
                      <input 
                        type="checkbox" 
                        checked={formData.taxable ?? true} 
                        onChange={(e) => setFormData({...formData, taxable: e.target.checked})}
                        className="h-5 w-5 accent-primary cursor-pointer rounded-lg ml-auto"
                      />
                   </div>
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
                      <SelectTrigger className="h-12 border-2 rounded-2xl bg-[#0D0F14] shadow-lg shadow-primary/5 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 bg-background border-white/10 text-white">
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
                      <SelectTrigger className="h-12 border-2 rounded-2xl bg-[#0D0F14] shadow-lg shadow-primary/5 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-2 bg-background border-white/10 text-white">
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
                      className="h-12 border-2 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold bg-[#0D0F14] text-white"
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
                        className="h-12 pl-10 border-2 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold bg-[#0D0F14] text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Inventory */}
            <TabsContent value="inventory" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-8 border-2 border-dashed rounded-3xl bg-muted/20 space-y-8">
                <div className="flex items-center justify-between p-6 bg-[#0D0F14] rounded-2xl border-2 shadow-sm border-white/5">
                  <div className="space-y-1">
                    <Label className="text-sm font-black uppercase tracking-tight text-white">Active Stock Tracking</Label>
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
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Available Quantity</Label>
                      <Input
                        type="number"
                        value={formData.quantity || 0}
                        onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                        className="h-11 border-2 rounded-xl bg-[#0D0F14] text-white border-white/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Critical Reorder Level</Label>
                      <Input
                        type="number"
                        value={formData.reorderLevel || 0}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) || 0 })}
                        className="h-11 border-2 rounded-xl bg-[#0D0F14] text-white border-white/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-white/60">Hub / Warehouse</Label>
                      <Select
                        value={formData.warehouseId || ""}
                        onValueChange={(v) => setFormData({ ...formData, warehouseId: v })}
                      >
                        <SelectTrigger className="h-11 border-2 rounded-xl bg-[#0D0F14] text-white border-white/5">
                          <SelectValue placeholder="Select Warehouse" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 bg-background border-white/10 text-white">
                          <SelectItem value="central">Central Distribution Center</SelectItem>
                          <SelectItem value="north">Northern Fulfillment Hub</SelectItem>
                          <SelectItem value="remote">Remote Edge Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                   <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Usage Unit</Label>
                       <Input value={formData.usageUnit || "Box"} onChange={(e) => setFormData({...formData, usageUnit: e.target.value})} className="h-11 border-2 rounded-xl bg-[#0D0F14]" />
                   </div>
                   <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Handler / Custodian</Label>
                       <Input value={formData.handler || ""} onChange={(e) => setFormData({...formData, handler: e.target.value})} className="h-11 border-2 rounded-xl bg-[#0D0F14]" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Qty Ordered</p>
                      <p className="text-xl font-black">{formData.qtyOrdered || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Reorder Threshold</p>
                      <Input type="number" value={formData.reorderLevel || 0} onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value)})} className="h-8 border-none bg-transparent font-black text-xl p-0" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Current Demand</p>
                      <p className="text-xl font-black">{formData.quantityInDemand || 0}</p>
                    </div>
                </div>
              </div>
            </TabsContent>

            {/* Variants */}
            <TabsContent value="variants" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl border-2 border-dashed border-white/5">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest ml-1 text-white">Product Variations</h3>
                   <p className="text-[10px] text-muted-foreground uppercase tracking-tighter ml-1">Define SKU-level differences</p>
                </div>
                <Button size="sm" onClick={addVariant} className="h-9 px-4 text-[10px] font-black uppercase tracking-widest shadow-lg bg-primary hover:bg-primary/90 text-white rounded-xl">
                  <Plus className="h-3.5 w-3.5 mr-2" /> Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.variants || []).map((v: any, idx: number) => (
                  <div key={idx} className="p-6 border-2 rounded-2xl bg-[#0D0F14] border-white/5 hover:border-primary/50 transition-all group relative animate-in slide-in-from-left-2 duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-40 ml-1">Variant Identity</Label>
                        <Input 
                          placeholder="e.g. XL / Blue" 
                          value={v.name} 
                          onChange={(e) => updateVariant(idx, "name", e.target.value)} 
                          className="h-10 border-0 bg-white/5 focus-visible:ring-primary/20 rounded-xl text-xs font-black text-white px-4"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-40 ml-1">SKU</Label>
                        <Input 
                          placeholder="Unique ID" 
                          value={v.sku} 
                          onChange={(e) => updateVariant(idx, "sku", e.target.value)} 
                          className="h-10 border-0 bg-white/5 font-mono text-xs rounded-xl px-4 text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-40 ml-1">Override Price</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={v.price} 
                          onChange={(e) => updateVariant(idx, "price", Number.parseFloat(e.target.value) || 0)} 
                          className="h-10 border-0 bg-white/5 font-black text-xs rounded-xl text-primary px-4"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase tracking-tight opacity-40 ml-1">Attributes</Label>
                        <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] p-2 bg-white/5 rounded-xl border border-transparent group-hover:border-white/5">
                           {Object.entries(v.attributes || {}).map(([key, value]) => (
                             <Badge key={key} variant="secondary" className="bg-primary/20 text-primary border-none font-black text-[9px] px-2 py-0.5 pr-1 gap-1 flex items-center group/badge">
                               {key.toUpperCase()}: {String(value).toUpperCase()}
                               <X className="h-3 w-3 cursor-pointer hover:bg-primary hover:text-white rounded-full p-0.5 transition-colors" onClick={() => removeAttribute(idx, key)} />
                             </Badge>
                           ))}
                           
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button variant="ghost" size="sm" className="h-6 w-6 rounded-full p-0 text-white/40 hover:text-white hover:bg-white/10 shrink-0">
                                 <Plus className="h-3.5 w-3.5" />
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-64 bg-[#0A0C10] border-white/10 p-4 rounded-2xl shadow-2xl" align="end">
                                <div className="space-y-3">
                                   <div className="flex items-center gap-2 text-primary">
                                      <Type className="h-4 w-4" />
                                      <span className="text-[10px] font-black uppercase tracking-widest">New Attribute</span>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2">
                                      <Input 
                                        placeholder="Key (Size)" 
                                        value={newAttrKey} 
                                        onChange={(e) => setNewAttrKey(e.target.value)}
                                        className="h-8 text-[10px] bg-white/5 border-none font-bold"
                                      />
                                      <Input 
                                        placeholder="Value (XL)" 
                                        value={newAttrVal} 
                                        onChange={(e) => setNewAttrVal(e.target.value)}
                                        className="h-8 text-[10px] bg-white/5 border-none font-bold"
                                      />
                                   </div>
                                   <Button 
                                     size="sm" 
                                     className="w-full h-8 bg-primary hover:bg-primary/90 text-[10px] font-black"
                                     onClick={() => addAttribute(idx)}
                                   >
                                     ADD ATTRIBUTE
                                   </Button>
                                </div>
                             </PopoverContent>
                           </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {(formData.variants || []).length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem] opacity-20 grayscale">
                    <Layers className="h-10 w-10 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">No specialized variants defined.<br/>Master SKU defaults will apply.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Media */}
            <TabsContent value="media" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-12 border-4 border-dashed rounded-[3rem] border-white/5 flex flex-col items-center justify-center bg-white/[0.02] group cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all">
                       <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5 border border-primary/20">
                          <Plus className="h-8 w-8" />
                       </div>
                       <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary">Deploy Visual Assets</p>
                       <p className="text-[9px] text-white/20 font-bold uppercase mt-1">PNG, JPG, WebP up to 10MB</p>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Asset Link (Internal/External)</Label>
                       <div className="flex gap-2">
                          <Input 
                            placeholder="https://visuals.nexus.com/asset-01.jpg" 
                            className="h-11 border-none bg-white/5 rounded-xl focus-visible:ring-primary/20 font-mono text-xs text-white px-4"
                          />
                          <Button size="icon" className="h-11 w-11 rounded-xl shrink-0 shadow-lg bg-primary hover:bg-primary/90 text-white">
                            <Plus className="h-4 w-4" />
                          </Button>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Strategical Inventory Repository
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        {(formData.media || []).map((m: any, i: number) => (
                           <div key={i} className="aspect-square rounded-2xl bg-black relative overflow-hidden border border-white/10 group shadow-2xl">
                              <img src={m.url} alt="Strategic Asset" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              {m.isPrimary && <Badge className="absolute top-2 left-2 text-[8px] bg-primary border-0 font-black shadow-lg">PRIMARY</Badge>}
                           </div>
                        ))}
                        <div className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center opacity-20 text-white font-black uppercase text-[10px] tracking-widest text-center p-4">
                           Operational assets pending deployment
                        </div>
                     </div>
                  </div>
               </div>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Strategic Slug <span className="text-red-500">*</span></Label>
                        <Input
                          placeholder="enterprise-pro-plan"
                          value={formData.slug || ""}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="h-12 border-none rounded-2xl font-mono text-xs focus-visible:ring-primary/20 bg-white/5 text-white px-5"
                        />
                     </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Lifecycle Status</Label>
                        <Select
                          value={formData.status || "draft"}
                          onValueChange={(v) => setFormData({ ...formData, status: v })}
                        >
                          <SelectTrigger className="h-12 border-none rounded-2xl bg-white/5 font-black uppercase tracking-widest text-[10px] text-white px-5">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 bg-[#0A0C10] text-white">
                            <SelectItem value="draft" className="uppercase font-black text-[10px] tracking-widest">Draft</SelectItem>
                            <SelectItem value="active" className="uppercase font-black text-[10px] tracking-widest text-green-500">Active</SelectItem>
                            <SelectItem value="archived" className="uppercase font-black text-[10px] tracking-widest text-red-500">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </div>

                  <div className="space-y-6 p-10 bg-white/[0.02] rounded-[3rem] border border-white/5 shadow-inner">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 ml-2">Operational Entitlements</h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-5 bg-[#0D0F14] rounded-2xl border border-white/5 shadow-2xl group hover:border-primary/20 transition-all">
                          <Label htmlFor="isSellable_adv" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-white/40 group-hover:text-white transition-colors">Sellable Entity</Label>
                          <input
                            type="checkbox"
                            id="isSellable_adv"
                            checked={formData.isSellable ?? true}
                            onChange={(e) => setFormData({ ...formData, isSellable: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-gray-300 accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between p-5 bg-[#0D0F14] rounded-2xl border border-white/5 shadow-2xl group hover:border-primary/20 transition-all">
                          <Label htmlFor="isPurchasable_adv" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-white/40 group-hover:text-white transition-colors">Purchasable Asset</Label>
                          <input
                            type="checkbox"
                            id="isPurchasable_adv"
                            checked={formData.isPurchasable ?? true}
                            onChange={(e) => setFormData({ ...formData, isPurchasable: e.target.checked })}
                            className="h-5 w-5 rounded-lg border-gray-300 accent-primary cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between p-5 bg-[#0D0F14] rounded-2xl border border-white/5 shadow-2xl group hover:border-primary/20 transition-all">
                          <Label htmlFor="isActive_adv" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-white/40 group-hover:text-white transition-colors">Lifecycle Active</Label>
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
