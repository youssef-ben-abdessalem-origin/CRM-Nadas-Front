import { CRMLayout } from "@/components/CRMLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Globe,
  DollarSign,
  Languages,
  Building2,
  UserPlus,
  Star,
  Flag,
  CheckCircle,
  Users,
  Handshake,
  Tag,
  Mail,
  Phone,
  Calendar,
  FileText,
  Settings as SettingsIcon,
  Bell,
  History,
} from "lucide-react";

interface SettingsCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const settingsCards: SettingsCard[] = [
  // Lead Settings
  {
    title: "Lead Sources",
    description: "Where your leads come from",
    icon: UserPlus,
    href: "/leads/settings",
    color: "text-blue-500",
  },
  {
    title: "Lead Stages",
    description: "Pipeline stages for leads",
    icon: Flag,
    href: "/leads/settings",
    color: "text-green-500",
  },
  {
    title: "Lead Scores",
    description: "Score categories for leads",
    icon: Star,
    href: "/leads/settings",
    color: "text-amber-500",
  },
  {
    title: "Lead Priorities",
    description: "Priority levels for leads",
    icon: CheckCircle,
    href: "/leads/settings",
    color: "text-red-500",
  },

  // Contact Settings
  {
    title: "Contact Statuses",
    description: "Statuses for contacts",
    icon: Phone,
    href: "/contacts/settings",
    color: "text-purple-500",
  },
  {
    title: "Contact Tiers",
    description: "Tier levels for contacts",
    icon: Users,
    href: "/contacts/settings",
    color: "text-indigo-500",
  },

  // Account Settings
  {
    title: "Account Types",
    description: "Types of accounts",
    icon: Building2,
    href: "/accounts/settings",
    color: "text-cyan-500",
  },
  {
    title: "Account Statuses",
    description: "Statuses for accounts",
    icon: Flag,
    href: "/accounts/settings",
    color: "text-emerald-500",
  },
  {
    title: "Account Tiers",
    description: "Tier levels for accounts",
    icon: Star,
    href: "/accounts/settings",
    color: "text-orange-500",
  },

  // Deal Settings
  {
    title: "Deal Stages",
    description: "Pipeline stages for deals",
    icon: Handshake,
    href: "/deals/settings",
    color: "text-pink-500",
  },
  {
    title: "Deal Reasons",
    description: "Win/Loss reasons for deals",
    icon: FileText,
    href: "/deals/settings",
    color: "text-teal-500",
  },

  {
    title: "Industries",
    description: "Company industries",
    icon: Building2,
    href: "/settings/industries",
    color: "text-slate-500",
  },
  {
    title: "Countries",
    description: "Countries and regions",
    icon: Globe,
    href: "/settings/countries",
    color: "text-green-500",
  },
  {
    title: "Currencies",
    description: "Currency types",
    icon: DollarSign,
    href: "/settings/currencies",
    color: "text-yellow-500",
  },
  {
    title: "Languages",
    description: "Languages supported",
    icon: Languages,
    href: "/settings",
    color: "text-violet-500",
  },
  {
    title: "Activity Types",
    description: "Types of activities",
    icon: Calendar,
    href: "/settings/activity-types",
    color: "text-sky-500",
  },
  {
    title: "Email Templates",
    description: "Email templates",
    icon: Mail,
    href: "/settings/email-templates",
    color: "text-blue-400",
  },
  {
    title: "Tags",
    description: "Custom tags",
    icon: Tag,
    href: "/settings/tags",
    color: "text-rose-500",
  },
  {
    title: "Notifications",
    description: "View notifications",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-amber-500",
  },
  {
    title: "Audit Logs",
    description: "Track system changes",
    icon: History,
    href: "/settings/audit-logs",
    color: "text-slate-500",
  },
];

export default function SettingsPage() {
  return (
    <CRMLayout title="CRM Settings">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your CRM configuration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {settingsCards.map((card) => (
            <Link key={card.title} to={card.href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </CRMLayout>
  );
}
