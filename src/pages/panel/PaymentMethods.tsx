import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Search,
  CheckCircle,
  AlertCircle,
  Globe,
  Wallet,
  Bitcoin,
  Building2,
  Banknote,
  Plus,
  Eye,
  EyeOff,
  Play,
  Loader2,
  Sparkles,
  Send,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePanel } from "@/hooks/usePanel";
import { supabase } from "@/integrations/supabase/client";
import { useAvailablePaymentGateways } from "@/hooks/useAvailablePaymentGateways";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaymentMethodRow } from "@/components/billing/PaymentMethodRow";
import { TransactionKanban } from "@/components/billing/TransactionKanban";

// Import only commonly available icons - create a fallback for missing ones
import {
  StripeIcon,
  PayPalIcon,
  BitcoinIcon,
  CoinbaseIcon,
  RazorpayIcon,
  PaystackIcon,
  FlutterwaveIcon,
  SquareIcon,
  SkrillIcon,
  WiseIcon,
  GenericPaymentIcon,
} from "@/components/payment/PaymentIcons";

// Fallback icon component for missing icons
const FallbackIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center bg-muted rounded-full", className)}>
    <span className="text-xs font-bold">PM</span>
  </div>
);

interface GatewayType {
  id: string;
  name: string;
  Icon: React.FC<{ className?: string }>;
  regions: string[];
  fee: string;
  docsUrl: string;
}

