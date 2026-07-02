import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CRMLayout } from "@/components/crmlayout";
import { getSignatureTask, type SignatureTask } from "@/lib/signatures";

export default function SignatureRequestDetail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [task, setTask] = useState<SignatureTask | null>(null);

  useEffect(() => {
    if (!taskId) return;
    setTask(getSignatureTask(taskId));
  }, [taskId]);

  if (!task) {
    return (
      <CRMLayout title={t("signatures.detail.pageTitle")}>
        <div className="p-6">
          <Card className="glass-morphism">
            <CardContent className="py-12 text-center text-slate-300">{t("signatures.detail.notFound")}</CardContent>
          </Card>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={task.title}>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-sm text-slate-400">{t("signatures.detail.breadcrumb", { title: task.title })}</div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <Card className="glass-morphism">
            <CardContent className="space-y-8 p-8">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-slate-100">{task.title}</h1>
                <Badge variant={task.status === "signed" ? "default" : "secondary"}>
                  {task.status === "signed" ? t("signatures.status.signed") : t("signatures.status.toSign")}
                </Badge>
              </div>

              <div>
                <p className="text-lg font-semibold text-slate-200">{t("signatures.detail.summary")}</p>
                <div className="mt-4 space-y-2 text-lg text-slate-300">
                  <p><span className="font-semibold text-white">{t("signatures.detail.creationDate")}:</span> {new Date(task.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-semibold text-white">{task.signerName}</span> - {t("signatures.detail.employee")} - {task.status === "signed" ? t("signatures.status.signed") : t("signatures.status.waiting")}</p>
                </div>
              </div>

              <Button
                onClick={() => navigate(`/signatures/${task.id}/sign`)}
                className="h-14 rounded-2xl bg-violet-700 px-8 text-lg hover:bg-violet-600"
              >
                {task.status === "signed" ? t("signatures.detail.viewSignedFile") : t("signatures.detail.sign")}
              </Button>

              <div className="border-t border-slate-800 pt-8">
                <h2 className="text-3xl font-bold text-slate-100">{t("signatures.detail.history")}</h2>
                <p className="mt-3 text-slate-400">
                  {t("signatures.detail.historyDescription")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism">
            <CardContent className="space-y-4 p-8">
              <h2 className="text-3xl font-semibold text-slate-100">{t("signatures.detail.yourInformation")}</h2>
              <div className="space-y-2 text-slate-300">
                <p className="text-2xl font-bold text-white">{task.signerName}</p>
                <p>{task.employeeNumber}</p>
                {task.signerPhone ? <p>{task.signerPhone}</p> : null}
                {task.signerEmail ? <p>{task.signerEmail}</p> : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
