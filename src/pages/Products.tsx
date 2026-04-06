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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";

export type ProductType = "SERVICE" | "PHYSICAL" | "SUBSCRIPTION";

export interface PriceBookItem {
  id: string;
  priceBookId: string;
  priceBook: { name: string; currency: string };
  price: number;
  billingType: "ONE_TIME" | "RECURRING";
  billingPeriod: "NONE" | "MONTHLY" | "YEARLY" | "WEEKLY";
  discountAllowed: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  attributes: any;
  isDefault: boolean;
  isActive: boolean;
  prices: PriceBookItem[];
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  type: ProductType;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  brandId: string | null;
  brand: { id: string; name: string } | null;
  isActive: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  // Legacy fields for UI compatibility if needed
  totalSold?: number;
  totalRevenue?: number;
}



// ProductForm component moved OUTSIDE Products component to prevent remounting
interface ProductFormProps {
  formData: {
    name: string;
    code: string;
    description: string;
    type: ProductType;
    categoryId: string;
    brandId: string;
    isActive: boolean;
    isSellable: boolean;
    isPurchasable: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  brands: any[];
}

const ProductForm = ({ formData, setFormData, categories, brands }: ProductFormProps) => {
  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name <span className="text-red-500">*</span></Label>
          <Input
            placeholder="Enterprise Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Product Code (Unique) <span className="text-red-500">*</span></Label>
          <Input
            placeholder="PRD-001"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Product Type</Label>
          <Select
            value={formData.type}
            onValueChange={(v: ProductType) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHYSICAL">Physical Goods</SelectItem>
              <SelectItem value="SERVICE">Professional Service</SelectItem>
              <SelectItem value="SUBSCRIPTION">SaaS / Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select
            value={formData.brandId}
            onValueChange={(v) => setFormData({ ...formData, brandId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
           <input
            type="checkbox"
            id="isSellable"
            checked={formData.isSellable}
            onChange={(e) => setFormData({ ...formData, isSellable: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isSellable" className="cursor-pointer">Sellable</Label>
        </div>
        <div className="flex items-center gap-2">
           <input
            type="checkbox"
            id="isPurchasable"
            checked={formData.isPurchasable}
            onChange={(e) => setFormData({ ...formData, isPurchasable: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isPurchasable" className="cursor-pointer">Purchasable</Label>
        </div>
        <div className="flex items-center gap-2">
           <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Product details and value prop..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );
};
const Products = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

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

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["products", "paginated", page, pageSize, search, filterCategoryId],
    queryFn: () => api.products.findAllPaginated(
      page,
      pageSize,
      search,
      filterCategoryId === "all" ? undefined : filterCategoryId
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

  const createMutation = useMutation({
    mutationFn: api.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      setShowAdd(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
      toast.success("Variant registered strategically");
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
      toast.success("Master Rate Designation finalized");
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
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    type: "PHYSICAL" as ProductType,
    categoryId: "",
    brandId: "",
    isActive: true,
    isSellable: true,
    isPurchasable: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      type: "PHYSICAL",
      categoryId: "",
      brandId: "",
      isActive: true,
      isSellable: true,
      isPurchasable: true,
    });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description || "",
      type: product.type,
      categoryId: product.categoryId || "",
      brandId: product.brandId || "",
      isActive: product.isActive,
      isSellable: product.isSellable,
      isPurchasable: product.isPurchasable,
    });
    setShowEdit(true);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!editingProduct || !formData.name) return;
    updateMutation.mutate({
      id: editingProduct.id,
      data: formData,
    });
  };

  const handleDelete = (product: Product) => {
    deleteMutation.mutate(product.id);
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
    <CRMLayout title="Products">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Default Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => {
                  const masterVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
                  const defaultPrice = masterVariant?.defaultPrice || masterVariant?.prices?.find((p: any) => p.priceBook?.isDefault) || masterVariant?.prices?.[0];
                  return (
                    <TableRow 
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowDetail(true);
                      }}
                    >
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {product.code}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {product.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                         <span className="text-sm">{product.category?.name || "—"}</span>
                      </TableCell>
                      <TableCell>
                         <span className="text-sm">{product.brand?.name || "—"}</span>
                      </TableCell>
                      <TableCell>
                        {defaultPrice ? (
                          <div className="font-medium text-sm">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: defaultPrice.priceBook?.currency || "USD",
                            }).format(defaultPrice.price)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No price set</span>
                        )}
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5">
                          {product.isActive ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span className="text-xs">{product.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(product)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(product)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {products.length} of {total} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Detail Drawer */}
        <Drawer open={showDetail} onOpenChange={setShowDetail}>
          <DrawerContent className="w-full md:w-[840px] md:max-w-[840px] p-0 flex flex-col h-[90vh]">
            {selectedProduct && (
              <Tabs defaultValue="overview" className="flex flex-col h-full">
                <div className="px-6 pt-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <DrawerTitle className="text-2xl font-bold">{selectedProduct.name}</DrawerTitle>
                      <DrawerDescription className="text-sm font-mono mt-1 opacity-70">
                        {selectedProduct.code}
                      </DrawerDescription>
                    </div>
                    <div className="flex gap-2">
                       <Badge variant={selectedProduct.type === 'PHYSICAL' ? 'default' : 'secondary'}>
                        {selectedProduct.type}
                      </Badge>
                      <Badge variant={selectedProduct.isActive ? "default" : "destructive"}>
                        {selectedProduct.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <TabsList className="bg-transparent border-b-0 w-full justify-start h-10 p-0 gap-6">
                    <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-2 h-full text-sm">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="variants" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-2 h-full text-sm">
                      Variants
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0 pb-2 h-full text-sm">
                      Pricing Matrix
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="overview" className="mt-0 space-y-8">
                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">General Definitions</Label>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-muted-foreground">Main Category</span>
                            <span className="text-sm font-medium">{selectedProduct.category?.name || "Uncategorized"}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-muted-foreground">Manufacturer / Brand</span>
                            <span className="text-sm font-medium">{selectedProduct.brand?.name || "None"}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-sm text-muted-foreground">Product Type</span>
                            <span className="text-sm font-medium">{selectedProduct.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Permissions</Label>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm text-muted-foreground">Sellable</span>
                            {selectedProduct.isSellable ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                          <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm text-muted-foreground">Purchasable</span>
                            {selectedProduct.isPurchasable ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Product Description</Label>
                      <div className="text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-xl border italic">
                        {selectedProduct.description || "No public description available for this catalog item."}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="variants" className="mt-0 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-semibold italic text-muted-foreground">Strategic Variant Control ({selectedProduct.variants?.length})</h3>
                       <Button size="sm" variant="outline" className="h-8 text-xs border-dashed" onClick={() => { setVariantName(""); setVariantSku(selectedProduct.code + "-"); setShowVariantDialog(true); }}>
                          <Plus className="h-3 w-3 mr-1" /> Add Variant
                       </Button>
                    </div>
                    
                    <div className="rounded-xl border divide-y bg-muted/10 overflow-hidden shadow-inner">
                      {selectedProduct.variants?.map((v) => (
                        <div key={v.id} className="p-4 hover:bg-background transition-all duration-200 group">
                           <div className="flex justify-between items-start">
                             <div className="flex gap-4">
                               <div className="h-10 w-10 rounded-lg bg-primary/5 border flex items-center justify-center text-primary">
                                  <Layers className="h-5 w-5" />
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm tracking-tight">{v.name}</span>
                                    {v.isDefault && <Badge className="text-[8px] h-3.5 px-1 bg-primary/10 text-primary border-primary/20">MASTER</Badge>}
                                  </div>
                                  <div className="text-xs font-mono text-muted-foreground mt-1 bg-background/50 inline-block px-1 rounded">SKU: {v.sku} | ID: {v.id}</div>
                               </div>
                             </div>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEditClick(selectedProduct)}>
                                   <Pencil className="h-3 w-3" />
                                </Button>
                             </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="mt-0 space-y-6">
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="text-sm font-bold italic">Global Price Control</h3>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Cross-reference: Variant x PriceBook</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       {selectedProduct.variants?.filter(v => v.isDefault).map(v => (
                         <div key={v.id} className="space-y-4">
                            <div className="flex items-center justify-between border-l-2 border-primary pl-3 bg-muted/20 py-2 rounded-r-lg">
                               <div className="flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-primary" />
                                  <span className="font-bold text-sm tracking-tight">Master Pricing Profile</span>
                               </div>
                               <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-primary/20 mr-2 uppercase tracking-tighter font-black">Active Default</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {priceBooks.map(pb => {
                                 const currentPrice = v.prices?.find((p: any) => p.priceBookId === pb.id);
                                 const isPrimary = v.defaultPriceId === currentPrice?.id;
                                 return (
                                   <div key={`${v.id}-${pb.id}`} className={`p-4 rounded-xl border transition-all relative overflow-hidden group ${isPrimary ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/50' : 'bg-background/40 hover:border-primary/40'}`}>
                                     <div className="absolute top-0 right-0 h-10 w-10 bg-primary/5 -mr-5 -mt-5 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
                                     <div className="flex flex-col gap-2 relative">
                                       <div className="flex justify-between items-start">
                                         <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{pb.name}</span>
                                            {isPrimary && <Badge className="text-[7px] h-3 px-1 bg-primary text-white border-0">PRIMARY</Badge>}
                                         </div>
                                         <Badge variant="outline" className="text-[9px] font-mono whitespace-nowrap">{pb.currency}</Badge>
                                       </div>
                                       
                                       <div className="flex items-end justify-between mt-2 pt-2 border-t border-dashed">
                                         <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground italic">Target Rate</span>
                                            <span className={`text-xl font-black leading-tight ${currentPrice ? 'text-primary' : 'text-muted-foreground opacity-30 italic font-medium'}`}>
                                               {currentPrice ? new Intl.NumberFormat("en-US", {
                                                 style: "currency",
                                                 currency: pb.currency || "USD",
                                                 minimumFractionDigits: 0
                                               }).format(currentPrice.price) : "Not Defined"}
                                            </span>
                                         </div>
                                         <div className="flex items-center gap-1">
                                            {currentPrice && !isPrimary && (
                                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
                                                  onClick={() => setPrimaryPriceMutation.mutate({ variantId: v.id, priceId: currentPrice.id })}>
                                                  <Copy className="h-3.5 w-3.5" />
                                               </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-transform group-hover:scale-110" 
                                               onClick={() => {
                                                  setPricingTarget({ variantId: v.id, priceBookId: pb.id, currentPrice: currentPrice?.price || 0 });
                                                  setNewPrice(currentPrice?.price || 0);
                                                  setShowPricingDialog(true);
                                               }}>
                                               <TrendingUp className="h-4 w-4" />
                                            </Button>
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })}
                            </div>
                         </div>
                       ))}
                    </div>
                  </TabsContent>
                </div>
                
                <div className="p-6 border-t bg-muted/10 flex justify-between items-center mt-auto">
                   <div className="text-xs text-muted-foreground">
                      Created {formatDate(selectedProduct.createdAt)}
                   </div>
                   <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowDetail(false)}>Dismiss</Button>
                      <Button size="sm" onClick={() => { setShowDetail(false); handleEditClick(selectedProduct); }}>Edit definitions</Button>
                   </div>
                </div>
              </Tabs>
            )}
          </DrawerContent>
        </Drawer>

        {/* Create Variant Dialog */}
        <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
           <DialogContent>
              <DialogHeader>
                 <DialogTitle>Register Strategic Variant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label>Variant Public Name</Label>
                    <Input placeholder="e.g. Pro Plan, 500GB Edition" value={variantName} onChange={(e) => setVariantName(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label>Specialized SKU</Label>
                    <Input className="font-mono" value={variantSku} onChange={(e) => setVariantSku(e.target.value)} />
                 </div>
                 <Button className="w-full" onClick={handleCreateVariant} disabled={createVariantMutation.isPending}>
                    {createVariantMutation.isPending ? "Syncing..." : "Finalize Variant Registration"}
                 </Button>
              </div>
           </DialogContent>
        </Dialog>

        {/* Pricing Matrix Dialog */}
        <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
           <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                 <DialogTitle className="flex items-center gap-2">
                   <DollarSign className="h-5 w-5 text-primary" />
                   Rate Adjustment
                 </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-6">
                 <div className="space-y-2 text-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Selected Allocation</p>
                    <p className="text-sm font-bold">{pricingTarget && selectedProduct?.variants?.find((v: any) => v.id === pricingTarget.variantId)?.name}</p>
                    <p className="text-xs text-primary">{pricingTarget && priceBooks.find((pb: any) => pb.id === pricingTarget.priceBookId)?.name}</p>
                 </div>
                 
                 <div className="space-y-3">
                    <Label className="text-center block italic text-muted-foreground">Specify Selling Price ({pricingTarget && priceBooks.find((pb: any) => pb.id === pricingTarget.priceBookId)?.currency})</Label>
                    <div className="relative">
                       <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                       <Input 
                         type="number" 
                         className="pl-10 text-2xl font-black h-14" 
                         value={newPrice} 
                         onChange={(e) => setNewPrice(Number(e.target.value))} 
                       />
                    </div>
                 </div>
                 
                 <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowPricingDialog(false)}>Cancel</Button>
                    <Button className="flex-1 shadow-lg shadow-primary/20" onClick={handleUpsertPrice} disabled={upsertPricingMutation.isPending}>
                       {upsertPricingMutation.isPending ? "Syncing Rate..." : "Commit Change"}
                    </Button>
                 </div>
              </div>
           </DialogContent>
        </Dialog>

        {/* Add Product Drawer */}
        <Drawer open={showAdd} onOpenChange={setShowAdd}>
          <DrawerContent className="w-full md:w-[720px] p-6 focus:outline-none">
            <DrawerHeader className="px-0">
              <DrawerTitle>Define New Product</DrawerTitle>
              <DrawerDescription>
                Create the core product concept. Pricing and variants can be refined later.
              </DrawerDescription>
            </DrawerHeader>
            <ProductForm 
              formData={formData} 
              setFormData={setFormData} 
              categories={categories}
              brands={brands}
            />
            <DrawerFooter className="px-0 pt-6">
               <div className="flex justify-end gap-3 w-full">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button onClick={handleAdd}>Initialize Product</Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Edit Product Drawer */}
        <Drawer open={showEdit} onOpenChange={setShowEdit}>
          <DrawerContent className="w-full md:w-[720px] p-6 focus:outline-none">
            <DrawerHeader className="px-0">
              <DrawerTitle>Modify Product</DrawerTitle>
              <DrawerDescription>Update core product definitions.</DrawerDescription>
            </DrawerHeader>
            <ProductForm 
              formData={formData} 
              setFormData={setFormData} 
              categories={categories}
              brands={brands}
            />
            <DrawerFooter className="px-0 pt-6">
              <div className="flex justify-end gap-3 w-full">
                <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
                <Button onClick={handleEdit}>Update Definitions</Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </CRMLayout>
  );
};

export default Products;
