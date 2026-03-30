import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, Settings, Search, CheckCircle, AlertCircle, Globe, Wallet, Bitcoin, Building2, Smartphone, DollarSign, Eye, EyeOff, Play, Loader2, Sparkles, Send, RefreshCw, Clock, TrendingUp, Users, BarChart3, ExternalLink, Banknote, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StripeIcon, PayPalIcon, BitcoinIcon, CoinbaseIcon, RazorpayIcon, PaystackIcon, FlutterwaveIcon, SquareIcon, SkrillIcon, WiseIcon, KoraPayIcon, MonnifyIcon, NowPaymentsIcon, CoinGateIcon, BinancePayIcon, PerfectMoneyIcon, GenericPaymentIcon, getPaymentIcon } from "@/components/payment/PaymentIcons";
import {
  AdyenIcon, CheckoutComIcon, WorldpayIcon, AuthorizeNetIcon, TwoCheckoutIcon, MollieIcon, DLocalIcon, RapydIcon,
  MercadoPagoIcon, IyzicoIcon, PaymobIcon, XenditIcon, MidtransIcon, GCashIcon, GrabPayIcon, OpayIcon, MoovIcon, ChipperIcon, PagaIcon, RemitaIcon, InterswitchIcon, MTNMoMoIcon, MPesaIcon,
  NetellerIcon, WebMoneyIcon, PayoneerIcon, AlipayIcon, WeChatPayIcon, RevolutIcon, VenmoIcon, ZelleIcon,
  WireTransferIcon, IDealIcon, BancontactIcon, BoletoIcon, PIXIcon,
  PlisioIcon, CoinPaymentsIcon, TripleAIcon, BitPayIcon, BlockonomicsIcon, OpenNodeIcon, MixPayIcon, CryptocloudIcon, OxapayIcon, SpicePayIcon, CryptomusIcon, HeleketIcon,
  KlarnaIcon, AfterpayIcon, TabbyIcon, TamaraIcon, SezzleIcon,
} from "@/components/payment/PaymentIconsExtended";
import PaymentAnalyticsChart from "@/components/payment/PaymentAnalyticsChart";
import { usePanel } from "@/hooks/usePanel";
import { supabase } from "@/integrations/supabase/client";
import { useAvailablePaymentGateways } from "@/hooks/useAvailablePaymentGateways";
import { useAdminPaymentGateways } from "@/hooks/useAdminPaymentGateways";

import { TransactionKanban } from "@/components/billing/TransactionKanban";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentMethodRow } from "@/components/billing/PaymentMethodRow";
import { useNavigate } from "react-router-dom";

