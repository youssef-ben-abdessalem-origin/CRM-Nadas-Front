import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package, Layers, DollarSign, BarChart3, Wrench, ShieldCheck, Bookmark } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";

const ProductSettings = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("categories");
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState<string | undefined>(undefined);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => api.products.getCategories().catch(() => []),
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ["product-units"],
    queryFn: () => api.products.getUnits().catch(() => []),
  });

  const { data: pricingModels = [], isLoading: pricingModelsLoading } = useQuery({
    queryKey: ["product-pricing-models"],
    queryFn: () => api.products.getPricingModels().catch(() => []),
  });

  const { data: priceBooks = [], isLoading: priceBooksLoading } = useQuery({
    queryKey: ["product-price-books"],
    queryFn: () => api.products.getPriceBooks().catch(() => []),
  });

  const { data: productTypes = [], isLoading: productTypesLoading } = useQuery({
    queryKey: ["product-types"],
    queryFn: () => api.products.getTypes().catch(() => []),
  });

  const { data: allCurrencies = [] } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.settings.getCurrencies().catch(() => []),
  });

  const { data: brandsList = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["product-brands"],
    queryFn: () => api.products.getBrands().catch(() => []),
  });

  const { data: taxClasses = [], isLoading: taxClassesLoading } = useQuery({
    queryKey: ["product-tax-classes"],
    queryFn: () => api.products.getTaxClasses().catch(() => []),
  });

  const createCategoryMutation = useMutation({
    mutationFn: api.products.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Category created successfully");
      setShowDialog(false);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Category updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: api.products.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createUnitMutation = useMutation({
    mutationFn: api.products.createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-units"] });
      toast.success("Unit created successfully");
      setShowDialog(false);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-units"] });
      toast.success("Unit updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteUnitMutation = useMutation({
    mutationFn: api.products.deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-units"] });
      toast.success("Unit deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createPricingModelMutation = useMutation({
    mutationFn: api.products.createPricingModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-pricing-models"] });
      toast.success("Pricing model created successfully");
      setShowDialog(false);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePricingModelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updatePricingModel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-pricing-models"] });
      toast.success("Pricing model updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePricingModelMutation = useMutation({
    mutationFn: api.products.deletePricingModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-pricing-models"] });
      toast.success("Pricing model deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createPriceBookMutation = useMutation({
    mutationFn: api.products.createPriceBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-price-books"] });
      toast.success("Price Book created successfully");
      setShowDialog(false);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePriceBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updatePriceBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-price-books"] });
      toast.success("Price Book updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePriceBookMutation = useMutation({
    mutationFn: api.products.deletePriceBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-price-books"] });
      toast.success("Price Book deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createProductTypeMutation = useMutation({
    mutationFn: api.products.createType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast.success("Product type created successfully");
      setShowDialog(false);
      setName(""); setCode(""); setDescription("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateProductTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast.success("Product type updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName(""); setCode(""); setDescription("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteProductTypeMutation = useMutation({
    mutationFn: api.products.deleteType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast.success("Product type deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: { name: string }) => api.products.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands"] });
      toast.success("Brand created successfully");
      setShowDialog(false);
      setName("");
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands"] });
      toast.success("Brand updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName("");
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: api.products.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands"] });
      toast.success("Brand deleted successfully");
    },
  });

  const createTaxClassMutation = useMutation({
    mutationFn: api.products.createTaxClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tax-classes"] });
      toast.success("Tax class created successfully");
      setShowDialog(false);
      setName(""); setRate(0);
    },
  });

  const updateTaxClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateTaxClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tax-classes"] });
      toast.success("Tax class updated successfully");
      setShowDialog(false);
      setEditingItem(null);
      setName(""); setRate(0);
    },
  });

  const deleteTaxClassMutation = useMutation({
    mutationFn: api.products.deleteTaxClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tax-classes"] });
      toast.success("Tax class deleted successfully");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return toast.error("Name is required");

    const payload = { name, parentId };
    
    const actions: any = {
      categories: () => editingItem ? updateCategoryMutation.mutate({ id: editingItem.id, data: payload }) : createCategoryMutation.mutate(payload),
      units: () => editingItem ? updateUnitMutation.mutate({ id: editingItem.id, data: { name } }) : createUnitMutation.mutate(name),
      brands: () => editingItem ? updateBrandMutation.mutate({ id: editingItem.id, data: { name } }) : createBrandMutation.mutate({ name }),
      "tax-classes": () => editingItem ? updateTaxClassMutation.mutate({ id: editingItem.id, data: { name, rate } }) : createTaxClassMutation.mutate({ name, rate }),
      "pricing-models": () => editingItem ? updatePricingModelMutation.mutate({ id: editingItem.id, data: { name } }) : createPricingModelMutation.mutate(name),
      "price-books": () => editingItem ? updatePriceBookMutation.mutate({ id: editingItem.id, data: { name, currency, isActive } }) : createPriceBookMutation.mutate({ name, currency, isActive }),
      "product-types": () => editingItem ? updateProductTypeMutation.mutate({ id: editingItem.id, data: { name, code, description } }) : createProductTypeMutation.mutate({ name, code, description }),
    };

    actions[activeTab]?.();
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setParentId(item.parentId || undefined);
    if (activeTab === "price-books") {
       setCurrency(item.currency || "USD");
       setIsActive(item.isActive !== false);
    }
    if (activeTab === "product-types") {
       setCode(item.code || "");
       setDescription(item.description || "");
    }
    if (activeTab === "tax-classes") {
       setRate(item.rate || 0);
    }
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ 
      title: `Delete ${getActiveTabTitle()}`, 
      description: `Are you sure you want to delete this ${getActiveTabTitle().toLowerCase()}? This action may impact existing products and records.`,
      variant: "destructive",
      confirmText: "Delete"
    })) {
      const deletions: any = {
        categories: () => deleteCategoryMutation.mutate(id),
        units: () => deleteUnitMutation.mutate(id),
        brands: () => deleteBrandMutation.mutate(id),
        "tax-classes": () => deleteTaxClassMutation.mutate(id),
        "pricing-models": () => deletePricingModelMutation.mutate(id),
        "price-books": () => deletePriceBookMutation.mutate(id),
        "product-types": () => deleteProductTypeMutation.mutate(id),
      };
      deletions[activeTab]?.();
    }
  };

  const renderCategoryTree = (nodes: any[], currentParentId: string | null = null, level = 0) => {
    return nodes
      .filter(n => (n.parentId || null) === currentParentId)
      .map(node => (
        <div key={node.id} className="border-b last:border-0">
          <div className="flex items-center justify-between p-4 bg-background/40 hover:bg-muted/30 group">
             <div className="flex items-center gap-3">
                {Array.from({ length: level }).map((_, i) => (
                  <div key={`${node.id}-spacer-${i}`} className="w-6 h-px bg-muted border-l" />
                ))}
                {level > 0 && <div className="w-2 h-2 rounded-full bg-primary/20" />}
                <span className={level === 0 ? "font-bold" : "text-sm"}>{node.name}</span>
             </div>
             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(node)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(node.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
             </div>
          </div>
          {renderCategoryTree(nodes, node.id, level + 1)}
        </div>
      ));
  };

  const getActiveTabTitle = () => {
    switch(activeTab) {
      case "categories": return "Category";
      case "units": return "Unit";
      case "brands": return "Brand";
      case "tax-classes": return "Tax Class";
      case "pricing-models": return "Pricing Model";
      case "price-books": return "Price List";
      case "product-types": return "Product Type";
      default: return "Item";
    }
  };

  return (
    <CRMLayout title="Product Catalog Settings">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Product Catalog Settings</h1>
            <p className="text-muted-foreground">Configure the core definitions that power your product ecosystem</p>
          </div>
          <Button onClick={() => { setName(""); setCode(""); setDescription(""); setCurrency("USD"); setIsActive(true); setEditingItem(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add {getActiveTabTitle()}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Categories
            </TabsTrigger>
            <TabsTrigger value="product-types" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Product Types
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> Brands
            </TabsTrigger>
            <TabsTrigger value="tax-classes" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Tax Rates
            </TabsTrigger>
            <TabsTrigger value="price-books" className="flex items-center gap-2">
               <DollarSign className="h-4 w-4" /> Price Lists
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Units
            </TabsTrigger>
            <TabsTrigger value="pricing-models" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Pricing Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <Card className="overflow-hidden">
               {categoriesLoading ? (
                 <div className="p-8 text-center text-muted-foreground italic">Loading categories...</div>
               ) : (
                 <div className="divide-y">
                    {renderCategoryTree(categories)}
                 </div>
               )}
            </Card>
          </TabsContent>

          <TabsContent value="product-types" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Type Name</TableHead>
                     <TableHead>Internal Code</TableHead>
                     <TableHead>Description</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productTypesLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center italic opacity-40">Loading Types...</TableCell></TableRow>
                  ) : (
                    productTypes.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-bold">{t.name}</TableCell>
                        <TableCell><Badge variant="outline" className="font-mono text-[10px] uppercase font-bold text-primary">{t.code}</Badge></TableCell>
                        <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">{t.description}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {productTypes.length === 0 && !productTypesLoading && (
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">No Strategic Product Types Defined</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="brands" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Brand Name</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandsLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center italic opacity-40">Loading Brands...</TableCell></TableRow>
                  ) : (
                    brandsList.map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-bold">{b.name}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {brandsList.length === 0 && !brandsLoading && (
                    <TableRow><TableCell colSpan={2} className="text-center py-12 text-muted-foreground italic">No Brands Defined</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="tax-classes" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Tax Class Name</TableHead>
                     <TableHead>Rate (%)</TableHead>
                     <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxClassesLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center italic opacity-40">Loading Tax Classes...</TableCell></TableRow>
                  ) : (
                    taxClasses.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-bold">{t.name}</TableCell>
                        <TableCell className="font-mono">{t.rate}%</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {taxClasses.length === 0 && !taxClassesLoading && (
                    <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">No Tax Classes Defined</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="price-books" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Price List Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceBooksLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                  ) : (
                    priceBooks.map((pb: any) => (
                      <TableRow key={pb.id}>
                        <TableCell className="font-medium">{pb.name}{pb.isDefault && <Badge variant="outline" className="ml-2">Default</Badge>}</TableCell>
                        <TableCell><span className="font-mono text-xs">{pb.currency}</span></TableCell>
                        <TableCell>
                          <Badge variant={pb.isActive ? "default" : "secondary"}>
                            {pb.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(pb)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(pb.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="units" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitsLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                  ) : (
                    units.map((unit: any) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-medium">{unit.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(unit.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pricing-models" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pricing Model Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingModelsLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                  ) : (
                    pricingModels.map((model: any) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(model)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(model.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} {getActiveTabTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder={
                  activeTab === 'price-books' 
                    ? 'Global Price List' 
                    : activeTab === 'product-types' 
                      ? 'Enterprise Service' 
                      : 'Software, Unit, etc.'
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            {activeTab === 'product-types' && (
              <>
                <div className="space-y-2">
                   <Label>Code *</Label>
                   <Input 
                     placeholder="e.g. physical, digital, service" 
                     value={code} 
                     onChange={(e) => setCode(e.target.value)}
                     className="font-mono"
                   />
                </div>
                <div className="space-y-2">
                   <Label>Description</Label>
                   <Input 
                     placeholder="Brief description..." 
                     value={description} 
                     onChange={(e) => setDescription(e.target.value)}
                   />
                </div>
              </>
            )}

            {activeTab === 'tax-classes' && (
              <div className="space-y-2">
                 <Label>Tax Rate (%) *</Label>
                 <Input 
                   type="number"
                   placeholder="e.g. 21" 
                   value={rate} 
                   onChange={(e) => setRate(Number.parseFloat(e.target.value) || 0)}
                 />
              </div>
            )}
            
            {activeTab === 'price-books' && (
               <>
                 <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCurrencies.map((c: any) => (
                          <SelectItem key={c.id} value={c.code}>
                            <div className="flex items-center gap-2">
                               <span className="font-mono text-xs opacity-60">[{c.code}]</span>
                               <span>{c.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="isActive" 
                      checked={isActive} 
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">Active and selectable in sales</Label>
                 </div>
               </>
            )}

            <Button onClick={handleSubmit} className="w-full">
              {editingItem ? "Save Changes" : "Create Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default ProductSettings;
