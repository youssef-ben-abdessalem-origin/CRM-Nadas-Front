import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CRMLayout } from "@/components/CRMLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";
import { useTranslation } from "react-i18next";

type LocalOrder = {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status: string;
  notes?: string;
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [openAdd, setOpenAdd] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setOpenAdd(true);
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const [draft, setDraft] = useState({ customer: "", amount: "", notes: "" });
  const [detailOrder, setDetailOrder] = useState<LocalOrder | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("orders");
    if (raw) setOrders(JSON.parse(raw));
  }, []);

  const save = (list: LocalOrder[]) => {
  const { t } = useTranslation();
    localStorage.setItem("orders", JSON.stringify(list));
    setOrders(list);
  };

  const onRowClick = (o: LocalOrder) => {
    setDetailOrder(o);
    setOpenDetail(true);
  };

  const addOrder = () => {
    if (!draft.customer || !draft.amount) return;
    const newOrder: LocalOrder = {
      id: `ORD-${Date.now()}`,
      customer: draft.customer,
      amount: Number(draft.amount),
      date: new Date().toISOString(),
      status: t("orders.statusNew"),
      notes: draft.notes,
    };
    save([newOrder, ...orders]);
    setDraft({ customer: "", amount: "", notes: "" });
    setOpenAdd(false);
  };

  return (
    <CRMLayout title={t("orders.pageTitle")}>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>{t("orders.title")}</CardTitle>
          <button onClick={() => setOpenAdd(true)} className="inline-flex items-center px-3 py-2 rounded bg-primary text-white">
            <Plus className="mr-2" /> {t("orders.newOrder")}
          </button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orders.orderId")}</TableHead>
                <TableHead>{t("orders.customer")}</TableHead>
                <TableHead>{t("orders.amount")}</TableHead>
                <TableHead>{t("orders.date")}</TableHead>
                <TableHead>{t("orders.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer" onClick={() => onRowClick(o)}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell>
                    <CurrencyNumbers amount={o.amount} />
                  </TableCell>
                  <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                  <TableCell>{o.status}</TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">No orders yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Drawer open={openAdd} onOpenChange={setOpenAdd}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Create Order</DrawerTitle>
            <DrawerDescription>Enter details to create a new order.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 w-full max-w-md">
            <div>
              <Label>{t("orders.customer")}</Label>
              <Input value={draft.customer} onChange={(e) => setDraft((d) => ({ ...d, customer: e.target.value }))} placeholder={t("orders.placeholders.customer")} />
            </div>
            <div>
              <Label>{t("orders.amount")}</Label>
              <Input type="number" value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} placeholder="Notes" />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={addOrder}>Add Order</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={openDetail} onOpenChange={setOpenDetail}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>{t("orders.orderDetails")}</DrawerTitle>
            <DrawerDescription>Overview of the selected order.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 p-2">
            {detailOrder && (
              <>
                <div><strong>Order ID:</strong> {detailOrder.id}</div>
                <div><strong>Customer:</strong> {detailOrder.customer}</div>
                <div><strong>Amount:</strong> <CurrencyNumbers amount={detailOrder.amount} /></div>
                <div><strong>Date:</strong> {new Date(detailOrder.date).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {detailOrder.status}</div>
                {detailOrder.notes && <div><strong>Notes:</strong> {detailOrder.notes}</div>}
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </CRMLayout>
  );
};

export default OrdersPage;
