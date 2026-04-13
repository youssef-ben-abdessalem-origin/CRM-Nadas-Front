import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CRMLayout } from "@/components/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  History,
  Search,
  CreditCard,
  ArrowUpRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Receipt
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { CurrencyNumbers } from "@/components/CurrencyNumbers";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.billing.payments.getAll()
  });

  const filteredPayments = payments.filter((p: any) => 
    p.paymentNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    p.accountName?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CRMLayout title="Settlement Registry">
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Payments</h1>
            <p className="text-muted-foreground text-sm font-medium">Historical ledger of commercial settlements and fund flows</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="bg-[#151921] border-white/5 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-[11px] tracking-wider h-10 px-5 rounded-lg">
              <Calendar className="h-4 w-4 mr-2" /> Ledger Export
            </Button>
          </div>
        </div>

        {/* Global Position Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Asset Inflow", value: payments.reduce((acc: number, cur: any) => acc + (Number(cur.amount) || 0), 0), color: "text-emerald-500", icon: ArrowUpRight },
            { label: "Settlements Recorded", value: payments.length, isRaw: true, color: "text-primary", icon: CheckCircle2 },
            { label: "Direct Context", value: payments.filter((p: any) => p.invoiceId).length, isRaw: true, color: "text-blue-500", icon: Receipt },
            { label: "Manual Entry Log", value: payments.filter((p: any) => !p.invoiceId).length, isRaw: true, color: "text-slate-400", icon: User }
          ].map((stat, i) => (
            <Card key={i} className="bg-[#151921] border-white/5 shadow-xl transition-all hover:border-primary/20">
              <CardContent className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                    <stat.icon className={`h-4 w-4 ${stat.color} opacity-40`} />
                 </div>
                {stat.isRaw ? (
                  <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                ) : (
                  <CurrencyNumbers amount={stat.value} valueClassName={`text-3xl font-black tracking-tighter ${stat.color}`} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transaction Matrix */}
        <Card className="bg-[#151921] border-white/5 shadow-2xl overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  placeholder="Search ledger by recipient or number..." 
                  className="pl-10 bg-[#0b0e14] border-white/5 text-sm h-10 focus:ring-primary/20 rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest"><Filter className="h-3 w-3 mr-2" /> All Methods</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#0b0e14]/30">
                <TableRow className="border-b border-white/5 hover:bg-transparent h-14">
                  <TableHead className="pl-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Protocol ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Commercial Stakeholder</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Context Ref</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Protocol Date</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Inflow Value</TableHead>
                  <TableHead className="w-10 pr-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {isLoading ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center italic text-slate-500 uppercase text-[10px] font-black tracking-[0.2em] animate-pulse">Decrypting Financial Ledger...</TableCell>
                  </TableRow>
                ) : filteredPayments.length > 0 ? (
                  filteredPayments.map((p: any) => (
                    <TableRow 
                      key={p.id} 
                      className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors group/row"
                    >
                      <TableCell className="pl-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-white text-[13px] uppercase tracking-wider group-hover/row:text-primary transition-colors">{p.paymentNumber}</span>
                          <span className="text-[10px] font-bold text-slate-600 uppercase mt-1">{p.method || "Electronic Transfer"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-300 text-[13px]">{p.contactName || "Direct Funding"}</span>
                          <span className="text-[10px] text-slate-500 italic">{p.accountName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         {p.invoiceNumber ? (
                           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase py-0.5">
                              {p.invoiceNumber}
                           </Badge>
                         ) : (
                           <span className="text-[10px] text-slate-600 italic">Manual Allocation</span>
                         )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm font-medium tabular-nums italic">
                        {p.date ? format(new Date(p.date), "dd MMM yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <CurrencyNumbers amount={p.amount} valueClassName="text-[14px] font-black text-emerald-500 tabular-nums tracking-tighter" />
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-white"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#151921] border-white/10 text-slate-200">
                             <DropdownMenuItem><ExternalLink className="h-4 w-4 mr-2" /> View Audit Trail</DropdownMenuItem>
                             <DropdownMenuItem className="text-rose-500"><History className="h-4 w-4 mr-2" /> Void Transaction</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                     <TableCell colSpan={6} className="h-40 text-center text-slate-500 italic text-[10px] font-black uppercase tracking-widest opacity-40">No settlements recorded in the commercial stream.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
};

export default PaymentsPage;
