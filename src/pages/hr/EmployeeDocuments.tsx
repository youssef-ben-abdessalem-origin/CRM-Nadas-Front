import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, EmployeeDocument } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, FileText, Upload } from "lucide-react";

const DOCUMENT_TYPES = ["CIN", "Passport", "Diploma", "Work Permit", "Medical Certificate", "Contract", "Other"];

export default function EmployeeDocuments() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeDocument | null>(null);
  const [empFilter, setEmpFilter] = useState("all");

  const [employeeId, setEmployeeId] = useState("");
  const [documentType, setDocumentType] = useState("CIN");
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["employeeDocuments", empFilter],
    queryFn: () => api.hr.documents.getAll(empFilter !== "all" ? +empFilter : undefined),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.hr.employees.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: api.hr.documents.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeDocuments"] });
      toast.success("Document added successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hr.documents.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeDocuments"] });
      toast.success("Document updated successfully");
      setIsOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.hr.documents.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employeeDocuments"] });
      toast.success("Document deleted successfully");
    },
  });

  const resetForm = () => {
    setEditing(null);
    setEmployeeId("");
    setDocumentType("CIN");
    setFile(null);
    setExpiryDate("");
    setNotes("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (doc: EmployeeDocument) => {
    setEditing(doc);
    setEmployeeId(String(doc.employeeId));
    setDocumentType(doc.documentType);
    setFile(null);
    setExpiryDate(doc.expiryDate ? doc.expiryDate.split("T")[0] : "");
    setNotes(doc.notes || "");
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      const payload: any = {
        employeeId: +employeeId,
        documentType,
        expiryDate: expiryDate || null,
        notes: notes || null,
      };
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("documentType", documentType);
      if (expiryDate) formData.append("expiryDate", expiryDate);
      if (notes) formData.append("notes", notes);
      if (file) formData.append("file", file);
      createMutation.mutate(formData);
    }
  };

  return (
    <CRMLayout title="HR - Documents">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Documents</h1>
            <p className="text-muted-foreground">Manage CIN, passports, diplomas, certificates, and other employee documents.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Document</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Document" : "Add Document"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Employee *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select Employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.firstName} {emp.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Document Type *</label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Upload File {!editing && "*"}</label>
                  <Input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                  {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Expiry Date</label>
                  <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Notes</label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter */}
        <Card className="glass-morphism">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="w-56">
              <Select value={empFilter} onValueChange={setEmpFilter}>
                <SelectTrigger><SelectValue placeholder="Filter Employee" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading documents...</TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No documents found.</TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-semibold">
                      {doc.employee ? `${doc.employee.firstName} ${doc.employee.lastName}` : "-"}
                    </TableCell>
                    <TableCell><Badge variant="outline">{doc.documentType}</Badge></TableCell>
                    <TableCell>{doc.fileName || "-"}</TableCell>
                    <TableCell>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{doc.notes || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(doc)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete document?")) deleteMutation.mutate(doc.id); }}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
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