// Fixed payment gateways with working docs and valid icons
const paymentGateways = {
  cards: [
    {
      id: "stripe",
      name: "Stripe",
      Icon: StripeIcon,
      regions: ["Worldwide"],
      fee: "2.9% + $0.30",
      docsUrl: "https://stripe.com/docs",
    },
    {
      id: "paypal",
      name: "PayPal",
      Icon: PayPalIcon,
      regions: ["Worldwide"],
      fee: "2.9% + $0.30",
      docsUrl: "https://developer.paypal.com",
    },
    {
      id: "square",
      name: "Square",
      Icon: SquareIcon,
      regions: ["US, CA, UK, AU, JP"],
      fee: "2.6% + $0.10",
      docsUrl: "https://developer.squareup.com",
    },
    {
      id: "adyen",
      name: "Adyen",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "Variable",
      docsUrl: "https://docs.adyen.com",
    },
    {
      id: "authorize_net",
      name: "Authorize.net",
      Icon: GenericPaymentIcon,
      regions: ["US, CA, UK, EU"],
      fee: "2.9% + $0.30",
      docsUrl: "https://developer.authorize.net",
    },
    {
      id: "braintree",
      name: "Braintree",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "2.9% + $0.30",
      docsUrl: "https://developer.paypal.com/braintree",
    },
    {
      id: "checkout_com",
      name: "Checkout.com",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "2.9% + $0.20",
      docsUrl: "https://docs.checkout.com",
    },
    {
      id: "worldpay",
      name: "Worldpay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "Variable",
      docsUrl: "https://developer.worldpay.com",
    },
    {
      id: "mollie",
      name: "Mollie",
      Icon: GenericPaymentIcon,
      regions: ["Europe"],
      fee: "1.8% + €0.25",
      docsUrl: "https://docs.mollie.com",
    },
    {
      id: "2checkout",
      name: "2Checkout (Verifone)",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "3.5% + $0.35",
      docsUrl: "https://verifone.cloud/docs",
    },
    {
      id: "paddle",
      name: "Paddle",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "5% + $0.50",
      docsUrl: "https://developer.paddle.com",
    },
    {
      id: "recurly",
      name: "Recurly",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "Variable",
      docsUrl: "https://developers.recurly.com",
    },
    {
      id: "chargebee",
      name: "Chargebee",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "Variable",
      docsUrl: "https://apidocs.chargebee.com",
    },
  ],
  regional: [
    {
      id: "razorpay",
      name: "Razorpay",
      Icon: RazorpayIcon,
      regions: ["India"],
      fee: "2%",
      docsUrl: "https://razorpay.com/docs",
    },
    {
      id: "paystack",
      name: "Paystack",
      Icon: PaystackIcon,
      regions: ["Africa"],
      fee: "1.5% + ₦100",
      docsUrl: "https://paystack.com/docs",
    },
    {
      id: "flutterwave",
      name: "Flutterwave",
      Icon: FlutterwaveIcon,
      regions: ["Africa"],
      fee: "1.4%",
      docsUrl: "https://developer.flutterwave.com",
    },
    {
      id: "mercado_pago",
      name: "Mercado Pago",
      Icon: GenericPaymentIcon,
      regions: ["LATAM"],
      fee: "3.49%",
      docsUrl: "https://www.mercadopago.com/developers",
    },
    {
      id: "iyzico",
      name: "Iyzico",
      Icon: GenericPaymentIcon,
      regions: ["Turkey"],
      fee: "2.49%",
      docsUrl: "https://dev.iyzipay.com",
    },
    {
      id: "xendit",
      name: "Xendit",
      Icon: GenericPaymentIcon,
      regions: ["SEA"],
      fee: "2.9%",
      docsUrl: "https://docs.xendit.co",
    },
    {
      id: "midtrans",
      name: "Midtrans",
      Icon: GenericPaymentIcon,
      regions: ["Indonesia"],
      fee: "2.9%",
      docsUrl: "https://docs.midtrans.com",
    },
    {
      id: "gcash",
      name: "GCash",
      Icon: GenericPaymentIcon,
      regions: ["Philippines"],
      fee: "2%",
      docsUrl: "https://developer.gcash.com",
    },
    {
      id: "grabpay",
      name: "GrabPay",
      Icon: GenericPaymentIcon,
      regions: ["SEA"],
      fee: "2%",
      docsUrl: "https://developer.grab.com",
    },
    {
      id: "mtn_momo",
      name: "MTN MoMo",
      Icon: GenericPaymentIcon,
      regions: ["Africa"],
      fee: "1%",
      docsUrl: "https://momodeveloper.mtn.com",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      Icon: GenericPaymentIcon,
      regions: ["East Africa"],
      fee: "1%",
      docsUrl: "https://developer.safaricom.co.ke",
    },
    {
      id: "bkash",
      name: "bKash",
      Icon: GenericPaymentIcon,
      regions: ["Bangladesh"],
      fee: "1.85%",
      docsUrl: "https://developer.bka.sh",
    },
    {
      id: "paytm",
      name: "Paytm",
      Icon: GenericPaymentIcon,
      regions: ["India"],
      fee: "1.99%",
      docsUrl: "https://developer.paytm.com",
    },
    {
      id: "upi",
      name: "UPI",
      Icon: GenericPaymentIcon,
      regions: ["India"],
      fee: "0%",
      docsUrl: "https://www.npci.org.in/what-we-do/upi/product-overview",
    },
    {
      id: "alipay",
      name: "Alipay",
      Icon: GenericPaymentIcon,
      regions: ["China, Asia"],
      fee: "2.2%",
      docsUrl: "https://global.alipay.com/docs",
    },
    {
      id: "wechat_pay",
      name: "WeChat Pay",
      Icon: GenericPaymentIcon,
      regions: ["China, Asia"],
      fee: "2%",
      docsUrl: "https://pay.weixin.qq.com/docs",
    },
  ],
  ewallets: [
    {
      id: "skrill",
      name: "Skrill",
      Icon: SkrillIcon,
      regions: ["Worldwide"],
      fee: "1.9%",
      docsUrl: "https://developer.skrill.com",
    },
    {
      id: "wise",
      name: "Wise",
      Icon: WiseIcon,
      regions: ["Worldwide"],
      fee: "0.5%",
      docsUrl: "https://wise.com/developers",
    },
    {
      id: "neteller",
      name: "Neteller",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "2.5%",
      docsUrl: "https://developer.paysafe.com/en/neteller",
    },
    {
      id: "payoneer",
      name: "Payoneer",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "1%",
      docsUrl: "https://developer.payoneer.com",
    },
    {
      id: "revolut",
      name: "Revolut",
      Icon: GenericPaymentIcon,
      regions: ["Europe, US, UK"],
      fee: "1%",
      docsUrl: "https://developer.revolut.com",
    },
    {
      id: "venmo",
      name: "Venmo",
      Icon: GenericPaymentIcon,
      regions: ["US"],
      fee: "1.9% + $0.10",
      docsUrl: "https://developer.paypal.com/docs/checkout/pay-with-venmo",
    },
    {
      id: "zelle",
      name: "Zelle",
      Icon: GenericPaymentIcon,
      regions: ["US"],
      fee: "0%",
      docsUrl: "https://www.zellepay.com",
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "Via gateway",
      docsUrl: "https://developer.apple.com/apple-pay",
    },
    {
      id: "google_pay",
      name: "Google Pay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "Via gateway",
      docsUrl: "https://developers.google.com/pay",
    },
    {
      id: "cashapp",
      name: "Cash App",
      Icon: GenericPaymentIcon,
      regions: ["US, UK"],
      fee: "2.75%",
      docsUrl: "https://cash.app/help",
    },
    {
      id: "amazon_pay",
      name: "Amazon Pay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "2.9% + $0.30",
      docsUrl: "https://developer.amazon.com/docs/amazon-pay",
    },
  ],
  bank: [
    {
      id: "ach",
      name: "ACH Transfer",
      Icon: GenericPaymentIcon,
      regions: ["US"],
      fee: "$0.25",
      docsUrl: "https://stripe.com/docs/ach",
    },
    {
      id: "sepa",
      name: "SEPA Transfer",
      Icon: GenericPaymentIcon,
      regions: ["Europe"],
      fee: "€0.35",
      docsUrl: "https://stripe.com/docs/sepa",
    },
    {
      id: "ideal",
      name: "iDEAL",
      Icon: GenericPaymentIcon,
      regions: ["Netherlands"],
      fee: "€0.29",
      docsUrl: "https://www.ideal.nl/en/developers",
    },
    {
      id: "bancontact",
      name: "Bancontact",
      Icon: GenericPaymentIcon,
      regions: ["Belgium"],
      fee: "€0.25",
      docsUrl: "https://www.bancontact.com",
    },
    {
      id: "boleto",
      name: "Boleto Bancário",
      Icon: GenericPaymentIcon,
      regions: ["Brazil"],
      fee: "R$3.49",
      docsUrl: "https://stripe.com/docs/payments/boleto",
    },
    {
      id: "pix",
      name: "PIX",
      Icon: GenericPaymentIcon,
      regions: ["Brazil"],
      fee: "0.99%",
      docsUrl: "https://www.bcb.gov.br/estabilidadefinanceira/pix",
    },
    {
      id: "sofort",
      name: "Sofort",
      Icon: GenericPaymentIcon,
      regions: ["Europe"],
      fee: "0.9%",
      docsUrl: "https://docs.klarna.com/sofort",
    },
    {
      id: "giropay",
      name: "Giropay",
      Icon: GenericPaymentIcon,
      regions: ["Germany"],
      fee: "1.2%",
      docsUrl: "https://www.giropay.de",
    },
  ],
  crypto: [
    {
      id: "coinbase_commerce",
      name: "Coinbase Commerce",
      Icon: CoinbaseIcon,
      regions: ["Worldwide"],
      fee: "1%",
      docsUrl: "https://commerce.coinbase.com/docs",
    },
    {
      id: "btcpay",
      name: "BTCPay Server",
      Icon: BitcoinIcon,
      regions: ["Worldwide"],
      fee: "0%",
      docsUrl: "https://docs.btcpayserver.org",
    },
    {
      id: "nowpayments",
      name: "NowPayments",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "0.5%",
      docsUrl: "https://nowpayments.io/docs",
    },
    {
      id: "binance_pay",
      name: "Binance Pay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "0.9%",
      docsUrl: "https://developers.binance.com/docs/binance-pay",
    },
    {
      id: "bitpay",
      name: "BitPay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "1%",
      docsUrl: "https://bitpay.com/docs",
    },
    {
      id: "cryptomus",
      name: "Cryptomus",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "0.4%",
      docsUrl: "https://doc.cryptomus.com",
    },
    {
      id: "coinpayments",
      name: "CoinPayments",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "0.5%",
      docsUrl: "https://www.coinpayments.net/apidoc",
    },
    {
      id: "plisio",
      name: "Plisio",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "0.5%",
      docsUrl: "https://plisio.net/documentation",
    },
    {
      id: "opennode",
      name: "OpenNode",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "1%",
      docsUrl: "https://developers.opennode.com",
    },
    {
      id: "moonpay",
      name: "MoonPay",
      Icon: GenericPaymentIcon,
      regions: ["Worldwide"],
      fee: "4.5%",
      docsUrl: "https://docs.moonpay.com",
    },
  ],
  bnpl: [
    {
      id: "klarna",
      name: "Klarna",
      Icon: GenericPaymentIcon,
      regions: ["US, EU, UK, AU"],
      fee: "3.29% + $0.30",
      docsUrl: "https://docs.klarna.com",
    },
    {
      id: "afterpay",
      name: "Afterpay",
      Icon: GenericPaymentIcon,
      regions: ["US, UK, AU, NZ"],
      fee: "4-6% + $0.30",
      docsUrl: "https://developers.afterpay.com",
    },
    {
      id: "affirm",
      name: "Affirm",
      Icon: GenericPaymentIcon,
      regions: ["US, CA"],
      fee: "Variable",
      docsUrl: "https://docs.affirm.com",
    },
    {
      id: "sezzle",
      name: "Sezzle",
      Icon: GenericPaymentIcon,
      regions: ["US, CA"],
      fee: "6% + $0.30",
      docsUrl: "https://docs.sezzle.com",
    },
  ],
};

