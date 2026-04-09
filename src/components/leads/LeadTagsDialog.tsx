import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ChevronDown,
  Palette,
  Check,
  Hash,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Tag {
  id: number;
  name: string;
  color?: string;
}

interface LeadTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: any;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", 
  "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#64748b", "#78350f", "#f43f5e"
];

export const LeadTagsDialog: React.FC<LeadTagsDialogProps> = ({
  open,
  onOpenChange,
  lead,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagColor, setNewTagColor] = useState("#84cc16"); // Default lime color from screen
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomColor, setShowCustomColor] = useState(false);

  const { data: allTags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.settings.getTags(),
    enabled: open,
  });

  useEffect(() => {
    if (open && lead) {
      // Map lead tags to full tag objects from allTags if possible
      const currentTags = lead.tags?.map((tagName: string) => {
        const found = allTags.find((t: Tag) => t.name.toLowerCase() === tagName.toLowerCase());
        return found || { id: -1, name: tagName, color: "#94a3b8" };
      }) || [];
      setSelectedTags(currentTags);
    }
  }, [open, lead, allTags]);

  const updateLeadMutation = useMutation({
    mutationFn: (tags: string[]) => api.leads.update(lead.id, { tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Tags updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const createTagMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) => api.settings.createTag(data),
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setSelectedTags([...selectedTags, newTag]);
      setInputValue("");
    },
  });

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setInputValue("");
  };

  const handleRemoveTag = (tagId: number | string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateNewTag = () => {
    if (!inputValue.trim()) return;
    
    // Check if tag already exists in allTags
    const existing = allTags.find(
      (t: Tag) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    
    if (existing) {
      handleAddTag(existing);
    } else {
      createTagMutation.mutate({
        name: inputValue.trim(),
        color: newTagColor,
      });
    }
  };

  const filteredAvailableTags = allTags.filter((tag: Tag) => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.some(st => st.id === tag.id)
  );

  const handleSave = () => {
    const tagNames = selectedTags.map(t => t.name);
    updateLeadMutation.mutate(tagNames);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-900/95 backdrop-blur-xl border-slate-800 shadow-2xl text-slate-100">
        <DialogHeader className="px-6 pt-6 mb-2">
          <DialogTitle className="text-2xl font-black tracking-tight text-white">Add Tags</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2 space-y-4">
          <div className="relative">
            <div className={cn(
              "flex flex-wrap gap-2 p-3 min-h-[52px] rounded-xl border-2 transition-all duration-300 bg-slate-800/50",
              "border-slate-700 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10",
              "shadow-sm"
            )}>
              <AnimatePresence>
                {selectedTags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Badge
                      className="group flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold border-none shadow-sm transition-all duration-200 hover:brightness-95"
                      style={{
                        backgroundColor: tag.color || "#e2e8f0",
                        color: "#fff",
                        // textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                      }}
                    >
                      {tag.name}
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>

              <input
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue) {
                    if (filteredAvailableTags.length > 0) {
                      handleAddTag(filteredAvailableTags[0]);
                    } else {
                      handleCreateNewTag();
                    }
                  } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
                    handleRemoveTag(selectedTags.at(-1).id);
                  }
                }}
                placeholder={selectedTags.length === 0 ? "Type to search or create tags..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-200 min-w-[120px] placeholder:text-slate-500"
              />
            </div>

            {/* Dropdown / Suggestion */}
                      {inputValue.trim() ? (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[300px] overflow-y-auto overflow-hidden">
                  {filteredAvailableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:bg-indigo-500/10 transition-colors group text-left"
                    >
                      <div className="h-4 w-4 rounded-full shadow-inner" style={{ backgroundColor: tag.color }} />
                      <span className="font-semibold group-hover:text-indigo-400">Existing Tag: <span className="text-slate-100">{tag.name}</span></span>
                    </button>
                  ))}
                  
                  {/* Create New Tag Entry */}
                  <div className="p-1 px-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 group">
                      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                        <PopoverTrigger asChild>
                          <button 
                            className="flex items-center gap-1.5 p-1.5 pr-2 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 bg-slate-800 group/picker border-slate-700"
                            style={{ borderColor: `${newTagColor}40` }}
                          >
                            <div className="h-5 w-5 rounded-full shadow-inner ring-1 ring-black/5" style={{ backgroundColor: newTagColor }} />
                            <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform duration-200", showColorPicker && "rotate-180")} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 rounded-2xl border-slate-800 bg-slate-900 shadow-2xl" align="start">
                          {showCustomColor ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Custom Color</span>
                                  <button onClick={() => setShowCustomColor(false)} className="text-[10px] font-bold text-indigo-400 hover:underline">Back</button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-10 rounded-xl shadow-lg ring-1 ring-black/20" style={{ backgroundColor: newTagColor }} />
                                  <div className="relative flex-1">
                                    <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                    <Input 
                                      value={newTagColor.replace(/#/g, '')}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                                        if (val.length <= 6) setNewTagColor(`#${val}`);
                                      }}
                                      className="pl-8 uppercase font-mono text-xs font-bold tracking-widest h-10 rounded-xl bg-slate-800 border-slate-700 text-white"
                                      placeholder="FFFFFF"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="w-full h-8 text-[10px] font-black uppercase tracking-tight bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowColorPicker(false)}>Done</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-6 gap-2">
                                {PRESET_COLORS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => {
                                      setNewTagColor(color);
                                      setShowColorPicker(false);
                                    }}
                                    className="h-7 w-7 rounded-lg shadow-sm border border-black/10 hover:scale-110 active:scale-90 transition-all cursor-pointer relative group/swatch"
                                    style={{ backgroundColor: color }}
                                  >
                                    {newTagColor === color && (
                                      <Check className="h-3 w-3 text-white absolute inset-0 m-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                              <div className="pt-2 border-t border-slate-800">
                                <button 
                                  onClick={() => setShowCustomColor(true)}
                                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                  <Palette className="h-3.5 w-3.5" />
                                  More Colors
                                </button>
                              </div>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      
                      <button 
                        onClick={handleCreateNewTag}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                          New Tag: <span className="text-slate-100">{inputValue}</span>
                        </div>
                      </button>
                      
                      <div className="text-[10px] font-black tracking-widest text-slate-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity">Press Enter</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="px-6 py-6 mt-4 bg-slate-800/50 border-t border-slate-800">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 rounded-xl border-slate-700 bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateLeadMutation.isPending}
              className="px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-95"
            >
              {updateLeadMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
