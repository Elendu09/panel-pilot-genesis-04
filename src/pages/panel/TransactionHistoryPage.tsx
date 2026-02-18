import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { TransactionHistory } from "@/components/billing/TransactionHistory";
import { usePanel } from "@/hooks/usePanel";

const TransactionHistoryPage = () => {
  const { panel } = usePanel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Helmet>
        <title>Transaction History - SMMPilot</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Receipt className="w-7 h-7 text-primary" />
          Transaction History
        </h1>
        <p className="text-muted-foreground">View and track all your panel transactions</p>
      </div>

      <TransactionHistory panelId={panel?.id} />
    </motion.div>
  );
};

export default TransactionHistoryPage;