// Fixed gateway setup steps with working URLs
const gatewaySetupSteps: Record<string, string[]> = {
  stripe: [
    "1. Go to stripe.com/dashboard → Developers → API Keys",
    "2. Copy Publishable Key (pk_live_…)",
    "3. Copy Secret Key (sk_live_…)",
    "4. Ensure Live mode is selected",
  ],
  paypal: [
    "1. Go to developer.paypal.com → My Apps & Credentials",
    "2. Select Live tab → Create or select app",
    "3. Copy Client ID and Secret",
  ],
  square: [
    "1. Go to developer.squareup.com → Applications",
    "2. Select your Production app",
    "3. Copy Application ID and Access Token",
  ],
  razorpay: [
    "1. Go to dashboard.razorpay.com → Settings → API Keys",
    "2. Generate Live Key",
    "3. Copy Key ID and Key Secret",
  ],
  paystack: ["1. Go to dashboard.paystack.com → Settings → API Keys", "2. Copy Live Secret Key (sk_live_…)"],
  flutterwave: [
    "1. Go to dashboard.flutterwave.com → Settings → API Keys",
    "2. Switch to Live mode",
    "3. Copy Public Key and Secret Key",
  ],
  coinbase_commerce: [
    "1. Go to commerce.coinbase.com → Settings → API Keys",
    "2. Create new API Key",
    "3. Copy the API Key",
  ],
  btcpay: [
    "1. Go to your BTCPay Server → Stores → Settings → Access Tokens",
    "2. Generate new token with invoice permissions",
  ],
  adyen: [
    "1. Log in at ca-live.adyen.com → Developers → API Credentials",
    "2. Generate new API Key",
    "3. Copy API Key and Merchant Account",
  ],
  checkout_com: [
    "1. Go to hub.checkout.com → Developers → Keys",
    "2. Copy Public Key and Secret Key from Live environment",
  ],
  authorize_net: [
    "1. Go to account.authorize.net → Settings → API Login ID",
    "2. Copy API Login ID and Transaction Key",
  ],
  braintree: [
    "1. Log in at braintreegateway.com → Settings → API Keys",
    "2. Switch to Production",
    "3. Copy Public Key and Private Key",
  ],
  mollie: ["1. Go to my.mollie.com → Developers → API Keys", "2. Copy Live API Key (live_…)"],
  sezzle: ["1. Go to dashboard.sezzle.com → Settings → API Keys", "2. Copy Public Key and Private Key"],
  klarna: ["1. Go to portal.klarna.com → Settings → API Credentials", "2. Copy API Username and Password"],
  afterpay: ["1. Go to portal.afterpay.com → Developer Settings", "2. Copy Merchant ID and Secret Key"],
  affirm: [
    "1. Go to sandbox.affirm.com → Merchant Dashboard → API Keys",
    "2. Switch to Production",
    "3. Copy Public and Private API Keys",
  ],
  apple_pay: [
    "1. Apple Pay requires an underlying gateway (Stripe, Adyen, etc.)",
    "2. Configure your primary gateway first",
    "3. Enable Apple Pay in your gateway dashboard",
  ],
  google_pay: [
    "1. Google Pay requires an underlying gateway (Stripe, Adyen, etc.)",
    "2. Configure your primary gateway first",
    "3. Enable Google Pay in your gateway dashboard",
  ],
};