// Worldwide payment gateways
const paymentGateways = {
  cards: [
    { id: "stripe", name: "Stripe", Icon: StripeIcon, regions: ["Worldwide"], fee: "2.9% + $0.30", docsUrl: "https://stripe.com/docs" },
    { id: "paypal", name: "PayPal", Icon: PayPalIcon, regions: ["Worldwide"], fee: "2.9% + $0.30", docsUrl: "https://developer.paypal.com" },
    { id: "square", name: "Square", Icon: SquareIcon, regions: ["US, CA, UK, AU, JP"], fee: "2.6% + $0.10", docsUrl: "https://developer.squareup.com" },
    { id: "braintree", name: "Braintree", Icon: PayPalIcon, regions: ["Worldwide"], fee: "2.9% + $0.30", docsUrl: "https://developer.paypal.com/braintree" },
    { id: "adyen", name: "Adyen", Icon: AdyenIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.adyen.com" },
    { id: "checkoutcom", name: "Checkout.com", Icon: CheckoutComIcon, regions: ["Worldwide"], fee: "2.9% + $0.20", docsUrl: "https://docs.checkout.com" },
    { id: "worldpay", name: "Worldpay", Icon: WorldpayIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://developer.worldpay.com" },
    { id: "authorizenet", name: "Authorize.net", Icon: AuthorizeNetIcon, regions: ["US, CA, UK, EU"], fee: "2.9% + $0.30", docsUrl: "https://developer.authorize.net" },
    { id: "twocheckout", name: "2Checkout (Verifone)", Icon: TwoCheckoutIcon, regions: ["Worldwide"], fee: "3.5% + $0.35", docsUrl: "https://verifone.cloud/docs" },
    { id: "mollie", name: "Mollie", Icon: MollieIcon, regions: ["Europe"], fee: "1.8% + €0.25", docsUrl: "https://docs.mollie.com" },
    { id: "dlocal", name: "dLocal", Icon: DLocalIcon, regions: ["LATAM, Africa, Asia"], fee: "Variable", docsUrl: "https://docs.dlocal.com" },
    { id: "rapyd", name: "Rapyd", Icon: RapydIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.rapyd.net" },
  ],
  regional: [
    { id: "razorpay", name: "Razorpay", Icon: RazorpayIcon, regions: ["India"], fee: "2%", docsUrl: "https://razorpay.com/docs" },
    { id: "paystack", name: "Paystack", Icon: PaystackIcon, regions: ["Africa"], fee: "1.5% + ₦100", docsUrl: "https://paystack.com/docs" },
    { id: "flutterwave", name: "Flutterwave", Icon: FlutterwaveIcon, regions: ["Africa"], fee: "1.4%", docsUrl: "https://developer.flutterwave.com" },
    { id: "korapay", name: "Kora Pay", Icon: KoraPayIcon, regions: ["Africa"], fee: "1.4%", docsUrl: "https://docs.korapay.com" },
    { id: "monnify", name: "Monnify", Icon: MonnifyIcon, regions: ["Nigeria"], fee: "1.5%", docsUrl: "https://docs.monnify.com" },
    { id: "mercadopago", name: "Mercado Pago", Icon: MercadoPagoIcon, regions: ["LATAM"], fee: "3.49%", docsUrl: "https://www.mercadopago.com/developers" },
    { id: "iyzico", name: "Iyzico", Icon: IyzicoIcon, regions: ["Turkey"], fee: "2.49%", docsUrl: "https://dev.iyzipay.com" },
    { id: "paymob", name: "Paymob", Icon: PaymobIcon, regions: ["MENA, Pakistan"], fee: "2.5%", docsUrl: "https://docs.paymob.com" },
    { id: "xendit", name: "Xendit", Icon: XenditIcon, regions: ["SEA"], fee: "2.9%", docsUrl: "https://docs.xendit.co" },
    { id: "midtrans", name: "Midtrans", Icon: MidtransIcon, regions: ["Indonesia"], fee: "2.9%", docsUrl: "https://docs.midtrans.com" },
    { id: "gcash", name: "GCash", Icon: GCashIcon, regions: ["Philippines"], fee: "2%", docsUrl: "https://developer.gcash.com" },
    { id: "grabpay", name: "GrabPay", Icon: GrabPayIcon, regions: ["SEA"], fee: "2%", docsUrl: "https://developer.grab.com" },
    { id: "opay", name: "OPay", Icon: OpayIcon, regions: ["Africa"], fee: "1.5%", docsUrl: "https://documentation.opayweb.com" },
    { id: "moov", name: "Moov Money", Icon: MoovIcon, regions: ["West Africa"], fee: "1%", docsUrl: "https://moov.money" },
    { id: "chipper", name: "Chipper Cash", Icon: ChipperIcon, regions: ["Africa"], fee: "1%", docsUrl: "https://developer.chipper.cash" },
    { id: "paga", name: "Paga", Icon: PagaIcon, regions: ["Nigeria"], fee: "1.5%", docsUrl: "https://developer.mypaga.com" },
    { id: "remita", name: "Remita", Icon: RemitaIcon, regions: ["Nigeria"], fee: "1.5%", docsUrl: "https://remita.net/developers" },
    { id: "interswitch", name: "Interswitch", Icon: InterswitchIcon, regions: ["Nigeria"], fee: "1.5%", docsUrl: "https://developer.interswitchgroup.com" },
    { id: "mtnmomo", name: "MTN MoMo", Icon: MTNMoMoIcon, regions: ["Africa"], fee: "1%", docsUrl: "https://momodeveloper.mtn.com" },
    { id: "mpesa", name: "M-Pesa (Safaricom)", Icon: MPesaIcon, regions: ["East Africa"], fee: "1%", docsUrl: "https://developer.safaricom.co.ke" },
  ],
  ewallets: [
    { id: "skrill", name: "Skrill", Icon: SkrillIcon, regions: ["Worldwide"], fee: "1.9%", docsUrl: "https://developer.skrill.com" },
    { id: "perfectmoney", name: "Perfect Money", Icon: PerfectMoneyIcon, regions: ["Worldwide"], fee: "0.5%", docsUrl: "https://perfectmoney.com/docs" },
    { id: "wise", name: "Wise", Icon: WiseIcon, regions: ["Worldwide"], fee: "0.5%", docsUrl: "https://wise.com/developers" },
    { id: "neteller", name: "Neteller", Icon: NetellerIcon, regions: ["Worldwide"], fee: "2.5%", docsUrl: "https://developer.paysafe.com/en/neteller" },
    { id: "webmoney", name: "WebMoney", Icon: WebMoneyIcon, regions: ["CIS, Asia"], fee: "0.8%", docsUrl: "https://wiki.webmoney.ru/projects/webmoney" },
    { id: "payoneer", name: "Payoneer", Icon: PayoneerIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://developer.payoneer.com" },
    { id: "alipay", name: "Alipay", Icon: AlipayIcon, regions: ["China, Asia"], fee: "2.2%", docsUrl: "https://global.alipay.com/docs" },
    { id: "wechatpay", name: "WeChat Pay", Icon: WeChatPayIcon, regions: ["China, Asia"], fee: "2%", docsUrl: "https://pay.weixin.qq.com/docs" },
    { id: "revolut", name: "Revolut", Icon: RevolutIcon, regions: ["Europe, US, UK"], fee: "1%", docsUrl: "https://developer.revolut.com" },
    { id: "venmo", name: "Venmo", Icon: VenmoIcon, regions: ["US"], fee: "1.9% + $0.10", docsUrl: "https://developer.paypal.com/docs/checkout/pay-with-venmo" },
    { id: "zelle", name: "Zelle", Icon: ZelleIcon, regions: ["US"], fee: "0%", docsUrl: "https://www.zellepay.com" },
  ],
  bank: [
    { id: "ach", name: "ACH Transfer", Icon: StripeIcon, regions: ["US"], fee: "$0.25", docsUrl: "https://stripe.com/docs/ach" },
    { id: "sepa", name: "SEPA Transfer", Icon: StripeIcon, regions: ["Europe"], fee: "€0.35", docsUrl: "https://stripe.com/docs/sepa" },
    { id: "wiretransfer", name: "Wire Transfer", Icon: WireTransferIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "" },
    { id: "ideal", name: "iDEAL", Icon: IDealIcon, regions: ["Netherlands"], fee: "€0.29", docsUrl: "https://www.ideal.nl/en/developers" },
    { id: "bancontact", name: "Bancontact", Icon: BancontactIcon, regions: ["Belgium"], fee: "€0.25", docsUrl: "https://www.bancontact.com" },
    { id: "boleto", name: "Boleto Bancário", Icon: BoletoIcon, regions: ["Brazil"], fee: "R$3.49", docsUrl: "https://stripe.com/docs/payments/boleto" },
    { id: "pix", name: "PIX", Icon: PIXIcon, regions: ["Brazil"], fee: "0.99%", docsUrl: "https://www.bcb.gov.br/estabilidadefinanceira/pix" },
  ],
  crypto: [
    { id: "coinbase", name: "Coinbase Commerce", Icon: CoinbaseIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://commerce.coinbase.com/docs" },
    { id: "btcpay", name: "BTCPay Server", Icon: BitcoinIcon, regions: ["Worldwide"], fee: "0%", docsUrl: "https://docs.btcpayserver.org" },
    { id: "nowpayments", name: "NowPayments", Icon: NowPaymentsIcon, regions: ["Worldwide"], fee: "0.5%", docsUrl: "https://nowpayments.io/docs" },
    { id: "coingate", name: "CoinGate", Icon: CoinGateIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://developer.coingate.com" },
    { id: "binancepay", name: "Binance Pay", Icon: BinancePayIcon, regions: ["Worldwide"], fee: "0.9%", docsUrl: "https://developers.binance.com/docs/binance-pay" },
    { id: "cryptomus", name: "Cryptomus", Icon: CryptomusIcon, regions: ["Worldwide"], fee: "0.4%", docsUrl: "https://doc.cryptomus.com" },
    { id: "heleket", name: "Heleket", Icon: HeleketIcon, regions: ["Worldwide"], fee: "0.4%", docsUrl: "https://heleket.com/docs" },
    { id: "plisio", name: "Plisio", Icon: PlisioIcon, regions: ["Worldwide"], fee: "0.5%", docsUrl: "https://plisio.net/documentation" },
    { id: "coinpayments", name: "CoinPayments", Icon: CoinPaymentsIcon, regions: ["Worldwide"], fee: "0.5%", docsUrl: "https://www.coinpayments.net/apidoc" },
    { id: "triplea", name: "TripleA", Icon: TripleAIcon, regions: ["Worldwide"], fee: "0.8%", docsUrl: "https://developers.triple-a.io" },
    { id: "bitpay", name: "BitPay", Icon: BitPayIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://bitpay.com/docs" },
    { id: "blockonomics", name: "Blockonomics", Icon: BlockonomicsIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://www.blockonomics.co/views/api.html" },
    { id: "opennode", name: "OpenNode", Icon: OpenNodeIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://developers.opennode.com" },
    { id: "mixpay", name: "MixPay", Icon: MixPayIcon, regions: ["Worldwide"], fee: "0%", docsUrl: "https://developers.mixpay.me" },
    { id: "cryptocloud", name: "Cryptocloud", Icon: CryptocloudIcon, regions: ["Worldwide"], fee: "0.6%", docsUrl: "https://docs.cryptocloud.plus" },
    { id: "oxapay", name: "Oxapay", Icon: OxapayIcon, regions: ["Worldwide"], fee: "0.4%", docsUrl: "https://docs.oxapay.com" },
    { id: "spicepay", name: "SpicePay", Icon: SpicePayIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://www.spicepay.com/docs" },
  ],
  bnpl: [
    { id: "klarna", name: "Klarna", Icon: KlarnaIcon, regions: ["US, EU, UK, AU"], fee: "3.29% + $0.30", docsUrl: "https://docs.klarna.com" },
    { id: "afterpay", name: "Afterpay / Clearpay", Icon: AfterpayIcon, regions: ["US, UK, AU, NZ"], fee: "4-6% + $0.30", docsUrl: "https://developers.afterpay.com" },
    { id: "tabby", name: "Tabby", Icon: TabbyIcon, regions: ["MENA"], fee: "Variable", docsUrl: "https://docs.tabby.ai" },
    { id: "tamara", name: "Tamara", Icon: TamaraIcon, regions: ["MENA"], fee: "Variable", docsUrl: "https://docs.tamara.co" },
    { id: "sezzle", name: "Sezzle", Icon: SezzleIcon, regions: ["US, CA"], fee: "6% + $0.30", docsUrl: "https://docs.sezzle.com" },
  ],
};

type GatewayType = { id: string; name: string; Icon: React.FC<{ className?: string }>; regions: string[]; fee: string; docsUrl?: string };

// Per-gateway field label customization
const gatewayFieldLabels: Record<string, { field1Label: string; field1Placeholder: string; field2Label: string; field2Placeholder: string; field2Required: boolean }> = {
  stripe: { field1Label: "Publishable Key", field1Placeholder: "pk_live_xxxx or pk_test_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx or sk_test_xxxx", field2Required: true },
  paypal: { field1Label: "Client ID", field1Placeholder: "Your PayPal Client ID", field2Label: "Client Secret", field2Placeholder: "Your PayPal Client Secret", field2Required: true },
  coinbase: { field1Label: "API Key", field1Placeholder: "Your Coinbase Commerce API Key", field2Label: "Webhook Secret (optional)", field2Placeholder: "Webhook shared secret", field2Required: false },
  razorpay: { field1Label: "Key ID", field1Placeholder: "rzp_live_xxxx", field2Label: "Key Secret", field2Placeholder: "Your Razorpay Key Secret", field2Required: true },
  paystack: { field1Label: "Public Key", field1Placeholder: "pk_live_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx", field2Required: true },
  flutterwave: { field1Label: "Public Key", field1Placeholder: "FLWPUBK-xxxx", field2Label: "Secret Key", field2Placeholder: "FLWSECK-xxxx", field2Required: true },
  korapay: { field1Label: "Public Key", field1Placeholder: "pk_live_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx", field2Required: true },
  heleket: { field1Label: "Merchant ID", field1Placeholder: "Your Heleket Merchant UUID", field2Label: "Payment API Key", field2Placeholder: "Your Heleket API Key", field2Required: true },
  cryptomus: { field1Label: "Merchant UUID", field1Placeholder: "Your Cryptomus Merchant UUID", field2Label: "Payment API Key", field2Placeholder: "Your Cryptomus API Key", field2Required: true },
  xendit: { field1Label: "Public Key", field1Placeholder: "xnd_public_xxxx", field2Label: "Secret Key", field2Placeholder: "xnd_xxxx", field2Required: true },
  midtrans: { field1Label: "Client Key", field1Placeholder: "Your Midtrans Client Key", field2Label: "Server Key", field2Placeholder: "Your Midtrans Server Key", field2Required: true },
  adyen: { field1Label: "API Key", field1Placeholder: "Your Adyen API Key", field2Label: "Merchant Account", field2Placeholder: "Your Merchant Account ID", field2Required: true },
  mollie: { field1Label: "API Key", field1Placeholder: "live_xxxx or test_xxxx", field2Label: "Profile ID (optional)", field2Placeholder: "pfl_xxxx", field2Required: false },
  bitpay: { field1Label: "API Token", field1Placeholder: "Your BitPay API Token", field2Label: "Pairing Code (optional)", field2Placeholder: "Pairing code", field2Required: false },
  binancepay: { field1Label: "API Key", field1Placeholder: "Your Binance Pay API Key", field2Label: "API Secret", field2Placeholder: "Your Binance Pay Secret Key", field2Required: true },
  square: { field1Label: "Application ID", field1Placeholder: "sq0idp-xxxx", field2Label: "Access Token", field2Placeholder: "Your Square Access Token", field2Required: true },
  nowpayments: { field1Label: "API Key", field1Placeholder: "Your NowPayments API Key", field2Label: "IPN Secret (optional)", field2Placeholder: "Your IPN callback secret", field2Required: false },
};

const categoryIcons: Record<keyof typeof paymentGateways, React.ElementType> = {
  cards: CreditCard,
  regional: Globe,
  ewallets: Wallet,
  bank: Building2,
  crypto: Bitcoin,
  bnpl: Sparkles,
};

const categoryLabels: Record<keyof typeof paymentGateways, string> = {
  cards: "Card Payments",
  regional: "Regional Gateways",
  ewallets: "E-Wallets",
  bank: "Bank Transfers",
  crypto: "Cryptocurrency",
  bnpl: "Buy Now Pay Later",
};

// Manual Payment interface
interface ManualPaymentMethod {
  id: string;
  title: string;
  bankDetails: string;
  instructions: string;
  processingTime: string;
  enabled: boolean;
}

const PaymentMethods = () => {
  const { toast } = useToast();
  const { panel, refreshPanel } = usePanel();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | keyof typeof paymentGateways>("all");
  const [configuredGateways, setConfiguredGateways] = useState<Record<string, { enabled: boolean; apiKey: string; secretKey: string }>>({});
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<typeof paymentGateways.cards[0] | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({ apiKey: "", secretKey: "", testMode: true, minDeposit: "5", maxDeposit: "1000", feePercentage: "0", fixedFee: "0" });
  
  // Manual payments state
  const [manualPayments, setManualPayments] = useState<ManualPaymentMethod[]>([]);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<ManualPaymentMethod | null>(null);
  const [manualForm, setManualForm] = useState({ title: "", bankDetails: "", instructions: "", processingTime: "12-24 hours" });
  
  // Platform methods state
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({ gatewayName: "", reason: "", expectedVolume: "" });
  const [pendingRequests, setPendingRequests] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);


  const { refresh: refreshAvailableGateways } = useAvailablePaymentGateways({
    panelId: panel?.id,
    panelSettings: (panel?.settings as any) || null,
  });
  
  // Real data from database
  const [topDepositors, setTopDepositors] = useState<{ name: string; amount: number; method: string }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<{ user: string; amount: number; time: string }[]>([]);
  const [paymentMethodUsage, setPaymentMethodUsage] = useState<{ method: string; percent: number; color: string }[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load configured gateways and manual payments from Supabase on mount
  useEffect(() => {
    if (panel?.id) {
      loadConfiguredGateways();
      fetchPaymentStats();
    }
  }, [panel?.id]);


  const loadConfiguredGateways = () => {
    const settings = panel?.settings as any;
    if (settings?.payments?.enabledMethods) {
      const methods = settings.payments.enabledMethods;
      const loaded: Record<string, { enabled: boolean; apiKey: string; secretKey: string }> = {};
      methods.forEach((m: any) => {
        loaded[m.id] = { enabled: m.enabled ?? true, apiKey: m.apiKey || '', secretKey: m.secretKey || '' };
      });
      setConfiguredGateways(loaded);
    }
    // Load manual payments
    if (settings?.payments?.manualPayments) {
      setManualPayments(settings.payments.manualPayments);
    }
  };

  const fetchPaymentStats = async () => {
    if (!panel?.id) return;
    setLoadingStats(true);
    
    try {
      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('panel_id', panel.id)
        .order('created_at', { ascending: false });
      
      // Fetch customers
      const { data: customers } = await supabase
        .from('client_users')
        .select('id, full_name, email')
        .eq('panel_id', panel.id);
      
      // Calculate top depositors
      const depositorMap = new Map<string, { name: string; amount: number; method: string }>();
      const completedDeposits = transactions?.filter(t => t.status === 'completed' && t.type === 'deposit') || [];
      
      for (const tx of completedDeposits) {
        const customer = customers?.find(c => c.id === tx.user_id);
        const key = tx.user_id || 'unknown';
        const existing = depositorMap.get(key) || { 
          name: customer?.full_name || customer?.email?.split('@')[0] || 'Anonymous', 
          amount: 0, 
          method: tx.payment_method || 'Unknown' 
        };
        existing.amount += tx.amount || 0;
        depositorMap.set(key, existing);
      }
      
      setTopDepositors(
        Array.from(depositorMap.values())
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3)
      );
      
      // Recent transactions
      const recent = (transactions || []).slice(0, 3).map(tx => {
        const customer = customers?.find(c => c.id === tx.user_id);
        const timeDiff = Date.now() - new Date(tx.created_at).getTime();
        const minutes = Math.floor(timeDiff / 60000);
        const timeStr = minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
        return {
          user: customer?.full_name || customer?.email?.split('@')[0] || 'User',
          amount: tx.amount || 0,
          time: timeStr
        };
      });
      setRecentTransactions(recent);
      
      // Payment method usage
      const methodMap = new Map<string, number>();
      completedDeposits.forEach(tx => {
        const method = tx.payment_method || 'other';
        methodMap.set(method, (methodMap.get(method) || 0) + 1);
      });
      const totalTxns = completedDeposits.length || 1;
      const colorMap: Record<string, string> = {
        stripe: 'bg-[#635BFF]',
        paypal: 'bg-[#003087]',
        crypto: 'bg-[#F7931A]',
        coinbase: 'bg-[#F7931A]',
        other: 'bg-muted-foreground'
      };
      setPaymentMethodUsage(
        Array.from(methodMap.entries())
          .map(([method, count]) => ({
            method: method.charAt(0).toUpperCase() + method.slice(1),
            percent: Math.round((count / totalTxns) * 100),
            color: colorMap[method.toLowerCase()] || 'bg-muted-foreground'
          }))
          .sort((a, b) => b.percent - a.percent)
      );
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };
  
  // Removed: One-click platform gateways - panel owners must configure their own API keys

  // Get all gateways for "all" category or specific category
  const getGatewaysForCategory = () => {
    if (activeCategory === "all") {
      return Object.values(paymentGateways).flat();
    }
    return paymentGateways[activeCategory];
  };

  const filteredGateways = getGatewaysForCategory()
    .filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.regions.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const enabledCount = Object.values(configuredGateways).filter(g => g.enabled).length;

  const openConfigDialog = (gateway: typeof paymentGateways.cards[0]) => {
    setSelectedGateway(gateway);
    const existing = configuredGateways[gateway.id];
    if (existing) {
      setFormData({ ...formData, apiKey: existing.apiKey, secretKey: existing.secretKey });
    } else {
      setFormData({ apiKey: "", secretKey: "", testMode: true, minDeposit: "5", maxDeposit: "1000", feePercentage: "0", fixedFee: "0" });
    }
    setConfigDialogOpen(true);
  };

  const saveGatewayConfig = async () => {
    if (!selectedGateway || !formData.apiKey || !panel?.id) {
      toast({ variant: "destructive", title: "API Key required" });
      return;
    }
    
    // Update local state
    const updatedGateways = {
      ...configuredGateways,
      [selectedGateway.id]: { enabled: true, apiKey: formData.apiKey, secretKey: formData.secretKey }
    };
    setConfiguredGateways(updatedGateways);
    
    // Persist to Supabase
    try {
      const enabledMethods = Object.entries(updatedGateways)
        .filter(([_, config]) => config.enabled)
        .map(([id, config]) => ({
          id,
          enabled: true,
          apiKey: config.apiKey,
          secretKey: config.secretKey, // Required for payment processing
          testMode: formData.testMode,
          minDeposit: parseFloat(formData.minDeposit) || 5,
          maxDeposit: parseFloat(formData.maxDeposit) || 1000
        }));
      
      const currentSettings = (panel?.settings as any) || {};
      const updatedSettings = {
        ...currentSettings,
        payments: {
          enabledMethods,
          configuredAt: new Date().toISOString()
        }
      };
      
      await supabase
        .from('panels')
        .update({ settings: updatedSettings })
        .eq('id', panel.id);
      
      refreshPanel();
      setConfigDialogOpen(false);
      toast({ title: `${selectedGateway.name} configured and saved!` });
    } catch (error) {
      console.error('Error saving gateway config:', error);
      toast({ variant: "destructive", title: "Failed to save configuration" });
    }
  };

  const toggleGateway = async (gatewayId: string) => {
    const current = configuredGateways[gatewayId];
    if (!current || !panel?.id) return;
    
    const updatedGateways = { 
      ...configuredGateways, 
      [gatewayId]: { ...current, enabled: !current.enabled } 
    };
    setConfiguredGateways(updatedGateways);
    
    // Persist to Supabase
    try {
    const enabledMethods = Object.entries(updatedGateways)
        .filter(([_, config]) => config.apiKey) // Only include configured ones
        .map(([id, config]) => ({
          id,
          enabled: config.enabled,
          apiKey: config.apiKey,
          secretKey: config.secretKey,
        }));
      
      const currentSettings = (panel?.settings as any) || {};
      await supabase
        .from('panels')
        .update({ 
          settings: { 
            ...currentSettings, 
            payments: { 
              enabledMethods, 
              configuredAt: new Date().toISOString() 
            } 
          } 
        })
        .eq('id', panel.id);
      
      refreshPanel();
    } catch (error) {
      console.error('Error toggling gateway:', error);
    }
  };

  const [testResult, setTestResult] = useState<{ success: boolean; message: string; accountName?: string; mode?: string } | null>(null);

  const testConnection = async () => {
    if (!selectedGateway || !formData.apiKey) {
      toast({ variant: "destructive", title: "API key required" });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const gatewayId = selectedGateway.id.toLowerCase();
      let gateway: 'stripe' | 'paypal' | 'coinbase' | null = null;
      
      if (gatewayId === 'stripe') gateway = 'stripe';
      else if (gatewayId === 'paypal') gateway = 'paypal';
      else if (gatewayId === 'coinbase') gateway = 'coinbase';

      if (!gateway) {
        // For unsupported gateways, simulate success
        await new Promise(r => setTimeout(r, 1500));
        setTestResult({ success: true, message: 'Connection test simulated (gateway not yet supported for real testing)' });
        toast({ title: "Test Simulated", description: "This gateway doesn't support real API validation yet" });
        setTesting(false);
        return;
      }

      const response = await fetch(
        'https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/validate-payment-gateway',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gateway,
            apiKey: formData.apiKey,
            secretKey: formData.secretKey || undefined,
          }),
        }
      );

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast({ 
          title: "Connection Successful!", 
          description: `${selectedGateway.name}: ${result.accountName || 'Connected'} (${result.mode || 'unknown'} mode)` 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Connection Failed", 
          description: result.error || result.message 
        });
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setTestResult({ success: false, message: 'Failed to connect to validation service' });
      toast({ variant: "destructive", title: "Test Failed", description: "Could not reach validation service" });
    } finally {
      setTesting(false);
    }
  };

  // Removed: enablePlatformGateway - panel owners must configure their own API keys

  const submitGatewayRequest = () => {
    if (!requestForm.gatewayName.trim()) {
      toast({ variant: "destructive", title: "Gateway name required" });
      return;
    }
    setPendingRequests(prev => prev + 1);
    setShowRequestDialog(false);
    setRequestForm({ gatewayName: "", reason: "", expectedVolume: "" });
    toast({ title: "Request submitted", description: "The platform admin will review your request" });
  };

  const syncWithPlatform = async () => {
    setSyncing(true);
    try {
      await refreshAvailableGateways();
      setLastSynced(new Date());
      toast({ title: "Synced with platform", description: "Payment methods are up to date" });
    } finally {
      setSyncing(false);
    }
  };

  // Manual Payment Management
  const openManualDialog = (method?: ManualPaymentMethod) => {
    if (method) {
      setEditingManual(method);
      setManualForm({
        title: method.title,
        bankDetails: method.bankDetails,
        instructions: method.instructions,
        processingTime: method.processingTime
      });
    } else {
      setEditingManual(null);
      setManualForm({ title: "", bankDetails: "", instructions: "", processingTime: "12-24 hours" });
    }
    setManualDialogOpen(true);
  };

  const saveManualPayment = async () => {
    if (!manualForm.title.trim() || !panel?.id) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }

    let updated: ManualPaymentMethod[];
    if (editingManual) {
      // Update existing
      updated = manualPayments.map(m => 
        m.id === editingManual.id 
          ? { ...m, ...manualForm }
          : m
      );
    } else {
      // Add new
      const newMethod: ManualPaymentMethod = {
        id: `manual_${Date.now()}`,
        title: manualForm.title,
        bankDetails: manualForm.bankDetails,
        instructions: manualForm.instructions,
        processingTime: manualForm.processingTime,
        enabled: true
      };
      updated = [...manualPayments, newMethod];
    }

    setManualPayments(updated);

    // Persist to Supabase
    try {
      const currentSettings = (panel?.settings as any) || {};
      const paymentSettings = currentSettings.payments || {};
      
      await supabase
        .from('panels')
        .update({ 
          settings: { 
            ...currentSettings, 
            payments: { 
              ...paymentSettings,
              manualPayments: updated,
              configuredAt: new Date().toISOString() 
            } 
          } 
        })
        .eq('id', panel.id);
      
      refreshPanel();
      setManualDialogOpen(false);
      toast({ title: editingManual ? "Manual payment updated" : "Manual payment added" });
    } catch (error) {
      console.error('Error saving manual payment:', error);
      toast({ variant: "destructive", title: "Failed to save" });
    }
  };

  const deleteManualPayment = async (id: string) => {
    if (!panel?.id) return;
    
    const updated = manualPayments.filter(m => m.id !== id);
    setManualPayments(updated);

    try {
      const currentSettings = (panel?.settings as any) || {};
      const paymentSettings = currentSettings.payments || {};
      
      await supabase
        .from('panels')
        .update({ 
          settings: { 
            ...currentSettings, 
            payments: { 
              ...paymentSettings,
              manualPayments: updated 
            } 
          } 
        })
        .eq('id', panel.id);
      
      refreshPanel();
      toast({ title: "Manual payment deleted" });
    } catch (error) {
      console.error('Error deleting manual payment:', error);
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const toggleManualPayment = async (id: string) => {
    if (!panel?.id) return;
    
    const updated = manualPayments.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    setManualPayments(updated);

    try {
      const currentSettings = (panel?.settings as any) || {};
      const paymentSettings = currentSettings.payments || {};
      
      await supabase
        .from('panels')
        .update({ 
          settings: { 
            ...currentSettings, 
            payments: { 
              ...paymentSettings,
              manualPayments: updated 
            } 
          } 
        })
        .eq('id', panel.id);
      
      refreshPanel();
    } catch (error) {
      console.error('Error toggling manual payment:', error);
    }
  };

  // Admin payment gateways for panel owner billing
  const { gateways: adminGateways, loading: adminGatewaysLoading } = useAdminPaymentGateways();

  // Tab state for 2-tab layout
  const [activeMainTab, setActiveMainTab] = useState<'buyer' | 'billing'>('buyer');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Payment Management</h1>
          <p className="text-muted-foreground">Configure payment methods for your buyers and manage deposits</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1.5">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            {enabledCount} Active Methods
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5">
            <Banknote className="w-4 h-4 mr-1.5" />
            {manualPayments.filter(m => m.enabled).length} Manual
          </Badge>
        </div>
      </motion.div>

      {/* Main 2-Tab Layout */}
      <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as 'buyer' | 'billing')} className="space-y-6">
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="buyer" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wallet className="w-4 h-4" />
            <span>Payment Methods</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4" />
            <span>Transactions & History</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab A: Buyer Payment Methods - Simplified List Layout */}
        <TabsContent value="buyer" className="space-y-6">
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Globe className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <strong>Buyer Payment Methods:</strong> Configure the payment gateways that your buyers/customers will see on the <strong>/deposit</strong> page when adding funds to their account.
            </AlertDescription>
          </Alert>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name..." 
              className="pl-9 bg-card/50 backdrop-blur-sm border-border/50" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>

          {/* Enhanced Kanban Listview Layout */}
          <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
            <CardContent className="p-0">
              {/* Manual Methods Section Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-border/30">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm font-semibold text-foreground">Manual Methods</span>
                <Badge variant="outline" className="ml-auto bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  {manualPayments.length}
                </Badge>
              </div>
              
              <div className="p-2 space-y-2">
                {manualPayments.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    <p>No manual payment methods yet.</p>
                  </div>
                ) : (
                  manualPayments
                    .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((method) => (
                      <PaymentMethodRow
                        key={method.id}
                        icon={<Banknote className="w-5 h-5 text-emerald-500" />}
                        name={method.title}
                        subtitle={method.processingTime}
                        enabled={method.enabled}
                        onClick={() => openManualDialog(method)}
                        onToggle={() => toggleManualPayment(method.id)}
                      />
                    ))
                )}
                
                <button
                  onClick={() => openManualDialog()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-muted/50 transition-colors text-primary text-sm border border-dashed border-border/50 hover:border-primary/50"
                >
                  <Plus className="w-4 h-4" />
                  Add Manual Payment
                </button>
              </div>

              {/* Payment Gateways Section Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent border-t border-b border-border/30 mt-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Payment Gateways</span>
                <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
                  {filteredGateways.length}
                </Badge>
              </div>
              
              <div className="p-2 space-y-2">
                {filteredGateways
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((gateway) => {
                    const isConfigured = !!configuredGateways[gateway.id];
                    const isEnabled = configuredGateways[gateway.id]?.enabled;
                    
                    return (
                      <PaymentMethodRow
                        key={gateway.id}
                        icon={<gateway.Icon className="w-5 h-5" />}
                        name={gateway.name}
                        subtitle={`Fee: ${gateway.fee}`}
                        enabled={isConfigured ? isEnabled : undefined}
                        onClick={() => openConfigDialog(gateway)}
                        onToggle={isConfigured ? () => toggleGateway(gateway.id) : undefined}
                      />
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab B: Transactions & History */}
        <TabsContent value="billing" className="space-y-6">
          <Alert className="border-primary/30 bg-primary/5">
            <BarChart3 className="w-4 h-4 text-primary" />
            <AlertDescription>
              <strong>Transaction Management:</strong> Review and approve pending deposits, view transaction history, and manage customer balances from buyers/tenants.
            </AlertDescription>
          </Alert>

          {/* Kanban-style Transaction Management */}
          {panel?.id && <TransactionKanban panelId={panel.id} />}
        </TabsContent>
      </Tabs>

      {/* Gateway Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedGateway && <selectedGateway.Icon className="w-8 h-8" />}
              Configure {selectedGateway?.name}
            </DialogTitle>
            <DialogDescription>Enter your API credentials to enable this payment gateway</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Mode Detection */}
            {formData.apiKey && (
              <div className={cn(
                "p-3 rounded-lg border text-sm",
                formData.apiKey.includes('test') || formData.apiKey.includes('sandbox')
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                  : "bg-green-500/10 border-green-500/30 text-green-500"
              )}>
                <div className="flex items-center gap-2">
                  {formData.apiKey.includes('test') || formData.apiKey.includes('sandbox') ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Test/Sandbox Mode Detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Production Mode</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {(() => {
              const labels = selectedGateway ? gatewayFieldLabels[selectedGateway.id] : undefined;
              const f1Label = labels?.field1Label || "API Key / Public Key";
              const f1Placeholder = labels?.field1Placeholder || "Your public/api key";
              const f2Label = labels?.field2Label || "Secret Key";
              const f2Placeholder = labels?.field2Placeholder || "Your secret key";
              const f2Required = labels?.field2Required !== false;
              return (
                <>
                  <div className="space-y-2">
                    <Label>{f1Label}</Label>
                    <Input value={formData.apiKey} onChange={(e) => setFormData({...formData, apiKey: e.target.value})} placeholder={f1Placeholder} className="bg-background/50 font-mono text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label>{f2Label} {!f2Required && <span className="text-muted-foreground text-xs">(optional)</span>}</Label>
                    <div className="relative">
                      <Input type={showSecretKey ? "text" : "password"} value={formData.secretKey} onChange={(e) => setFormData({...formData, secretKey: e.target.value})} placeholder={f2Placeholder} className="bg-background/50 font-mono text-sm pr-10" />
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowSecretKey(!showSecretKey)}>
                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Webhook URL */}
            <div className="space-y-2">
              <Label>Webhook URL (auto-generated)</Label>
              <Input readOnly value={`${window.location.origin}/api/webhooks/${selectedGateway?.id}`} className="bg-muted/50 font-mono text-xs" />
              <p className="text-xs text-muted-foreground">Configure this URL in your {selectedGateway?.name} dashboard</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Deposit ($)</Label>
                <Input type="number" value={formData.minDeposit} onChange={(e) => setFormData({...formData, minDeposit: e.target.value})} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Max Deposit ($)</Label>
                <Input type="number" value={formData.maxDeposit} onChange={(e) => setFormData({...formData, maxDeposit: e.target.value})} className="bg-background/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee (%)</Label>
                <Input type="number" value={formData.feePercentage} onChange={(e) => setFormData({...formData, feePercentage: e.target.value})} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Fixed Fee ($)</Label>
                <Input type="number" value={formData.fixedFee} onChange={(e) => setFormData({...formData, fixedFee: e.target.value})} className="bg-background/50" />
              </div>
            </div>

            <div className="flex items-center justify-between glass-card p-3 rounded-lg">
              <div>
                <p className="font-medium">Test Mode</p>
                <p className="text-xs text-muted-foreground">Use sandbox/test credentials</p>
              </div>
              <Switch checked={formData.testMode} onCheckedChange={(checked) => setFormData({...formData, testMode: checked})} />
            </div>

            {/* Documentation Link */}
            {selectedGateway?.docsUrl && (
              <a href={selectedGateway.docsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="w-4 h-4" />
                View {selectedGateway.name} Documentation
              </a>
            )}

            {/* Test Result Display */}
            {testResult && (
              <div className={cn(
                "p-4 rounded-lg border",
                testResult.success 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-red-500/10 border-red-500/30"
              )}>
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium", testResult.success ? "text-green-500" : "text-red-500")}>
                      {testResult.message}
                    </p>
                    {testResult.accountName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Account: {testResult.accountName}
                      </p>
                    )}
                    {testResult.mode && (
                      <Badge variant="outline" className={cn(
                        "mt-2",
                        testResult.mode === 'test' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                      )}>
                        {testResult.mode === 'test' ? 'Sandbox/Test Mode' : 'Production Mode'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={testConnection} disabled={testing || !formData.apiKey}>
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Test Connection
              </Button>
              <Button className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/80" onClick={saveGatewayConfig}>
                <CheckCircle className="w-4 h-4" />
                Save Gateway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Gateway Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[400px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Request New Gateway</DialogTitle>
            <DialogDescription>Request a payment gateway to be enabled by the platform admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Gateway Name</Label>
              <Input value={requestForm.gatewayName} onChange={(e) => setRequestForm({...requestForm, gatewayName: e.target.value})} placeholder="e.g., Wise, Revolut" className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea value={requestForm.reason} onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})} placeholder="Why do you need this gateway?" className="bg-background/50" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Expected Monthly Volume</Label>
              <select className="w-full p-2 rounded-md border bg-background/50" value={requestForm.expectedVolume} onChange={(e) => setRequestForm({...requestForm, expectedVolume: e.target.value})}>
                <option value="">Select volume</option>
                <option value="low">Under $1,000</option>
                <option value="medium">$1,000 - $10,000</option>
                <option value="high">$10,000 - $50,000</option>
                <option value="enterprise">Over $50,000</option>
              </select>
            </div>
            <Button className="w-full gap-2" onClick={submitGatewayRequest}>
              <Send className="w-4 h-4" />
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Payment Dialog */}
      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Banknote className="w-6 h-6 text-emerald-500" />
              {editingManual ? 'Edit Manual Payment' : 'Add Manual Payment'}
            </DialogTitle>
            <DialogDescription>
              Configure payment instructions for bank transfers, mobile money, or other manual payment methods
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Payment Method Title *</Label>
              <Input 
                value={manualForm.title} 
                onChange={(e) => setManualForm({...manualForm, title: e.target.value})} 
                placeholder="e.g., Bank Transfer (GTBank), Mobile Money, Western Union"
                className="bg-background/50" 
              />
            </div>
            <div className="space-y-2">
              <Label>Bank/Account Details</Label>
              <Textarea 
                value={manualForm.bankDetails} 
                onChange={(e) => setManualForm({...manualForm, bankDetails: e.target.value})} 
                placeholder="Bank: GTBank&#10;Account Name: Your Business Name&#10;Account Number: 0123456789&#10;Swift Code: GTBINGLA"
                className="bg-background/50 font-mono text-sm" 
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Instructions</Label>
              <Textarea 
                value={manualForm.instructions} 
                onChange={(e) => setManualForm({...manualForm, instructions: e.target.value})} 
                placeholder="1. Make the transfer to the account above&#10;2. Send proof of payment via WhatsApp to +234...&#10;3. Your account will be credited within 24 hours"
                className="bg-background/50" 
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Processing Time</Label>
              <select 
                className="w-full p-2 rounded-md border bg-background/50" 
                value={manualForm.processingTime} 
                onChange={(e) => setManualForm({...manualForm, processingTime: e.target.value})}
              >
                <option value="1-2 hours">1-2 hours</option>
                <option value="6-12 hours">6-12 hours</option>
                <option value="12-24 hours">12-24 hours</option>
                <option value="1-2 business days">1-2 business days</option>
                <option value="2-5 business days">2-5 business days</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setManualDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveManualPayment} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle className="w-4 h-4" />
              {editingManual ? 'Save Changes' : 'Add Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
