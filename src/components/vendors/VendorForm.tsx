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
  Building2, 
  Briefcase, 
  MapPin, 
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  RotateCcw
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import { toast } from "sonner";

const vendorSchema = z.object({
  name: z.string().min(2, "Vendor name is required"),
  owner: z.string().min(2, "Owner name is required"),
  phone: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  category: z.string().min(2, "Category is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  glAccount: z.string().optional(),
  emailOptOut: z.boolean().default(false),
  address: z.string().optional(),
  country: z.string().optional(),
  flatNo: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  coordinates: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  readonly onSubmit: (data: VendorFormValues) => void;
  readonly onCancel: () => void;
  readonly initialData?: any;
  readonly isPending?: boolean;
}

export function VendorForm({ onSubmit, onCancel, initialData, isPending }: VendorFormProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData || {
      owner: "Djo Abdo",
      name: "",
      category: "Software",
      glAccount: "Sales-Software",
      emailOptOut: false,
      country: "-None-",
      state: "-None-",
      email: "",
      phone: "",
      website: "",
      address: "",
      description: "",
      image: ""
    },
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await api.uploads.uploadAvatar(file);
      form.setValue("image", res.url);
      toast.success("Identity visual captured");
    } catch (error) {
      console.error("Vendor image sync failed:", error);
      toast.error("Vision system failure: Could not process image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAll = () => {
    form.reset({
      owner: "Djo Abdo",
      name: "",
      category: "Software",
      glAccount: "Sales-Software",
      emailOptOut: false,
      country: "-None-",
      state: "-None-",
      email: "",
      phone: "",
      website: "",
      address: "",
      description: "",
      image: ""
    });
    toast.info("Vendor profile purged");
  };

  const handleSubmit = (values: VendorFormValues) => {
    onSubmit(values);
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Image & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div variants={item}>
              <Card className="overflow-hidden border-none shadow-2xl bg-slate-900/50 backdrop-blur-xl">
                <CardContent className="p-0">
                  <div className="aspect-square bg-slate-800 flex flex-col items-center justify-center relative group">
                    {form.watch("image") ? (
                      <div className="relative w-full h-full group">
                        <img src={form.watch("image")} alt="Vendor" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button 
                             variant="destructive" 
                             size="icon" 
                             onClick={() => form.setValue("image", "")}
                             className="rounded-full"
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <div className={`h-20 w-20 rounded-2xl bg-slate-700/50 flex items-center justify-center ${isUploading ? 'animate-pulse' : ''}`}>
                          {isUploading ? <UploadCloud className="h-10 w-10 animate-bounce" /> : <ImageIcon className="h-10 w-10" />}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">{isUploading ? 'Syncing...' : 'Vendor Image'}</p>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer opacity-0" aria-label="Upload vendor image">
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item} className="space-y-4">
               <div className="flex items-center gap-3 px-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                     <Building2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Vendor Identity</h3>
               </div>
               
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Vendor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Global Systems Inc." className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Vendor Owner</FormLabel>
                    <FormControl>
                      <Input className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          {/* Right Column: Detailed Info & Address */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                     <Briefcase className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Strategic Information</h3>
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-white/5 h-12">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Logistics">Logistics</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="glAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">GL Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-white/5 h-12">
                          <SelectValue placeholder="Select Account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sales-Software">Sales-Software</SelectItem>
                        <SelectItem value="Procurement">Procurement</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@vendor.com" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://vendor.com" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailOptOut"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/5 p-4 bg-slate-900/20 mt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Email Opt Out
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
              <div className="md:col-span-2 flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                     <MapPin className="h-4 w-4 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Logistics & Location</h3>
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Country / Region</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-900/50 border-white/5 h-12">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="-None-">-None-</SelectItem>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="UAE">United Arab Emirates</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">City</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Strategic Way" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flatNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Building / Apt</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite 500" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Zip / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="94105" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinates"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Coordinates</FormLabel>
                    <FormControl>
                      <Input placeholder="37.7749° N, 122.4194° W" className="bg-slate-900/50 border-white/5 h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={item} className="pt-6 border-t border-white/5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Description Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Procurement notes and strategic alliance details..." 
                        className="bg-slate-900/50 border-white/5 min-h-[120px] resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          variants={item}
          initial="hidden"
          animate="show"
          className="flex items-center gap-4 pt-10 border-t border-white/5"
        >
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClearAll}
            className="px-6 h-12 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Clear All
          </Button>
          <div className="flex-1" />
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="px-8 h-12 text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="px-10 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
          >
            {isPending ? "Archiving..." : "Register Vendor"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
