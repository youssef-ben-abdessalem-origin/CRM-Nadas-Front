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
                  const defaultPrice = product.variants?.[0]?.prices?.[0];
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
          <DrawerContent className="w-full md:w-[720px] md:max-w-[720px] p-6 overflow-y-auto">
            {selectedProduct && (
              <div className="space-y-6">
                <DrawerHeader className="px-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <DrawerTitle className="text-2xl">{selectedProduct.name}</DrawerTitle>
                      <DrawerDescription className="text-sm font-mono mt-1">
                        {selectedProduct.code}
                      </DrawerDescription>
                    </div>
                    <Badge variant={selectedProduct.isActive ? "default" : "destructive"}>
                      {selectedProduct.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </DrawerHeader>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase">General Information</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Type</span>
                          <span className="font-medium">{selectedProduct.type}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-medium">{selectedProduct.category?.name || "Uncategorized"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Brand</span>
                          <span className="font-medium">{selectedProduct.brand?.name || "Generic"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase">Sales Status</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Sellable</span>
                          <span className={selectedProduct.isSellable ? "text-green-500" : "text-red-500"}>
                            {selectedProduct.isSellable ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">Purchasable</span>
                          <span className={selectedProduct.isPurchasable ? "text-green-500" : "text-red-500"}>
                            {selectedProduct.isPurchasable ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground uppercase">Description</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border">
                    {selectedProduct.description || "No description provided."}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs text-muted-foreground uppercase">Variants & Pricing</Label>
                  <div className="rounded-lg border">
                    {selectedProduct.variants?.map((variant) => (
                      <div key={variant.id} className="p-4 border-b last:border-0">
                        <div className="flex items-center justify-between font-medium text-sm">
                          <span>{variant.name} ({variant.sku})</span>
                          {variant.isDefault && <Badge variant="outline" className="text-[10px]">Default</Badge>}
                        </div>
                        <div className="mt-2 space-y-1">
                          {variant.prices?.map((price) => (
                            <div key={price.id} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{price.priceBook?.name}</span>
                              <span className="font-semibold">
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: price.priceBook?.currency || "USD",
                                }).format(price.price)}
                                {price.billingType === "RECURRING" && ` / ${price.billingPeriod}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DrawerContent>
        </Drawer>

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
