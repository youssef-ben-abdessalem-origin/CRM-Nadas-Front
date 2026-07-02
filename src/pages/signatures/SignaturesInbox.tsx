import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSignature, FileText, Filter, PenLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CRMLayout } from "@/components/crmlayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listSignatureTasks, type SignatureTask } from "@/lib/signatures";

export default function SignaturesInbox() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<SignatureTask[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "signed">("all");

  useEffect(() => {
    setTasks(listSignatureTasks());
  }, []);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((task) => task.status === filter);
  }, [filter, tasks]);

  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  return (
    <CRMLayout title={t("signatures.inbox.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 lg:grid-cols-[1.6fr,1fr]">
          <Card className="glass-morphism border-violet-500/20 bg-violet-500/10">
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-200">{t("signatures.inbox.account")}</p>
                <h1 className="mt-3 text-3xl font-bold text-white">{t("signatures.inbox.title")}</h1>
                <p className="mt-2 text-slate-300">{t("signatures.inbox.description")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/40 px-6 py-5 text-center">
                <div className="text-4xl font-bold text-white">{pendingCount}</div>
                <div className="text-sm text-slate-300">{t("signatures.inbox.documentsToSign")}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="flex h-full items-center justify-between gap-4 p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t("signatures.inbox.filter")}</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{t("signatures.inbox.queue")}</p>
              </div>
              <div className="w-48">
                <Select value={filter} onValueChange={(value: "all" | "pending" | "signed") => setFilter(value)}>
                  <SelectTrigger className="border-slate-700 bg-slate-900 text-slate-100">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("signatures.status.all")}</SelectItem>
                    <SelectItem value="pending">{t("signatures.status.pending")}</SelectItem>
                    <SelectItem value="signed">{t("signatures.status.signed")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="glass-morphism cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => navigate("/signatures")}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-violet-500/15 p-4 text-violet-300"><PenLine className="h-6 w-6" /></div>
              <div>
                <p className="text-lg font-semibold">{t("signatures.inbox.title")}</p>
                <p className="text-sm text-muted-foreground">{t("signatures.inbox.cards.signatureAccess")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-sky-500/15 p-4 text-sky-300"><FileSignature className="h-6 w-6" /></div>
              <div>
                <p className="text-lg font-semibold">{t("signatures.inbox.cards.signedFiles")}</p>
                <p className="text-sm text-muted-foreground">{t("signatures.inbox.cards.signedFilesDesc")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-morphism">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-emerald-500/15 p-4 text-emerald-300"><FileText className="h-6 w-6" /></div>
              <div>
                <p className="text-lg font-semibold">{t("signatures.inbox.cards.documents")}</p>
                <p className="text-sm text-muted-foreground">{t("signatures.inbox.cards.documentsDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-morphism">
          <CardHeader>
            <CardTitle>{t("signatures.inbox.documents")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
                {t("signatures.inbox.empty")}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-left transition hover:border-violet-500/40 hover:bg-slate-900"
                  onClick={() => navigate(`/signatures/${task.id}`)}
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-100">{task.title}</p>
                    <p className="text-sm text-slate-400">{task.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={task.status === "signed" ? "default" : "secondary"}>
                      {task.status === "signed" ? t("signatures.status.signed") : t("signatures.status.toSign")}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-500">
                      {task.signedAt ? new Date(task.signedAt).toLocaleDateString() : new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
