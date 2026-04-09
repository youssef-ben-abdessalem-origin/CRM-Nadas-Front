import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, MailOpen, RefreshCw, Link2, Unlink, Inbox, Send, Plus } from "lucide-react";
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
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<"INBOX" | "SENT">("INBOX");
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [replyToThreadId, setReplyToThreadId] = useState<string | undefined>(undefined);

  const { data: status } = useQuery({
    queryKey: ["gmail-status"],
    queryFn: () => api.gmail.getStatus(),
  });

  const { data: emailsData, isLoading, refetch } = useQuery({
    queryKey: ["gmail-messages", activeFolder],
    queryFn: () => api.gmail.getMessages(50, undefined, activeFolder),
    enabled: status?.connected,
  });

  const { data: threadData, isLoading: isLoadingThread } = useQuery({
    queryKey: ["gmail-thread", selectedThreadId],
    queryFn: () => api.gmail.getThread(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const selectedEmail = emailsData?.messages?.find((m: any) => m.id === selectedThreadId) || (threadData?.messages?.[threadData.messages.length - 1]);

  const connectMutation = useMutation({
    mutationFn: () => api.gmail.getAuthUrl(),
    onSuccess: (data) => {
      globalThis.location.href = data.url;
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

  const sendMutation = useMutation({
    mutationFn: ({ to, subject, body, threadId }: { to: string; subject: string; body: string; threadId?: string }) =>
      api.gmail.send(to, subject, body, threadId),
    onSuccess: () => {
      toast.success("Email sent successfully!");
      setShowCompose(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      if (activeFolder === "SENT") {
        refetch();
      }
      setReplyToThreadId(undefined);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleReply = (email: any) => {
    if (!email) return;
    const from = getHeaderValue(email.payload.headers, "From");
    const subject = getHeaderValue(email.payload.headers, "Subject");
    const emailMatch = from.match(/<(.+)>/);
    const toEmail = emailMatch ? emailMatch[1] : from;

    setComposeTo(toEmail);
    setComposeSubject(subject.startsWith("Re:") ? subject : `Re: ${subject}`);
    setComposeBody("\n\n--- On " + new Date(Number.parseInt(email.internalDate)).toLocaleString() + ", " + from + " wrote ---\n");
    setReplyToThreadId(email.threadId);
    setShowCompose(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const gmailConnected = params.get("gmail_connected");
    const toParam = params.get("to");
    const subjectParam = params.get("subject");

    if (gmailConnected === "true") {
      toast.success("Gmail connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
      queryClient.invalidateQueries({ queryKey: ["gmail-messages"] });
      globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
    }

    if (toParam) {
      setComposeTo(toParam);
      if (subjectParam) setComposeSubject(subjectParam);
      setShowCompose(true);
      // Clean up the URL
      globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
    }
  }, [queryClient]);

  const getHeaderValue = (headers: { name: string; value: string }[], name: string) => {
    return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(Number.parseInt(timestamp));
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

  const getMessageBody = (message: any): string => {
    const getPartBody = (payload: any): string => {
      if (payload.body?.data) {
        const decoded = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        // Correct way to decode UTF-8 from atob
        try {
          const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0));
          return new TextDecoder().decode(bytes);
        } catch (e) {
          return decoded;
        }
      }
      if (payload.parts) {
        for (const part of payload.parts) {
          const body = getPartBody(part);
          if (body) return body;
        }
      }
      return "";
    };

    const body = getPartBody(message.payload);
    return body || message.snippet || "";
  };

  const formatEmailBody = (body: string) => {
    // Regex to find "Le ... à ..., <...> a écrit :" line
    const replyRegex = /(Le\s.+à\s.+,?\s<.+>\s+a\sécrit\s:|On\s.+\sat\s.+,?\s.+wrote:)/i;
    
    // Process body to remove leading '>' characters from quotes
    const cleanedBody = body.split('\n').map(line => line.replace(/^\s*>+ ?/, '')).join('\n');

    if (!replyRegex.test(cleanedBody)) {
      return <div>{cleanedBody}</div>;
    }

    const parts = cleanedBody.split(replyRegex);
    return (
      <div className="space-y-4">
        {parts.map((part, i) => {
          const key = `part-${i}-${part.slice(0, 10)}`;
          if (replyRegex.test(part)) {
            return (
              <div key={key} className="text-muted-foreground border-t border-dashed pt-2 mt-4 text-[11px] font-medium">
                {part}
              </div>
            );
          }
          if (i > 0 && parts[i-1] && replyRegex.test(parts[i-1])) {
            return (
              <div key={key} className="pl-4 border-l-2 border-muted/30 text-muted-foreground italic text-[11px]">
                {part.trim()}
              </div>
            );
          }
          return <div key={key}>{part.trim()}</div>;
        })}
      </div>
    );
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
              <div className="flex items-center gap-4">
                <div className="flex rounded-lg border p-1 bg-muted/30">
                  <Button 
                    variant={activeFolder === "INBOX" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8"
                    onClick={() => setActiveFolder("INBOX")}
                  >
                    <Inbox className="h-4 w-4 mr-2" />
                    Inbox
                  </Button>
                  <Button 
                    variant={activeFolder === "SENT" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8"
                    onClick={() => setActiveFolder("SENT")}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Sent
                  </Button>
                </div>
                <Badge variant="outline" className="h-6">
                  {emailsData?.messages?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setComposeTo("");
                    setComposeSubject("");
                    setComposeBody("");
                    setReplyToThreadId(undefined);
                    setShowCompose(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Compose
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
                  <div className="flex items-center justify-center p-12">
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
                      const to = getHeaderValue(email.payload.headers, "To");
                      const subject = getHeaderValue(email.payload.headers, "Subject");
                      
                      let displayContact = "";
                      if (activeFolder === "SENT") {
                        displayContact = to.split("<")[0].trim() || to;
                      } else {
                        displayContact = from.split("<")[0].trim() || from;
                      }

                      return (
                        <button
                          key={email.id}
                          className={`w-full text-left p-4 cursor-pointer hover:bg-muted/50 transition-colors border-none bg-transparent block ${
                            selectedThreadId === email.threadId ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedThreadId(email.threadId)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <MailOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <p className="font-medium truncate text-sm">
                                  {activeFolder === "SENT" ? `To: ${displayContact}` : displayContact}
                                </p>
                              </div>
                              <p className="text-sm font-medium truncate mt-1">
                                {subject || "(No Subject)"}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {email.snippet}
                              </p>
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                              {formatDate(email.internalDate)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="w-1/3 flex flex-col">
            <Card className="flex-1 overflow-hidden flex flex-col">
              {selectedThreadId ? (
                <>
                  <CardHeader className="border-b px-4 py-3 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base truncate">
                        {getHeaderValue(threadData?.messages?.[0]?.payload.headers || [], "Subject") || "(No Subject)"}
                      </CardTitle>
                      <Button size="sm" onClick={() => handleReply(threadData?.messages?.[threadData.messages.length - 1] || selectedEmail)}>
                        <Send className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </CardHeader>
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {isLoadingThread ? (
                      <div className="flex items-center justify-center p-12">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      threadData?.messages?.map((msg: any) => (
                        <div key={msg.id} className="space-y-2 group">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold">
                              {getHeaderValue(msg.payload.headers, "From").split("<")[0].trim()}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(Number.parseInt(msg.internalDate)).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm rounded-lg p-4 bg-muted/20 border border-transparent group-hover:border-border transition-colors shadow-sm">
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {formatEmailBody(getMessageBody(msg))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a conversation to view</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{replyToThreadId ? "Reply to Thread" : "Compose Email"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                placeholder="recipient@example.com"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                placeholder="Write your message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!composeTo || !composeSubject) {
                  toast.error("Please fill in recipient and subject");
                  return;
                }
                sendMutation.mutate({
                  to: composeTo,
                  subject: composeSubject,
                  body: composeBody,
                  threadId: replyToThreadId,
                });
              }}
              disabled={sendMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendMutation.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
};

export default EmailsPage;