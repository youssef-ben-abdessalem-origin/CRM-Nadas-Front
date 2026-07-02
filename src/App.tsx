import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Contacts from "./pages/Contacts.tsx";
import ContactDetail from "./pages/ContactDetail.tsx";
import Deals from "./pages/Deals.tsx";
import DealDetail from "./pages/DealDetail.tsx";
import Leads from "./pages/Leads.tsx";
import NewLead from "./pages/NewLead.tsx";
import LeadDetail from "./pages/LeadDetail.tsx";
import Accounts from "./pages/Accounts.tsx";
import AccountDetail from "./pages/AccountDetail.tsx";
import LeadsSettings from "./pages/Settings.tsx";
import ContactsSettings from "./pages/ContactsSettings.tsx";
import AccountsSettings from "./pages/AccountsSettingsPage.tsx";
import DealsSettings from "./pages/DealsSettingsPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import CurrenciesSettings from "./pages/CurrenciesSettings.tsx";
import CountriesSettings from "./pages/CountriesSettings.tsx";
import IndustriesSettings from "./pages/IndustriesSettings.tsx";
import TagsSettings from "./pages/TagsSettings.tsx";
import ActivityTypesSettings from "./pages/ActivityTypesSettings.tsx";
import EmailTemplatesSettings from "./pages/EmailTemplatesSettings.tsx";
import NotificationsSettings from "./pages/NotificationsSettings.tsx";
import AuditLogsSettings from "./pages/AuditLogsSettings.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import EmailsPage from "./pages/EmailsPage.tsx";
import CalendarPage from "./pages/CalendarPage.tsx";
import Products from "./pages/Products.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Vendors from "./pages/Vendors.tsx";
import VendorDetail from "./pages/VendorDetail.tsx";
import CreateProduct from "./pages/CreateProduct.tsx";
import ProductSettings from "./pages/ProductSettings.tsx";
import QuotesPage from "./pages/QuotesPage.tsx";
import QuoteDetail from "./pages/QuoteDetail.tsx";
import InvoicesPage from "./pages/InvoicesPage.tsx";
import InvoiceDetail from "./pages/InvoiceDetail.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import PaymentsPage from "./pages/PaymentsPage.tsx";
import Forecast from "./pages/Forecast.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import ActivitiesPage from "./pages/ActivitiesPage.tsx";
import TasksPage from "./pages/TasksPage.tsx";
import LogisticsSettings from "./pages/LogisticsSettings.tsx";
import CompanySettings from "./pages/settings/CompanySettings.tsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.tsx";
import Users from "./pages/team/Users.tsx";
import Roles from "./pages/team/Roles.tsx";
import RoleConfig from "./pages/team/RoleConfig.tsx";
import Privileges from "./pages/team/Privileges.tsx";
import Departments from "./pages/team/Departments.tsx";

import Employees from "./pages/hr/Employees.tsx";
import EmployeeDetail from "./pages/hr/EmployeeDetail.tsx";
import EmployeeFormPage from "./pages/hr/EmployeeFormPage.tsx";
import Positions from "./pages/hr/Positions.tsx";
import CostCenters from "./pages/hr/CostCenters.tsx";
import Contracts from "./pages/hr/Contracts.tsx";
import EmployeeDocuments from "./pages/hr/EmployeeDocuments.tsx";
import CnssProfiles from "./pages/hr/CnssProfiles.tsx";
import IrppTaxProfiles from "./pages/hr/IrppTaxProfiles.tsx";
import Attendance from "./pages/hr/Attendance.tsx";
import Leaves from "./pages/hr/Leaves.tsx";
import Shifts from "./pages/hr/Shifts.tsx";
import ShiftAssignments from "./pages/hr/ShiftAssignments.tsx";
import OvertimeRequests from "./pages/hr/OvertimeRequests.tsx";
import HrSettings from "./pages/hr/HrSettings.tsx";
import LeaveBalances from "./pages/hr/LeaveBalances.tsx";
import VacationAccrualRules from "./pages/hr/VacationAccrualRules.tsx";
import EmployeePortal from "./pages/hr/EmployeePortal.tsx";
import HrReports from "./pages/hr/HrReports.tsx";
import DocumentGeneration from "./pages/hr/DocumentGeneration.tsx";
import SignaturesInbox from "./pages/signatures/SignaturesInbox.tsx";
import SignatureRequestDetail from "./pages/signatures/SignatureRequestDetail.tsx";
import SignatureWorkspace from "./pages/signatures/SignatureWorkspace.tsx";

