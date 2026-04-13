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

export default function LogisticsSettings() {
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
      toast.success("Carrier updated successfully");
      setShowDialog(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const taxMutation = useMutation({
    mutationFn: (data: any) => data.id ? api.products.updateTaxClass(data.id, data) : api.products.createTaxClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-classes"] });
      toast.success("Tax setting updated successfully");
      setShowDialog(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteCarrierMutation = useMutation({
    mutationFn: api.settings.deleteCarrier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      toast.success("Carrier removed");
    },
  });

  const deleteTaxMutation = useMutation({
    mutationFn: api.products.deleteTaxClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-classes"] });
      toast.success("Tax setting removed");
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
    <CRMLayout title="Logistics & Tax Settings">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}><ChevronLeft /></Button>
          <div>
            <h1 className="text-2xl font-bold">Logistics & Financials</h1>
            <p className="text-muted-foreground">Manage shipping carriers and global tax configurations</p>
          </div>
        </div>

        <Tabs defaultValue="carriers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="carriers">
              <Truck className="h-4 w-4 mr-2" /> Carriers
            </TabsTrigger>
            <TabsTrigger value="tax">
              <Percent className="h-4 w-4 mr-2" /> Tax Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carriers" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div>
                  <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Shipping Carriers</CardTitle>
                </div>
                <Button size="sm" onClick={() => openEdit('carrier')}>
                   <Plus className="h-4 w-4 mr-2" /> New Carrier
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Carrier Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Tracking Template</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
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
                  <CardTitle className="text-sm uppercase tracking-widest font-bold text-muted-foreground">Tax Classes</CardTitle>
                </div>
                <Button size="sm" onClick={() => openEdit('tax')}>
                   <Plus className="h-4 w-4 mr-2" /> New Tax Protocol
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Protocol Name</TableHead>
                      <TableHead>Tax Rate (%)</TableHead>
                      <TableHead className="text-right pr-6">Actions</TableHead>
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
              <DialogTitle>{editingItem?.item.id ? 'Edit' : 'Add'} {editingItem?.type === 'carrier' ? 'Carrier' : 'Tax Protocol'}</DialogTitle>
              <DialogDescription>Define your logistics and financial rules here.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Label / Name</Label>
                <Input value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={editingItem?.type === 'carrier' ? 'e.g. Aramex' : 'e.g. Standard VAT'} />
              </div>
              {editingItem?.type === 'carrier' ? (
                <>
                  <div className="space-y-2">
                    <Label>Carrier Code</Label>
                    <Input value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. ARAMEX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tracking URL Template</Label>
                    <Input value={formData.trackingUrlTemplate || ''} onChange={(e) => setFormData({ ...formData, trackingUrlTemplate: e.target.value })} placeholder="https://.../{{trackingNumber}}" />
                    <p className="text-[10px] text-muted-foreground">Use <code>{`{{trackingNumber}}`}</code> as a placeholder.</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>Rate (%)</Label>
                  <Input type="number" value={formData.rate || ''} onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })} placeholder="e.g. 19" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
