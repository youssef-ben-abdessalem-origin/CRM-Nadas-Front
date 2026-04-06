import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const InvoicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: invoices = [], isLoading, refetch } = useQuery(["invoices"], api.billing.invoices.getAll);

  const [openAdd, setOpenAdd] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [form, setForm] = useState({ name: "", customer: "", amount: "", dueDate: "", notes: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onRowClick = (iv: any) => {
    setDetailInvoice(iv);
    setOpenDetail(true);
  };

  const createInvoice = async () => {
    try {
      await api.billing.invoices.create({ name: form.name, customerName: form.customer, amount: Number(form.amount) || 0, dueDate: form.dueDate, notes: form.notes });
      await refetch();
      setOpenAdd(false);
      setForm({ name: "", customer: "", amount: "", dueDate: "", notes: "" });
      toast.success("Invoice created");
    } catch {
      toast.error("Failed to create invoice");
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);

  return (
    <CRMLayout title="Invoices">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button variant="outline" onClick={() => setOpenAdd(true)}>
            <Plus className="mr-2" /> New Invoice
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading invoices...</div>
          ) : invoices && invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((iv: any) => (
              <TableRow key={iv.id} className="cursor-pointer" onClick={() => onRowClick(iv)}>
                    <TableCell className="font-medium">{iv.id || iv.name}</TableCell>
                    <TableCell>{iv.customerName || iv.customer || "—"}</TableCell>
                    <TableCell>{fmt(Number(iv.amount) || 0)}</TableCell>
                    <TableCell>{iv.dueDate ? new Date(iv.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{iv.notes || ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground">No invoices yet.</div>
          )}
        </CardContent>
      </Card>

      <Drawer open={openAdd} onOpenChange={setOpenAdd}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Create Invoice</DrawerTitle>
            <DrawerDescription>Enter details to create a new invoice.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 w-full max-w-md">
            <div>
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Invoice name" />
            </div>
            <div>
              <Label>Customer</Label>
              <Input name="customer" value={form.customer} onChange={handleChange} placeholder="Customer name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount</Label>
                <Input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="0.00" />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} rows={4} />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={createInvoice}>Create Invoice</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={openDetail} onOpenChange={setOpenDetail}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Invoice Details</DrawerTitle>
            <DrawerDescription>Overview of the selected invoice.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 p-2">
            {detailInvoice && (
              <>
                <div><strong>Name:</strong> {detailInvoice.name}</div>
                <div><strong>Customer:</strong> {detailInvoice.customerName || detailInvoice.customer}</div>
                <div><strong>Amount:</strong> {fmt(Number(detailInvoice.amount) || 0)}</div>
                <div><strong>Due Date:</strong> {detailInvoice.dueDate ? new Date(detailInvoice.dueDate).toLocaleDateString() : "—"}</div>
                <div><strong>Notes:</strong> {detailInvoice.notes || ""}</div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </CRMLayout>
  );
};

export default InvoicesPage;