import SalaryComponents from "./pages/payroll/SalaryComponents.tsx";
import PayrollPeriods from "./pages/payroll/PayrollPeriods.tsx";
import PayslipDetail from "./pages/payroll/PayslipDetail.tsx";
import LoansAdvances from "./pages/payroll/LoansAdvances.tsx";
import PayrollSettings from "./pages/payroll/PayrollSettings.tsx";
import CnssDeclarations from "./pages/payroll/CnssDeclarations.tsx";
import IrppDeclarations from "./pages/payroll/IrppDeclarations.tsx";
import BankTransfers from "./pages/payroll/BankTransfers.tsx";
import StcSettlements from "./pages/payroll/StcSettlements.tsx";
import ThirteenthMonth from "./pages/payroll/ThirteenthMonth.tsx";
import Documents from "./pages/Documents.tsx";
import CampaignsPage from "./pages/Campaigns.tsx";
import CampaignDetail from "./pages/CampaignDetail.tsx";
import NewCampaign from "./pages/NewCampaign.tsx";
import NewAutomationRule from "./pages/NewAutomationRule.tsx";
import NewVendor from "./pages/NewVendor";
import EditProduct from "./pages/EditProduct.tsx";
import NewQuote from "./pages/NewQuote.tsx";
import VendorsSettings from "./pages/VendorsSettingsPage.tsx";
import WorkflowArchitect from "./pages/WorkflowArchitect.tsx";
import { ConfirmProvider } from "@/hooks/use-confirm.tsx";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || 'fr';
    const isArabic = lang.startsWith('ar');
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Add class for additional CSS targeting
    if (isArabic) {
      document.body.classList.add('lang-ar');
    } else {
      document.body.classList.remove('lang-ar');
    }
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConfirmProvider>
          <Sonner />

          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/new"
              element={
                <ProtectedRoute>
                  <NewLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/edit/:id"
              element={
                <ProtectedRoute>
                  <NewLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/:id"
              element={
                <ProtectedRoute>
                  <Contacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <CampaignsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/new"
              element={
                <ProtectedRoute>
                  <NewCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/edit/:id"
              element={
                <ProtectedRoute>
                  <NewCampaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:id"
              element={
                <ProtectedRoute>
                  <CampaignDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts/:id"
              element={
                <ProtectedRoute>
                  <AccountDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals"
              element={
                <ProtectedRoute>
                  <Deals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals/:id"
              element={
                <ProtectedRoute>
                  <DealDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/settings"
              element={
                <ProtectedRoute>
                  <LeadsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/settings"
              element={
                <ProtectedRoute>
                  <ContactsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts/settings"
              element={
                <ProtectedRoute>
                  <AccountsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals/settings"
              element={
                <ProtectedRoute>
                  <DealsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors/settings"
              element={
                <ProtectedRoute>
                  <VendorsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/currencies"
              element={
                <ProtectedRoute>
                  <CurrenciesSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/countries"
              element={
                <ProtectedRoute>
                  <CountriesSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/industries"
              element={
                <ProtectedRoute>
                  <IndustriesSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/tags"
              element={
                <ProtectedRoute>
                  <TagsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/activity-types"
              element={
                <ProtectedRoute>
                  <ActivityTypesSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/email-templates"
              element={
                <ProtectedRoute>
                  <EmailTemplatesSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/emails"
              element={
                <ProtectedRoute>
                  <EmailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <CalendarPage />
                </ProtectedRoute>
              }
            />
             <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <ActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/roles"
              element={
                <ProtectedRoute>
                  <Roles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/departments"
              element={
                <ProtectedRoute>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/privileges"
              element={
                <ProtectedRoute>
                  <Privileges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team/roles/:id"
              element={
                <ProtectedRoute>
                  <RoleConfig />
                </ProtectedRoute>
              }
            />
            <Route path="/team" element={<Navigate to="/team/users" replace />} />
            <Route
              path="/hr/employees"
              element={
                <ProtectedRoute>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/employees/new"
              element={
                <ProtectedRoute>
                  <EmployeeFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/employees/edit/:id"
              element={
                <ProtectedRoute>
                  <EmployeeFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/employees/:id"
              element={
                <ProtectedRoute>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/positions"
              element={
                <ProtectedRoute>
                  <Positions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/cost-centers"
              element={
                <ProtectedRoute>
                  <CostCenters />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/contracts"
              element={
                <ProtectedRoute>
                  <Contracts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/documents"
              element={
                <ProtectedRoute>
                  <EmployeeDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/cnss-profiles"
              element={
                <ProtectedRoute>
                  <CnssProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/irpp-tax-profiles"
              element={
                <ProtectedRoute>
                  <IrppTaxProfiles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/leaves"
              element={
                <ProtectedRoute>
                  <Leaves />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/shifts"
              element={
                <ProtectedRoute>
                  <Shifts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/shift-assignments"
              element={
                <ProtectedRoute>
                  <ShiftAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/overtime-requests"
              element={
                <ProtectedRoute>
                  <OvertimeRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/hr-settings"
              element={
                <ProtectedRoute>
                  <HrSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/leave-balances"
              element={
                <ProtectedRoute>
                  <LeaveBalances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/leave-balances/:employeeId"
              element={
                <ProtectedRoute>
                  <LeaveBalances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/vacation-accrual"
              element={
                <ProtectedRoute>
                  <VacationAccrualRules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/portal"
              element={
                <ProtectedRoute>
                  <EmployeePortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/reports"
              element={
                <ProtectedRoute>
                  <HrReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/document-generation"
              element={
                <ProtectedRoute>
                  <DocumentGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/components"
              element={
                <ProtectedRoute>
                  <SalaryComponents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/periods"
              element={
                <ProtectedRoute>
                  <PayrollPeriods />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/payslips/:id"
              element={
                <ProtectedRoute>
                  <PayslipDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signatures"
              element={
                <ProtectedRoute>
                  <SignaturesInbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signatures/:taskId"
              element={
                <ProtectedRoute>
                  <SignatureRequestDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signatures/:taskId/sign"
              element={
                <ProtectedRoute>
                  <SignatureWorkspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/loans-advances"
              element={
                <ProtectedRoute>
                  <LoansAdvances />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/settings"
              element={
                <ProtectedRoute>
                  <PayrollSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/cnss-declarations"
              element={
                <ProtectedRoute>
                  <CnssDeclarations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/irpp-declarations"
              element={
                <ProtectedRoute>
                  <IrppDeclarations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/bank-transfers"
              element={
                <ProtectedRoute>
                  <BankTransfers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/thirteenth-month"
              element={
                <ProtectedRoute>
                  <ThirteenthMonth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/stc-settlements"
              element={
                <ProtectedRoute>
                  <StcSettlements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedRoute>
                  <Vendors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors/:id"
              element={
                <ProtectedRoute>
                  <VendorDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors/new"
              element={
                <ProtectedRoute>
                  <NewVendor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
             <Route
               path="/products/settings"
               element={
                 <ProtectedRoute>
                   <ProductSettings />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/products/edit/:id"
               element={
                 <ProtectedRoute>
                   <EditProduct />
                 </ProtectedRoute>
               }
             />
              <Route
                path="/quotes/edit/:id"
                element={
                  <ProtectedRoute>
                    <NewQuote />
                  </ProtectedRoute>
                }
              />
             <Route
               path="/quotes/new"
               element={
                 <ProtectedRoute>
                   <NewQuote />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/quotes"
               element={
                 <ProtectedRoute>
                   <QuotesPage />
                 </ProtectedRoute>
               }
             />
              <Route
                path="/quotes/:id"
                element={
                  <ProtectedRoute>
                    <QuoteDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
              element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute>
                  <InvoiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast"
              element={
                <ProtectedRoute>
                  <Forecast />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/automations/new"
              element={
                <ProtectedRoute>
                  <NewAutomationRule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/automations"
              element={
                <ProtectedRoute>
                  <WorkflowArchitect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/logistics"
              element={
                <ProtectedRoute>
                  <LogisticsSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/company"
              element={
                <ProtectedRoute>
                  <CompanySettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ConfirmProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
