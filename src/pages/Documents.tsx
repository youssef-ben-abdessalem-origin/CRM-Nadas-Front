import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  FolderPlus,
  Folder,
  File,
  Grid,
  Filter,
  ArrowUpDown,
  Info,
  Lock,
  Users as UsersIcon,
  ChevronDown as ChevronDownIcon,
  ExternalLink,
  Search as SearchIcon,
  X,
  Check,
  Zap,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation, Trans } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ROLE_LABELS = {
  ADMIN: "Admin",
  ORGANIZER: "Organizer",
  EDITOR: "Editor",
  COMMENTER: "Commenter",
  VIEWER: "Viewer",
};

const Documents = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  // Custom Selection States
  const [currentSharingRole, setCurrentSharingRole] = useState<keyof typeof ROLE_LABELS | null>(null);
  const [selectedUsersByRole, setSelectedUsersByRole] = useState<Record<string, any[]>>({
    ADMIN: [],
    ORGANIZER: [],
    EDITOR: [],
    COMMENTER: [],
    VIEWER: []
  });

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["workdrive-team"],
    queryFn: api.workdrive.getTeam,
  });

  const { data: teamFolders = [] } = useQuery({
    queryKey: ["workdrive-folders", team?.id, true],
    queryFn: () => team ? api.workdrive.getFolders({ teamId: team.id, isTeamFolder: true }) : Promise.resolve([]),
    enabled: !!team,
  });

  const { data: myFolders = [] } = useQuery({
    queryKey: ["workdrive-folders", team?.id, false],
    queryFn: () => team ? api.workdrive.getFolders({ teamId: team.id, isTeamFolder: false }) : Promise.resolve([]),
    enabled: !!team,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: api.users.getAll,
  });

  const createTeamMutation = useMutation({
    mutationFn: api.workdrive.createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workdrive-team"] });
      toast.success(t('documents.setup.success', { defaultValue: 'WorkDrive team set up successfully!' }));
      setShowSetup(false);
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: api.workdrive.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workdrive-folders"] });
      toast.success(t('documents.createFolder.success', { defaultValue: 'Folder created' }));
      setShowCreateFolder(false);
      setNewFolderName("");
      setSelectedUsersByRole({ ADMIN: [], ORGANIZER: [], EDITOR: [], COMMENTER: [], VIEWER: [] });
    }
  });

  const handleCreateTeam = () => {
    if (!teamName) return;
    createTeamMutation.mutate(teamName);
  };

  const handleCreateFolder = () => {
    if (!newFolderName || !team) return;

    // Collect all permissions
    const permissions: any[] = [];
    Object.entries(selectedUsersByRole).forEach(([role, users]) => {
      users.forEach(user => {
        permissions.push({ userId: user.id, role });
      });
    });

    createFolderMutation.mutate({
      name: newFolderName,
      teamId: team.id,
      isTeamFolder: activeTab === 'team',
      permissions
    });
  };

  const activeFolder = (activeTab === 'team' ? teamFolders : myFolders).find(f => f.id === selectedFolderId);

  // Components
  const WelcomeView = () => (
    <div className="flex flex-col items-center justify-center  p-8 relative overflow-hidden ">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6 relative z-10 mb-10"
      >


        <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight text-white leading-tight">
          <Trans i18nKey="documents.welcome.title">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">WorkDrive</span>
          </Trans>
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-normal leading-relaxed px-4">
          {t('documents.welcome.desc')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-10">
        {[
          {
            id: 1,
            text: t('documents.welcome.features.collab.title'),
            desc: t('documents.welcome.features.collab.desc'),
            icon: UsersIcon,
            accent: "bg-blue-500"
          },
          {
            id: 2,
            text: t('documents.welcome.features.hubs.title'),
            desc: t('documents.welcome.features.hubs.desc'),
            icon: FolderPlus,
            accent: "bg-amber-500"
          },
          {
            id: 3,
            text: t('documents.welcome.features.integration.title'),
            desc: t('documents.welcome.features.integration.desc'),
            icon: File,
            accent: "bg-emerald-500"
          }
        ].map((step, idx) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card className="group relative border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden h-full">
              {/* Subtle Top Border Accent on Hover */}
              <div className={cn("absolute top-0 left-0 w-full h-[1px] opacity-0 group-hover:opacity-100 transition-opacity", step.accent)} />

              <CardContent className="p-8 flex flex-col items-start text-left space-y-6">
                <div className="p-3 rounded-xl bg-white/5 text-white group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-6 w-6" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white tracking-tight">{step.text}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 flex flex-col items-center gap-6"
      >
        <Button
          onClick={() => setShowSetup(true)}
          className="bg-white hover:bg-slate-100 text-slate-950 font-semibold px-10 h-14 rounded-xl shadow-xl transition-all group relative"
        >
          <span className="flex items-center gap-2">
            {t('documents.welcome.getStarted')} <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          </span>
        </Button>

      </motion.div>
    </div>
  );

  const UserSelectorPopup = () => {
    const [localQuery, setLocalQuery] = useState("");
    if (!currentSharingRole) return null;

    const filteredUsers = users.filter((u: any) =>
      (u.name?.toLowerCase().includes(localQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(localQuery.toLowerCase())) &&
      !selectedUsersByRole[currentSharingRole].some((sel: any) => sel.id === u.id)
    );

    return (
      <Dialog open={!!currentSharingRole} onOpenChange={() => setCurrentSharingRole(null)}>
        <DialogContent className="sm:max-w-[800px] h-[500px] flex flex-col p-0 overflow-hidden rounded-2xl bg-[#0A0C10] border-white/10 shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black text-white">{t('documents.userSelector.title')}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-1 overflow-hidden border-t border-white/5">
            {/* Left: Available */}
            <div className="w-1/2 border-r border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('documents.userSelector.available')}</span>
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    className="pl-9 h-9 text-xs border-none bg-transparent text-white placeholder:text-slate-600 focus-visible:ring-0"
                    placeholder={t('documents.userSelector.search')}
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredUsers.map((user: any) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUsersByRole({
                        ...selectedUsersByRole,
                        [currentSharingRole]: [...selectedUsersByRole[currentSharingRole], user]
                      });
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                  >
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-[10px] font-black bg-white/10">{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-primary transition-colors">{user.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{user.email}</div>
                    </div>
                    <Plus className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Selected */}
            <div className="w-1/2 flex flex-col bg-white/[0.01]">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('documents.userSelector.selected')}</span>
                <Badge variant="secondary" className="text-[10px] px-2 h-5 bg-white/10 text-white border-none py-0">
                  {selectedUsersByRole[currentSharingRole].length}
                </Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {selectedUsersByRole[currentSharingRole].length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2 opacity-60">
                    <UsersIcon className="h-10 w-10 stroke-1" />
                    <span className="text-xs font-medium">{t('documents.userSelector.noneSelected')}</span>
                  </div>
                ) : (
                  selectedUsersByRole[currentSharingRole].map((user: any) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-[10px] font-black">{user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{user.name}</div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUsersByRole({
                            ...selectedUsersByRole,
                            [currentSharingRole]: selectedUsersByRole[currentSharingRole].filter(u => u.id !== user.id)
                          });
                        }}
                        className="p-1 hover:text-destructive text-slate-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="p-4 bg-white/5 border-t border-white/5 gap-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentSharingRole(null)}
              className="font-bold text-slate-400 h-10 px-6 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setCurrentSharingRole(null)}
              className="bg-primary hover:bg-primary/90 text-white font-black h-10 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              {t('documents.userSelector.addSelected')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const DriveDashboard = () => (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-slate-900/40 bg-[#0A0C10]">
      {/* Sidebar - Hidden on mobile, visible on medium+ */}
      <div className="hidden md:flex w-64 border-r border-white/5 flex-col bg-white/5 backdrop-blur-xl">
        <div className="p-4 flex-1">
          <div className="space-y-6">
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedFolderId(null); setActiveTab('my'); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-[0.05em]",
                  activeTab === 'my' && !selectedFolderId ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-white/5"
                )}
              >
                <Folder className="h-4 w-4" /> {t('documents.sidebar.myFolders')}
              </button>

              <div className="pt-2">
                <div className="px-3 py-3 flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('documents.sidebar.teamHubs')}</span>
                  <button
                    onClick={() => { setActiveTab('team'); setShowCreateFolder(true); }}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-1 mt-1">
                  {teamFolders.map((folder: any) => (
                    <button
                      key={folder.id}
                      onClick={() => { setSelectedFolderId(folder.id); setActiveTab('team'); }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-[0.05em]",
                        selectedFolderId === folder.id ? "bg-white/10 text-white border border-white/10" : "text-slate-500 hover:bg-white/5"
                      )}
                    >
                      <Folder className="h-4 w-4 opacity-70" />
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                      <Lock className="h-3 w-3 opacity-30" />
                    </button>
                  ))}

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <Button variant="ghost" className="w-full justify-start text-xs font-bold text-slate-500 gap-2 h-10 px-3 hover:bg-white/5 hover:text-white">
            <ExternalLink className="h-3.5 w-3.5" /> {t('documents.sidebar.openWorkdrive')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#0A0C10]">
        {/* Top Header */}
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-white/10 backdrop-blur-xl sticky top-0 z-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 shrink-0">
            <h2 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-3">
              {selectedFolderId ? (
                <>
                  <Folder className="h-5 w-5 text-primary" />
                  <span className="truncate max-w-[100px] md:max-w-none">{activeFolder?.name || "MCP"}</span>
                </>
              ) : (
                <>
                  <Grid className="h-5 w-5 text-slate-500" />
                  {t('documents.header.allFolders')}
                </>
              )}
            </h2>
            {selectedFolderId && (
              <div className="hidden sm:flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-slate-600" />
                <div className="flex items-center gap-1.5 p-1 pr-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400">
                  <UsersIcon className="h-3 w-3 ml-1" /> {t('documents.header.memberCount', { count: 1 })}
                </div>
                <Button variant="ghost" size="sm" className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest gap-2 text-slate-500 hover:text-white hover:bg-white/5">
                  <Settings className="h-3 w-3" /> {t('documents.header.manage')} <ChevronDownIcon className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-4">
            <div className="hidden lg:flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-white"><ArrowUpDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-white"><Filter className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500 hover:text-white"><Grid className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" className="hidden sm:flex h-10 rounded-xl font-black text-xs uppercase tracking-widest border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 gap-2">
              {t('documents.header.record')} <ChevronDownIcon className="h-4 w-4" />
            </Button>
            <Button className="h-10 md:h-11 bg-primary hover:bg-primary/90 text-white font-black rounded-xl px-4 md:px-8 gap-2 shadow-xl shadow-primary/20 text-xs md:text-sm">
              <Plus className="h-4 w-4 md:h-5 md:w-5" /> <span className="hidden xs:inline">{t('documents.header.newAction')}</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-[#0A0C10]/50 custom-scrollbar">
          {!selectedFolderId ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-8">
              {(activeTab === 'team' ? teamFolders : myFolders).map((folder: any) => (
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -5 }}
                  whileTap={{ scale: 0.98 }}
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="group flex flex-col items-center space-y-4 p-6 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all duration-500 shadow-2xl shadow-black/20"
                >
                  <div className="relative">
                    <div className="p-6 rounded-3xl bg-amber-500/10 text-amber-500 shadow-inner group-hover:bg-amber-500/20 transition-colors duration-500">
                      <Folder className="h-12 w-12 fill-current opacity-90 shadow-2xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#0A0C10] flex items-center justify-center border-2 border-white/5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Lock className="h-3 w-3 text-slate-500" />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-black text-white/90 tracking-tight group-hover:text-primary transition-colors">{folder.name}</div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Active Hub</div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-8 min-h-[50vh]">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-dashed border-white/5 rounded-[3rem] animate-pulse" />
                <div className="relative p-12 rounded-[3rem] bg-white/5 text-slate-700 shadow-2xl">
                  <FolderPlus className="h-24 w-24 opacity-20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-2xl border-4 border-[#0A0C10] shadow-xl">
                    <Plus className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-black text-white tracking-tight">{t('documents.empty.title')}</h3>
                <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed">
                  {t('documents.empty.desc')}
                </p>
                <div className="pt-4 flex flex-col items-center gap-2">
                   <Badge variant="outline" className="text-[10px] font-black text-slate-700 border-white/5 uppercase tracking-[0.2em] px-4 py-1">{t('documents.empty.dragDrop')}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <Button variant="outline" className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-8 border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 gap-3 transition-all">
                  {t('documents.actions.create')} <ChevronDownIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-8 border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 gap-3 transition-all">
                  {t('documents.actions.upload')} <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Tools Bar - Hidden on small screens */}
      <div className="hidden lg:flex w-16 border-l border-white/5 flex-col items-center py-6 space-y-8 bg-white/5 backdrop-blur-md">
        <button className="flex flex-col items-center gap-1.5 group">
          <div className="p-2 rounded-xl group-hover:bg-white/10 text-slate-500 group-hover:text-primary transition-all">
            <Info className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">{t('documents.rightBar.details')}</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 group">
          <div className="p-2 rounded-xl group-hover:bg-white/10 text-slate-500 group-hover:text-primary transition-all">
            <Zap className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">{t('documents.rightBar.zia')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <CRMLayout title={t('documents.title')}>
      <div className="h-full px-4 py-8">
        {!isTeamLoading && (team ? <DriveDashboard /> : <WelcomeView />)}

        {/* Setup Dialog */}
        <Dialog open={showSetup} onOpenChange={setShowSetup}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl bg-[#0A0C10] border-white/5">
            <div className="overflow-y-auto max-h-[70vh] p-8 pb-12 space-y-8 custom-scrollbar">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight text-white inter-font">{t('documents.setup.title')}</DialogTitle>
                <DialogDescription className="text-sm font-medium mt-2 leading-relaxed text-slate-400">
                  {t('documents.setup.desc')}
                </DialogDescription>
              </DialogHeader>



              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t('documents.setup.benefitsTitle')}</p>
                <div className="space-y-3">
                  {[
                    t('documents.setup.benefit1'),
                    t('documents.setup.benefit2'),
                    t('documents.setup.benefit3')
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="p-1 rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-bold text-slate-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">{t('documents.setup.teamNameLabel')}</Label>
                <p className="text-xs font-bold text-slate-600 pl-1">{t('documents.setup.teamNameSub')}</p>
                <Input
                  placeholder={t('documents.setup.teamNamePlaceholder')}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="h-12 rounded-xl font-bold border-white/5 bg-white/5 text-white focus:ring-primary/20 placeholder:text-slate-700"
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-white/5 border-t border-white/5">
              <Button
                onClick={handleCreateTeam}
                disabled={!teamName || createTeamMutation.isPending}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-2xl shadow-primary/20"
              >
                {createTeamMutation.isPending ? t('documents.setup.submit_pending') : t('documents.setup.submit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2.5rem] bg-[#0A0C10] border-white/5">
            <div className="overflow-y-auto max-h-[70vh] p-10 space-y-10 custom-scrollbar">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-white">{t('documents.createFolder.title')}</DialogTitle>
                <DialogDescription className="text-sm font-bold text-slate-400 mt-2">
                  {t('documents.createFolder.desc')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-4">
                  <Label className="sm:text-right text-xs font-bold text-slate-500">{t('documents.createFolder.nameLabel')}</Label>
                  <Input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={t('documents.createFolder.namePlaceholder')}
                    className="h-12 rounded-xl font-bold border-white/10 bg-white/5 text-white border-l-4 border-l-primary"
                  />
                </div>

                {/* Grid for roles */}
                <div className="space-y-6 sm:space-y-4">
                  {[
                    { role: 'ADMIN', label: 'Admin' },
                    { role: 'ORGANIZER', label: 'Organizer' },
                    { role: 'EDITOR', label: 'Editor' },
                    { role: 'COMMENTER', label: 'Commenter' },
                    { role: 'VIEWER', label: 'Viewer' }
                  ].map(field => (
                    <div key={field.role} className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start gap-2 sm:gap-4 group">
                      <Label className="sm:text-right text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors pt-1 sm:pt-3">{t(`common.roles.${field.role.toLowerCase()}`)}</Label>
                      <div className="relative">
                        <div
                          className="min-h-[48px] px-3 py-2 rounded-xl border border-white/10 bg-white/5 flex flex-wrap gap-2 items-center cursor-pointer hover:border-white/20 transition-all font-bold"
                          onClick={() => setCurrentSharingRole(field.role as any)}
                        >
                          {selectedUsersByRole[field.role].length === 0 ? (
                            <span className="text-slate-600 pointer-events-none">{t('documents.createFolder.selectUsers')}</span>
                          ) : (
                            selectedUsersByRole[field.role].map(u => (
                              <Badge key={u.id} variant="secondary" className="bg-white/10 text-white h-8 gap-2 pl-1 rounded-lg border-none pr-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-[8px]">{u.name[0]}</AvatarFallback>
                                </Avatar>
                                {u.name}
                                <X className="h-3 w-3 hover:text-destructive" onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUsersByRole({
                                    ...selectedUsersByRole,
                                    [field.role]: selectedUsersByRole[field.role].filter(sel => sel.id !== u.id)
                                  });
                                }} />
                              </Badge>
                            ))
                          )}
                          <UsersIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-hover:text-primary/50 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 bg-white/5 border-t border-white/5 gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowCreateFolder(false)}
                className="font-bold text-slate-400 h-11 px-8 hover:bg-white/5 hover:text-white transition-all"
              >
                {t('common.actions.cancel')}
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName || createFolderMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-white font-black px-12 h-11 rounded-xl shadow-xl shadow-primary/20 transition-all min-w-[140px]"
              >
                {createFolderMutation.isPending ? t('documents.createFolder.submit_pending') : t('documents.createFolder.submit')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Share Selector */}
        <UserSelectorPopup />
      </div>
    </CRMLayout>
  );
};

export default Documents;
