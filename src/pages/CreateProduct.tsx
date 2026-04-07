import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { ArrowLeft, Save, X } from "lucide-react";

import { ProductForm } from "@/components/products/ProductForm";

const CreateProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: api.products.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
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

    // If no variants defined, create a default one with the inventory/price info
    if (payload.variants.length === 0) {
      payload.variants = [{
        name: "Default",
        sku: `${payload.slug}-DEF`,
        price: payload.basePrice,
        cost: payload.cost,
        isDefault: true,
        inventory: payload.trackInventory ? [{
          quantityAvailable: payload.quantity,
          reorderLevel: payload.reorderLevel,
          warehouseId: payload.warehouseId || "central"
        }] : []
      }];
    }

    createMutation.mutate(payload);
  };

  return (
    <CRMLayout title="New Product">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/products")}
              className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest border-2"
            >
              <X className="h-3.5 w-3.5 mr-2" /> Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest shadow-xl"
              disabled={createMutation.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-2" /> Save Product
            </Button>
          </div>
        </div>

        <Card className="border-2 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b-2 border-dashed">
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              Product Details
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

export default CreateProduct;
