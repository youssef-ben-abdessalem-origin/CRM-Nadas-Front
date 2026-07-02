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
import { useTranslation } from "react-i18next";

const ProductSettings = () => {
  const { t } = useTranslation();
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
      toast.success(t("productSettings.statusUpdates.categoryCreated"));
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
      toast.success(t("productSettings.statusUpdates.categoryUpdated"));
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
      toast.success(t("productSettings.statusUpdates.categoryDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createUnitMutation = useMutation({
    mutationFn: api.products.createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-units"] });
      toast.success(t("productSettings.statusUpdates.unitCreated"));
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
      toast.success(t("productSettings.statusUpdates.unitUpdated"));
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
      toast.success(t("productSettings.statusUpdates.unitDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createPricingModelMutation = useMutation({
    mutationFn: api.products.createPricingModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-pricing-models"] });
      toast.success(t("productSettings.statusUpdates.pricingModelCreated"));
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
      toast.success(t("productSettings.statusUpdates.pricingModelUpdated"));
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
      toast.success(t("productSettings.statusUpdates.pricingModelDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createPriceBookMutation = useMutation({
    mutationFn: api.products.createPriceBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-price-books"] });
      toast.success(t("productSettings.statusUpdates.priceBookCreated"));
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
      toast.success(t("productSettings.statusUpdates.priceBookUpdated"));
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
      toast.success(t("productSettings.statusUpdates.priceBookDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createProductTypeMutation = useMutation({
    mutationFn: api.products.createType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-types"] });
      toast.success(t("productSettings.statusUpdates.productTypeCreated"));
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
      toast.success(t("productSettings.statusUpdates.productTypeUpdated"));
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
      toast.success(t("productSettings.statusUpdates.productTypeDeleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: { name: string }) => api.products.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands"] });
      toast.success(t("productSettings.statusUpdates.brandCreated"));
      setShowDialog(false);
      setName("");
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands"] });
      toast.success(t("productSettings.statusUpdates.brandUpdated"));
      setShowDialog(false);
      setEditingItem(null);
      setName("");
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: api.products.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-brands"] });
      toast.success(t("productSettings.statusUpdates.brandDeleted"));
    },
  });

  const createTaxClassMutation = useMutation({
    mutationFn: api.products.createTaxClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tax-classes"] });
      toast.success(t("productSettings.statusUpdates.taxClassCreated"));
      setShowDialog(false);
      setName(""); setRate(0);
    },
  });

  const updateTaxClassMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.products.updateTaxClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tax-classes"] });
      toast.success(t("productSettings.statusUpdates.taxClassUpdated"));
      setShowDialog(false);
      setEditingItem(null);
      setName(""); setRate(0);
    },
  });

  const deleteTaxClassMutation = useMutation({
    mutationFn: api.products.deleteTaxClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-tax-classes"] });
      toast.success(t("productSettings.statusUpdates.taxClassDeleted"));
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return toast.error(t("productSettings.errors.nameRequired"));

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
      title: t("productSettings.deleteDialog.title", { item: getActiveTabTitle() }), 
      description: t("productSettings.deleteDialog.description", { item: getActiveTabTitle().toLowerCase() }),
      variant: "destructive",
      confirmText: t("common.delete")
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
      case "categories": return t("productSettings.tabTitles.category");
      case "units": return t("productSettings.tabTitles.unit");
      case "brands": return t("productSettings.tabTitles.brand");
      case "tax-classes": return t("productSettings.tabTitles.taxClass");
      case "pricing-models": return t("productSettings.tabTitles.pricingModel");
      case "price-books": return t("productSettings.tabTitles.priceList");
      case "product-types": return t("productSettings.tabTitles.productType");
      default: return t("productSettings.tabTitles.default");
    }
  };

  return (
    <CRMLayout title={t("productSettings.pageTitle")}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("productSettings.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("productSettings.subtitle")}</p>
          </div>
          <Button onClick={() => { setName(""); setCode(""); setDescription(""); setCurrency("USD"); setIsActive(true); setEditingItem(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> {t("productSettings.addItem", { item: getActiveTabTitle() })}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> {t("productSettings.tabs.categories")}
            </TabsTrigger>
            <TabsTrigger value="product-types" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" /> {t("productSettings.tabs.productTypes")}
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" /> {t("productSettings.tabs.brands")}
            </TabsTrigger>
            <TabsTrigger value="tax-classes" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> {t("productSettings.tabs.taxClasses")}
            </TabsTrigger>
            <TabsTrigger value="price-books" className="flex items-center gap-2">
               <DollarSign className="h-4 w-4" /> {t("productSettings.tabs.priceBooks")}
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> {t("productSettings.tabs.units")}
            </TabsTrigger>
            <TabsTrigger value="pricing-models" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> {t("productSettings.tabs.pricingModels")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <Card className="overflow-hidden">
               {categoriesLoading ? (
                 <div className="p-8 text-center text-muted-foreground italic">{t("productSettings.loading.categories")}</div>
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
                     <TableHead>{t("productSettings.table.typeName")}</TableHead>
                     <TableHead>{t("productSettings.table.internalCode")}</TableHead>
                     <TableHead>{t("common.description")}</TableHead>
                     <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productTypesLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center italic opacity-40">{t("productSettings.loading.types")}</TableCell></TableRow>
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
                    <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">{t("productSettings.empty.types")}</TableCell></TableRow>
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
                     <TableHead>{t("productSettings.table.brandName")}</TableHead>
                     <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brandsLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center italic opacity-40">{t("productSettings.loading.brands")}</TableCell></TableRow>
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
                    <TableRow><TableCell colSpan={2} className="text-center py-12 text-muted-foreground italic">{t("productSettings.empty.brands")}</TableCell></TableRow>
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
                     <TableHead>{t("productSettings.table.taxClassName")}</TableHead>
                     <TableHead>{t("productSettings.table.rate")}</TableHead>
                     <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxClassesLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center italic opacity-40">{t("productSettings.loading.taxClasses")}</TableCell></TableRow>
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
                    <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">{t("productSettings.empty.taxClasses")}</TableCell></TableRow>
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
                    <TableHead>{t("productSettings.table.priceListName")}</TableHead>
                    <TableHead>{t("productSettings.table.currency")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceBooksLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center">{t("common.loading")}</TableCell></TableRow>
                  ) : (
                    priceBooks.map((pb: any) => (
                      <TableRow key={pb.id}>
                        <TableCell className="font-medium">{pb.name}{pb.isDefault && <Badge variant="outline" className="ml-2">{t("common.default")}</Badge>}</TableCell>
                        <TableCell><span className="font-mono text-xs">{pb.currency}</span></TableCell>
                        <TableCell>
                          <Badge variant={pb.isActive ? "default" : "secondary"}>
                            {pb.isActive ? t("common.active") : t("common.inactive")}
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
                    <TableHead>{t("productSettings.table.unitName")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unitsLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">{t("common.loading")}</TableCell></TableRow>
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
                    <TableHead>{t("productSettings.table.pricingModelName")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingModelsLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">{t("common.loading")}</TableCell></TableRow>
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
            <DialogTitle>{editingItem ? t("common.edit") : t("common.add")} {getActiveTabTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")} *</Label>
              <Input
                placeholder={
                  activeTab === 'price-books' 
                    ? t("productSettings.placeholders.priceListName")
                    : activeTab === 'product-types' 
                      ? t("productSettings.placeholders.typeName")
                      : t("productSettings.placeholders.name")
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            {activeTab === 'product-types' && (
              <>
                <div className="space-y-2">
                   <Label>{t('productSettings.code')} *</Label>
                   <Input 
                     placeholder={t("productSettings.placeholders.code")} 
                     value={code} 
                     onChange={(e) => setCode(e.target.value)}
                     className="font-mono"
                   />
                </div>
                <div className="space-y-2">
                   <Label>{t('common.description')}</Label>
                   <Input 
                     placeholder={t("productSettings.placeholders.description")} 
                     value={description} 
                     onChange={(e) => setDescription(e.target.value)}
                   />
                </div>
              </>
            )}

            {activeTab === 'tax-classes' && (
              <div className="space-y-2">
                 <Label>{t('productSettings.taxRate')} (%) *</Label>
                 <Input 
                   type="number"
                   placeholder={t("productSettings.placeholders.taxRate")} 
                   value={rate} 
                   onChange={(e) => setRate(Number.parseFloat(e.target.value) || 0)}
                 />
              </div>
            )}
            
            {activeTab === 'price-books' && (
               <>
                 <div className="space-y-2">
                    <Label>{t('productSettings.currency')}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("productSettings.placeholders.selectCurrency")} />
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
                    <Label htmlFor="isActive" className="cursor-pointer">{t("productSettings.activeInSales")}</Label>
                 </div>
               </>
            )}

            <Button onClick={handleSubmit} className="w-full">
              {editingItem ? t("common.saveChanges") : t("productSettings.createItem")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default ProductSettings;
