import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Receipt,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "commission" | "subscription";
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
  invoiceId?: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

const mockTransactions: Transaction[] = [
  { id: "TXN001", type: "deposit", amount: 100.00, method: "PayPal", status: "completed", date: "2024-12-20", description: "Balance top-up", invoiceId: "INV-001" },
  { id: "TXN002", type: "commission", amount: -5.25, method: "Platform Fee", status: "completed", date: "2024-12-19", description: "5% commission on order #ORD-2847" },
  { id: "TXN003", type: "deposit", amount: 250.00, method: "Stripe", status: "completed", date: "2024-12-18", description: "Balance top-up", invoiceId: "INV-002" },
  { id: "TXN004", type: "subscription", amount: -15.00, method: "Auto-debit", status: "completed", date: "2024-12-15", description: "Pro plan subscription", invoiceId: "INV-003" },
  { id: "TXN005", type: "deposit", amount: 50.00, method: "Crypto", status: "pending", date: "2024-12-14", description: "Balance top-up (pending confirmation)" },
  { id: "TXN006", type: "commission", amount: -3.50, method: "Platform Fee", status: "completed", date: "2024-12-12", description: "5% commission on order #ORD-2845" },
  { id: "TXN007", type: "withdrawal", amount: -200.00, method: "Bank Transfer", status: "completed", date: "2024-12-10", description: "Withdrawal to bank", invoiceId: "INV-004" },
];

export const TransactionHistory = ({ transactions = mockTransactions }: TransactionHistoryProps) => {
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "commission">("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / perPage);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * perPage, page * perPage);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit": return "bg-green-500/10 text-green-500";
      case "withdrawal": return "bg-orange-500/10 text-orange-500";
      case "commission": return "bg-purple-500/10 text-purple-500";
      case "subscription": return "bg-blue-500/10 text-blue-500";
      default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <Tabs value={filter} onValueChange={(v) => { setFilter(v as any); setPage(1); }}>
            <TabsList className="bg-muted/50">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="deposit" className="text-xs">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal" className="text-xs">Withdrawals</TabsTrigger>
              <TabsTrigger value="commission" className="text-xs">Commissions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("capitalize", getTypeColor(tx.type))}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">
                    {tx.description}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tx.method}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize text-xs", getStatusColor(tx.status))}>
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={tx.amount >= 0 ? "text-green-500" : "text-muted-foreground"}>
                      {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tx.invoiceId && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
