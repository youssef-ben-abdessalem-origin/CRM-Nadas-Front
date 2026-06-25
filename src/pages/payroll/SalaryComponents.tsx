import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, SalaryComponent } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, Settings } from "lucide-react";

const PROTECTED_COMPONENT_CODES = new Set([
  "BASIC_SALARY",
  "GROSS_SALARY",
  "BASE_SALARY",
  "CNSS_EMPLOYEE",
  "CNSS",
  "INCOME_TAX",
  "IRPP",
  "CNSS_EMPLOYER",
  "TRAINING_TAX",
  "TFP",
  "FOPROLOS",
  "WORK_ACCIDENT",
  "ACCIDENT_INSURANCE",
]);

export default function SalaryComponents() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<SalaryComponent | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("EARNING");
  const [taxable, setTaxable] = useState("true");
  const [subjectToCnss, setSubjectToCnss] = useState("true");
  const [active, setActive] = useState("true");
  const [description, setDescription] = useState("");

  // Queries
  const { data: components = [], isLoading } = useQuery({
    queryKey: ["components"],
    queryFn: api.payroll.components.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.payroll.components.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      toast.success("Salary component created");
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.payroll.components.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      toast.success("Salary component updated");
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.payroll.components.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      toast.success("Salary component deleted");
    },
  });

  const resetForm = () => {
    setEditingComp(null);
    setCode("");
    setName("");
    setType("EARNING");
    setTaxable("true");
    setSubjectToCnss("true");
    setActive("true");
    setDescription("");
  };

  const handleEdit = (comp: SalaryComponent) => {
    setEditingComp(comp);
    setCode(comp.code);
    setName(comp.name);
    setType(comp.type);
    setTaxable(comp.taxable ? "true" : "false");
    setSubjectToCnss(comp.subjectToCnss ? "true" : "false");
    setActive(comp.active ? "true" : "false");
    setDescription(comp.description || "");
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code,
      name,
      type,
      taxable: taxable === "true",
      subjectToCnss: subjectToCnss === "true",
      active: active === "true",
      description,
    };

    if (editingComp) {
      updateMutation.mutate({ id: editingComp.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <CRMLayout title="Payroll - Components">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Salary Components</h1>
            <p className="text-muted-foreground">Manage base components, allowances, bonuses, and social/tax rules.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Component
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingComp ? "Edit Component" : "Create Component"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Code *</label>
                  <Input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. TRANSPORT_ALLOWANCE" disabled={!!editingComp && PROTECTED_COMPONENT_CODES.has(editingComp.code)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Name *</label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Transport Allowance" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Type *</label>
                  <Select value={type} onValueChange={setType} disabled={!!editingComp && PROTECTED_COMPONENT_CODES.has(editingComp.code)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EARNING">EARNING (E.g. Allowance, Bonus)</SelectItem>
                      <SelectItem value="DEDUCTION">DEDUCTION (E.g. Taxes, Loan repayment)</SelectItem>
                      <SelectItem value="EMPLOYER_CONTRIBUTION">EMPLOYER CONTRIBUTION</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Taxable *</label>
                    <Select value={taxable} onValueChange={setTaxable}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Subject to CNSS *</label>
                    <Select value={subjectToCnss} onValueChange={setSubjectToCnss}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Status *</label>
                  <Select value={active} onValueChange={setActive}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Description</label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Components Table */}
        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead>CNSS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading components...</TableCell>
                </TableRow>
              ) : components.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No salary components found.</TableCell>
                </TableRow>
              ) : (
                components.map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-semibold">{comp.code}</TableCell>
                    <TableCell>{comp.name}</TableCell>
                    <TableCell>{comp.type}</TableCell>
                    <TableCell>
                      <Badge variant={comp.taxable ? "default" : "secondary"}>
                        {comp.taxable ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={comp.subjectToCnss ? "default" : "secondary"}>
                        {comp.subjectToCnss ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={comp.active ? "default" : "secondary"}>
                        {comp.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(comp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!PROTECTED_COMPONENT_CODES.has(comp.code) && (
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete component?")) deleteMutation.mutate(comp.id); }}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
