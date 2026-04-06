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
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

const EmailTemplatesSettings = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
  });

  const { data: emailTemplates = [], isLoading } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: () => api.settings.getEmailTemplates().catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: api.settings.createEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast.success("Email template created successfully");
      setShowDialog(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.settings.updateEmailTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast.success("Email template updated successfully");
      setShowDialog(false);
      setEditingTemplate(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.settings.deleteEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailTemplates"] });
      toast.success("Email template deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ name: "", subject: "", body: "" });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Please fill in required fields");
      return;
    }
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject || "",
      body: template.body || "",
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this email template?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPreviewText = (body: string) => {
    return body ? body.substring(0, 80) + (body.length > 80 ? "..." : "") : "—";
  };

  if (isLoading) {
    return (
      <CRMLayout title="Email Templates">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Email Templates">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">Manage email templates</p>
          </div>
          <Button onClick={() => { resetForm(); setEditingTemplate(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Template
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Body Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No email templates found
                  </TableCell>
                </TableRow>
              ) : (
                emailTemplates.map((template: EmailTemplate) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.subject || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs">
                      {getPreviewText(template.body)}
                    </TableCell>
                    <TableCell>
                      {!template.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Email Template" : "Add Email Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Lead Follow-up"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Following up on our conversation"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                placeholder="Hi {{name}},"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Use placeholders like {'{{name}}'}, {'{{company}}'}, {'{{topic}}'} for dynamic content.
              </p>
            </div>
            <Button onClick={handleSubmit} className="w-full">
              {editingTemplate ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default EmailTemplatesSettings;
