import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Contacts from "./pages/Contacts.tsx";
import Deals from "./pages/Deals.tsx";
import Leads from "./pages/Leads.tsx";
import Accounts from "./pages/Accounts.tsx";
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
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import { ProtectedRoute } from "@/components/ProtectedRoute.tsx";
import Cookies from "js-cookie";
import { LogoutButton } from "./components/ui/logout-button";

const queryClient = new QueryClient();

const App = () => {
  const isAuth = !!Cookies.get("token");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
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
              path="/contacts"
              element={
                <ProtectedRoute>
                  <Contacts />
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
              path="/deals"
              element={
                <ProtectedRoute>
                  <Deals />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
