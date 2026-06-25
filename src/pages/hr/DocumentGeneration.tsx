import { useState } from "react";
import { api } from "@/lib/api";
import { CRMLayout } from "@/components/crmlayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";

const API_BASE = "http://localhost:3001";

export default function DocumentGeneration() {
  const { t } = useTranslation();
  const [selectedEmpId, setSelectedEmpId] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: api.hr.employees.getAll,
  });

  const downloadDoc = async (url: string, filename: string) => {
    const token = Cookies.get("token");
    const res = await fetch(`${API_BASE}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <CRMLayout title={t("hr.documents.title")}>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("hr.documents.title")}</h1>
          <p className="text-muted-foreground">{t("hr.documents.description")}</p>
        </div>

        <Card>
          <CardHeader><CardTitle>{t("hr.documents.selectEmployee")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder={t("hr.documents.selectEmployeePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e: any) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.firstName} {e.lastName} ({e.employeeNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedEmpId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>{t("hr.documents.workCertificate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t("hr.documents.workCertificateDesc")}</p>
                <Button
                  onClick={() => downloadDoc(
                    api.documents.workCertificateUrl(+selectedEmpId),
                    `attestation-travail-${selectedEmpId}.html`
                  )}
                >
                  <Download className="mr-2 h-4 w-4" /> {t("hr.documents.download")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle>{t("hr.documents.employmentContract")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{t("hr.documents.employmentContractDesc")}</p>
                <Button
                  onClick={() => downloadDoc(
                    api.documents.employmentContractUrl(+selectedEmpId),
                    `contrat-travail-${selectedEmpId}.html`
                  )}
                >
                  <Download className="mr-2 h-4 w-4" /> {t("hr.documents.download")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
