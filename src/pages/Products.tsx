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

type ProductCategory =
  | "Software"
  | "Hardware"
  | "Service"
  | "Subscription"
  | "Support"
  | "Training"
  | "Other";
type ProductStatus = "active" | "draft" | "discontinued";
type PricingModel = "one-time" | "subscription" | "usage-based" | "tiered";

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categoryId: number;
  categoryName: string;
  status: string;
  pricingModel: PricingModel;
  unitPrice: number;
  cost: number;
  margin: number;
  currency: string;
  stock: number;
  reorderLevel: number;
  unitId: number;
  unitName: string;
  taxRate: number;
  tags: string;
  created: string;
  lastUpdated: string;
  totalSold: number;
  totalRevenue: number;
}

const categoryConfig: Record<
  ProductCategory,
  { label: string; color: string }
> = {
  Software: {
    label: "Software",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  Hardware: {
    label: "Hardware",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  Service: {
    label: "Service",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  Subscription: {
    label: "Subscription",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  Support: {
    label: "Support",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Training: {
    label: "Training",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  },
  Other: {
    label: "Other",
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  },
};

const pricingConfig: Record<PricingModel, { label: string; color: string }> = {
  "one-time": {
    label: "One-Time",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  subscription: {
    label: "Subscription",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  "usage-based": {
    label: "Usage-Based",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  tiered: {
    label: "Tiered",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
};

// ProductForm component moved OUTSIDE Products component to prevent remounting
interface ProductFormProps {
  formData: {
    name: string;
    sku: string;
    description: string;
    categoryId: string;
    pricingModel: PricingModel;
    unitPrice: string;
    cost: string;
    stock: string;
    reorderLevel: string;
    unitId: string;
    taxRate: string;
    tags: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: any[];
  units: any[];
}

const ProductForm = ({ formData, setFormData, categories, units }: ProductFormProps) => {
  const unitPrice = parseFloat(formData.unitPrice) || 0;
  const cost = parseFloat(formData.cost) || 0;
  const margin =
    unitPrice > 0 ? Math.round(((unitPrice - cost) / unitPrice) * 100) : 0;

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enterprise Cloud Platform"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>
            SKU <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="ECP-001"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(v) =>
              setFormData({ ...formData, categoryId: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Pricing Model</Label>
          <Select
            value={formData.pricingModel}
            onValueChange={(v) =>
              setFormData({ ...formData, pricingModel: v as PricingModel })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-Time</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="usage-based">Usage-Based</SelectItem>
              <SelectItem value="tiered">Tiered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select
            value={formData.unitId}
            onValueChange={(v) =>
              setFormData({ ...formData, unitId: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id.toString()}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input
            type="number"
            placeholder="4999"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData({ ...formData, unitPrice: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Cost</Label>
          <Input
            type="number"
            placeholder="1200"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input
            type="number"
            placeholder="999"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Reorder Level</Label>
          <Input
            type="number"
            placeholder="10"
            value={formData.reorderLevel}
            onChange={(e) =>
              setFormData({ ...formData, reorderLevel: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tax Rate (%)</Label>
          <Input
            type="number"
            placeholder="0"
            value={formData.taxRate}
            onChange={(e) =>
              setFormData({ ...formData, taxRate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input
            placeholder="cloud, enterprise, platform"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>
      </div>

      {margin > 0 && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Calculated Margin</span>
            <span
              className={`font-semibold ${margin >= 70
                  ? "text-green-500"
                  : margin >= 50
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
            >
              {margin}%
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Product description..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="resize-none"
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
  const [filterPricing, setFilterPricing] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api.products.getCategories().catch(() => []),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["product-units"],
    queryFn: () => api.products.getUnits().catch(() => []),
  });

  const { data: allProducts = [], isLoading: isAllProductsLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.products.getAll().catch(() => []),
  });

  const { data: paginatedData, isLoading: isPaginatedLoading } = useQuery({
    queryKey: ["products", "paginated", page, pageSize, search, filterCategoryId],
    queryFn: () => api.products.getPaginated({
      page,
      limit: pageSize,
      search,
      categoryId: filterCategoryId === "all" ? undefined : parseInt(filterCategoryId)
    }).catch(() => ({
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
  const isLoading = isAllProductsLoading || isPaginatedLoading;

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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
    pricingModel: "one-time" as PricingModel,
    unitPrice: "",
    cost: "",
    stock: "",
    reorderLevel: "",
    unitId: "",
    taxRate: "0",
    tags: "",
  });

  const stats = {
    total: allProducts.length,
    active: allProducts.length, // Status removed as per request
    totalRevenue: allProducts.reduce(
      (sum: number, p: Product) => sum + p.totalRevenue,
      0,
    ),
    avgMargin:
      allProducts.filter((p: Product) => p.margin > 0).length > 0
        ? Math.round(
          allProducts.reduce((sum: number, p: Product) => sum + p.margin, 0) /
          allProducts.filter((p: Product) => p.margin > 0).length,
        )
        : 0,
    totalSold: allProducts.reduce(
      (sum: number, p: Product) => sum + p.totalSold,
      0,
    ),
    lowStock: allProducts.filter(
      (p: Product) => p.stock > 0 && p.stock <= p.reorderLevel,
    ).length,
  };

  const { currency: currencyInfo } = useProfileCurrency();
  const formatCurrency = (value: number) => {
    const code = currencyInfo?.currency ?? "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      categoryId: categories[0]?.id?.toString() || "",
      pricingModel: "one-time",
      unitPrice: "",
      cost: "",
      stock: "",
      reorderLevel: "",
      unitId: units[0]?.id?.toString() || "",
      taxRate: "0",
      tags: "",
    });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description,
      categoryId: product.categoryId?.toString() || "",
      pricingModel: product.pricingModel,
      unitPrice: product.unitPrice.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      reorderLevel: product.reorderLevel.toString(),
      unitId: product.unitId?.toString() || "",
      taxRate: product.taxRate.toString(),
      tags: product.tags || "",
    });
    setShowEdit(true);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.sku) {
      toast.error("Please fill in required fields");
      return;
    }
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const cost = parseFloat(formData.cost) || 0;
    createMutation.mutate({
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      categoryId: parseInt(formData.categoryId),
      categoryName: categories.find(c => c.id.toString() === formData.categoryId)?.name || "Software",
      pricingModel: formData.pricingModel,
      unitPrice,
      cost,
      margin:
        unitPrice > 0 ? Math.round(((unitPrice - cost) / unitPrice) * 100) : 0,
      currency: "USD",
      stock: parseInt(formData.stock) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      unitId: parseInt(formData.unitId),
      unitName: units.find(u => u.id.toString() === formData.unitId)?.name || "unit",
      taxRate: parseFloat(formData.taxRate) || 0,
      tags: formData.tags,
      totalSold: 0,
      totalRevenue: 0,
    });
  };

  const handleEdit = () => {
    if (!editingProduct || !formData.name) return;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const cost = parseFloat(formData.cost) || 0;
    updateMutation.mutate({
      id: editingProduct.id,
      data: {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        categoryName: categories.find(c => c.id.toString() === formData.categoryId)?.name || "Software",
        pricingModel: formData.pricingModel,
        unitPrice,
        cost,
        margin:
          unitPrice > 0
            ? Math.round(((unitPrice - cost) / unitPrice) * 100)
            : 0,
        stock: parseInt(formData.stock) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
        unitId: parseInt(formData.unitId),
        unitName: units.find(u => u.id.toString() === formData.unitId)?.name || "unit",
        taxRate: parseFloat(formData.taxRate) || 0,
        tags: formData.tags,
      },
    });
  };

  const handleDelete = (product: Product) => {
    deleteMutation.mutate(product.id);
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Package className="h-3 w-3 inline mr-1" />
                In catalog
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for sale
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <DollarSign className="h-3 w-3 inline mr-1" />
                All time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Avg Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.avgMargin}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Gross margin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Units Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalSold)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <ShoppingCart className="h-3 w-3 inline mr-1" />
                Total sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {stats.lowStock}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Need reorder
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPricing} onValueChange={setFilterPricing}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="one-time">One-Time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="usage-based">Usage-Based</SelectItem>
                <SelectItem value="tiered">Tiered</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
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

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: Product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDetail(true);
                    }}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        <Hash className="h-3 w-3 mr-1" />
                        {product.sku}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                      >
                        {product.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={pricingConfig[product.pricingModel].color}
                      >
                        {pricingConfig[product.pricingModel].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {product.pricingModel === "usage-based"
                        ? `$${toFixedSafe(toNumber(product?.unitPrice), 2)} / req`
                        : formatCurrencyValue(
                          toNumber(product?.unitPrice),
                          currencyInfo?.currency ?? "USD",
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${product.margin >= 70
                            ? "text-green-500"
                            : product.margin >= 50
                              ? "text-amber-500"
                              : "text-red-500"
                          }`}
                      >
                        {product.margin}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.stock > 0 &&
                        product.stock <= product.reorderLevel ? (
                        <div className="flex items-center justify-end gap-1 text-amber-500">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="font-medium">{product.stock}</span>
                        </div>
                      ) : (
                        <span className="font-medium">{product.stock}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                      {product.totalSold} {product.unitName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyValue(
                        toNumber(product.totalRevenue),
                        currencyInfo?.currency ?? "USD",
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`Creating quote for ${product.name}`);
                          }}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(product);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(`Copied ${product.name}`);
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(`Viewing ${product.name} details`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(product);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Pagination */}
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
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
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
          <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
            {selectedProduct && (
              <>
                <DrawerHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DrawerTitle className="text-xl">
                        {selectedProduct.name}
                      </DrawerTitle>
                      <DrawerDescription className="flex items-center gap-2 mt-1">
                        <Hash className="h-3 w-3" />
                        {selectedProduct.sku}
                        <span className="mx-1">·</span>
                        <span className="text-muted-foreground">{selectedProduct.unitName}</span>
                      </DrawerDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-500 border-blue-500/20"
                      >
                        {selectedProduct.categoryName}
                      </Badge>
                    </div>
                  </div>
                </DrawerHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Pricing
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Unit Price
                        </span>
                        <CurrencyBadge
                          amount={toNumber(selectedProduct.unitPrice)}
                          currencyCode={currencyInfo?.currency}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost</span>
                        <span>{formatCurrency(selectedProduct.cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Margin</span>
                        <span
                          className={`font-semibold ${selectedProduct.margin >= 70
                              ? "text-green-500"
                              : selectedProduct.margin >= 50
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                        >
                          {selectedProduct.margin}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pricing Model
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            pricingConfig[selectedProduct.pricingModel].color
                          }
                        >
                          {pricingConfig[selectedProduct.pricingModel].label}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Rate</span>
                        <span>{selectedProduct.taxRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" /> Performance
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Revenue
                        </span>
                        <CurrencyBadge
                          amount={selectedProduct.totalRevenue}
                          currencyCode={currencyInfo?.currency}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Units Sold
                        </span>
                        <span>{selectedProduct.totalSold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock</span>
                        <span
                          className={
                            selectedProduct.stock <=
                              selectedProduct.reorderLevel &&
                              selectedProduct.stock > 0
                              ? "text-amber-500 font-medium"
                              : ""
                          }
                        >
                          {selectedProduct.stock} {selectedProduct.unitName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Reorder Level
                        </span>
                        <span>{selectedProduct.reorderLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProduct.tags &&
                  (() => {
                    const tagList = Array.isArray(selectedProduct.tags)
                      ? selectedProduct.tags
                      : String(selectedProduct.tags ?? "")
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                    if (tagList.length === 0) return null;
                    return (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <Tag className="h-4 w-4" /> Tags
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {tagList.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {selectedProduct.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p>{formatDate(selectedProduct.created)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated</span>
                    <p>{formatDate(selectedProduct.lastUpdated)}</p>
                  </div>
                </div>
              </>
            )}
          </DrawerContent>
        </Drawer>

        {/* Add Product Drawer */}
        <Drawer open={showAdd} onOpenChange={setShowAdd}>
          <DrawerContent className="w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 flex flex-col">
            <DrawerHeader>
              <DrawerTitle>Add New Product</DrawerTitle>
              <DrawerDescription>
                Fill in the details to create a new product.
              </DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto overflow-x-visible">
              <ProductForm 
                formData={formData} 
                setFormData={setFormData} 
                categories={categories}
                units={units}
              />
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" /> Create Product
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Edit Product Drawer */}
        <Drawer open={showEdit} onOpenChange={setShowEdit}>
          <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Edit Product</DrawerTitle>
              <DrawerDescription>Update product information.</DrawerDescription>
            </DrawerHeader>
            <ProductForm 
              formData={formData} 
              setFormData={setFormData} 
              categories={categories}
              units={units}
            />
            <DrawerFooter>
              <Button variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </CRMLayout>
  );
};

export default Products;
