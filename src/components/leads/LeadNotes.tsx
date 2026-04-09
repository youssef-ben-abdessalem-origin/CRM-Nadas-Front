import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, Note, Lead } from "@/lib/api";
import { toast } from "sonner";
import {
  StickyNote,
  Pencil,
  Trash2,
  Calendar,
  User as UserIcon,
  X,
  Type,
  Paperclip,
  Check,
  MoreVertical
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useConfirm } from "@/hooks/use-confirm";

interface LeadNotesProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadNotes = ({ lead, open, onOpenChange }: LeadNotesProps) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const { data: activityTypes = [] } = useQuery({
    queryKey: ["activity-types"],
    queryFn: () => api.activities.getTypes(),
    enabled: open,
  });

  const noteTypeId = activityTypes.find((t: any) =>
    t.name.toLowerCase().includes('note') || t.name.toLowerCase().includes('sticky')
  )?.id || 1; // Fallback to 1 if not found

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", "lead", lead?.id],
    queryFn: async () => {
      if (!lead) return [];
      // Use activities instead of notes endpoint to avoid 404
      const activities = await api.activities.getByEntity("lead", lead.id);
      return activities.filter((a: any) => a.typeId === noteTypeId).map((a: any) => ({
        id: a.id,
        content: a.description || a.subject || "",
        title: a.subject === "Note" ? "" : a.subject,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        createdBy: a.createdBy,
        createdById: a.createdById
      }));
    },
    enabled: !!lead && open && activityTypes.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.activities.create({
        entityType: "lead",
        entityId: lead!.id,
        typeId: noteTypeId,
        subject: data.title || "Note",
        description: data.content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "lead", lead?.id] });
      setNewNote({ title: "", content: "" });
      toast.success("Note added");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.activities.update(id, {
        subject: data.title || "Note",
        description: data.content
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "lead", lead?.id] });
      setEditingNoteId(null);
      toast.success("Note updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.activities.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "lead", lead?.id] });
      toast.success("Note deleted");
    },
  });

  const handleSaveNote = () => {
    if (!newNote.content.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    if (editingNoteId) {
      updateMutation.mutate({ id: editingNoteId, data: newNote });
    } else {
      createMutation.mutate(newNote);
    }
  };

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNote({ title: note.title || "", content: note.content });
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setNewNote({ title: "", content: "" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] p-0 flex flex-col h-full bg-background border-l border-border">
        <div className="p-6 border-b border-border bg-card/50">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl font-bold">Notes</SheetTitle>
              {notes.length > 0 && (
                <span className="bg-muted px-2 py-0.5 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                  {notes.length} Total
                </span>
              )}
            </div>
            <SheetDescription className="text-xs">
              {lead?.name} • {lead?.company || "No Company"}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 opacity-50">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm font-medium">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center">
                  <StickyNote className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">No notes yet</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Be the first to add context about this lead.
                  </p>
                </div>
              </div>
            ) : (
              notes.map((note: Note) => (
                <div
                  key={note.id}
                  className="group relative bg-card border border-border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={note.createdBy?.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold uppercase">
                          {note.createdBy?.name?.substring(0, 2) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight">
                          {note.createdBy?.name || "System User"}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => startEdit(note)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                        onClick={async () => {
                          if (await confirm({ 
                            title: "Delete Note", 
                            description: "Are you sure you want to delete this note? This action cannot be undone.",
                            variant: "destructive",
                            confirmText: "Delete"
                          })) {
                            deleteMutation.mutate(note.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {note.title && (
                    <h4 className="text-sm font-bold mb-1.5 text-foreground/90">
                      {note.title}
                    </h4>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-6 bg-card border-t border-border mt-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold tracking-tight">
                {editingNoteId ? "Edit Note" : "New Note"}
              </h4>
              {editingNoteId && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold" onClick={cancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div className="relative group">
                <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Note Title (Optional)"
                  className="pl-10 h-10 bg-background border-border focus-visible:ring-primary"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                />
              </div>
              <div className="relative group">
                <Textarea
                  placeholder="What's this note about?"
                  className="min-h-[120px] bg-background border-border focus-visible:ring-primary resize-none p-4"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                />
                <div className="absolute bottom-3 left-3 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              className="w-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 font-bold"
              onClick={handleSaveNote}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingNoteId ? "Update Note" : "Save Note"}
              {!createMutation.isPending && !updateMutation.isPending && <Check className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
