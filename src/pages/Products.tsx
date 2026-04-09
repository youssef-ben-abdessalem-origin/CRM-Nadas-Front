import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrencyBadge from "@/components/ui/currency-badge";
import { toNumber, toFixedSafe, formatCurrencyValue } from "@/utils/number";
import { useProfileCurrency } from "@/hooks/useProfileCurrency";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Edit,
  Pencil,
  Trash2,
  Copy,
  ArrowUpRight,
  Minus,
  Layers,
  Tag,
  Hash,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";
import { DynamicAutoSelect } from "@/components/ui/DynamicAutoSelect";

import { ProductForm } from "@/components/products/ProductForm";

export type ProductType = "service" | "physical" | "digital";
export type ProductStatus = "draft" | "active" | "archived";

export interface PriceBookItem {
  id: string;
  priceBookId: string;
  priceBook: { name: string; currency: string };
  price: number;
  discount: number;
  minQty: number;
}

export interface Inventory {
  id: string;
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel: number;
  warehouseId?: string;
  stockStatus?: string;
}

export interface ProductMedia {
  id: string;
  url: string;
  type: string;
  isPrimary: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price?: number;
  cost?: number;
  attributes: any;
  isDefault: boolean;
  status: string;
  prices: PriceBookItem[];
  inventory: Inventory[];
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  productCode?: string;
  productActive: boolean;
  productOwner?: string;
  productCategory?: string;
  vendorName?: string;
  manufacturer?: string;
  salesStartDate?: string;
  salesEndDate?: string;
  supportStartDate?: string;
  supportEndDate?: string;
  unitPrice?: number;
  tax?: number;
  commissionRate?: number;
  taxable: boolean;
  usageUnit?: string;
  quantityInStock: number;
  handler?: string;
  qtyOrdered: number;
  reorderLevel: number;
  quantityInDemand: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const Products = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api.products.getCategories().catch(() => []),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["product-brands"],
    queryFn: () => api.products.getBrands().catch(() => []),
  });

  const { data: priceBooks = [] } = useQuery({
    queryKey: ["product-price-books"],
    queryFn: () => api.products.getPriceBooks().catch(() => []),
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["product-types"],
    queryFn: () => api.products.getTypes().catch(() => []),
  });

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["products", "paginated", page, pageSize, search, filterCategoryId, filterStatus, filterType],
    queryFn: () => api.products.findAllPaginated(
      page,
      pageSize,
      search,
      filterCategoryId === "all" ? undefined : filterCategoryId,
      filterStatus === "all" ? undefined : filterStatus,
      filterType === "all" ? undefined : filterType
    ).catch(() => ({
      data: [],
      total: 0,
      page: 1,
      limit: pageSize,
      totalPages: 0,
    })),
  });

  const products = paginatedData?.data || [];
  const total = paginatedData?.total || 0;
  const totalPages = paginatedData?.totalPages || 1;


  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      setShowEdit(false);
      setEditingProduct(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.products.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
      setShowDetail(false);
      setSelectedProduct(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: api.products.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product archived successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: api.products.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product duplicated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [pricingTarget, setPricingTarget] = useState<{ variantId: string; priceBookId: string; currentPrice: number } | null>(null);
  const [variantName, setVariantName] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [newPrice, setNewPrice] = useState(0);

  const createVariantMutation = useMutation({
    mutationFn: api.products.createVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant created successfully");
      setShowVariantDialog(false);
      setVariantName(""); setVariantSku("");
    },
  });

  const upsertPricingMutation = useMutation({
    mutationFn: (data: { variantId: string; priceBookId: string; price: number }) =>
      api.products.upsertPricing(data.variantId, data.priceBookId, data.price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Pricing matrix updated");
      setShowPricingDialog(false);
    },
  });

  const setPrimaryPriceMutation = useMutation({
    mutationFn: ({ variantId, priceId }: { variantId: string; priceId: string }) =>
      api.products.setPrimaryPrice(variantId, priceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Primary rate updated");
    },
  });

  const handleCreateVariant = () => {
    if (!selectedProduct) return;
    createVariantMutation.mutate({
      name: variantName,
      sku: variantSku,
      productId: selectedProduct.id,
      isDefault: false
    });
  };

  const handleUpsertPrice = () => {
    if (!pricingTarget) return;
    upsertPricingMutation.mutate({
      variantId: pricingTarget.variantId,
      priceBookId: pricingTarget.priceBookId,
      price: newPrice
    });
  };

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    type: "physical",
    status: "draft",
    categoryId: "",
    brandId: "",
    isActive: true,
    isSellable: true,
    isPurchasable: true,
    billingType: "one_time",
    billingCycle: "monthly",
    trialPeriodDays: 0,
    setupFee: 0,
    unitOfMeasure: "unit",
    basePrice: 0,
    cost: 0,
    currency: "USD",
    taxClass: "standard",
    tags: [] as string[],
    variants: [] as any[],
    media: [] as any[],
    trackInventory: false,
    quantity: 0,
    reorderLevel: 0,
    warehouseId: "central",
  });

  const resetForm = () => {
    setSearch("");
    setFilterCategoryId("all");
    setFilterStatus("all");
    setFilterType("all");
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    
    // Find default variant for base price/inventory info
    const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0];
    const inventory = defaultVariant?.inventory?.[0];

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      type: product.type,
      status: product.status,
      categoryId: product.categoryId || "",
      brandId: product.brandId || "",
      isActive: product.isActive,
      isSellable: product.isSellable,
      isPurchasable: product.isPurchasable,
      billingType: product.billingType || "one_time",
      billingCycle: product.billingCycle || "monthly",
      trialPeriodDays: product.trialPeriodDays || 0,
      setupFee: product.setupFee || 0,
      unitOfMeasure: product.unitOfMeasure || "unit",
      basePrice: defaultVariant?.price || 0,
      cost: defaultVariant?.cost || 0,
      currency: product.variants?.[0]?.prices?.[0]?.priceBook?.currency || "USD",
      taxClass: "standard",
      tags: [],
      variants: product.variants || [],
      media: product.media || [],
      trackInventory: !!inventory,
      quantity: inventory?.quantityAvailable || 0,
      reorderLevel: inventory?.reorderLevel || 0,
      warehouseId: inventory?.warehouseId || "central",
    });
    setShowEdit(true);
  };


  const handleEdit = () => {
    if (!editingProduct || !formData.name) return;
    updateMutation.mutate({
      id: editingProduct.id,
      data: formData,
    });
  };

  const handleDelete = async (product: Product) => {
    if (await confirm({ 
      title: "Delete Product", 
      description: `Are you sure you want to delete "${product.name}"? This action will permanently remove the product and all its variants from the catalog.`,
      variant: "destructive",
      confirmText: "Delete"
    })) {
      deleteMutation.mutate(product.id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <CRMLayout title="Products">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground animate-pulse font-medium">Loading products...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Product Registry">
      <div className="flex flex-col h-full bg-[#0D0F14] -m-6 -mt-3">
        {/* Intelligence Header */}
        <header className="h-24 shrink-0 flex items-center justify-between px-8 bg-card/20 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10">
               <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Strategic Assets</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary/20 text-primary border-none text-[9px] font-black tracking-widest px-2 py-0">GLOBAL INVENTORY</Badge>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Procurement Command Center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" className="h-11 rounded-xl px-6 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 border border-white/5 gap-2 transition-all">
                <Download className="h-4 w-4 opacity-40" /> Export Catalog
             </Button>
             <Button className="h-11 rounded-xl px-8 text-[10px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-2 active:scale-95 transition-all"
               onClick={() => navigate("/products/new")}
             >
                <Plus className="h-4 w-4" /> Deploy Asset
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-12">
          <div className="max-w-[1700px] mx-auto space-y-12">
            
            {/* Tactical Filtration Matrix */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
               <div className="flex flex-wrap gap-4 items-center flex-1">
                  <div className="relative group w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary group-focus-within:scale-110 transition-transform" />
                    <Input 
                      placeholder="Search asset identity or code..." 
                      className="h-14 pl-14 bg-background/50 border-0 rounded-2xl text-xs font-bold tracking-tight text-white placeholder:text-muted-foreground/40 focus-visible:ring-1 ring-primary/20"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <DynamicAutoSelect 
                    placeholder="All Product Realms"
                    value={filterCategoryId}
                    onSelect={setFilterCategoryId}
                    className="h-14 border-0 bg-background/50 rounded-2xl shadow-none w-64"
                    options={[
                      { value: "all", label: "Every Asset Category" },
                      ...categories.map((c: any) => ({ value: c.id, label: c.name }))
                    ]}
                  />
                  <DynamicAutoSelect 
                    placeholder="Operation Status"
                    value={filterStatus}
                    onSelect={setFilterStatus}
                    className="h-14 border-0 bg-background/50 rounded-2xl shadow-none w-48"
                    options={[
                      { value: "all", label: "All Statuses" },
                      { value: "active", label: "Operational" },
                      { value: "draft", label: "In-Planning" },
                      { value: "archived", label: "Decommissioned" },
                    ]}
                  />
               </div>

               <div className="flex items-center gap-2">
                  <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-background/30 hover:bg-background/50 border border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Filter className="h-4 w-4 mr-2 opacity-40" /> Advanced Logic
                  </Button>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-primary/5 hover:bg-primary/20 border border-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </Button>
               </div>
            </div>

            {/* Strategic Data Matrix */}
            <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden shadow-3xl overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 hover:bg-white/5 border-b border-white/5">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-16 pl-10">Asset Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-16 text-center">Procurement Domain</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-16 text-center">Logistics Point</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-16 text-center">Unit Price</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-16 text-center">Ops Status</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 h-16 pr-10">Directives</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="h-[400px] text-center border-b-0">
                        <div className="flex flex-col items-center gap-6 opacity-10">
                          <div className="h-24 w-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
                             <Package className="h-12 w-12" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-[0.4em]">Asset Matrix Clear</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product: Product) => (
                      <TableRow 
                        key={product.id} 
                        className="group border-b border-white/[0.02] hover:bg-primary/[0.03] transition-all cursor-pointer"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <TableCell className="pl-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-[1.8rem] bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/40 transition-all overflow-hidden relative shadow-2xl" 
                              style={product.image ? { backgroundImage: `url(${product.image})`, backgroundSize: 'cover' } : {}}
                            >
                              {!product.image && <Package className="h-7 w-7 text-white/10 group-hover:text-primary transition-colors" />}
                              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-sm uppercase tracking-tight text-white group-hover:text-primary transition-colors">{product.name}</p>
                              <div className="flex items-center gap-2">
                                 <code className="text-[10px] font-black text-white/30 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-md">
                                   {product.productCode || "NO_SKU_NODE"}
                                 </code>
                                 <span className="h-1 w-1 rounded-full bg-white/10" />
                                 <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{product.manufacturer || "GLOBAL MFG"}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-white/5 text-white/60 border-white/10 text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                            {product.productCategory || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex flex-col items-center">
                             <p className="text-sm font-black text-white">{product.quantityInStock || 0}</p>
                             <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{product.usageUnit || "Units"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex flex-col items-center bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                             <p className="text-xs font-black text-primary">
                               {new Intl.NumberFormat("en-US", { style: "currency", currency: "TND" }).format(product.unitPrice || 0)}
                             </p>
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">Base Rate</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full mr-2 shadow-[0_0_8px]",
                              product.productActive ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"
                            )} />
                            <Badge variant="outline" className={cn(
                              "text-[9px] h-5 px-2 uppercase font-black tracking-widest border-none bg-white/5",
                              product.productActive ? "text-green-500" : "text-red-500"
                            )}>
                              {product.productActive ? "Operational" : "Offline"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-10" onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-primary hover:text-white transition-all"
                                onClick={() => handleEditClick(product)}
                              >
                                 <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-red-500 hover:text-white transition-all"
                                onClick={() => handleDelete(product)}
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between px-10 py-8 bg-white/5 border-t border-white/5">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                  Registry Load: {products.length} / Global Assets
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-6 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl disabled:opacity-20"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous Sequence
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-6 text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 rounded-xl disabled:opacity-20"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    Next Sequence
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Pricing Matrix Dialog */}
        <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
          <DialogContent className="max-w-md rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Update Matrix Point</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">New Price Value</Label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input 
                    type="number" 
                    value={newPrice} 
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                    className="h-12 pl-9 rounded-xl font-black text-lg border-2" 
                   />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest" onClick={handleUpsertPrice}>
                  Apply Change
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-2" onClick={() => setShowPricingDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Variant Dialog */}
        <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
          <DialogContent className="max-w-md rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Forge New Variant</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Variant Alias</Label>
                <Input value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="e.g. 50 User Bundle" className="h-12 rounded-xl font-bold border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Specific SKU Code</Label>
                <Input value={variantSku} onChange={(e) => setVariantSku(e.target.value)} placeholder="SRV-ENT-50" className="h-12 rounded-xl font-mono border-2" />
              </div>
              <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest" onClick={handleCreateVariant}>
                Create Variant Logic
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[32px]">
            <div className="bg-primary/5 p-8 border-b">
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Edit Product Blueprint</DialogTitle>
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-8">
              <ProductForm 
                formData={formData} 
                setFormData={setFormData}
                categories={categories}
                brands={brands}
                productTypes={productTypes}
              />
            </div>
            <div className="p-8 border-t bg-muted/20 flex gap-4">
              <Button className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest" onClick={handleEdit}>
                Finalize Updates
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-2" onClick={() => setShowEdit(false)}>
                Discard Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

export default Products;
