import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MailOpen, RefreshCw, Link2, Unlink, Inbox } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: { name: string; value: string }[];
    body?: { data?: string; size: number };
    parts?: any[];
  };
  internalDate: string;
}

const EmailsPage = () => {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);

  const { data: status } = useQuery({
    queryKey: ["gmail-status"],
    queryFn: () => api.gmail.getStatus(),
  });

  const { data: emailsData, isLoading, refetch } = useQuery({
    queryKey: ["gmail-messages"],
    queryFn: () => api.gmail.getMessages(50),
    enabled: status?.connected,
  });

  const connectMutation = useMutation({
    mutationFn: () => api.gmail.getAuthUrl(),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => api.gmail.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      toast.success("Gmail disconnected");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmailConnected = params.get("gmail_connected");
    if (gmailConnected === "true") {
      toast.success("Gmail connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [queryClient]);

  const getHeaderValue = (headers: { name: string; value: string }[], name: string) => {
    return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (!status?.connected) {
    return (
      <CRMLayout title="Emails">
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Connect Your Gmail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Connect your Gmail account to view and manage your emails directly from Nexus CRM.
              </p>
              <Button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="w-full"
              >
                <Link2 className="h-4 w-4 mr-2" />
                {connectMutation.isPending ? "Connecting..." : "Connect Gmail"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Emails">
      <div className="h-[calc(100vh-8rem)]">
        <div className="flex h-full gap-4">
          <div className="w-2/3 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Inbox</h2>
                <Badge variant="secondary">
                  {emailsData?.messages?.length || 0} emails
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                >
                  <Unlink className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            </div>

            <Card className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : emailsData?.messages?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Mail className="h-8 w-8 mb-2" />
                    <p>No emails found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {emailsData?.messages?.map((email: EmailMessage) => {
                      const from = getHeaderValue(email.payload.headers, "From");
                      const subject = getHeaderValue(email.payload.headers, "Subject");
                      const date = getHeaderValue(email.payload.headers, "Date");
                      const isSelected = selectedEmail?.id === email.id;

                      return (
                        <div
                          key={email.id}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            isSelected ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedEmail(email)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <MailOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <p className="font-medium truncate">
                                  {from.split("<")[0].trim() || from}
                                </p>
                              </div>
                              <p className="text-sm font-medium truncate mt-1">
                                {subject || "(No Subject)"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {email.snippet}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDate(email.internalDate)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="w-1/3">
            <Card className="h-full">
              {selectedEmail ? (
                <>
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg">
                      {getHeaderValue(selectedEmail.payload.headers, "Subject") || "(No Subject)"}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">From:</span>{" "}
                        {getHeaderValue(selectedEmail.payload.headers, "From")}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(getHeaderValue(selectedEmail.payload.headers, "Date")).toLocaleString()}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-sm whitespace-pre-wrap">
                      {selectedEmail.snippet || "No content preview available."}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an email to view</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
};

export default EmailsPage;