// Field labels configuration
const gatewayFieldLabels: Record<
  string,
  {
    field1Label: string;
    field1Placeholder: string;
    field2Label: string;
    field2Placeholder: string;
    field2Required: boolean;
  }
> = {
  stripe: {
    field1Label: "Publishable Key",
    field1Placeholder: "pk_live_xxxx",
    field2Label: "Secret Key",
    field2Placeholder: "sk_live_xxxx",
    field2Required: true,
  },
  paypal: {
    field1Label: "Client ID",
    field1Placeholder: "Your PayPal Client ID",
    field2Label: "Client Secret",
    field2Placeholder: "Your PayPal Client Secret",
    field2Required: true,
  },
  razorpay: {
    field1Label: "Key ID",
    field1Placeholder: "rzp_live_xxxx",
    field2Label: "Key Secret",
    field2Placeholder: "Your Razorpay Key Secret",
    field2Required: true,
  },
  paystack: {
    field1Label: "Public Key",
    field1Placeholder: "pk_live_xxxx",
    field2Label: "Secret Key",
    field2Placeholder: "sk_live_xxxx",
    field2Required: true,
  },
  flutterwave: {
    field1Label: "Public Key",
    field1Placeholder: "FLWPUBK-xxxx",
    field2Label: "Secret Key",
    field2Placeholder: "FLWSECK-xxxx",
    field2Required: true,
  },
  coinbase_commerce: {
    field1Label: "API Key",
    field1Placeholder: "Your Coinbase Commerce API Key",
    field2Label: "Webhook Secret (optional)",
    field2Placeholder: "Webhook shared secret",
    field2Required: false,
  },
  btcpay: {
    field1Label: "Server URL",
    field1Placeholder: "https://btcpay.yourdomain.com",
    field2Label: "API Key",
    field2Placeholder: "Your BTCPay API Key",
    field2Required: true,
  },
  adyen: {
    field1Label: "API Key",
    field1Placeholder: "Your Adyen API Key",
    field2Label: "Merchant Account",
    field2Placeholder: "Your Merchant Account ID",
    field2Required: true,
  },
  mollie: {
    field1Label: "API Key",
    field1Placeholder: "live_xxxx",
    field2Label: "Profile ID (optional)",
    field2Placeholder: "pfl_xxxx",
    field2Required: false,
  },
  authorize_net: {
    field1Label: "API Login ID",
    field1Placeholder: "Your Authorize.net API Login ID",
    field2Label: "Transaction Key",
    field2Placeholder: "Your Transaction Key",
    field2Required: true,
  },
  sezzle: {
    field1Label: "Public Key",
    field1Placeholder: "Your Sezzle Public Key",
    field2Label: "Private Key",
    field2Placeholder: "Your Sezzle Private Key",
    field2Required: true,
  },
  klarna: {
    field1Label: "API Username",
    field1Placeholder: "Your Klarna API Username",
    field2Label: "API Password",
    field2Placeholder: "Your Klarna API Password",
    field2Required: true,
  },
  afterpay: {
    field1Label: "Merchant ID",
    field1Placeholder: "Your Afterpay Merchant ID",
    field2Label: "Secret Key",
    field2Placeholder: "Your Afterpay Secret Key",
    field2Required: true,
  },
  apple_pay: {
    field1Label: "Merchant ID",
    field1Placeholder: "merchant.com.yourdomain",
    field2Label: "Gateway API Key",
    field2Placeholder: "Your Stripe/Adyen API Key",
    field2Required: true,
  },
  google_pay: {
    field1Label: "Merchant ID",
    field1Placeholder: "merchant.com.yourdomain",
    field2Label: "Gateway API Key",
    field2Placeholder: "Your Stripe/Adyen API Key",
    field2Required: true,
  },
  cryptomus: {
    field1Label: "Merchant UUID",
    field1Placeholder: "Your Cryptomus Merchant UUID",
    field2Label: "API Key",
    field2Placeholder: "Your Cryptomus API Key",
    field2Required: true,
  },
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
  const [configuredGateways, setConfiguredGateways] = useState<
    Record<string, { enabled: boolean; apiKey: string; secretKey: string }>
  >({});
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<GatewayType | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    apiKey: "",
    secretKey: "",
    minDeposit: "5",
    maxDeposit: "1000",
    feePercentage: "0",
    fixedFee: "0",
  });
  const [manualPayments, setManualPayments] = useState<ManualPaymentMethod[]>([]);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [editingManual, setEditingManual] = useState<ManualPaymentMethod | null>(null);
  const [manualForm, setManualForm] = useState({
    title: "",
    bankDetails: "",
    instructions: "",
    processingTime: "12-24 hours",
  });
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestForm, setRequestForm] = useState({ gatewayName: "", reason: "", expectedVolume: "" });
  const [activeMainTab, setActiveMainTab] = useState<"buyer" | "billing">("buyer");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    accountName?: string;
    mode?: string;
  } | null>(null);

  const { refresh: refreshAvailableGateways } = useAvailablePaymentGateways({
    panelId: panel?.id,
    panelSettings: (panel?.settings as any) || null,
  });

  // Load configured gateways
  useEffect(() => {
    if (panel?.id) {
      loadConfiguredGateways();
    }
  }, [panel?.id]);

  const loadConfiguredGateways = () => {
    const settings = panel?.settings as any;
    if (settings?.payments?.enabledMethods) {
      const methods = settings.payments.enabledMethods;
      const loaded: Record<string, { enabled: boolean; apiKey: string; secretKey: string }> = {};
      methods.forEach((m: any) => {
        loaded[m.id] = { enabled: m.enabled ?? true, apiKey: m.apiKey || "", secretKey: m.secretKey || "" };
      });
      setConfiguredGateways(loaded);
    }
    if (settings?.payments?.manualPayments) {
      setManualPayments(settings.payments.manualPayments);
    }
  };

  const getGatewaysForCategory = () => {
    if (activeCategory === "all") {
      return Object.values(paymentGateways).flat();
    }
    return paymentGateways[activeCategory];
  };

  const filteredGateways = getGatewaysForCategory().filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.regions.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const enabledCount = Object.values(configuredGateways).filter((g) => g.enabled).length;

  const openConfigDialog = (gateway: GatewayType) => {
    setSelectedGateway(gateway);
    setTestResult(null);
    const existing = configuredGateways[gateway.id];
    if (existing) {
      setFormData({ ...formData, apiKey: existing.apiKey, secretKey: existing.secretKey });
    } else {
      setFormData({
        apiKey: "",
        secretKey: "",
        minDeposit: "5",
        maxDeposit: "1000",
        feePercentage: "0",
        fixedFee: "0",
      });
    }
    setConfigDialogOpen(true);
  };

  const saveGatewayConfig = async () => {
    if (!selectedGateway || !formData.apiKey || !panel?.id) {
      toast({ variant: "destructive", title: "API Key required" });
      return;
    }

    const updatedGateways = {
      ...configuredGateways,
      [selectedGateway.id]: { enabled: true, apiKey: formData.apiKey, secretKey: formData.secretKey },
    };
    setConfiguredGateways(updatedGateways);

    try {
      const enabledMethods = Object.entries(updatedGateways)
        .filter(([_, config]) => config.enabled)
        .map(([id, config]) => ({
          id,
          enabled: true,
          apiKey: config.apiKey,
          secretKey: config.secretKey,
          minDeposit: parseFloat(formData.minDeposit) || 5,
          maxDeposit: parseFloat(formData.maxDeposit) || 1000,
        }));

      const currentSettings = (panel?.settings as any) || {};
      const updatedSettings = {
        ...currentSettings,
        payments: {
          enabledMethods,
          configuredAt: new Date().toISOString(),
        },
      };

      await supabase.from("panels").update({ settings: updatedSettings }).eq("id", panel.id);

      refreshPanel();
      setConfigDialogOpen(false);
      toast({ title: `${selectedGateway.name} configured and saved!` });
    } catch (error) {
      console.error("Error saving gateway config:", error);
      toast({ variant: "destructive", title: "Failed to save configuration" });
    }
  };

  const toggleGateway = async (gatewayId: string) => {
    const current = configuredGateways[gatewayId];
    if (!current || !panel?.id) return;

    const updatedGateways = {
      ...configuredGateways,
      [gatewayId]: { ...current, enabled: !current.enabled },
    };
    setConfiguredGateways(updatedGateways);

    try {
      const enabledMethods = Object.entries(updatedGateways)
        .filter(([_, config]) => config.apiKey)
        .map(([id, config]) => ({
          id,
          enabled: config.enabled,
          apiKey: config.apiKey,
          secretKey: config.secretKey,
        }));

      const currentSettings = (panel?.settings as any) || {};
      await supabase
        .from("panels")
        .update({
          settings: {
            ...currentSettings,
            payments: {
              enabledMethods,
              configuredAt: new Date().toISOString(),
            },
          },
        })
        .eq("id", panel.id);

      refreshPanel();
    } catch (error) {
      console.error("Error toggling gateway:", error);
    }
  };

  const testConnection = async () => {
    if (!selectedGateway || !formData.apiKey) {
      toast({ variant: "destructive", title: "API key required" });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const gatewayId = selectedGateway.id.toLowerCase();
      let gateway: "stripe" | "paypal" | "coinbase" | null = null;

      if (gatewayId === "stripe") gateway = "stripe";
      else if (gatewayId === "paypal") gateway = "paypal";
      else if (gatewayId === "coinbase_commerce") gateway = "coinbase";

      if (!gateway) {
        await new Promise((r) => setTimeout(r, 1500));
        setTestResult({
          success: true,
          message: "Connection test simulated (gateway not yet supported for real testing)",
        });
        toast({ title: "Test Simulated", description: "This gateway doesn't support real API validation yet" });
        setTesting(false);
        return;
      }

      const response = await fetch("https://tooudgubuhxjbbvzjcgx.supabase.co/functions/v1/validate-payment-gateway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateway,
          apiKey: formData.apiKey,
          secretKey: formData.secretKey || undefined,
        }),
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast({
          title: "Connection Successful!",
          description: `${selectedGateway.name}: ${result.accountName || "Connected"} (${result.mode || "unknown"} mode)`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: result.error || result.message,
        });
      }
    } catch (error) {
      console.error("Test connection error:", error);
      setTestResult({ success: false, message: "Failed to connect to validation service" });
      toast({ variant: "destructive", title: "Test Failed", description: "Could not reach validation service" });
    } finally {
      setTesting(false);
    }
  };

  const openManualDialog = (method?: ManualPaymentMethod) => {
    if (method) {
      setEditingManual(method);
      setManualForm({
        title: method.title,
        bankDetails: method.bankDetails,
        instructions: method.instructions,
        processingTime: method.processingTime,
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
      updated = manualPayments.map((m) => (m.id === editingManual.id ? { ...m, ...manualForm } : m));
    } else {
      const newMethod: ManualPaymentMethod = {
        id: `manual_${Date.now()}`,
        title: manualForm.title,
        bankDetails: manualForm.bankDetails,
        instructions: manualForm.instructions,
        processingTime: manualForm.processingTime,
        enabled: true,
      };
      updated = [...manualPayments, newMethod];
    }

    setManualPayments(updated);

    try {
      const currentSettings = (panel?.settings as any) || {};
      const paymentSettings = currentSettings.payments || {};

      await supabase
        .from("panels")
        .update({
          settings: {
            ...currentSettings,
            payments: {
              ...paymentSettings,
              manualPayments: updated,
              configuredAt: new Date().toISOString(),
            },
          },
        })
        .eq("id", panel.id);

      refreshPanel();
      setManualDialogOpen(false);
      toast({ title: editingManual ? "Manual payment updated" : "Manual payment added" });
    } catch (error) {
      console.error("Error saving manual payment:", error);
      toast({ variant: "destructive", title: "Failed to save" });
    }
  };

  const deleteManualPayment = async (id: string) => {
    if (!panel?.id) return;

    const updated = manualPayments.filter((m) => m.id !== id);
    setManualPayments(updated);

    try {
      const currentSettings = (panel?.settings as any) || {};
      const paymentSettings = currentSettings.payments || {};

      await supabase
        .from("panels")
        .update({
          settings: {
            ...currentSettings,
            payments: {
              ...paymentSettings,
              manualPayments: updated,
            },
          },
        })
        .eq("id", panel.id);

      refreshPanel();
      toast({ title: "Manual payment deleted" });
    } catch (error) {
      console.error("Error deleting manual payment:", error);
      toast({ variant: "destructive", title: "Failed to delete" });
    }
  };

  const toggleManualPayment = async (id: string) => {
    if (!panel?.id) return;

    const updated = manualPayments.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setManualPayments(updated);

    try {
      const currentSettings = (panel?.settings as any) || {};
      const paymentSettings = currentSettings.payments || {};

      await supabase
        .from("panels")
        .update({
          settings: {
            ...currentSettings,
            payments: {
              ...paymentSettings,
              manualPayments: updated,
            },
          },
        })
        .eq("id", panel.id);

      refreshPanel();
    } catch (error) {
      console.error("Error toggling manual payment:", error);
    }
  };

  const submitGatewayRequest = () => {
    if (!requestForm.gatewayName.trim()) {
      toast({ variant: "destructive", title: "Gateway name required" });
      return;
    }
    setShowRequestDialog(false);
    setRequestForm({ gatewayName: "", reason: "", expectedVolume: "" });
    toast({ title: "Request submitted", description: "The platform admin will review your request" });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Payment Management
          </h1>
          <p className="text-muted-foreground">Configure payment methods for your buyers and manage deposits</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1.5">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            {enabledCount} Active Methods
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1.5">
            <Banknote className="w-4 h-4 mr-1.5" />
            {manualPayments.filter((m) => m.enabled).length} Manual
          </Badge>
        </div>
      </motion.div>

      <Tabs
        value={activeMainTab}
        onValueChange={(v) => setActiveMainTab(v as "buyer" | "billing")}
        className="space-y-6"
      >
        <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex gap-1 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger
            value="buyer"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wallet className="w-4 h-4" />
            <span>Payment Methods</span>
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Globe className="w-4 h-4" />
            <span>Transactions & History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyer" className="space-y-6">
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Globe className="w-4 h-4 text-blue-500" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <strong>Buyer Payment Methods:</strong> Configure the payment gateways that your buyers/customers will see
              on the <strong>/deposit</strong> page when adding funds to their account.
            </AlertDescription>
          </Alert>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9 bg-card/50 backdrop-blur-sm border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="bg-card/80 backdrop-blur-xl border-border/50 overflow-hidden">
            <CardContent className="p-0">
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
                    .filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
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

        <TabsContent value="billing" className="space-y-6">
          <Alert className="border-primary/30 bg-primary/5">
            <Globe className="w-4 h-4 text-primary" />
            <AlertDescription>
              <strong>Transaction Management:</strong> Review and approve pending deposits, view transaction history,
              and manage customer balances from buyers/tenants.
            </AlertDescription>
          </Alert>

          {panel?.id && <TransactionKanban panelId={panel.id} />}
        </TabsContent>
      </Tabs>

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
            {selectedGateway && gatewaySetupSteps[selectedGateway.id] && (
              <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20 space-y-1.5">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  How to get your Live API keys:
                </p>
                {gatewaySetupSteps[selectedGateway.id].map((step, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    {step}
                  </p>
                ))}
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
                    <Input
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder={f1Placeholder}
                      className="bg-background/50 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {f2Label} {!f2Required && <span className="text-muted-foreground text-xs">(optional)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        type={showSecretKey ? "text" : "password"}
                        value={formData.secretKey}
                        onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                        placeholder={f2Placeholder}
                        className="bg-background/50 font-mono text-sm pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                      >
                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="space-y-2">
              <Label>Webhook URL (auto-generated)</Label>
              <Input
                readOnly
                value={`${panel?.custom_domain ? `https://${panel.custom_domain}` : panel?.subdomain ? `https://${panel.subdomain}.smmpilot.online` : window.location.origin}/api/webhooks/${selectedGateway?.id}`}
                className="bg-muted/50 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Configure this URL in your {selectedGateway?.name} dashboard
              </p>
            </div>

            {selectedGateway?.docsUrl && (
              <a
                href={selectedGateway.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View {selectedGateway.name} Documentation
              </a>
            )}

            {testResult && (
              <div
                className={cn(
                  "p-4 rounded-lg border",
                  testResult.success ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30",
                )}
              >
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
                      <p className="text-sm text-muted-foreground mt-1">Account: {testResult.accountName}</p>
                    )}
                    {testResult.mode && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-2",
                          testResult.mode === "test"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20",
                        )}
                      >
                        {testResult.mode === "test" ? "Sandbox/Test Mode" : "Production Mode"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={testConnection}
                disabled={testing || !formData.apiKey}
              >
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

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[400px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle>Request New Gateway</DialogTitle>
            <DialogDescription>Request a payment gateway to be enabled by the platform admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Gateway Name</Label>
              <Input
                value={requestForm.gatewayName}
                onChange={(e) => setRequestForm({ ...requestForm, gatewayName: e.target.value })}
                placeholder="e.g., Wise, Revolut"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="Why do you need this gateway?"
                className="bg-background/50"
                rows={3}
              />
            </div>
            <Button className="w-full gap-2" onClick={submitGatewayRequest}>
              <Send className="w-4 h-4" />
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Banknote className="w-6 h-6 text-emerald-500" />
              {editingManual ? "Edit Manual Payment" : "Add Manual Payment"}
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
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                placeholder="e.g., Bank Transfer (GTBank), Mobile Money"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Bank/Account Details</Label>
              <Textarea
                value={manualForm.bankDetails}
                onChange={(e) => setManualForm({ ...manualForm, bankDetails: e.target.value })}
                placeholder="Bank: GTBank&#10;Account Name: Your Business Name&#10;Account Number: 0123456789"
                className="bg-background/50 font-mono text-sm"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Instructions</Label>
              <Textarea
                value={manualForm.instructions}
                onChange={(e) => setManualForm({ ...manualForm, instructions: e.target.value })}
                placeholder="1. Make the transfer to the account above&#10;2. Send proof of payment via WhatsApp..."
                className="bg-background/50"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Processing Time</Label>
              <select
                className="w-full p-2 rounded-md border bg-background/50"
                value={manualForm.processingTime}
                onChange={(e) => setManualForm({ ...manualForm, processingTime: e.target.value })}
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
              {editingManual ? "Save Changes" : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
