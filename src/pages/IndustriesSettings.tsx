import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Industry {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
}

const IndustriesSettings = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isDefault: false,
  });

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ["industries"],
    queryFn: () => api.settings.getIndustries().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      toast.success("Industry created successfully");
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateIndustry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      toast.success("Industry updated successfully");
      setShowDialog(false);
      setEditingIndustry(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteIndustry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["industries"] });
      toast.success("Industry deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", isDefault: false });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editingIndustry) {
      updateMutation.mutate({ id: editingIndustry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (industry: Industry) => {
    setEditingIndustry(industry);
    setFormData({
      name: industry.name,
      description: industry.description || "",
      isDefault: industry.isDefault,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this industry?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Industries">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Industries">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Industries</h1>
            <p className="text-muted-foreground">Manage company industries</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingIndustry(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Industry
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {industries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No industries found
                  </TableCell>
                </TableRow>
              ) : (
                industries.map((industry: Industry) => (
                  <TableRow key={industry.id}>
                    <TableCell className="font-medium">{industry.name}</TableCell>
                    <TableCell className="text-muted-foreground">{industry.description || "—"}</TableCell>
                    <TableCell>
                      {industry.isDefault && (
                        <Badge className="bg-green-500">Default</Badge>
                      )}
                      {!industry.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(industry)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!industry.isDefault && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(industry.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndustry ? "Edit Industry" : "Add Industry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Technology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Industry description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <Label htmlFor="isDefault">Set as default industry</Label>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingIndustry ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default IndustriesSettings;
