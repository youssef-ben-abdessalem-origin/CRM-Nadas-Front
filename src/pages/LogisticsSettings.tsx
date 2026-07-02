import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Truck, Percent, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LogisticsSettings() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingItem, setEditingItem] = useState<{ type: 'carrier' | 'tax', item: any } | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const { data: carriers = [], isLoading: carriersLoading } = useQuery({
    queryKey: ["carriers"],
    queryFn: api.settings.getCarriers,
  });

  const { data: taxClasses = [], isLoading: taxLoading } = useQuery({
    queryKey: ["tax-classes"],
    queryFn: api.products.getTaxClasses,
  });

  const carrierMutation = useMutation({
    mutationFn: (data: any) => data.id ? api.settings.updateCarrier(data.id, data) : api.settings.createCarrier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success(t("logistics.statusUpdates.carrierUpdated"));
      setShowDialog(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const taxMutation = useMutation({
    mutationFn: (data: any) => data.id ? api.products.updateTaxClass(data.id, data) : api.products.createTaxClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-classes"] });
      toast.success(t("logistics.statusUpdates.taxUpdated"));
      setShowDialog(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteCarrierMutation = useMutation({
    mutationFn: api.settings.deleteCarrier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success(t("logistics.statusUpdates.carrierRemoved"));
    },
  });

  const deleteTaxMutation = useMutation({
    mutationFn: api.products.deleteTaxClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-classes"] });
      toast.success(t("logistics.statusUpdates.taxRemoved"));
    },
  });

  const openEdit = (type: 'carrier' | 'tax', item: any = {}) => {
    setEditingItem({ type, item });
    setFormData(item);
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingItem?.type === 'carrier') {
      carrierMutation.mutate(formData);
    } else {
      taxMutation.mutate(formData);
    }
  };

  return (
    <CRMLayout title={t("logistics.pageTitle")}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><ChevronLeft /></Button>
          <div>
            <h1 className="text-2xl font-bold">{t("logistics.title")}</h1>
            <p className="text-muted-foreground">{t("logistics.subtitle")}</p>
          </div>
        </div>

        <Tabs defaultValue="carriers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="carriers">
              <Truck className="h-4 w-4 mr-2" /> {t("logistics.tabs.carriers")}
            </TabsTrigger>
            <TabsTrigger value="tax">
              <Percent className="h-4 w-4 mr-2" /> {t("logistics.tabs.tax")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carriers" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div>
                  <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">{t("logistics.carriers.title")}</CardTitle>
                </div>
                <Button size="sm" onClick={() => openEdit('carrier')}>
                   <Plus className="h-4 w-4 mr-2" /> {t("logistics.carriers.addNew")}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">{t("logistics.carriers.carrierName")}</TableHead>
                      <TableHead>{t("logistics.carriers.code")}</TableHead>
                      <TableHead>{t("logistics.carriers.trackingTemplate")}</TableHead>
                      <TableHead className="text-right pr-6">{t("logistics.carriers.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carriers.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6 font-bold">{c.name}</TableCell>
                        <TableCell><code className="bg-muted px-1 rounded text-[10px]">{c.code}</code></TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{c.trackingUrlTemplate}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit('carrier', c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCarrierMutation.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div>
                  <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">{t("logistics.tax.title")}</CardTitle>
                </div>
                <Button size="sm" onClick={() => openEdit('tax')}>
                   <Plus className="h-4 w-4 mr-2" /> {t("logistics.tax.addNew")}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">{t("logistics.tax.protocolName")}</TableHead>
                      <TableHead>{t("logistics.tax.taxRate")}</TableHead>
                      <TableHead className="text-right pr-6">{t("logistics.carriers.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxClasses.map((t: any) => (
                      <TableRow key={t.id}>
                        <TableCell className="pl-6 font-bold">{t.name}</TableCell>
                        <TableCell>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black text-xs">
                             {t.rate}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit('tax', t)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTaxMutation.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem?.item.id ? t("common.edit") : t("common.add")} {editingItem?.type === 'carrier' ? t("logistics.dialog.carrier") : t("logistics.dialog.taxProtocol")}</DialogTitle>
              <DialogDescription>{t("logistics.dialog.description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("logistics.dialog.labelName")}</Label>
                <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={editingItem?.type === 'carrier' ? t("logistics.dialog.placeholders.carrier") : t("logistics.dialog.placeholders.taxProtocol")} />
              </div>
              {editingItem?.type === 'carrier' ? (
                <>
                  <div className="space-y-2">
                    <Label>{t("logistics.dialog.carrierCode")}</Label>
                    <Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder={t("logistics.dialog.placeholders.code")} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("logistics.dialog.trackingUrlTemplate")}</Label>
                    <Input value={formData.trackingUrlTemplate || ''} onChange={(e) => setFormData({ ...formData, trackingUrlTemplate: e.target.value })} placeholder={t("logistics.dialog.placeholders.trackingTemplate")} />
                    <p className="text-[10px] text-muted-foreground">Use <code>{`{{trackingNumber}}`}</code> as a placeholder.</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>{t("logistics.dialog.rate")}</Label>
                  <Input type="number" value={formData.rate || ''} onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })} placeholder={t("logistics.dialog.placeholders.rate")} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave}>{t("logistics.dialog.saveRule")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
