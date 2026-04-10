import { CRMLayout } from "@/components/CRMLayout";
import { MetricCard } from "@/components/MetricCard";
import { 
  DollarSign, 
  Users, 
  Handshake, 
  Folder, 
  Megaphone, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Activity,
  Target
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  ComposedChart,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";

const Dashboard = () => {
  const { symbol: currencySymbol } = useDefaultCurrency();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.dashboard.getStats,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deal': return Handshake;
      case 'contact': return Users;
      case 'revenue': return DollarSign;
      default: return Folder;
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Dashboard Overview">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </CRMLayout>
    );
  }

  const { stats, charts, activities } = dashboardData || {};

  return (
    <CRMLayout title="Command Center">
      <div className="space-y-6 animate-in fade-in duration-500">
        
        {/* Top Tier Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Total Revenue" 
            value={stats?.totalRevenue || 0} 
            isCurrency
            change={stats?.revenueChange} 
            changeType="positive" 
            icon={DollarSign} 
          />
          <MetricCard 
            label="Avg. Deal Size" 
            value={Number(stats?.totalRevenue || 0) / (stats?.activeDealsCount || 1)} 
            isCurrency
            change="+5.2%" 
            changeType="positive" 
            icon={Target} 
          />
          <MetricCard 
            label="Conversion Rate" 
            value={`${stats?.conversionRate || 0}%`} 
            change={stats?.conversionChange} 
            changeType="negative" 
            icon={TrendingUp} 
          />
          <MetricCard 
            label="Active Deals" 
            value={(stats?.activeDealsCount || 0).toString()} 
            change={stats?.activeDealsChange} 
            changeType="positive" 
            icon={Handshake} 
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Contacts</p>
              <p className="text-xl font-bold">{stats?.totalContactsCount || 0}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Campaigns</p>
              <p className="text-xl font-bold">{stats?.totalCampaignsCount || 0}</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lead Velocity</p>
              <p className="text-xl font-bold">+24%</p>
            </div>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Trend (Area Chart) */}
          <div className="lg:col-span-2 glass-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Revenue Performance
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Actual
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted" /> Target
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={charts?.revenueData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${currencySymbol}${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Sources (Donut Chart) */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Lead Distribution
            </h3>
            <div className="relative h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.leadSourceData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(charts?.leadSourceData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">1,367</span>
                <span className="text-[10px] text-muted-foreground uppercase">Total Leads</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {(charts?.leadSourceData || []).map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Tier Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Sales Pipeline (Vertical Bar Chart) */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-6">Pipeline Velocity</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts?.pipelineData || []} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign ROI (Composed Chart) */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-6">Campaign Performance (ROI)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={charts?.campaignPerformance || []}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 20 }} />
                <Bar yAxisId="left" dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} name="Leads Generated" />
                <Line yAxisId="right" type="monotone" dataKey="roi" stroke="hsl(var(--success))" strokeWidth={3} name="ROI (x)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Real-time Activity Feed */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Live Activity Stream
            </h3>
            <button className="text-[10px] text-primary hover:underline">View All Logs</button>
          </div>
          <div className="space-y-4">
            {(activities || []).map((activity: any) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-4 group cursor-default">
                  <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-success opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
};

export default Dashboard;
