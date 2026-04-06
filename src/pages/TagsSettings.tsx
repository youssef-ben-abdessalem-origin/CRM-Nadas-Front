import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Tag as TagIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Tag {
  id: number;
  name: string;
  color: string;
  isActive: boolean;
}

const TagsSettings = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
  });

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.settings.getTags().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag created successfully");
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag updated successfully");
      setShowDialog(false);
      setEditingTag(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Tag deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", color: "#3b82f6" });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || "#3b82f6",
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteMutation.mutate(id);
    }
  };

  const colorOptions = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", 
    "#8b5cf6", "#ec4899", "#64748b", "#000000", "#ffffff",
  ];

  if (isLoading) {
    return (
      <CRMLayout title="Tags">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Tags">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tags</h1>
            <p className="text-muted-foreground">Manage custom tags</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingTag(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Tag
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No tags found
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag: Tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || "#3b82f6" }}
                        />
                        {tag.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: tag.color || "#3b82f6" }}
                      />
                    </TableCell>
                    <TableCell>
                      {!tag.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
            <DialogTitle>{editingTag ? "Edit Tag" : "Add Tag"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="VIP"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      formData.color === color ? "border-primary" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
              <Input
                type="text"
                placeholder="#3b82f6"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="mt-2"
              />
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingTag ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default TagsSettings;
