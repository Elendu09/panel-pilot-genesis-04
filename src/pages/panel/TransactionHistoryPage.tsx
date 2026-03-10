import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
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
        <title>Transaction History - Home of SMM</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <TransactionHistory panelId={panel?.id} />
    </motion.div>
  );
};

export default TransactionHistoryPage;
