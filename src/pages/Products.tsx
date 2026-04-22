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
import { useTranslation } from "react-i18next";
import { DynamicAutoSelect } from "@/components/ui/DynamicAutoSelect";
import { cn } from "@/lib/utils";

import { ProductForm } from "@/components/products/ProductForm";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";

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
  slug: string;
  type: string;
  status: string;
  categoryId?: string;
  brandId?: string;
  isActive: boolean;
  isSellable: boolean;
  isPurchasable: boolean;
  billingType?: string;
  billingCycle?: string;
  trialPeriodDays?: number;
  setupFee?: number;
  unitOfMeasure?: string;
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
  variants?: ProductVariant[];
  media?: ProductMedia[];
  createdAt: string;
  updatedAt: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      toast.success(t('products.statusUpdates.updated', 'Product updated successfully'));
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
      toast.success(t('products.statusUpdates.deleted', 'Product deleted successfully'));
      setShowDetail(false);
      setSelectedProduct(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveMutation = useMutation({
    mutationFn: api.products.archive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t('products.statusUpdates.archived', 'Product archived successfully'));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: api.products.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t('products.statusUpdates.duplicated', 'Product duplicated successfully'));
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
      toast.success(t('products.statusUpdates.variantCreated', 'Variant created successfully'));
      setShowVariantDialog(false);
      setVariantName(""); setVariantSku("");
    },
  });

  const upsertPricingMutation = useMutation({
    mutationFn: (data: { variantId: string; priceBookId: string; price: number }) =>
      api.products.upsertPricing(data.variantId, data.priceBookId, data.price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t('products.statusUpdates.pricingUpdated', 'Pricing matrix updated'));
      setShowPricingDialog(false);
    },
  });

  const setPrimaryPriceMutation = useMutation({
    mutationFn: ({ variantId, priceId }: { variantId: string; priceId: string }) =>
      api.products.setPrimaryPrice(variantId, priceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t('products.statusUpdates.primaryRateUpdated', 'Primary rate updated'));
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
    // navigate(`/products/edit/${product.id}`);
  };


  const handleEdit = () => {
    if (!editingProduct || !formData.name) return;

    const payload = { ...formData };
    if (payload.categoryId === "") payload.categoryId = null;
    if (payload.brandId === "") payload.brandId = null;

    updateMutation.mutate({
      id: editingProduct.id,
      data: payload,
    });
  };

  const handleDelete = async (product: Product) => {
    if (await confirm({
      title: t('products.actions.deleteTitle', 'Delete Product'),
      description: t('products.actions.deleteDesc', { name: product.name }),
      variant: "destructive",
      confirmText: t('common.delete', 'Delete')
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
      <CRMLayout title={t('products.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground animate-pulse font-medium">{t('products.loading')}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t('products.title')}>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('products.stats.totalAssets')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Package className="h-3 w-3 inline mr-1" />
                {t('products.stats.activeCatalog')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('products.stats.inventory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {products.reduce((acc, p) => acc + (p.quantityInStock || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('products.stats.unitsInStock')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('products.stats.operational')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {products.filter(p => p.productActive).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('products.stats.activeProducts')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('products.stats.avgRate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                <CurrencyNumbers 
                  amount={products.length > 0 ? products.reduce((acc, p) => acc + (p.unitPrice || 0), 0) / products.length : 0} 
                  valueClassName="text-2xl"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('products.stats.marketAverage')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('products.stats.categories')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <Filter className="h-3 w-3 inline mr-1" />
                {t('products.stats.realms')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('products.toolbar.search')}
                className="h-9 pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder={t('products.toolbar.categories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('products.toolbar.allCategories')}</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> {t('products.toolbar.filter')}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> {t('products.toolbar.export')}
            </Button>
            <Button size="sm" onClick={() => navigate("/products/new")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> {t('products.toolbar.deploy')}
            </Button>
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-4">
                  <input type="checkbox" className="h-4 w-4 rounded" />
                </TableHead>
                <TableHead>{t('products.table.identity')}</TableHead>
                <TableHead>{t('products.table.domain')}</TableHead>
                <TableHead className="text-center">{t('products.table.stock')}</TableHead>
                <TableHead className="text-right">{t('products.table.unitPrice')}</TableHead>
                <TableHead className="text-center">{t('products.table.status')}</TableHead>
                <TableHead className="text-right pr-4">{t('products.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    {t('products.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} className="pl-4">
                      <input type="checkbox" className="h-4 w-4 rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/5">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{product.productCode || t('products.table.noSku')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                        {product.productCategory || t('products.table.general')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <p className="text-sm font-bold">{product.quantityInStock || 0}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">{product.usageUnit || "units"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex flex-col items-end">
                        <p className="text-sm font-bold text-primary">
                          <CurrencyNumbers amount={product.unitPrice || 0} />
                        </p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest">{t('products.table.baseRate')}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          product.productActive ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className="text-xs font-medium">{product.productActive ? t('products.table.operational') : t('products.table.offline')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              {t('products.pagination.showing', { count: products.length })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('products.pagination.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                {t('products.pagination.next')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Pricing Matrix Dialog */}
        <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
          <DialogContent className="max-w-md rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">{t('products.pricingDialog.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('products.pricingDialog.label')}</Label>
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
                  {t('products.pricingDialog.apply')}
                </Button>
                <Button variant="outline" className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest border-2" onClick={() => setShowPricingDialog(false)}>
                  {t('products.pricingDialog.cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Variant Dialog */}
        <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
          <DialogContent className="max-w-md rounded-3xl p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">{t('products.variantDialog.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('products.variantDialog.nameLabel')}</Label>
                <Input value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder={t('products.variantDialog.namePlaceholder')} className="h-12 rounded-xl font-bold border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('products.variantDialog.skuLabel')}</Label>
                <Input value={variantSku} onChange={(e) => setVariantSku(e.target.value)} placeholder={t('products.variantDialog.skuPlaceholder')} className="h-12 rounded-xl font-mono border-2" />
              </div>
              <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest" onClick={handleCreateVariant}>
                {t('products.variantDialog.create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Matrix Management & Variants remain in dialogs for quick access */}
      </div>
    </CRMLayout>
  );
};

export default Products;
