import { CRMLayout } from "@/components/CRMLayout";
import { useTranslation } from "react-i18next";

const Placeholder = ({ title }: { title: string }) => {
  const { t } = useTranslation();
  return (
    <CRMLayout title={title}>
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{t("placeholder.comingSoon")}</p>
        </div>
      </div>
    </CRMLayout>
  );
};

export const Invoices = () => <Placeholder title="Invoices" />;
export const Activities = () => <Placeholder title="Activities" />;
export const Reports = () => <Placeholder title="Reports" />;
export const Automations = () => <Placeholder title="Automations" />;
export const SettingsPage = () => <Placeholder title="Settings" />;
export const Quotes = () => <Placeholder title="Quotes" />;
export const Orders = () => <Placeholder title="Orders" />;
export const Payments = () => <Placeholder title="Payments" />;
export const Emails = () => <Placeholder title="Emails" />;
export const Calendar = () => <Placeholder title="Calendar" />;
export const Team = () => <Placeholder title="Team" />;
export const AuditLogs = () => <Placeholder title="Audit Logs" />;
export const Notifications = () => <Placeholder title="Notifications" />;
