import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import api from "@/lib/api";

export function useAuthCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await api.auth.profile();
        setIsAuthenticated(true);
      } catch (err: any) {
        Cookies.remove("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  return { isLoading, isAuthenticated };
}