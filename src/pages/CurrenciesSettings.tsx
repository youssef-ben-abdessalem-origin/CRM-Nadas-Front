import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
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
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useConfirm } from "@/hooks/use-confirm";

interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
  isDefault: boolean;
}

const CurrenciesSettings = () => {
  const { symbol: currencySymbol } = useDefaultCurrency();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    symbol: "",
    isDefault: false,
  });

  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => api.settings.getCurrencies().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("Currency created successfully");
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateCurrency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("Currency updated successfully");
      setShowDialog(false);
      setEditingCurrency(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteCurrency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast.success("Currency deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", code: "", symbol: "", isDefault: false });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editingCurrency) {
      updateMutation.mutate({ id: editingCurrency.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({
      name: currency.name,
      code: currency.code,
      symbol: currency.symbol || "",
      isDefault: currency.isDefault,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ 
      title: "Delete Currency", 
      description: "Are you sure you want to delete this currency? This may affect pricing and financial records across the system.",
      variant: "destructive",
      confirmText: "Delete"
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Currencies">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Currencies">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Currencies</h1>
            <p className="text-muted-foreground">Manage currency types</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingCurrency(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Currency
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No currencies found
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map((currency: Currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.name}</TableCell>
                    <TableCell>{currency.code}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      {currency.isDefault && (
                        <Badge className="bg-green-500">Default</Badge>
                      )}
                      {!currency.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(currency)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!currency.isDefault && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(currency.id)}>
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
            <DialogTitle>{editingCurrency ? "Edit Currency" : "Add Currency"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="US Dollar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input
                placeholder="USD"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label>Symbol</Label>
               <Input
                 placeholder={currencySymbol}
                 value={formData.symbol}
                 onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
               />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <Label htmlFor="isDefault">Set as default currency</Label>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingCurrency ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default CurrenciesSettings;
