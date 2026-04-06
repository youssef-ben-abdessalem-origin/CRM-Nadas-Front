import React, { useState, useEffect } from "react";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type LocalPayment = {
  id: string;
  to: string;
  amount: number;
  date: string;
  status: string;
};

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<LocalPayment[]>([]);
  const [form, setForm] = useState({ to: "", amount: "" });
  const [open, setOpen] = useState(false);
  const [detailPayment, setDetailPayment] = useState<LocalPayment | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("payments");
    if (raw) setPayments(JSON.parse(raw));
  }, []);

  const save = (list: LocalPayment[]) => {
    localStorage.setItem("payments", JSON.stringify(list));
    setPayments(list);
  };

  const onRowClick = (p: LocalPayment) => {
    setDetailPayment(p);
    setOpenDetail(true);
  };

  const addPayment = () => {
    if (!form.to || !form.amount) return;
    const p: LocalPayment = {
      id: `PAY-${Date.now()}`,
      to: form.to,
      amount: Number(form.amount),
      date: new Date().toISOString(),
      status: "Completed",
    };
    save([p, ...payments]);
    setForm({ to: "", amount: "" });
    setOpen(false);
  };

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  return (
    <CRMLayout title="Payments">
      <h2 className="text-lg font-semibold mb-4">Payments</h2>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Client payments history is stored locally for by-view UX.</span>
        <button onClick={() => setOpen(true)} className="inline-flex items-center px-3 py-2 rounded bg-primary text-white">
          <Plus className="mr-2" /> New Payment
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">To</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-6 py-4">{p.id}</td>
                <td className="px-6 py-4">{p.to}</td>
                <td className="px-6 py-4">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(p.amount)}</td>
                <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">{p.status}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-4 text-muted-foreground">No payments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>New Payment</DrawerTitle>
            <DrawerDescription>Enter details to create a new payment.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 w-full max-w-md p-2">
            <div>
              <Label>To</Label>
              <Input value={form.to} onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} placeholder="Customer name" />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={addPayment}>Add</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={openDetail} onOpenChange={setOpenDetail}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Payment Details</DrawerTitle>
            <DrawerDescription>Overview of the selected payment.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 p-2">
            {detailPayment && (
              <>
                <div><strong>ID:</strong> {detailPayment.id}</div>
                <div><strong>To:</strong> {detailPayment.to}</div>
                <div><strong>Amount:</strong> {fmt(detailPayment.amount)}</div>
                <div><strong>Date:</strong> {new Date(detailPayment.date).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {detailPayment.status}</div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </CRMLayout>
  );
};

export default PaymentsPage;
