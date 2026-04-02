import { CRMLayout } from "@/components/CRMLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Edit,
  Trash2,
  Copy,
  ArrowUpRight,
  Minus,
  Layers,
  Tag,
  Hash,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ProductCategory =
  | "Software"
  | "Hardware"
  | "Service"
  | "Subscription"
  | "Support"
  | "Training"
  | "Other";
type ProductStatus = "active" | "draft" | "discontinued";
type PricingModel = "one-time" | "subscription" | "usage-based" | "tiered";

interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category: ProductCategory;
  status: ProductStatus;
  pricingModel: PricingModel;
  unitPrice: number;
  cost: number;
  margin: number;
  currency: string;
  stock: number;
  reorderLevel: number;
  unit: string;
  taxRate: number;
  tags: string[];
  created: string;
  lastUpdated: string;
  totalSold: number;
  totalRevenue: number;
  relatedProducts: number[];
}

const categoryConfig: Record<ProductCategory, { label: string; color: string }> = {
  Software: { label: "Software", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  Hardware: { label: "Hardware", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
  Service: { label: "Service", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  Subscription: { label: "Subscription", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  Support: { label: "Support", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  Training: { label: "Training", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  Other: { label: "Other", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

const statusConfig: Record<ProductStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  draft: { label: "Draft", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertTriangle },
  discontinued: { label: "Discontinued", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
};

const pricingConfig: Record<PricingModel, { label: string; color: string }> = {
  "one-time": { label: "One-Time", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  subscription: { label: "Subscription", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  "usage-based": { label: "Usage-Based", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  tiered: { label: "Tiered", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Enterprise Cloud Platform",
    sku: "ECP-001",
    description: "Full-featured cloud infrastructure platform with enterprise-grade security, auto-scaling, and 99.99% SLA.",
    category: "Software",
    status: "active",
    pricingModel: "subscription",
    unitPrice: 4999,
    cost: 1200,
    margin: 76,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["cloud", "enterprise", "platform"],
    created: "2023-01-15",
    lastUpdated: "2024-01-10",
    totalSold: 45,
    totalRevenue: 2699460,
    relatedProducts: [3, 5],
  },
  {
    id: 2,
    name: "API Gateway Pro",
    sku: "AGP-002",
    description: "High-performance API gateway with rate limiting, authentication, and analytics.",
    category: "Software",
    status: "active",
    pricingModel: "usage-based",
    unitPrice: 0.01,
    cost: 0.003,
    margin: 70,
    currency: "USD",
    stock: 999999,
    reorderLevel: 0,
    unit: "per request",
    taxRate: 0,
    tags: ["api", "gateway", "microservices"],
    created: "2023-03-20",
    lastUpdated: "2024-01-08",
    totalSold: 125,
    totalRevenue: 187500,
    relatedProducts: [1, 4],
  },
  {
    id: 3,
    name: "Premium Support Plan",
    sku: "PSP-003",
    description: "24/7 dedicated support with 1-hour response time, dedicated account manager, and quarterly reviews.",
    category: "Support",
    status: "active",
    pricingModel: "subscription",
    unitPrice: 2500,
    cost: 800,
    margin: 68,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["support", "premium", "sla"],
    created: "2023-02-01",
    lastUpdated: "2024-01-05",
    totalSold: 38,
    totalRevenue: 1140000,
    relatedProducts: [1, 6],
  },
  {
    id: 4,
    name: "Data Analytics Suite",
    sku: "DAS-004",
    description: "Comprehensive data analytics platform with real-time dashboards, ML-powered insights, and custom reporting.",
    category: "Software",
    status: "active",
    pricingModel: "tiered",
    unitPrice: 1999,
    cost: 400,
    margin: 80,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["analytics", "data", "ml"],
    created: "2023-05-10",
    lastUpdated: "2024-01-12",
    totalSold: 62,
    totalRevenue: 1488258,
    relatedProducts: [1, 2],
  },
  {
    id: 5,
    name: "Onboarding & Training Package",
    sku: "OTP-005",
    description: "Comprehensive onboarding program including setup assistance, team training, and best practices documentation.",
    category: "Training",
    status: "active",
    pricingModel: "one-time",
    unitPrice: 15000,
    cost: 5000,
    margin: 67,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "package",
    taxRate: 0,
    tags: ["training", "onboarding", "consulting"],
    created: "2023-04-01",
    lastUpdated: "2023-12-20",
    totalSold: 28,
    totalRevenue: 420000,
    relatedProducts: [1, 3],
  },
  {
    id: 6,
    name: "Security Compliance Module",
    sku: "SCM-006",
    description: "HIPAA, SOC2, and GDPR compliance module with automated audits, encryption, and access controls.",
    category: "Software",
    status: "active",
    pricingModel: "subscription",
    unitPrice: 3500,
    cost: 900,
    margin: 74,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["security", "compliance", "hipaa"],
    created: "2023-06-15",
    lastUpdated: "2024-01-11",
    totalSold: 22,
    totalRevenue: 924000,
    relatedProducts: [1, 3],
  },
  {
    id: 7,
    name: "Custom Integration Service",
    sku: "CIS-007",
    description: "Professional services for custom integrations with existing systems, ERP, CRM, and legacy applications.",
    category: "Service",
    status: "active",
    pricingModel: "one-time",
    unitPrice: 25000,
    cost: 12000,
    margin: 52,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "project",
    taxRate: 0,
    tags: ["integration", "custom", "professional-services"],
    created: "2023-07-01",
    lastUpdated: "2024-01-09",
    totalSold: 15,
    totalRevenue: 375000,
    relatedProducts: [1, 5],
  },
  {
    id: 8,
    name: "Starter Plan",
    sku: "STP-008",
    description: "Entry-level cloud platform for small teams. Includes 5 users, 100GB storage, and basic support.",
    category: "Subscription",
    status: "active",
    pricingModel: "subscription",
    unitPrice: 299,
    cost: 80,
    margin: 73,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["starter", "small-business", "entry"],
    created: "2023-08-01",
    lastUpdated: "2024-01-07",
    totalSold: 156,
    totalRevenue: 559764,
    relatedProducts: [3, 5],
  },
  {
    id: 9,
    name: "Edge Computing Node",
    sku: "ECN-009",
    description: "Physical edge computing hardware for low-latency processing at the network edge.",
    category: "Hardware",
    status: "active",
    pricingModel: "one-time",
    unitPrice: 8500,
    cost: 4200,
    margin: 51,
    currency: "USD",
    stock: 45,
    reorderLevel: 10,
    unit: "unit",
    taxRate: 0,
    tags: ["hardware", "edge", "iot"],
    created: "2023-09-15",
    lastUpdated: "2024-01-06",
    totalSold: 32,
    totalRevenue: 272000,
    relatedProducts: [1, 2],
  },
  {
    id: 10,
    name: "Legacy Migration Tool",
    sku: "LMT-010",
    description: "Automated tool for migrating legacy systems to modern cloud infrastructure.",
    category: "Software",
    status: "discontinued",
    pricingModel: "one-time",
    unitPrice: 12000,
    cost: 3000,
    margin: 75,
    currency: "USD",
    stock: 0,
    reorderLevel: 0,
    unit: "license",
    taxRate: 0,
    tags: ["migration", "legacy", "deprecated"],
    created: "2022-06-01",
    lastUpdated: "2023-10-01",
    totalSold: 18,
    totalRevenue: 216000,
    relatedProducts: [],
  },
  {
    id: 11,
    name: "Advanced Monitoring Pack",
    sku: "AMP-011",
    description: "Real-time infrastructure monitoring with alerting, log aggregation, and incident management.",
    category: "Software",
    status: "active",
    pricingModel: "subscription",
    unitPrice: 1500,
    cost: 300,
    margin: 80,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["monitoring", "alerting", "observability"],
    created: "2023-10-01",
    lastUpdated: "2024-01-13",
    totalSold: 41,
    totalRevenue: 738000,
    relatedProducts: [1, 4],
  },
  {
    id: 12,
    name: "AI/ML Accelerator",
    sku: "AIM-012",
    description: "Pre-built ML models and pipelines for common business use cases: forecasting, classification, and anomaly detection.",
    category: "Software",
    status: "draft",
    pricingModel: "subscription",
    unitPrice: 5000,
    cost: 1500,
    margin: 70,
    currency: "USD",
    stock: 999,
    reorderLevel: 0,
    unit: "license/month",
    taxRate: 0,
    tags: ["ai", "ml", "accelerator"],
    created: "2024-01-01",
    lastUpdated: "2024-01-14",
    totalSold: 0,
    totalRevenue: 0,
    relatedProducts: [4, 6],
  },
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPricing, setFilterPricing] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "Software" as ProductCategory,
    status: "active" as ProductStatus,
    pricingModel: "one-time" as PricingModel,
    unitPrice: "",
    cost: "",
    stock: "",
    reorderLevel: "",
    unit: "license/month",
    taxRate: "0",
    tags: "",
  });

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    const matchesPricing = filterPricing === "all" || p.pricingModel === filterPricing;
    return matchesSearch && matchesCategory && matchesStatus && matchesPricing;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    totalRevenue: products.reduce((sum, p) => sum + p.totalRevenue, 0),
    avgMargin:
      products.filter((p) => p.margin > 0).length > 0
        ? Math.round(
            products.reduce((sum, p) => sum + p.margin, 0) /
              products.filter((p) => p.margin > 0).length
          )
        : 0,
    totalSold: products.reduce((sum, p) => sum + p.totalSold, 0),
    lowStock: products.filter(
      (p) => p.stock > 0 && p.stock <= p.reorderLevel
    ).length,
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      category: "Software",
      status: "active",
      pricingModel: "one-time",
      unitPrice: "",
      cost: "",
      stock: "",
      reorderLevel: "",
      unit: "license/month",
      taxRate: "0",
      tags: "",
    });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      status: product.status,
      pricingModel: product.pricingModel,
      unitPrice: product.unitPrice.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      reorderLevel: product.reorderLevel.toString(),
      unit: product.unit,
      taxRate: product.taxRate.toString(),
      tags: product.tags.join(", "),
    });
    setShowEdit(true);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.sku) {
      toast.error("Please fill in required fields");
      return;
    }
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const cost = parseFloat(formData.cost) || 0;
    const product: Product = {
      id: Math.max(...products.map((p) => p.id)) + 1,
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      pricingModel: formData.pricingModel,
      unitPrice,
      cost,
      margin: unitPrice > 0 ? Math.round(((unitPrice - cost) / unitPrice) * 100) : 0,
      currency: "USD",
      stock: parseInt(formData.stock) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 0,
      unit: formData.unit,
      taxRate: parseFloat(formData.taxRate) || 0,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      created: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      totalSold: 0,
      totalRevenue: 0,
      relatedProducts: [],
    };
    setProducts((prev) => [product, ...prev]);
    toast.success(`Product ${product.name} created`);
    setShowAdd(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editingProduct || !formData.name) return;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const cost = parseFloat(formData.cost) || 0;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name,
              sku: formData.sku,
              description: formData.description,
              category: formData.category,
              status: formData.status,
              pricingModel: formData.pricingModel,
              unitPrice,
              cost,
              margin: unitPrice > 0 ? Math.round(((unitPrice - cost) / unitPrice) * 100) : 0,
              stock: parseInt(formData.stock) || 0,
              reorderLevel: parseInt(formData.reorderLevel) || 0,
              unit: formData.unit,
              taxRate: parseFloat(formData.taxRate) || 0,
              tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : p
      )
    );
    toast.success(`Product ${formData.name} updated`);
    setShowEdit(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleDelete = (product: Product) => {
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    toast.info(`Product ${product.name} deleted`);
    setShowDetail(false);
    setSelectedProduct(null);
  };

  const ProductForm = ({ onSubmit }: { onSubmit: () => void }) => {
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const cost = parseFloat(formData.cost) || 0;
    const margin = unitPrice > 0 ? Math.round(((unitPrice - cost) / unitPrice) * 100) : 0;

    return (
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enterprise Cloud Platform"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>
              SKU <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="ECP-001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) =>
                setFormData({ ...formData, category: v as ProductCategory })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Subscription">Subscription</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) =>
                setFormData({ ...formData, status: v as ProductStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pricing Model</Label>
            <Select
              value={formData.pricingModel}
              onValueChange={(v) =>
                setFormData({ ...formData, pricingModel: v as PricingModel })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">One-Time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="usage-based">Usage-Based</SelectItem>
                <SelectItem value="tiered">Tiered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Input
              placeholder="license/month"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Unit Price</Label>
            <Input
              type="number"
              placeholder="4999"
              value={formData.unitPrice}
              onChange={(e) =>
                setFormData({ ...formData, unitPrice: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Cost</Label>
            <Input
              type="number"
              placeholder="1200"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Stock</Label>
            <Input
              type="number"
              placeholder="999"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Reorder Level</Label>
            <Input
              type="number"
              placeholder="10"
              value={formData.reorderLevel}
              onChange={(e) =>
                setFormData({ ...formData, reorderLevel: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.taxRate}
              onChange={(e) =>
                setFormData({ ...formData, taxRate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input
              placeholder="cloud, enterprise, platform"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>
        </div>

        {margin > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Calculated Margin</span>
              <span className={`font-semibold ${margin >= 70 ? "text-green-500" : margin >= 50 ? "text-amber-500" : "text-red-500"}`}>
                {margin}%
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Product description..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="resize-none"
            rows={3}
          />
        </div>
      </div>
    );
  };

  return (
    <CRMLayout title="Products">
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Package className="h-3 w-3 inline mr-1" />
                In catalog
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for sale
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <DollarSign className="h-3 w-3 inline mr-1" />
                All time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Avg Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats.avgMargin}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                Gross margin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Units Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalSold)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <ShoppingCart className="h-3 w-3 inline mr-1" />
                Total sales
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {stats.lowStock}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Need reorder
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-72 pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Subscription">Subscription</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPricing} onValueChange={setFilterPricing}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Pricing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pricing</SelectItem>
                <SelectItem value="one-time">One-Time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="usage-based">Usage-Based</SelectItem>
                <SelectItem value="tiered">Tiered</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setShowAdd(true); }}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowDetail(true);
                  }}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {product.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      <Hash className="h-3 w-3 mr-1" />
                      {product.sku}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={categoryConfig[product.category].color}
                    >
                      {categoryConfig[product.category].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={pricingConfig[product.pricingModel].color}
                    >
                      {pricingConfig[product.pricingModel].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusConfig[product.status].color}
                    >
                      {statusConfig[product.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {product.pricingModel === "usage-based"
                      ? `$${product.unitPrice.toFixed(2)} / req`
                      : formatCurrency(product.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-medium ${product.margin >= 70 ? "text-green-500" : product.margin >= 50 ? "text-amber-500" : "text-red-500"}`}
                    >
                      {product.margin}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {product.stock > 0 && product.stock <= product.reorderLevel ? (
                      <div className="flex items-center justify-end gap-1 text-amber-500">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span className="font-medium">{product.stock}</span>
                      </div>
                    ) : product.status === "discontinued" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className="font-medium">{product.stock}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.totalSold}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info(`Creating quote for ${product.name}`);
                        }}
                      >
                        <Receipt className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(product);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Copied ${product.name}`);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.info(`Viewing ${product.name} details`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedProduct && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-xl">
                        {selectedProduct.name}
                      </DialogTitle>
                      <DialogDescription className="flex items-center gap-2 mt-1">
                        <Hash className="h-3 w-3" />
                        {selectedProduct.sku}
                        <span className="mx-1">·</span>
                        {selectedProduct.unit}
                      </DialogDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={statusConfig[selectedProduct.status].color}
                      >
                        {statusConfig[selectedProduct.status].label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={categoryConfig[selectedProduct.category].color}
                      >
                        {categoryConfig[selectedProduct.category].label}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Pricing
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit Price</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedProduct.unitPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost</span>
                        <span>{formatCurrency(selectedProduct.cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Margin</span>
                        <span
                          className={`font-semibold ${selectedProduct.margin >= 70 ? "text-green-500" : selectedProduct.margin >= 50 ? "text-amber-500" : "text-red-500"}`}
                        >
                          {selectedProduct.margin}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pricing Model</span>
                        <Badge
                          variant="outline"
                          className={pricingConfig[selectedProduct.pricingModel].color}
                        >
                          {pricingConfig[selectedProduct.pricingModel].label}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax Rate</span>
                        <span>{selectedProduct.taxRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" /> Performance
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Revenue</span>
                        <span className="font-semibold text-green-500">
                          {formatCurrency(selectedProduct.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Units Sold</span>
                        <span>{selectedProduct.totalSold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className={selectedProduct.stock <= selectedProduct.reorderLevel && selectedProduct.stock > 0 ? "text-amber-500 font-medium" : ""}>
                          {selectedProduct.stock} {selectedProduct.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reorder Level</span>
                        <span>{selectedProduct.reorderLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProduct.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4" /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduct.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created</span>
                    <p>{formatDate(selectedProduct.created)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated</span>
                    <p>{formatDate(selectedProduct.lastUpdated)}</p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEdit(selectedProduct)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.info(`Creating quote for ${selectedProduct.name}`);
                    }}
                  >
                    <Receipt className="h-4 w-4 mr-2" /> Create Quote
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(selectedProduct)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new product.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleAdd} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" /> Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update product information.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSubmit={handleEdit} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default Products;
