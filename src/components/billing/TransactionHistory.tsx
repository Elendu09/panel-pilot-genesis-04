import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  payment_method: string | null;
  status: string | null;
  created_at: string;
  description: string | null;
}

interface TransactionHistoryProps {
  panelId?: string;
}

export const TransactionHistory = ({ panelId }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "commission">("all");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    fetchTransactions();
  }, [panelId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // Fetch transactions for the panel owner
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusColor = (status: string | null) => {
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", getTypeColor(tx.type))}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {tx.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.payment_method || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize text-xs", getStatusColor(tx.status))}>
                        {tx.status || 'completed'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={tx.amount >= 0 ? "text-green-500" : "text-muted-foreground"}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
