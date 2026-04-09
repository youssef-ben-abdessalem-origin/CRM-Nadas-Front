import { CRMLayout } from "@/components/CRMLayout";
import { MetricCard } from "@/components/MetricCard";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { DollarSign, Users, Handshake, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 53000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 55000 },
  { month: "Jun", revenue: 72000 },
  { month: "Jul", revenue: 68000 },
  { month: "Aug", revenue: 81000 },
];

const dealsData = [
  { month: "Jan", won: 12, lost: 4 },
  { month: "Feb", won: 18, lost: 6 },
  { month: "Mar", won: 15, lost: 3 },
  { month: "Apr", won: 22, lost: 5 },
  { month: "May", won: 19, lost: 7 },
  { month: "Jun", won: 28, lost: 4 },
  { month: "Jul", won: 25, lost: 6 },
  { month: "Aug", won: 31, lost: 3 },
];

const recentActivities = (currencySymbol: string) => [
  { id: 1, type: "deal", text: "New deal \"Enterprise License\" created", time: "2m ago", icon: Handshake },
  { id: 2, type: "contact", text: "Sarah Chen added to Acme Corp", time: "15m ago", icon: Users },
  { id: 3, type: "revenue", text: `Invoice #1084 paid — ${currencySymbol}12,400`, time: "1h ago", icon: DollarSign },
  { id: 4, type: "deal", text: "Deal \"Cloud Migration\" moved to Negotiation", time: "2h ago", icon: Handshake },
  { id: 5, type: "contact", text: "New lead from website form: Mark Wilson", time: "3h ago", icon: Users },
];

const Dashboard = () => {
  const { symbol: currencySymbol } = useDefaultCurrency();
  return (
    <CRMLayout title="Dashboard">
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Revenue" value={`${currencySymbol}482,600`} change="+12.5% from last month" changeType="positive" icon={DollarSign} />
          <MetricCard label="Active Deals" value="47" change="+8 new this week" changeType="positive" icon={Handshake} />
          <MetricCard label="Total Contacts" value="2,847" change="+124 this month" changeType="positive" icon={Users} />
          <MetricCard label="Conversion Rate" value="24.8%" change="-1.2% from last month" changeType="negative" icon={TrendingUp} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
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
              <LineChart data={dealsData}>
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
            {recentActivities(currencySymbol).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <activity.icon className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <span className="text-sm text-foreground flex-1">{activity.text}</span>
                <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CRMLayout>
  );
};

export default Dashboard;
