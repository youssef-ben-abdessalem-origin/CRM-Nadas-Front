import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, Package, Layers, DollarSign } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const ProductSettings = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState("");

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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
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

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (activeTab === "categories") {
      if (editingItem) {
        updateCategoryMutation.mutate({ id: editingItem.id, data: { name } });
      } else {
        createCategoryMutation.mutate(name);
      }
    } else if (activeTab === "units") {
      if (editingItem) {
        updateUnitMutation.mutate({ id: editingItem.id, data: { name } });
      } else {
        createUnitMutation.mutate(name);
      }
    } else {
      if (editingItem) {
        updatePricingModelMutation.mutate({ id: editingItem.id, data: { name } });
      } else {
        createPricingModelMutation.mutate(name);
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      if (activeTab === "categories") {
        deleteCategoryMutation.mutate(id);
      } else if (activeTab === "units") {
        deleteUnitMutation.mutate(id);
      } else {
        deletePricingModelMutation.mutate(id);
      }
    }
  };

  return (
    <CRMLayout title="Product Settings">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Product Settings</h1>
            <p className="text-muted-foreground">Manage product categories, units, and pricing models</p>
          </div>
          <Button onClick={() => { setName(""); setEditingItem(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add {activeTab === "categories" ? "Category" : activeTab === "units" ? "Unit" : "Pricing Model"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" /> Categories
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Units
            </TabsTrigger>
            <TabsTrigger value="pricing-models" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Pricing Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesLoading ? (
                    <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                  ) : (
                    categories.map((cat: any) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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
            <DialogTitle>{editingItem ? "Edit" : "Add"} {activeTab === "categories" ? "Category" : activeTab === "units" ? "Unit" : "Pricing Model"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Software, Hour, one-time, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingItem ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default ProductSettings;
