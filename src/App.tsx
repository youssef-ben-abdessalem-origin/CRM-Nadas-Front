import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Contacts from "./pages/Contacts.tsx";
import Deals from "./pages/Deals.tsx";
import Leads from "./pages/Leads.tsx";
import Accounts from "./pages/Accounts.tsx";
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
