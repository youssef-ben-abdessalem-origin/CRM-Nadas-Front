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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";

interface Country {
  id: number;
  name: string;
  code: string;
  phoneCode: string;
  isActive: boolean;
  isDefault: boolean;
}

const CountriesSettings = () => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    phoneCode: "",
    isDefault: false,
  });

  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: () => api.settings.getCountries().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      toast.success("Country created successfully");
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateCountry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      toast.success("Country updated successfully");
      setShowDialog(false);
      setEditingCountry(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      toast.success("Country deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", phoneCode: "", isDefault: false });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editingCountry) {
      updateMutation.mutate({ id: editingCountry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      code: country.code,
      phoneCode: country.phoneCode || "",
      isDefault: country.isDefault,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ 
      title: "Delete Country", 
      description: "Are you sure you want to delete this country? This may affect records currently using this location.",
      variant: "destructive",
      confirmText: "Delete"
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Countries">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Countries">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Countries</h1>
            <p className="text-muted-foreground">Manage countries and regions</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingCountry(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Country
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Phone Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No countries found
                  </TableCell>
                </TableRow>
              ) : (
                countries.map((country: Country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.phoneCode}</TableCell>
                    <TableCell>
                      {country.isDefault && (
                        <Badge className="bg-green-500">Default</Badge>
                      )}
                      {!country.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(country)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!country.isDefault && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(country.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCountry ? "Edit Country" : "Add Country"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="United States"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                placeholder="US"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Code</Label>
              <Input
                placeholder="+1"
                value={formData.phoneCode}
                onChange={(e) => setFormData({ ...formData, phoneCode: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <Label htmlFor="isDefault">Set as default country</Label>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingCountry ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default CountriesSettings;
