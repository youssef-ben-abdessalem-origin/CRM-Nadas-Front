import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import { ProductForm } from "@/components/products/ProductForm";
import { useTranslation } from "react-i18next";

const EditProduct = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<any>(null);

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.products.getOne(id!),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api.products.getCategories().catch(() => []),
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["product-brands"],
    queryFn: () => api.products.getBrands().catch(() => []),
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["product-types"],
    queryFn: () => api.products.getTypes().catch(() => []),
  });

  useEffect(() => {
    if (product) {
      // Find default variant for prices/inventory
      const defaultVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
      const inventory = defaultVariant?.inventory?.[0];

      setFormData({
        ...product,
        productActive: product.isActive,
        // Map fields that might be null in DB
        categoryId: product.categoryId || null,
        brandId: product.brandId || null,
        // Flat mapping for the form's simplified UI
        unitPrice: product.unitPrice ?? defaultVariant?.price ?? 0,
        qtyOrdered: product.qtyOrdered ?? 0,
        quantityInStock: product.quantityInStock ?? inventory?.quantityAvailable ?? 0,
        reorderLevel: product.reorderLevel ?? inventory?.reorderLevel ?? 0,
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.products.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      toast.success("Blueprint updated successfully");
      navigate("/products");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!formData.name || !formData.slug) {
      toast.error("Please fill in required fields (Name and Slug)");
      return;
    }

    const payload = { ...formData };
    
    // Final sanitization for UUIDs
    if (payload.categoryId === "") payload.categoryId = null;
    if (payload.brandId === "") payload.brandId = null;

    updateMutation.mutate(payload);
  };

  if (isProductLoading || !formData) {
    return (
      <CRMLayout title="Loading Asset...">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Retrieving Asset Blueprint</p>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={`Edit: ${product?.name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Catalog
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/products")}
              className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-2"
            >
              <X className="h-3.5 w-3.5 mr-2" /> Discard
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest shadow-xl"
              disabled={updateMutation.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-2" /> {updateMutation.isPending ? "Updating..." : "Commit Changes"}
            </Button>
          </div>
        </div>

        <Card className="border-2 shadow-2xl rounded-[32px] overflow-hidden">
          <CardHeader className="bg-muted/30 border-b-2 border-dashed p-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              Modify Asset Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ProductForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              brands={brands}
              productTypes={productTypes}
            />
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default EditProduct;
