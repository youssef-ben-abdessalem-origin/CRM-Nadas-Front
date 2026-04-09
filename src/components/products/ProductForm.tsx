import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, 
  Trash2,
  UploadCloud,
  Truck,
  Warehouse,
  User,
  Hash,
  Activity,
  Info,
  CalendarDays,
  Coins,
  ClipboardList,
  Image as ImageIcon,
  UserCheck
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  productCode: z.string().optional(),
  productOwner: z.string().default("Djo Abdo"),
  productActive: z.boolean().default(true),
  productCategory: z.string().optional(),
  vendorName: z.string().optional(),
  manufacturer: z.string().optional(),
  salesStartDate: z.string().optional(),
  salesEndDate: z.string().optional(),
  supportStartDate: z.string().optional(),
  supportEndDate: z.string().optional(),
  unitPrice: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  commissionRate: z.coerce.number().min(0).default(0),
  taxable: z.boolean().default(true),
  usageUnit: z.string().default("Box"),
  quantityInStock: z.coerce.number().min(0).default(0),
  handler: z.string().optional(),
  qtyOrdered: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  quantityInDemand: z.coerce.number().min(0).default(0),
  description: z.string().optional(),
  image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  formData: any;
  setFormData: (data: any) => void;
  categories?: any[];
  brands?: any[];
  productTypes?: any[];
}

