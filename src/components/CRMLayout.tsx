import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export function CRMLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <AppSidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        <div className="print:hidden">
            <TopBar title={title} />
        </div>
        <main className="flex-1 overflow-y-auto p-6 pt-3 print:p-0 print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
