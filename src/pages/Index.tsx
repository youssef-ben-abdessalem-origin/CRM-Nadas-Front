import { CRMLayout } from "@/components/CRMLayout";
import { MetricCard } from "@/components/MetricCard";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { DollarSign, Users, Handshake, Folder, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
      <CRMLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </CRMLayout>
    );
  }

  const { stats, charts, activities } = dashboardData;

  return (
    <CRMLayout title="Dashboard">
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            label="Total Revenue" 
            value={`${currencySymbol}${Number(stats.totalRevenue).toLocaleString()}`} 
            change={stats.revenueChange} 
            changeType="positive" 
            icon={DollarSign} 
          />
          <MetricCard 
            label="Active Deals" 
            value={stats.activeDealsCount.toString()} 
            change={stats.activeDealsChange} 
            changeType="positive" 
            icon={Handshake} 
          />
          <MetricCard 
            label="Total Contacts" 
            value={stats.totalContactsCount.toString()} 
            change={stats.contactsChange} 
            changeType="positive" 
            icon={Users} 
          />
          <MetricCard 
            label="Total Campaigns" 
            value={stats.totalCampaignsCount.toString()} 
            change={stats.campaignsChange} 
            changeType="positive" 
            icon={Megaphone} 
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${currencySymbol}${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Deals Won vs Lost</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.dealsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="won" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="lost" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((activity: any) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-center gap-3 py-2">
                  <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <span className="text-sm text-foreground flex-1">{activity.text}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
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