export const ProductForm = ({ formData, setFormData, categories }: ProductFormProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.vendors.getAll().catch(() => []),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.employees.getAll().catch(() => []),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: formData || {
      productOwner: "Djo Abdo",
      productActive: true,
      usageUnit: "Box",
      taxable: true,
      unitPrice: 0,
      quantityInStock: 0,
    },
  });

  const handleChange = (name: keyof ProductFormValues, value: any) => {
    form.setValue(name, value);
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await api.uploads.uploadAvatar(file);
      handleChange("image", res.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Product image upload failed:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Form {...form}>
      <div className="space-y-8 pb-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Image & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-2xl bg-slate-900/50 backdrop-blur-xl group">
                <CardContent className="p-0">
                  <div className="aspect-square bg-slate-800 flex flex-col items-center justify-center relative group">
                    {form.watch("image") ? (
                      <div className="relative w-full h-full group">
                        <img src={form.watch("image")} alt="Product" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button 
                             variant="destructive" 
                             size="icon" 
                             onClick={() => handleChange("image", "")}
                             className="rounded-full shadow-lg"
                             type="button"
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-500 p-8 text-center">
                        <div className={`h-24 w-24 rounded-3xl bg-slate-700/50 flex items-center justify-center ${isUploading ? 'animate-pulse' : ''} border-2 border-dashed border-white/10 group-hover:border-primary/50 transition-all shadow-inner`}>
                          {isUploading ? <UploadCloud className="h-10 w-10 animate-bounce" /> : <ImageIcon className="h-10 w-10 group-hover:text-primary transition-colors" />}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Product Image'}</p>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer opacity-0" aria-label="Upload product image">
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item} className="space-y-4 pt-2">
               <div className="flex items-center gap-3 px-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                     <Info className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Basic Information</h3>
               </div>
               
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Product Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Product Name" 
                        className="bg-slate-900/50 border-white/10 h-12 rounded-xl focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" 
                        {...field} 
                        onChange={(e) => { field.onChange(e); handleChange("name", e.target.value); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Product Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SKU-001" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl font-mono text-xs" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("productCode", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-end pb-3 pl-2">
                      <div className="flex items-center space-x-2 bg-slate-900/40 p-3 rounded-xl border border-white/5 h-10 mt-auto hover:bg-slate-900/60 transition-colors cursor-pointer group">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => { field.onChange(checked); handleChange("productActive", checked); }}
                          />
                        </FormControl>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 cursor-pointer group-hover:text-slate-300">
                          Is Active
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="productOwner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Product Owner</FormLabel>
                    <Select 
                      onValueChange={(v) => { field.onChange(v); handleChange("productOwner", v); }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-slate-500" />
                            <SelectValue placeholder="Select Owner" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                        {employees?.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.user.name}>{emp.user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Additional Information */}
            <motion.div variants={item} className="space-y-6">
              <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                     <ClipboardList className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Additional Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Category</FormLabel>
                      <Select 
                        onValueChange={(v) => { field.onChange(v); handleChange("productCategory", v); }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                          <SelectItem value="-None-">-None-</SelectItem>
                          {categories?.map((c) => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Vendor Name</FormLabel>
                      <Select 
                        onValueChange={(v) => { field.onChange(v); handleChange("vendorName", v); }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-slate-500" />
                              <SelectValue placeholder="Select Vendor" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                          <SelectItem value="-None-">-None-</SelectItem>
                          {vendors?.map((v: any) => (
                            <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Manufacturer</FormLabel>
                      <Select 
                        onValueChange={(v) => { field.onChange(v); handleChange("manufacturer", v); }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                            <SelectValue placeholder="Select Manufacturer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                          <SelectItem value="-None-">-None-</SelectItem>
                          <SelectItem value="AltvetPet Inc.">AltvetPet Inc.</SelectItem>
                          <SelectItem value="LexPon Inc.">LexPon Inc.</SelectItem>
                          <SelectItem value="MetBeat Corp.">MetBeat Corp.</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                     <CalendarDays className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Important Dates</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/30 border border-white/5 shadow-inner">
                {[
                  { name: "salesStartDate", label: "Sales Start Date" },
                  { name: "salesEndDate", label: "Sales End Date" },
                  { name: "supportStartDate", label: "Support Start Date" },
                  { name: "supportEndDate", label: "Support End Date" }
                ].map((date) => (
                  <FormField
                    key={date.name}
                    control={form.control}
                    name={date.name as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{date.label}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            className="bg-transparent border-none h-8 p-0 text-[11px] font-bold text-slate-300 uppercase cursor-pointer focus:ring-0" 
                            {...field} 
                            onChange={(e) => { field.onChange(e); handleChange(date.name as any, e.target.value); }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </motion.div>

            {/* Price Information */}
            <motion.div variants={item} className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                     <Coins className="h-4 w-4 text-amber-500" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Price Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Unit Price (TND)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl font-bold text-amber-500 focus:border-amber-500/50" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("unitPrice", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Tax (%)</FormLabel>
                      <Select 
                        onValueChange={(v) => { field.onChange(v); handleChange("tax", v); }} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                            <SelectValue placeholder="Select Tax" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                          <SelectItem value="0">0% (None)</SelectItem>
                          <SelectItem value="5">5% (Reduced)</SelectItem>
                          <SelectItem value="10">10% (Standard-Low)</SelectItem>
                          <SelectItem value="15">15% (Standard-Mid)</SelectItem>
                          <SelectItem value="18">18% (Standard-High)</SelectItem>
                          <SelectItem value="20">20% (Max)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Commission Rate (TND)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("commissionRate", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="taxable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-white/5 p-4 bg-slate-900/20 max-w-xs group cursor-pointer hover:bg-slate-900/40 transition-colors">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => { field.onChange(checked); handleChange("taxable", checked); }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-500 transition-colors cursor-pointer">
                        Taxable
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </motion.div>

            {/* Stock Information */}
            <motion.div variants={item} className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                     <Warehouse className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Stock Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="usageUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Usage Unit</FormLabel>
                      <Select 
                        onValueChange={(v) => { field.onChange(v); handleChange("usageUnit", v); }} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-white/10 h-12 rounded-xl">
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-950 border-white/10 text-slate-300">
                          {["Box", "Carton", "Dozen", "Each", "Hour(s)", "Impressions", "Lb", "M", "Pack", "Pages", "Pieces", "Quantity", "Reams", "Sheet", "Spiral Binder", "Square Feet"].map(u => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantityInStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Quantity in Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl font-bold text-indigo-400 focus:border-indigo-500/50" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("quantityInStock", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="handler"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Handler</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Handler Name" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl font-medium" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("handler", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qtyOrdered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Qty Ordered</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("qtyOrdered", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Reorder Level</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("reorderLevel", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantityInDemand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Quantity in Demand</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="bg-slate-900/50 border-white/10 h-12 rounded-xl" 
                          {...field} 
                          onChange={(e) => { field.onChange(e); handleChange("quantityInDemand", e.target.value); }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={item} className="pt-6 border-t border-white/5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Product description and internal notes..." 
                        className="bg-slate-900/50 border-white/10 min-h-[140px] resize-none rounded-2xl p-5 text-slate-300 leading-relaxed focus:border-blue-500/50" 
                        {...field} 
                        onChange={(e) => { field.onChange(e); handleChange("description", e.target.value); }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </Form>
  );
};
