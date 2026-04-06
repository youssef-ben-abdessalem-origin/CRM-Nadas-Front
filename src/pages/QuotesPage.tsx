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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const QuotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: quotes = [], isLoading, refetch } = useQuery({ queryKey: ["quotes"], queryFn: () => api.billing.quotes.getAll() });

  const [openAdd, setOpenAdd] = useState(false);
  const [detailQuote, setDetailQuote] = useState<any | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [form, setForm] = useState({ name: "", customer: "", amount: "", dueDate: "", notes: "" });
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onRowClick = (q: any) => {
    setDetailQuote(q);
    setOpenDetail(true);
  };

  const createQuote = async () => {
    try {
      // Basic payload; backend should accept these fields
      await api.billing.quotes.create({ name: form.name, customerName: form.customer, amount: Number(form.amount) || 0, dueDate: form.dueDate, notes: form.notes });
      await refetch();
      setOpenAdd(false);
      setForm({ name: "", customer: "", amount: "", dueDate: "", notes: "" });
      toast.success("Quote created");
    } catch {
      toast.error("Failed to create quote");
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);

  // Derived filtered quotes based on search query
  const filteredQuotes = quotes.filter((q: any) => {
    const text = [q.name, q.customerName || q.customer, q.notes].filter(Boolean).join(" ").toLowerCase();
    return text.includes((query || "").toLowerCase());
  });

  return (
    <CRMLayout title="Quotes">
      <div className="p-4">
        <Input
          placeholder="Search quotes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-72"
        />
      </div>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Quotes</CardTitle>
          <Button variant="outline" onClick={() => setOpenAdd(true)}>
            <Plus className="mr-2" /> New Quote
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading quotes...</div>
          ) : filteredQuotes && filteredQuotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((q: any) => (
                  <TableRow key={q.id} className="cursor-pointer" onClick={() => onRowClick(q)}>
                    <TableCell className="font-medium">{q.name || q.id}</TableCell>
                    <TableCell>{q.customerName || q.customer || "—"}</TableCell>
                    <TableCell>{fmt(Number(q.amount) || 0)}</TableCell>
                    <TableCell>{q.dueDate ? new Date(q.dueDate).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>{q.notes || ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground">{query.trim() ? "No quotes match your search." : "No quotes yet."}</div>
          )}
        </CardContent>
      </Card>

        <Drawer open={openAdd} onOpenChange={setOpenAdd}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Create Quote</DrawerTitle>
            <DrawerDescription>Enter details to create a new quote.</DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-4 w-full max-w-md">
            <div>
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Quote name" />
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
            <Button onClick={createQuote}>Create Quote</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      <Drawer open={openDetail} onOpenChange={setOpenDetail}>
        <DrawerContent className="h-screen w-full md:w-[720px] md:max-w-[720px] lg:w-[860px] lg:max-w-[860px] xl:w-[1000px] xl:max-w-[1000px] p-6 overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Quote Details</DrawerTitle>
            <DrawerDescription>Overview of the selected quote.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2 p-2">
            {detailQuote && (
              <>
                <div><strong>Name:</strong> {detailQuote.name}</div>
                <div><strong>Customer:</strong> {detailQuote.customerName || detailQuote.customer}</div>
                <div><strong>Amount:</strong> {fmt(Number(detailQuote.amount) || 0)}</div>
                <div><strong>Due Date:</strong> {detailQuote.dueDate ? new Date(detailQuote.dueDate).toLocaleDateString() : "—"}</div>
                <div><strong>Notes:</strong> {detailQuote.notes || ""}</div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </CRMLayout>
  );
};

export default QuotesPage;
