import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, PerformanceReview } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash, ClipboardCheck } from "lucide-react";

export default function PerformanceReviews() {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<PerformanceReview | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("Draft");

  const { data: items = [], isLoading } = useQuery({ queryKey: ["performanceReviews"], queryFn: () => api.hr.performanceReviews.getAll() });
  const { data: employees = [] } = useQuery({ queryKey: ["employees"], queryFn: () => api.hr.employees.getAll() });

  const createMut = useMutation({ mutationFn: (d: any) => api.hr.performanceReviews.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["performanceReviews"] }); toast.success("Review created"); setIsOpen(false); resetForm(); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }: any) => api.hr.performanceReviews.update(id, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ["performanceReviews"] }); toast.success("Review updated"); setIsOpen(false); resetForm(); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => api.hr.performanceReviews.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["performanceReviews"] }); toast.success("Review deleted"); } });

  const resetForm = () => {
    setEditing(null); setEmployeeId(""); setReviewerId(""); setReviewDate(""); setOverallRating(0); setStrengths(""); setWeaknesses(""); setSummary(""); setStatus("Draft");
  };

  const handleEdit = (r: PerformanceReview) => {
    setEditing(r); setEmployeeId(String(r.employeeId)); setReviewerId(r.reviewerId ? String(r.reviewerId) : ""); setReviewDate(r.reviewDate.split("T")[0]); setOverallRating(r.overallRating || 0); setStrengths(r.strengths || ""); setWeaknesses(r.weaknesses || ""); setSummary(r.summary || ""); setStatus(r.status); setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { employeeId: +employeeId, reviewerId: reviewerId ? +reviewerId : null, reviewDate, overallRating, strengths: strengths || null, weaknesses: weaknesses || null, summary: summary || null, status };
    if (editing) updateMut.mutate({ id: editing.id, d: payload }); else createMut.mutate(payload);
  };

  return (
    <CRMLayout title="HR - Performance Reviews">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1>
            <p className="text-muted-foreground">Conduct and manage employee performance evaluations.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild><Button className="gap-2"><ClipboardCheck className="h-4 w-4" /> New Review</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit Review" : "New Review"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Employee *</label>
                  <Select value={employeeId} onValueChange={setEmployeeId}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{employees.map((e: any) => (<SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Reviewer</label>
                    <Select value={reviewerId} onValueChange={setReviewerId}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{employees.map((e: any) => (<SelectItem key={e.id} value={String(e.id)}>{e.firstName} {e.lastName}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Review Date *</label>
                    <Input required type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Rating (0-10)</label>
                    <Input type="number" min={0} max={10} step={0.5} value={overallRating} onChange={(e) => setOverallRating(+e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Submitted">Submitted</SelectItem>
                        <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Strengths</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={strengths} onChange={(e) => setStrengths(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Weaknesses</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Summary</label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={summary} onChange={(e) => setSummary(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="glass-morphism">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              : items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8">No reviews.</TableCell></TableRow>
              : items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : "-"}</TableCell>
                  <TableCell>{r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : "-"}</TableCell>
                  <TableCell>{new Date(r.reviewDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {r.overallRating != null ? (
                      <Badge variant={r.overallRating >= 7 ? "default" : r.overallRating >= 4 ? "secondary" : "destructive"}>{r.overallRating}</Badge>
                    ) : "-"}
                  </TableCell>
                  <TableCell><Badge variant={r.status === "Acknowledged" ? "default" : r.status === "Submitted" ? "outline" : "secondary"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(r)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(r.id)}><Trash className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
