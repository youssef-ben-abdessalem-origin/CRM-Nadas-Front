import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { Lock, Mail } from "lucide-react";

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.auth.login(email, password);
      if (response.accessToken) {
        Cookies.set("token", response.accessToken, { expires: 7 });
        if (response.refreshToken) {
          Cookies.set("refreshToken", response.refreshToken, { expires: 14 });
        }
        localStorage.setItem("user", JSON.stringify(response.user || { email }));
        onLogin(response.accessToken, response.user);
        queryClient.invalidateQueries();
        toast.success(t("auth.login.success"));
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || t("auth.login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">{t("auth.login.brand")}</h1>
          <p className="mt-2 text-slate-400">{t("auth.login.subtitle")}</p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">{t("auth.login.welcome")}</CardTitle>
            <CardDescription className="text-slate-400">
              {t("auth.login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">{t("auth.login.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.login.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-slate-600 bg-slate-700/50 pl-10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">{t("auth.login.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-600 bg-slate-700/50 pl-10 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? t("auth.login.signingIn") : t("auth.login.signIn")}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-400">
              <p>{t("auth.login.demoCredentials")}</p>
              <p className="text-slate-500">admin@nexus.com / admin123</p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.login.footer")}
        </p>
      </div>
    </div>
  );
};

export default Login;
