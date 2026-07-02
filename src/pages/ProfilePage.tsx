import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import { User, Mail, Phone, Save, Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.users.getProfile().catch(() => null),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.users.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      localStorage.setItem("user", JSON.stringify(data));
      toast.success(t("profile.statusUpdates.updated"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploads.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, avatar: data.url }));
      toast.success(t("profile.statusUpdates.avatarUpdated"));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("profile.errors.fileSizeTooLarge"));
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <CRMLayout title={t("profile.pageTitle")}>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t("common.loading")}</div>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title={t("profile.pageTitle")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <span className="h-4 w-4 block animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <CardTitle className="text-2xl">{profile?.name}</CardTitle>
            <CardDescription>{profile?.role?.name || profile?.role}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{profile?.phone || "—"}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder={t("profile.placeholders.name")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.phoneNumber")}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder={t("profile.placeholders.phone")}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("profile.email")}</Label>
                <Input value={profile?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">{t("profile.emailCannotBeChanged")}</p>
              </div>

              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? t("common.saving") : t("common.saveChanges")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default ProfilePage;
