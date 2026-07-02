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
import { useTranslation } from "react-i18next";

interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  symbolArabic: string;
  symbolEnglish: string;
  isActive: boolean;
  isDefault: boolean;
}

const CurrenciesSettings = () => {
  const { t } = useTranslation();
  const { symbol: currencySymbol } = useDefaultCurrency();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [showDialog, setShowDialog] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    symbol: "",
    symbolArabic: "",
    symbolEnglish: "",
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
      toast.success(t("currencies.statusUpdates.created"));
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
      toast.success(t("currencies.statusUpdates.updated"));
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
      toast.success(t("currencies.statusUpdates.deleted"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ 
      name: "", 
      code: "", 
      symbol: "", 
      symbolArabic: "", 
      symbolEnglish: "", 
      isDefault: false 
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error(t("currencies.errors.requiredFields"));
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
      symbolArabic: currency.symbolArabic || "",
      symbolEnglish: currency.symbolEnglish || "",
      isDefault: currency.isDefault,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ 
      title: t("currencies.deleteDialog.title"), 
      description: t("currencies.deleteDialog.description"),
      variant: "destructive",
      confirmText: t("currencies.deleteDialog.confirmText")
    })) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title={t("currencies.pageTitle")}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("currencies.pageTitle")}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t("currencies.pageTitle")}</h1>
            <p className="text-muted-foreground">{t("currencies.subtitle")}</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingCurrency(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> {t("currencies.addCurrency")}
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("currencies.code")}</TableHead>
                <TableHead>{t("currencies.symbols")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t("currencies.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map((currency: Currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.name}</TableCell>
                    <TableCell>{currency.code}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {currency.symbolArabic && <Badge variant="outline">{currency.symbolArabic}</Badge>}
                        {currency.symbolEnglish && <Badge variant="outline">{currency.symbolEnglish}</Badge>}
                        {!currency.symbolArabic && !currency.symbolEnglish && <span>{currency.symbol}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {currency.isDefault && (
                        <Badge className="bg-green-500">{t("common.default")}</Badge>
                      )}
                      {!currency.isActive && (
                        <Badge variant="secondary">{t("common.inactive")}</Badge>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCurrency ? t("currencies.edit") : t("currencies.add")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.name")} *</Label>
                <Input
                  placeholder="US Dollar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("currencies.code")} *</Label>
                <Input
                  placeholder={t("currencies.codePlaceholder")}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("currencies.arabicSymbol")}</Label>
                <Input
                  placeholder="د.ت"
                  value={formData.symbolArabic}
                  onChange={(e) => setFormData({ ...formData, symbolArabic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("currencies.englishSymbol")}</Label>
                <Input
                  placeholder={t("currencies.symbolPlaceholder")}
                  value={formData.symbolEnglish}
                  onChange={(e) => setFormData({ ...formData, symbolEnglish: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("currencies.defaultSymbol")}</Label>
              <Input
                placeholder={currencySymbol}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground">{t("currencies.symbolFallbackHint")}</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                className="h-4 w-4"
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <Label htmlFor="isDefault">{t("currencies.setDefault")}</Label>
            </div>
            <Button onClick={handleSubmit} className="w-full mt-2">
              {editingCurrency ? t("currencies.update") : t("currencies.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default CurrenciesSettings;
