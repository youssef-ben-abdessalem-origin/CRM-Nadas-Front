import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Trash2,
  MoreHorizontal,
  Eye,
  FileText,
  Send,
  Printer,
  Download,
  Copy,
  Search,
  X,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  DollarSign,
  FileSignature,
  ShoppingCart,
  Tag,
  Percent,
  CreditCard,
} from "lucide-react";
import api from "@/lib/api";
import { useProfileCurrency } from "@/hooks/useProfileCurrency";
import { toast } from "sonner";
import { format } from "date-fns";

// Types
interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

interface Quote {
  id: string;
  name: string;
  customerName?: string;
  customer?: string;
  amount: number;
  dueDate: string;
  notes?: string;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdAt?: string;
  items?: QuoteItem[];
}

const QuotesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    data: quotes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["quotes"],
    queryFn: () => api.billing.quotes.getAll(),
  });

  const [openAdd, setOpenAdd] = useState(false);
  const [detailQuote, setDetailQuote] = useState<Quote | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [form, setForm] = useState({
    name: "",
    customer: "",
    amount: "",
    dueDate: "",
    notes: "",
  });
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
    },
  ]);
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems((arr) => [
      ...arr,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ]);
  };

  const updateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    setItems((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const removeItem = (idx: number) => {
    setItems((arr) => arr.filter((_, i) => i !== idx));
  };

  const computeTotals = () => {
    let subtotal = 0;
    let tax = 0;
    for (const it of items) {
      const lineSubtotal = it.quantity * it.unitPrice - it.discount;
      const lineTax = (lineSubtotal * it.taxRate) / 100;
      subtotal += lineSubtotal;
      tax += lineTax;
    }
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onRowClick = (q: Quote) => {
    setDetailQuote(q);
    setOpenDetail(true);
  };

  const createQuote = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a quote name");
      return;
    }
    if (items.length === 0 || items.every((i) => !i.description.trim())) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsSubmitting(true);
    try {
      const totals = computeTotals();
      const payload = {
        name: form.name,
        customerName: form.customer,
        dueDate: form.dueDate,
        notes: form.notes,
        items: items.filter((i) => i.description.trim()),
        amount: totals.total,
        status: "draft",
      };
      await api.billing.quotes.create(payload);
      await refetch();
      setOpenAdd(false);
      resetForm();
      toast.success("Quote created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", customer: "", amount: "", dueDate: "", notes: "" });
    setItems([
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
      },
    ]);
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      await api.billing.quotes.update(quoteId, { status });
      await refetch();
      if (detailQuote && detailQuote.id === quoteId) {
        setDetailQuote({ ...detailQuote, status: status as any });
      }
      toast.success(`Quote ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const { currency: currencyInfo } = useProfileCurrency();
  const currencyCode = currencyInfo?.currency ?? "USD";
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(v);

  const totals = computeTotals();

  const filteredQuotes = quotes.filter((q: any) => {
    const text = [q.name, q.customerName || q.customer, q.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes((query || "").toLowerCase());
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Draft
          </Badge>
        );
      case "sent":
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            Sent
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700">
            Rejected
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <CRMLayout title="Quotes">
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
            <p className="text-muted-foreground text-sm">
              Manage and track your sales quotes
            </p>
          </div>
          <Button
            onClick={() => setOpenAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes by name, customer, or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Quotes Table */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">
              All Quotes
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredQuotes.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredQuotes && filteredQuotes.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[250px]">Quote Name</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((q: any) => (
                      <TableRow
                        key={q.id}
                        className="cursor-pointer hover:bg-muted/30 transition-colors group"
                        onClick={() => onRowClick(q)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <FileSignature className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span>{q.name || q.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(q.customerName || q.customer)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{q.customerName || q.customer || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt(Number(q.amount) || 0)}
                        </TableCell>
                        <TableCell>
                          {q.dueDate ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(q.dueDate), "MMM dd, yyyy")}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(q.status)}</TableCell>
                        <TableCell className="text-right">
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onRowClick(q)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send to Customer
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <FileSignature className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No quotes found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {query.trim()
                    ? "No quotes match your search criteria."
                    : "Get started by creating your first quote."}
                </p>
                {!query.trim() && (
                  <Button
                    variant="outline"
                    onClick={() => setOpenAdd(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quote
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Quote Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Quote</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a professional quote for your
              customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Quote Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., Q2024-001 - Website Development"
                    className="focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Customer
                  </Label>
                  <Input
                    id="customer"
                    name="customer"
                    value={form.customer}
                    onChange={handleChange}
                    placeholder="Customer name or company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-1">
                  Notes / Terms
                </Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any additional notes or terms for this quote..."
                />
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Line Items
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Item
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-4">Description</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Discount</div>
                  <div className="col-span-2 text-right">Tax (%)</div>
                  <div className="col-span-1 text-center"></div>
                </div>
                <div className="divide-y">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-4">
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(idx, "description", e.target.value)
                          }
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "quantity",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="h-9 text-sm text-center"
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "unitPrice",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="h-9 text-sm text-right"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.discount || ""}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "discount",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="h-9 text-sm text-right"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          placeholder="0"
                          value={item.taxRate || ""}
                          onChange={(e) =>
                            updateItem(
                              idx,
                              "taxRate",
                              Number(e.target.value) || 0,
                            )
                          }
                          className="h-9 text-sm text-right"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(idx)}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove item</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              {items.some((i) => i.quantity > 0 || i.unitPrice > 0) && (
                <div className="flex justify-end">
                  <div className="w-72 space-y-2 p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{fmt(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{fmt(totals.tax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-indigo-600">
                        {fmt(totals.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenAdd(false)}>
              Cancel
            </Button>
            <Button
              onClick={createQuote}
              disabled={isSubmitting || !form.name.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Quote
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quote Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Quote Details</DialogTitle>
              {detailQuote && getStatusBadge(detailQuote.status)}
            </div>
            <DialogDescription>
              Quote information and line items
            </DialogDescription>
          </DialogHeader>

          {detailQuote && (
            <div className="space-y-6">
              {/* Quote Header */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Quote Name
                    </p>
                    <p className="font-medium">{detailQuote.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Customer
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(
                            detailQuote.customerName || detailQuote.customer,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium">
                        {detailQuote.customerName ||
                          detailQuote.customer ||
                          "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Amount
                    </p>
                    <p className="font-semibold text-lg text-indigo-600">
                      {fmt(Number(detailQuote.amount) || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Due Date
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="font-medium">
                        {detailQuote.dueDate
                          ? format(new Date(detailQuote.dueDate), "PPP")
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                  {detailQuote.createdAt && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">
                        Created
                      </p>
                      <p className="text-sm">
                        {format(new Date(detailQuote.createdAt), "PPP")}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Notes
                    </p>
                    <p className="text-sm mt-0.5 whitespace-pre-wrap">
                      {detailQuote.notes || "No notes added"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              {detailQuote.items && detailQuote.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Line Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">
                            Unit Price
                          </TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                          <TableHead className="text-right">Tax</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailQuote.items.map((item, idx) => {
                          const lineTotal =
                            item.quantity * item.unitPrice -
                            item.discount +
                            (item.quantity * item.unitPrice - item.discount) *
                              (item.taxRate / 100);
                          return (
                            <TableRow key={idx}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {fmt(item.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                {fmt(item.discount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.taxRate}%
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {fmt(lineTotal)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" className="gap-1">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <div className="flex-1"></div>
                {detailQuote.status === "draft" && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 gap-1"
                      onClick={() =>
                        updateQuoteStatus(detailQuote.id, "accepted")
                      }
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        updateQuoteStatus(detailQuote.id, "rejected")
                      }
                    >
                      <AlertCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default QuotesPage;
  