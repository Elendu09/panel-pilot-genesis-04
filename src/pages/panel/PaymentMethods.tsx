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
  BraintreeIcon, PayUIcon, PaytmIcon, CCAvenueIcon, PaddleIcon, GumroadIcon, FastSpringIcon, RecurlyIcon, ChargebeeIcon,
  TwoCTwoPIcon, PayGateIcon, EbanxIcon, PagSeguroIcon, NuveiIcon, BlueSnapIcon, CybersourceIcon, PayFastIcon,
  ThawaniIcon, TapIcon, MoyasarIcon, HyperPayIcon, BenefitIcon, STCPayIcon, FawryIcon, KashierIcon, AcceptPaymobIcon,
  IPayAfricaIcon, YocoIcon, CellulantIcon, DPOGroupIcon, PesapalIcon, HubtelIcon, AZAFinanceIcon, FlywireIcon, BokuIcon,
  MercadoPagoIcon, IyzicoIcon, PaymobIcon, XenditIcon, MidtransIcon, GCashIcon, GrabPayIcon, OpayIcon, MoovIcon, ChipperIcon, PagaIcon, RemitaIcon, InterswitchIcon, MTNMoMoIcon, MPesaIcon,
  ToyyibPayIcon, BillplzIcon, PayHereIcon, BkashIcon, SSLCommerzIcon, ESewaIcon, KhaltiIcon, JazzCashIcon, EasypaisaIcon,
  FlouciIcon, CinetPayIcon, PayDunyaIcon, CampayIcon, NotchPayIcon, WaveIcon, TigoMoneyIcon, AirtelMoneyIcon,
  UPIIcon, PhonePeIcon, DANAIcon, OVOIcon, ShopeePayIcon, TrueMoneyIcon, PromptPayIcon,
  KakaoPayIcon, TossPaymentsIcon, LinePayIcon, KonbiniIcon, PayPayIcon, AuPayIcon, VNPayIcon, MoMoVNIcon, ZaloPayIcon,
  NetellerIcon, WebMoneyIcon, PayoneerIcon, AlipayIcon, WeChatPayIcon, RevolutIcon, VenmoIcon, ZelleIcon,
  PaySeraIcon, PaysafecardIcon, CashAppIcon, ApplePayIcon, GooglePayIcon, SamsungPayIcon, AmazonPayIcon, ShopPayIcon,
  WireTransferIcon, IDealIcon, BancontactIcon, BoletoIcon, PIXIcon,
  TrustlyIcon, SofortIcon, GiropayIcon, EPSIcon, Przelewy24Icon, MultiBancoIcon, OXXOIcon, SPEIIcon,
  PlisioIcon, CoinPaymentsIcon, TripleAIcon, BitPayIcon, BlockonomicsIcon, OpenNodeIcon, MixPayIcon, CryptocloudIcon, OxapayIcon, SpicePayIcon, CryptomusIcon, HeleketIcon,
  UtrustIcon, ConfirmoIcon, SpeedIcon, GoURLIcon, B2BinPayIcon, CoinremitterIcon, CoinsPaidIcon, SpectrocoinIcon, TransakIcon, MoonPayIcon, SimplexIcon, RampIcon, SardineIcon,
  KlarnaIcon, AfterpayIcon, TabbyIcon, TamaraIcon, SezzleIcon,
  AffirmIcon, ZipPayIcon, SplititIcon, LaybuyIcon, OpenpayIcon, AtomeIcon, HoolahIcon, PaceIcon,
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
    { id: "braintree", name: "Braintree", Icon: BraintreeIcon, regions: ["Worldwide"], fee: "2.9% + $0.30", docsUrl: "https://developer.paypal.com/braintree" },
    { id: "adyen", name: "Adyen", Icon: AdyenIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.adyen.com" },
    { id: "checkoutcom", name: "Checkout.com", Icon: CheckoutComIcon, regions: ["Worldwide"], fee: "2.9% + $0.20", docsUrl: "https://docs.checkout.com" },
    { id: "worldpay", name: "Worldpay", Icon: WorldpayIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://developer.worldpay.com" },
    { id: "authorizenet", name: "Authorize.net", Icon: AuthorizeNetIcon, regions: ["US, CA, UK, EU"], fee: "2.9% + $0.30", docsUrl: "https://developer.authorize.net" },
    { id: "twocheckout", name: "2Checkout (Verifone)", Icon: TwoCheckoutIcon, regions: ["Worldwide"], fee: "3.5% + $0.35", docsUrl: "https://verifone.cloud/docs" },
    { id: "mollie", name: "Mollie", Icon: MollieIcon, regions: ["Europe"], fee: "1.8% + €0.25", docsUrl: "https://docs.mollie.com" },
    { id: "dlocal", name: "dLocal", Icon: DLocalIcon, regions: ["LATAM, Africa, Asia"], fee: "Variable", docsUrl: "https://docs.dlocal.com" },
    { id: "rapyd", name: "Rapyd", Icon: RapydIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.rapyd.net" },
    { id: "payu", name: "PayU", Icon: PayUIcon, regions: ["LATAM, India, EU, Africa"], fee: "2.3%", docsUrl: "https://developers.payu.com" },
    { id: "ccavenue", name: "CCAvenue", Icon: CCAvenueIcon, regions: ["India"], fee: "2%", docsUrl: "https://www.ccavenue.com/apidoc" },
    { id: "paddle", name: "Paddle", Icon: PaddleIcon, regions: ["Worldwide"], fee: "5% + $0.50", docsUrl: "https://developer.paddle.com" },
    { id: "gumroad", name: "Gumroad", Icon: GumroadIcon, regions: ["Worldwide"], fee: "10%", docsUrl: "https://gumroad.com/api" },
    { id: "fastspring", name: "FastSpring", Icon: FastSpringIcon, regions: ["Worldwide"], fee: "5.9% + $0.95", docsUrl: "https://developer.fastspring.com" },
    { id: "recurly", name: "Recurly", Icon: RecurlyIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://developers.recurly.com" },
    { id: "chargebee", name: "Chargebee", Icon: ChargebeeIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://apidocs.chargebee.com" },
    { id: "2c2p", name: "2C2P", Icon: TwoCTwoPIcon, regions: ["SEA"], fee: "3.5%", docsUrl: "https://developer.2c2p.com" },
    { id: "paygate", name: "PayGate", Icon: PayGateIcon, regions: ["South Africa"], fee: "3.5%", docsUrl: "https://docs.paygate.co.za" },
    { id: "ebanx", name: "Ebanx", Icon: EbanxIcon, regions: ["LATAM"], fee: "Variable", docsUrl: "https://developers.ebanx.com" },
    { id: "pagseguro", name: "PagSeguro", Icon: PagSeguroIcon, regions: ["Brazil"], fee: "3.99%", docsUrl: "https://dev.pagseguro.uol.com.br" },
    { id: "nuvei", name: "Nuvei", Icon: NuveiIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.nuvei.com" },
    { id: "bluesnap", name: "BlueSnap", Icon: BlueSnapIcon, regions: ["Worldwide"], fee: "2.9% + $0.30", docsUrl: "https://developers.bluesnap.com" },
    { id: "cybersource", name: "Cybersource", Icon: CybersourceIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://developer.cybersource.com" },
    { id: "payfast", name: "PayFast", Icon: PayFastIcon, regions: ["South Africa"], fee: "3.5% + R2", docsUrl: "https://developers.payfast.co.za" },
    { id: "thawani", name: "Thawani", Icon: ThawaniIcon, regions: ["Oman"], fee: "2%", docsUrl: "https://docs.thawani.om" },
    { id: "tap", name: "Tap Payments", Icon: TapIcon, regions: ["MENA"], fee: "2.65%", docsUrl: "https://developers.tap.company" },
    { id: "moyasar", name: "Moyasar", Icon: MoyasarIcon, regions: ["Saudi Arabia"], fee: "2.8%", docsUrl: "https://docs.moyasar.com" },
    { id: "hyperpay", name: "HyperPay", Icon: HyperPayIcon, regions: ["MENA"], fee: "2.5%", docsUrl: "https://docs.hyperpay.com" },
    { id: "benefit", name: "Benefit", Icon: BenefitIcon, regions: ["Bahrain"], fee: "Variable", docsUrl: "https://www.benefit.bh" },
    { id: "stcpay", name: "STC Pay", Icon: STCPayIcon, regions: ["Saudi Arabia"], fee: "2.5%", docsUrl: "https://www.stcpay.com.sa" },
    { id: "fawry", name: "Fawry", Icon: FawryIcon, regions: ["Egypt"], fee: "2.5%", docsUrl: "https://developer.fawrystaging.com" },
    { id: "kashier", name: "Kashier", Icon: KashierIcon, regions: ["Egypt"], fee: "2.5%", docsUrl: "https://kashier.io/docs" },
    { id: "accept_paymob", name: "Accept (Paymob)", Icon: AcceptPaymobIcon, regions: ["Egypt, Pakistan"], fee: "2.5%", docsUrl: "https://docs.paymob.com" },
    { id: "yoco", name: "Yoco", Icon: YocoIcon, regions: ["South Africa"], fee: "2.95%", docsUrl: "https://developer.yoco.com" },
    { id: "cellulant", name: "Cellulant", Icon: CellulantIcon, regions: ["Africa"], fee: "Variable", docsUrl: "https://docs.cellulant.io" },
    { id: "dpo_group", name: "DPO Group", Icon: DPOGroupIcon, regions: ["Africa"], fee: "3.5%", docsUrl: "https://docs.dpogroup.com" },
    { id: "pesapal", name: "Pesapal", Icon: PesapalIcon, regions: ["East Africa"], fee: "3.5%", docsUrl: "https://developer.pesapal.com" },
    { id: "hubtel", name: "Hubtel", Icon: HubtelIcon, regions: ["Ghana"], fee: "2%", docsUrl: "https://developers.hubtel.com" },
    { id: "flywire", name: "Flywire", Icon: FlywireIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.flywire.com" },
    { id: "boku", name: "Boku", Icon: BokuIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://developer.boku.com" },
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
    { id: "toyyibpay", name: "ToyyibPay", Icon: ToyyibPayIcon, regions: ["Malaysia"], fee: "1.5%", docsUrl: "https://toyyibpay.com/apireference" },
    { id: "billplz", name: "Billplz", Icon: BillplzIcon, regions: ["Malaysia"], fee: "1%", docsUrl: "https://www.billplz.com/api" },
    { id: "payhere", name: "PayHere", Icon: PayHereIcon, regions: ["Sri Lanka"], fee: "3%", docsUrl: "https://support.payhere.lk/api-docs" },
    { id: "bkash", name: "bKash", Icon: BkashIcon, regions: ["Bangladesh"], fee: "1.85%", docsUrl: "https://developer.bka.sh" },
    { id: "sslcommerz", name: "SSLCommerz", Icon: SSLCommerzIcon, regions: ["Bangladesh"], fee: "2%", docsUrl: "https://developer.sslcommerz.com" },
    { id: "esewa", name: "eSewa", Icon: ESewaIcon, regions: ["Nepal"], fee: "2%", docsUrl: "https://developer.esewa.com.np" },
    { id: "khalti", name: "Khalti", Icon: KhaltiIcon, regions: ["Nepal"], fee: "2%", docsUrl: "https://docs.khalti.com" },
    { id: "jazzcash", name: "JazzCash", Icon: JazzCashIcon, regions: ["Pakistan"], fee: "2%", docsUrl: "https://sandbox.jazzcash.com.pk/Sandbox/Home/Document" },
    { id: "easypaisa", name: "Easypaisa", Icon: EasypaisaIcon, regions: ["Pakistan"], fee: "2%", docsUrl: "https://developer.easypaisa.com.pk" },
    { id: "flouci", name: "Flouci", Icon: FlouciIcon, regions: ["Tunisia"], fee: "2%", docsUrl: "https://flouci.com/api" },
    { id: "cinetpay", name: "CinetPay", Icon: CinetPayIcon, regions: ["West Africa"], fee: "2%", docsUrl: "https://docs.cinetpay.com" },
    { id: "paydunya", name: "PayDunya", Icon: PayDunyaIcon, regions: ["West Africa"], fee: "2%", docsUrl: "https://paydunya.com/developers" },
    { id: "campay", name: "Campay", Icon: CampayIcon, regions: ["Cameroon"], fee: "2%", docsUrl: "https://docs.campay.net" },
    { id: "notchpay", name: "NotchPay", Icon: NotchPayIcon, regions: ["Africa"], fee: "2%", docsUrl: "https://docs.notchpay.co" },
    { id: "wave", name: "Wave", Icon: WaveIcon, regions: ["West Africa"], fee: "1%", docsUrl: "https://docs.wave.com" },
    { id: "tigomoney", name: "Tigo Money", Icon: TigoMoneyIcon, regions: ["Africa, LATAM"], fee: "1.5%", docsUrl: "" },
    { id: "airtel_money", name: "Airtel Money", Icon: AirtelMoneyIcon, regions: ["Africa, India"], fee: "1.5%", docsUrl: "https://developer.airtel.africa" },
    { id: "upi", name: "UPI", Icon: UPIIcon, regions: ["India"], fee: "0%", docsUrl: "https://www.npci.org.in/what-we-do/upi/product-overview" },
    { id: "phonepe", name: "PhonePe", Icon: PhonePeIcon, regions: ["India"], fee: "0%", docsUrl: "https://developer.phonepe.com" },
    { id: "paytm", name: "Paytm", Icon: PaytmIcon, regions: ["India"], fee: "1.99%", docsUrl: "https://developer.paytm.com" },
    { id: "dana", name: "DANA", Icon: DANAIcon, regions: ["Indonesia"], fee: "1.5%", docsUrl: "https://dashboard.dana.id" },
    { id: "ovo", name: "OVO", Icon: OVOIcon, regions: ["Indonesia"], fee: "1.5%", docsUrl: "https://developer.ovo.id" },
    { id: "shopeepay", name: "ShopeePay", Icon: ShopeePayIcon, regions: ["SEA"], fee: "1.5%", docsUrl: "https://developer.shopeepay.com" },
    { id: "truemoney", name: "TrueMoney", Icon: TrueMoneyIcon, regions: ["Thailand"], fee: "2%", docsUrl: "https://developer.truemoney.com" },
    { id: "promptpay", name: "PromptPay", Icon: PromptPayIcon, regions: ["Thailand"], fee: "0%", docsUrl: "https://www.bot.or.th/English/PaymentSystems/PromptPay" },
    { id: "kakaopay", name: "KakaoPay", Icon: KakaoPayIcon, regions: ["Korea"], fee: "2.5%", docsUrl: "https://developers.kakaopay.com" },
    { id: "toss", name: "Toss Payments", Icon: TossPaymentsIcon, regions: ["Korea"], fee: "2.8%", docsUrl: "https://docs.tosspayments.com" },
    { id: "linepay", name: "LINE Pay", Icon: LinePayIcon, regions: ["Japan, Taiwan, Thailand"], fee: "3.45%", docsUrl: "https://pay.line.me/documents/online_v3.html" },
    { id: "konbini", name: "Konbini", Icon: KonbiniIcon, regions: ["Japan"], fee: "¥190 per txn", docsUrl: "https://stripe.com/docs/payments/konbini" },
    { id: "paypay", name: "PayPay", Icon: PayPayIcon, regions: ["Japan"], fee: "1.98%", docsUrl: "https://developer.paypay.ne.jp" },
    { id: "aupay", name: "au PAY", Icon: AuPayIcon, regions: ["Japan"], fee: "2.6%", docsUrl: "https://developer.au-payment.com" },
    { id: "vnpay", name: "VNPAY", Icon: VNPayIcon, regions: ["Vietnam"], fee: "2%", docsUrl: "https://sandbox.vnpayment.vn/apis/docs" },
    { id: "momo_vn", name: "MoMo (Vietnam)", Icon: MoMoVNIcon, regions: ["Vietnam"], fee: "1.5%", docsUrl: "https://developers.momo.vn" },
    { id: "zalopay", name: "ZaloPay", Icon: ZaloPayIcon, regions: ["Vietnam"], fee: "1.5%", docsUrl: "https://docs.zalopay.vn" },
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
    { id: "paysera", name: "PaySera", Icon: PaySeraIcon, regions: ["Europe"], fee: "1.5%", docsUrl: "https://developers.paysera.com" },
    { id: "paysafecard", name: "Paysafecard", Icon: PaysafecardIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://www.paysafecard.com/business" },
    { id: "cashapp", name: "Cash App", Icon: CashAppIcon, regions: ["US, UK"], fee: "2.75%", docsUrl: "https://cash.app/help" },
    { id: "applepay", name: "Apple Pay", Icon: ApplePayIcon, regions: ["Worldwide"], fee: "Via gateway", docsUrl: "https://developer.apple.com/apple-pay" },
    { id: "googlepay", name: "Google Pay", Icon: GooglePayIcon, regions: ["Worldwide"], fee: "Via gateway", docsUrl: "https://developers.google.com/pay" },
    { id: "samsungpay", name: "Samsung Pay", Icon: SamsungPayIcon, regions: ["Worldwide"], fee: "Via gateway", docsUrl: "https://developer.samsung.com/pay" },
    { id: "amazonpay", name: "Amazon Pay", Icon: AmazonPayIcon, regions: ["Worldwide"], fee: "2.9% + $0.30", docsUrl: "https://developer.amazon.com/docs/amazon-pay" },
    { id: "shoppay", name: "Shop Pay", Icon: ShopPayIcon, regions: ["Worldwide"], fee: "Via Shopify", docsUrl: "https://shopify.dev/docs/api/payments-apps" },
  ],
  bank: [
    { id: "ach", name: "ACH Transfer", Icon: StripeIcon, regions: ["US"], fee: "$0.25", docsUrl: "https://stripe.com/docs/ach" },
    { id: "sepa", name: "SEPA Transfer", Icon: StripeIcon, regions: ["Europe"], fee: "€0.35", docsUrl: "https://stripe.com/docs/sepa" },
    
    { id: "ideal", name: "iDEAL", Icon: IDealIcon, regions: ["Netherlands"], fee: "€0.29", docsUrl: "https://www.ideal.nl/en/developers" },
    { id: "bancontact", name: "Bancontact", Icon: BancontactIcon, regions: ["Belgium"], fee: "€0.25", docsUrl: "https://www.bancontact.com" },
    { id: "boleto", name: "Boleto Bancário", Icon: BoletoIcon, regions: ["Brazil"], fee: "R$3.49", docsUrl: "https://stripe.com/docs/payments/boleto" },
    { id: "pix", name: "PIX", Icon: PIXIcon, regions: ["Brazil"], fee: "0.99%", docsUrl: "https://www.bcb.gov.br/estabilidadefinanceira/pix" },
    { id: "trustly", name: "Trustly", Icon: TrustlyIcon, regions: ["Europe"], fee: "0.5%", docsUrl: "https://developers.trustly.com" },
    { id: "sofort", name: "Sofort (Klarna)", Icon: SofortIcon, regions: ["Europe"], fee: "0.9%", docsUrl: "https://docs.klarna.com/sofort" },
    { id: "giropay", name: "Giropay", Icon: GiropayIcon, regions: ["Germany"], fee: "1.2%", docsUrl: "https://www.giropay.de" },
    { id: "eps", name: "EPS", Icon: EPSIcon, regions: ["Austria"], fee: "€0.25", docsUrl: "https://www.eps-ueberweisung.at" },
    { id: "przelewy24", name: "Przelewy24", Icon: Przelewy24Icon, regions: ["Poland"], fee: "1.5%", docsUrl: "https://developers.przelewy24.pl" },
    { id: "multibanco", name: "MultiBanco", Icon: MultiBancoIcon, regions: ["Portugal"], fee: "€1", docsUrl: "https://www.multibanco.pt" },
    { id: "oxxo", name: "OXXO", Icon: OXXOIcon, regions: ["Mexico"], fee: "MXN $10", docsUrl: "https://stripe.com/docs/payments/oxxo" },
    { id: "spei", name: "SPEI", Icon: SPEIIcon, regions: ["Mexico"], fee: "MXN $7", docsUrl: "https://stripe.com/docs/payments/bank-transfers" },
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
    { id: "utrust", name: "Utrust", Icon: UtrustIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://docs.utrust.com" },
    { id: "confirmo", name: "Confirmo", Icon: ConfirmoIcon, regions: ["Worldwide"], fee: "0.8%", docsUrl: "https://confirmo.net/docs" },
    { id: "speed", name: "Speed", Icon: SpeedIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://docs.tryspeed.com" },
    { id: "gourl", name: "GoURL", Icon: GoURLIcon, regions: ["Worldwide"], fee: "1.5%", docsUrl: "https://gourl.io/api-php.html" },
    { id: "b2binpay", name: "B2BinPay", Icon: B2BinPayIcon, regions: ["Worldwide"], fee: "0.5%", docsUrl: "https://docs.b2binpay.com" },
    { id: "coinremitter", name: "Coinremitter", Icon: CoinremitterIcon, regions: ["Worldwide"], fee: "0.23%", docsUrl: "https://coinremitter.com/docs" },
    { id: "coinspaid", name: "CoinsPaid", Icon: CoinsPaidIcon, regions: ["Worldwide"], fee: "0.8%", docsUrl: "https://docs.coinspaid.com" },
    { id: "spectrocoin", name: "SpectroCoin", Icon: SpectrocoinIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://spectrocoin.com/en/integration" },
    { id: "transak", name: "Transak", Icon: TransakIcon, regions: ["Worldwide"], fee: "1%", docsUrl: "https://docs.transak.com" },
    { id: "moonpay", name: "MoonPay", Icon: MoonPayIcon, regions: ["Worldwide"], fee: "4.5%", docsUrl: "https://docs.moonpay.com" },
    { id: "simplex", name: "Simplex", Icon: SimplexIcon, regions: ["Worldwide"], fee: "3.5%", docsUrl: "https://integrations.simplex.com" },
    { id: "ramp", name: "Ramp Network", Icon: RampIcon, regions: ["Worldwide"], fee: "2.49%", docsUrl: "https://docs.ramp.network" },
    { id: "sardine", name: "Sardine", Icon: SardineIcon, regions: ["Worldwide"], fee: "Variable", docsUrl: "https://docs.sardine.ai" },
  ],
  bnpl: [
    { id: "klarna", name: "Klarna", Icon: KlarnaIcon, regions: ["US, EU, UK, AU"], fee: "3.29% + $0.30", docsUrl: "https://docs.klarna.com" },
    { id: "afterpay", name: "Afterpay / Clearpay", Icon: AfterpayIcon, regions: ["US, UK, AU, NZ"], fee: "4-6% + $0.30", docsUrl: "https://developers.afterpay.com" },
    { id: "tabby", name: "Tabby", Icon: TabbyIcon, regions: ["MENA"], fee: "Variable", docsUrl: "https://docs.tabby.ai" },
    { id: "tamara", name: "Tamara", Icon: TamaraIcon, regions: ["MENA"], fee: "Variable", docsUrl: "https://docs.tamara.co" },
    { id: "sezzle", name: "Sezzle", Icon: SezzleIcon, regions: ["US, CA"], fee: "6% + $0.30", docsUrl: "https://docs.sezzle.com" },
    { id: "affirm", name: "Affirm", Icon: AffirmIcon, regions: ["US, CA"], fee: "Variable", docsUrl: "https://docs.affirm.com" },
    { id: "zip", name: "Zip (QuadPay)", Icon: ZipPayIcon, regions: ["US, AU, NZ, UK"], fee: "Variable", docsUrl: "https://docs.zip.co" },
    { id: "splitit", name: "Splitit", Icon: SplititIcon, regions: ["Worldwide"], fee: "2.5%", docsUrl: "https://developers.splitit.com" },
    { id: "laybuy", name: "Laybuy", Icon: LaybuyIcon, regions: ["NZ, AU, UK"], fee: "Variable", docsUrl: "https://docs.laybuy.com" },
    { id: "openpay_bnpl", name: "Openpay", Icon: OpenpayIcon, regions: ["AU, UK, US"], fee: "Variable", docsUrl: "https://developer.openpay.com.au" },
    { id: "atome", name: "Atome", Icon: AtomeIcon, regions: ["SEA, HK, TW"], fee: "Variable", docsUrl: "https://developer.atome.sg" },
    { id: "hoolah", name: "hoolah", Icon: HoolahIcon, regions: ["SEA"], fee: "Variable", docsUrl: "https://www.hoolah.co/merchants" },
    { id: "pace", name: "Pace", Icon: PaceIcon, regions: ["SEA"], fee: "Variable", docsUrl: "https://www.pacenow.co" },
  ],
};

type GatewayType = { id: string; name: string; Icon: React.FC<{ className?: string }>; regions: string[]; fee: string; docsUrl?: string };

// Per-gateway field label customization
const gatewayFieldLabels: Record<string, { field1Label: string; field1Placeholder: string; field2Label: string; field2Placeholder: string; field2Required: boolean }> = {
  stripe: { field1Label: "Publishable Key", field1Placeholder: "pk_live_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx", field2Required: true },
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
  mollie: { field1Label: "API Key", field1Placeholder: "live_xxxx", field2Label: "Profile ID (optional)", field2Placeholder: "pfl_xxxx", field2Required: false },
  bitpay: { field1Label: "API Token", field1Placeholder: "Your BitPay API Token", field2Label: "Pairing Code (optional)", field2Placeholder: "Pairing code", field2Required: false },
  binancepay: { field1Label: "API Key", field1Placeholder: "Your Binance Pay API Key", field2Label: "API Secret", field2Placeholder: "Your Binance Pay Secret Key", field2Required: true },
  square: { field1Label: "Application ID", field1Placeholder: "sq0idp-xxxx", field2Label: "Access Token", field2Placeholder: "Your Square Access Token", field2Required: true },
  nowpayments: { field1Label: "API Key", field1Placeholder: "Your NowPayments API Key", field2Label: "IPN Secret (optional)", field2Placeholder: "Your IPN callback secret", field2Required: false },
  braintree: { field1Label: "Merchant ID", field1Placeholder: "Your Braintree Merchant ID", field2Label: "Private Key", field2Placeholder: "Your Braintree Private Key", field2Required: true },
  payu: { field1Label: "Merchant Key", field1Placeholder: "Your PayU Merchant Key", field2Label: "Merchant Salt", field2Placeholder: "Your PayU Salt", field2Required: true },
  paytm: { field1Label: "Merchant ID", field1Placeholder: "Your Paytm MID", field2Label: "Merchant Key", field2Placeholder: "Your Paytm Merchant Key", field2Required: true },
  ccavenue: { field1Label: "Merchant ID", field1Placeholder: "Your CCAvenue Merchant ID", field2Label: "Working Key", field2Placeholder: "Your CCAvenue Working Key", field2Required: true },
  paddle: { field1Label: "Vendor ID", field1Placeholder: "Your Paddle Vendor ID", field2Label: "API Key", field2Placeholder: "Your Paddle API Key", field2Required: true },
  recurly: { field1Label: "Public Key", field1Placeholder: "Your Recurly Public Key", field2Label: "Private Key", field2Placeholder: "Your Recurly Private API Key", field2Required: true },
  chargebee: { field1Label: "Site Name", field1Placeholder: "your-site.chargebee.com", field2Label: "API Key", field2Placeholder: "Your Chargebee Full Access Key", field2Required: true },
  "2c2p": { field1Label: "Merchant ID", field1Placeholder: "Your 2C2P Merchant ID", field2Label: "Secret Key", field2Placeholder: "Your 2C2P Secret Key", field2Required: true },
  ebanx: { field1Label: "Integration Key", field1Placeholder: "Your Ebanx Integration Key", field2Label: "Public Key", field2Placeholder: "Your Ebanx Public Key", field2Required: true },
  pagseguro: { field1Label: "Email", field1Placeholder: "Your PagSeguro email", field2Label: "Token", field2Placeholder: "Your PagSeguro Token", field2Required: true },
  nuvei: { field1Label: "Merchant ID", field1Placeholder: "Your Nuvei Merchant ID", field2Label: "Secret Key", field2Placeholder: "Your Nuvei Secret Key", field2Required: true },
  cybersource: { field1Label: "Merchant ID", field1Placeholder: "Your Cybersource Merchant ID", field2Label: "Transaction Key", field2Placeholder: "Your Transaction Key", field2Required: true },
  payfast: { field1Label: "Merchant ID", field1Placeholder: "Your PayFast Merchant ID", field2Label: "Passphrase", field2Placeholder: "Your PayFast Passphrase", field2Required: true },
  tap: { field1Label: "Public Key", field1Placeholder: "pk_live_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx", field2Required: true },
  moyasar: { field1Label: "Publishable Key", field1Placeholder: "pk_live_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx", field2Required: true },
  hyperpay: { field1Label: "Entity ID", field1Placeholder: "Your HyperPay Entity ID", field2Label: "Access Token", field2Placeholder: "Your HyperPay Bearer Token", field2Required: true },
  fawry: { field1Label: "Merchant Code", field1Placeholder: "Your Fawry Merchant Code", field2Label: "Security Key", field2Placeholder: "Your Fawry Security Key", field2Required: true },
  kashier: { field1Label: "Merchant ID", field1Placeholder: "Your Kashier MID", field2Label: "API Key", field2Placeholder: "Your Kashier API Key", field2Required: true },
  yoco: { field1Label: "Public Key", field1Placeholder: "pk_live_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_live_xxxx", field2Required: true },
  pesapal: { field1Label: "Consumer Key", field1Placeholder: "Your Pesapal Consumer Key", field2Label: "Consumer Secret", field2Placeholder: "Your Pesapal Consumer Secret", field2Required: true },
  toyyibpay: { field1Label: "User Secret Key", field1Placeholder: "Your ToyyibPay Secret Key", field2Label: "Category Code", field2Placeholder: "Your Category Code", field2Required: true },
  billplz: { field1Label: "API Key", field1Placeholder: "Your Billplz API Key", field2Label: "Collection ID", field2Placeholder: "Your Billplz Collection ID", field2Required: true },
  bkash: { field1Label: "App Key", field1Placeholder: "Your bKash App Key", field2Label: "App Secret", field2Placeholder: "Your bKash App Secret", field2Required: true },
  sslcommerz: { field1Label: "Store ID", field1Placeholder: "your_store_id", field2Label: "Store Password", field2Placeholder: "your_store_password", field2Required: true },
  esewa: { field1Label: "Merchant Code", field1Placeholder: "Your eSewa Merchant Code", field2Label: "API Key (optional)", field2Placeholder: "eSewa API Key", field2Required: false },
  khalti: { field1Label: "Public Key", field1Placeholder: "Your Khalti Public Key", field2Label: "Secret Key", field2Placeholder: "Your Khalti Secret Key", field2Required: true },
  jazzcash: { field1Label: "Merchant ID", field1Placeholder: "Your JazzCash Merchant ID", field2Label: "Password", field2Placeholder: "Your JazzCash Password", field2Required: true },
  easypaisa: { field1Label: "Store ID", field1Placeholder: "Your Easypaisa Store ID", field2Label: "Hash Key", field2Placeholder: "Your Easypaisa Hash Key", field2Required: true },
  cinetpay: { field1Label: "API Key", field1Placeholder: "Your CinetPay API Key", field2Label: "Site ID", field2Placeholder: "Your CinetPay Site ID", field2Required: true },
  notchpay: { field1Label: "Public Key", field1Placeholder: "pk.xxxx", field2Label: "Secret Key (optional)", field2Placeholder: "Your NotchPay Secret", field2Required: false },
  mtnmomo: { field1Label: "Subscription Key", field1Placeholder: "Your MTN MoMo Primary Key", field2Label: "API User", field2Placeholder: "Your MTN API User UUID", field2Required: true },
  mpesa: { field1Label: "Consumer Key", field1Placeholder: "Your M-Pesa Consumer Key", field2Label: "Consumer Secret", field2Placeholder: "Your M-Pesa Consumer Secret", field2Required: true },
  plisio: { field1Label: "API Key", field1Placeholder: "Your Plisio API Key", field2Label: "Secret Key (optional)", field2Placeholder: "Your Plisio Secret", field2Required: false },
  coinpayments: { field1Label: "Merchant ID", field1Placeholder: "Your CoinPayments Merchant ID", field2Label: "IPN Secret", field2Placeholder: "Your IPN Secret Key", field2Required: true },
  triplea: { field1Label: "API Key", field1Placeholder: "Your TripleA API Key", field2Label: "Client Secret", field2Placeholder: "Your TripleA Client Secret", field2Required: true },
  oxapay: { field1Label: "API Key", field1Placeholder: "Your Oxapay Merchant API Key", field2Label: "Payout Key (optional)", field2Placeholder: "Payout API Key", field2Required: false },
  utrust: { field1Label: "API Key", field1Placeholder: "Your Utrust API Key", field2Label: "Webhook Secret", field2Placeholder: "Your Utrust Webhook Secret", field2Required: true },
  coinspaid: { field1Label: "API Key", field1Placeholder: "Your CoinsPaid API Key", field2Label: "API Secret", field2Placeholder: "Your CoinsPaid API Secret", field2Required: true },
  transak: { field1Label: "API Key", field1Placeholder: "Your Transak API Key", field2Label: "Secret Key (optional)", field2Placeholder: "Partner Secret", field2Required: false },
  moonpay: { field1Label: "API Key", field1Placeholder: "Your MoonPay API Key", field2Label: "Secret Key", field2Placeholder: "Your MoonPay Secret Key", field2Required: true },
  affirm: { field1Label: "Public API Key", field1Placeholder: "Your Affirm Public Key", field2Label: "Private API Key", field2Placeholder: "Your Affirm Private Key", field2Required: true },
  klarna: { field1Label: "API Key (UID)", field1Placeholder: "Your Klarna API Username", field2Label: "API Secret", field2Placeholder: "Your Klarna API Password", field2Required: true },
  tabby: { field1Label: "Public Key", field1Placeholder: "pk_xxxx", field2Label: "Secret Key", field2Placeholder: "sk_xxxx", field2Required: true },
  tamara: { field1Label: "API Token", field1Placeholder: "Your Tamara API Token", field2Label: "Notification Key (optional)", field2Placeholder: "Webhook token", field2Required: false },
  vnpay: { field1Label: "Terminal ID", field1Placeholder: "Your VNPAY TMN Code", field2Label: "Hash Secret", field2Placeholder: "Your VNPAY HashSecret", field2Required: true },
  kakaopay: { field1Label: "CID", field1Placeholder: "Your KakaoPay CID", field2Label: "Admin Key", field2Placeholder: "Your KakaoPay Admin Key", field2Required: true },
  toss: { field1Label: "Client Key", field1Placeholder: "Your Toss Client Key", field2Label: "Secret Key", field2Placeholder: "Your Toss Secret Key", field2Required: true },
  benefit: { field1Label: "Merchant ID", field1Placeholder: "Your Benefit Merchant ID", field2Label: "API Key", field2Placeholder: "Your Benefit API Key", field2Required: true },
  stcpay: { field1Label: "Merchant ID", field1Placeholder: "Your STC Pay Merchant ID", field2Label: "API Key", field2Placeholder: "Your STC Pay API Key", field2Required: true },
  thawani: { field1Label: "Publishable Key", field1Placeholder: "Your Thawani Publishable Key", field2Label: "Secret Key", field2Placeholder: "Your Thawani Secret Key", field2Required: true },
  accept_paymob: { field1Label: "API Key", field1Placeholder: "Your Paymob API Key", field2Label: "Integration ID", field2Placeholder: "Your Integration ID", field2Required: true },
  ipay_africa: { field1Label: "Vendor ID", field1Placeholder: "Your iPay Vendor ID", field2Label: "Hash Key", field2Placeholder: "Your iPay Hash Key", field2Required: true },
  cellulant: { field1Label: "API Key", field1Placeholder: "Your Cellulant API Key", field2Label: "Secret Key", field2Placeholder: "Your Cellulant Secret", field2Required: true },
  dpo_group: { field1Label: "Company Token", field1Placeholder: "Your DPO Company Token", field2Label: "Service Type", field2Placeholder: "Your DPO Service Type", field2Required: true },
  hubtel: { field1Label: "Client ID", field1Placeholder: "Your Hubtel Client ID", field2Label: "Client Secret", field2Placeholder: "Your Hubtel Client Secret", field2Required: true },
  aza_finance: { field1Label: "API Key", field1Placeholder: "Your AZA API Key", field2Label: "Secret Key", field2Placeholder: "Your AZA Secret Key", field2Required: true },
  flywire: { field1Label: "API Key", field1Placeholder: "Your Flywire API Key", field2Label: "Secret Key", field2Placeholder: "Your Flywire Secret Key", field2Required: true },
  boku: { field1Label: "Merchant ID", field1Placeholder: "Your Boku Merchant ID", field2Label: "API Key", field2Placeholder: "Your Boku API Key", field2Required: true },
  gcash: { field1Label: "App ID", field1Placeholder: "Your GCash App ID", field2Label: "API Key", field2Placeholder: "Your GCash API Key", field2Required: true },
  grabpay: { field1Label: "Partner ID", field1Placeholder: "Your GrabPay Partner ID", field2Label: "Partner Secret", field2Placeholder: "Your GrabPay Partner Secret", field2Required: true },
  opay: { field1Label: "Public Key", field1Placeholder: "Your OPay Public Key", field2Label: "Secret Key", field2Placeholder: "Your OPay Secret Key", field2Required: true },
  moov: { field1Label: "API Key", field1Placeholder: "Your Moov API Key", field2Label: "Secret Key", field2Placeholder: "Your Moov Secret Key", field2Required: true },
  chipper: { field1Label: "API Key", field1Placeholder: "Your Chipper Cash API Key", field2Label: "Secret Key", field2Placeholder: "Your Chipper Secret Key", field2Required: true },
  paga: { field1Label: "Public Key", field1Placeholder: "Your Paga Public Key", field2Label: "Private Key", field2Placeholder: "Your Paga Private Key", field2Required: true },
  remita: { field1Label: "Merchant ID", field1Placeholder: "Your Remita Merchant ID", field2Label: "API Key", field2Placeholder: "Your Remita API Key", field2Required: true },
  interswitch: { field1Label: "Client ID", field1Placeholder: "Your Interswitch Client ID", field2Label: "Client Secret", field2Placeholder: "Your Interswitch Client Secret", field2Required: true },
  dana: { field1Label: "Client ID", field1Placeholder: "Your DANA Client ID", field2Label: "Client Secret", field2Placeholder: "Your DANA Client Secret", field2Required: true },
  ovo: { field1Label: "API Key", field1Placeholder: "Your OVO/Xendit API Key", field2Label: "Secret Key", field2Placeholder: "Your Secret Key", field2Required: false },
  shopeepay: { field1Label: "Client ID", field1Placeholder: "Your ShopeePay Client ID", field2Label: "Secret Key", field2Placeholder: "Your ShopeePay Secret Key", field2Required: true },
  truemoney: { field1Label: "App ID", field1Placeholder: "Your TrueMoney App ID", field2Label: "Secret Key", field2Placeholder: "Your TrueMoney Secret Key", field2Required: true },
  promptpay: { field1Label: "API Key (via Stripe/Omise)", field1Placeholder: "Your payment processor API Key", field2Label: "Secret Key", field2Placeholder: "Your Secret Key", field2Required: false },
  aupay: { field1Label: "Merchant ID", field1Placeholder: "Your au PAY Merchant ID", field2Label: "API Key", field2Placeholder: "Your au PAY API Key", field2Required: true },
  momo_vn: { field1Label: "Partner Code", field1Placeholder: "Your MoMo Partner Code", field2Label: "Access Key", field2Placeholder: "Your MoMo Access Key", field2Required: true },
  zalopay: { field1Label: "App ID", field1Placeholder: "Your ZaloPay App ID", field2Label: "Key1", field2Placeholder: "Your ZaloPay Key1", field2Required: true },
  linepay: { field1Label: "Channel ID", field1Placeholder: "Your LINE Pay Channel ID", field2Label: "Channel Secret", field2Placeholder: "Your LINE Pay Channel Secret", field2Required: true },
  konbini: { field1Label: "Stripe API Key", field1Placeholder: "sk_live_xxxx (Stripe Key)", field2Label: "Webhook Secret (optional)", field2Placeholder: "whsec_xxxx", field2Required: false },
  paypay: { field1Label: "API Key", field1Placeholder: "Your PayPay API Key", field2Label: "API Secret", field2Placeholder: "Your PayPay API Secret", field2Required: true },
  alipay: { field1Label: "App ID", field1Placeholder: "Your Alipay App ID", field2Label: "Private Key", field2Placeholder: "Your Alipay Private Key", field2Required: true },
  wechatpay: { field1Label: "Merchant ID", field1Placeholder: "Your WeChat Merchant ID", field2Label: "API Key v3", field2Placeholder: "Your WeChat API Key v3", field2Required: true },
  revolut: { field1Label: "API Key", field1Placeholder: "Your Revolut API Key", field2Label: "Webhook Secret (optional)", field2Placeholder: "Webhook signing secret", field2Required: false },
  venmo: { field1Label: "PayPal Client ID", field1Placeholder: "Your PayPal Client ID (with Venmo enabled)", field2Label: "PayPal Client Secret", field2Placeholder: "Your PayPal Client Secret", field2Required: true },
  zelle: { field1Label: "Zelle Email/Phone", field1Placeholder: "your@email.com or +1234567890", field2Label: "Bank Name (for display)", field2Placeholder: "e.g., Chase, Wells Fargo", field2Required: false },
  paysera: { field1Label: "Project ID", field1Placeholder: "Your PaySera Project ID", field2Label: "Sign Password", field2Placeholder: "Your PaySera Sign Password", field2Required: true },
  paysafecard: { field1Label: "API Key", field1Placeholder: "Your Paysafecard API Key", field2Label: "Webhook Secret (optional)", field2Placeholder: "Webhook secret", field2Required: false },
  cashapp: { field1Label: "Square Application ID", field1Placeholder: "Your Square App ID", field2Label: "Square Access Token", field2Placeholder: "Your Square Access Token", field2Required: true },
  applepay: { field1Label: "Gateway API Key (Stripe/Adyen)", field1Placeholder: "Your primary gateway key", field2Label: "Gateway Secret", field2Placeholder: "Your primary gateway secret", field2Required: true },
  googlepay: { field1Label: "Gateway API Key (Stripe/Adyen)", field1Placeholder: "Your primary gateway key", field2Label: "Gateway Secret", field2Placeholder: "Your primary gateway secret", field2Required: true },
  samsungpay: { field1Label: "Gateway API Key (Stripe/Adyen)", field1Placeholder: "Your primary gateway key", field2Label: "Gateway Secret", field2Placeholder: "Your primary gateway secret", field2Required: true },
  amazonpay: { field1Label: "Merchant ID", field1Placeholder: "Your Amazon Pay Merchant ID", field2Label: "MWS Auth Token", field2Placeholder: "Your MWS Auth Token", field2Required: true },
  shoppay: { field1Label: "Shopify API Key", field1Placeholder: "Your Shopify API Key", field2Label: "Shopify API Secret", field2Placeholder: "Your Shopify API Secret", field2Required: true },
  afterpay: { field1Label: "Merchant ID", field1Placeholder: "Your Afterpay Merchant ID", field2Label: "Secret Key", field2Placeholder: "Your Afterpay Secret Key", field2Required: true },
  zip: { field1Label: "API Key", field1Placeholder: "Your Zip API Key", field2Label: "Secret Key", field2Placeholder: "Your Zip Secret Key", field2Required: true },
  splitit: { field1Label: "API Key", field1Placeholder: "Your Splitit API Key", field2Label: "Secret (optional)", field2Placeholder: "Your Splitit Secret", field2Required: false },
  laybuy: { field1Label: "Merchant ID", field1Placeholder: "Your Laybuy Merchant ID", field2Label: "API Key", field2Placeholder: "Your Laybuy API Key", field2Required: true },
  openpay_bnpl: { field1Label: "Auth Token", field1Placeholder: "Your Openpay Auth Token", field2Label: "Secret (optional)", field2Placeholder: "Openpay Secret", field2Required: false },
  atome: { field1Label: "API Key", field1Placeholder: "Your Atome API Key", field2Label: "Secret Key", field2Placeholder: "Your Atome Secret Key", field2Required: true },
  hoolah: { field1Label: "Merchant ID", field1Placeholder: "Your hoolah Merchant ID", field2Label: "API Key", field2Placeholder: "Your hoolah API Key", field2Required: true },
  pace: { field1Label: "API Key", field1Placeholder: "Your Pace API Key", field2Label: "Client ID", field2Placeholder: "Your Pace Client ID", field2Required: true },
  blockonomics: { field1Label: "API Key", field1Placeholder: "Your Blockonomics API Key", field2Label: "Callback Secret (optional)", field2Placeholder: "Callback secret", field2Required: false },
  opennode: { field1Label: "API Key", field1Placeholder: "Your OpenNode API Key", field2Label: "Webhook Secret (optional)", field2Placeholder: "Webhook secret", field2Required: false },
  mixpay: { field1Label: "App ID", field1Placeholder: "Your MixPay App ID", field2Label: "App Secret", field2Placeholder: "Your MixPay App Secret", field2Required: true },
  cryptocloud: { field1Label: "Shop ID", field1Placeholder: "Your Cryptocloud Shop ID", field2Label: "API Key", field2Placeholder: "Your Cryptocloud API Key", field2Required: true },
  spicepay: { field1Label: "API Key", field1Placeholder: "Your SpicePay API Key", field2Label: "Secret (optional)", field2Placeholder: "SpicePay Secret", field2Required: false },
  confirmo: { field1Label: "API Key", field1Placeholder: "Your Confirmo API Key", field2Label: "Callback Secret (optional)", field2Placeholder: "Confirmo Callback Secret", field2Required: false },
  speed: { field1Label: "API Key", field1Placeholder: "Your Speed API Key", field2Label: "Secret (optional)", field2Placeholder: "Speed Secret", field2Required: false },
  gourl: { field1Label: "Private Key", field1Placeholder: "Your GoURL Private Key", field2Label: "Public Key (optional)", field2Placeholder: "GoURL Public Key", field2Required: false },
  b2binpay: { field1Label: "API Key", field1Placeholder: "Your B2BinPay API Key", field2Label: "Secret Key", field2Placeholder: "Your B2BinPay Secret Key", field2Required: true },
  coinremitter: { field1Label: "API Key", field1Placeholder: "Your Coinremitter API Key", field2Label: "Password", field2Placeholder: "Your Coinremitter Password", field2Required: true },
  spectrocoin: { field1Label: "Merchant ID", field1Placeholder: "Your SpectroCoin Merchant ID", field2Label: "API Key", field2Placeholder: "Your SpectroCoin API Key", field2Required: true },
  simplex: { field1Label: "API Key", field1Placeholder: "Your Simplex API Key", field2Label: "Partner Name (optional)", field2Placeholder: "Your partner name", field2Required: false },
  ramp: { field1Label: "API Key", field1Placeholder: "Your Ramp API Key", field2Label: "Secret (optional)", field2Placeholder: "Ramp Secret", field2Required: false },
  sardine: { field1Label: "Client ID", field1Placeholder: "Your Sardine Client ID", field2Label: "Client Secret", field2Placeholder: "Your Sardine Client Secret", field2Required: true },
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
  const [formData, setFormData] = useState({ apiKey: "", secretKey: "", minDeposit: "5", maxDeposit: "1000", feePercentage: "0", fixedFee: "0" });
  
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

const gatewaySetupSteps: Record<string, string[]> = {
  stripe: ["1. Go to stripe.com/dashboard → Developers → API Keys", "2. Copy Publishable Key (pk_live_…)", "3. Copy Secret Key (sk_live_…)", "4. Ensure Live mode is selected"],
  paypal: ["1. Go to developer.paypal.com → My Apps & Credentials", "2. Select Live tab → Create or select app", "3. Copy Client ID and Secret"],
  square: ["1. Go to developer.squareup.com → Applications", "2. Select your Production app", "3. Copy Application ID and Access Token"],
  braintree: ["1. Log in at braintreegateway.com → Settings → API Keys", "2. Switch to Production", "3. Copy Public Key and Private Key"],
  adyen: ["1. Log in at ca-live.adyen.com → Developers → API Credentials", "2. Generate new API Key", "3. Copy API Key and Merchant Account"],
  checkoutcom: ["1. Go to hub.checkout.com → Developers → Keys", "2. Copy Public Key and Secret Key from Live environment"],
  worldpay: ["1. Go to online.worldpay.com → Integration", "2. Copy Merchant Code and XML Password"],
  authorizenet: ["1. Go to account.authorize.net → Settings → API Login ID", "2. Copy API Login ID and Transaction Key"],
  twocheckout: ["1. Go to verifone.cloud → Integrations → Webhooks & API", "2. Copy Merchant Code and Secret Key"],
  mollie: ["1. Go to my.mollie.com → Developers → API Keys", "2. Copy Live API Key (live_…)"],
  dlocal: ["1. Go to dashboard.dlocal.com → Integration → API Keys", "2. Copy x-login and x-trans-key for Production"],
  rapyd: ["1. Go to dashboard.rapyd.net → Developers", "2. Copy Access Key and Secret Key"],
  razorpay: ["1. Go to dashboard.razorpay.com → Settings → API Keys", "2. Generate Live Key", "3. Copy Key ID and Key Secret"],
  paystack: ["1. Go to dashboard.paystack.com → Settings → API Keys", "2. Copy Live Secret Key (sk_live_…)"],
  flutterwave: ["1. Go to dashboard.flutterwave.com → Settings → API Keys", "2. Switch to Live mode", "3. Copy Public Key and Secret Key"],
  korapay: ["1. Go to merchant.korapay.com → Settings → API Keys", "2. Copy Public Key and Secret Key from Live section"],
  monnify: ["1. Go to app.monnify.com → Settings → API Keys", "2. Copy Live API Key and Secret Key"],
  mercadopago: ["1. Go to mercadopago.com/developers → Your integrations", "2. Select Production credentials", "3. Copy Public Key and Access Token"],
  iyzico: ["1. Go to merchant.iyzipay.com → Settings → API Keys", "2. Copy API Key and Secret Key"],
  paymob: ["1. Go to accept.paymob.com → Dashboard → Settings", "2. Copy API Key and Integration ID"],
  xendit: ["1. Go to dashboard.xendit.co → Settings → API Keys", "2. Generate Live API Key", "3. Copy Secret Key"],
  midtrans: ["1. Go to dashboard.midtrans.com → Settings → Access Keys", "2. Copy Server Key and Client Key from Production"],
  ideal: ["1. Configure through Mollie or Stripe", "2. Copy API Key from your payment processor"],
  bancontact: ["1. Configure through Mollie or Stripe", "2. Copy API Key from your payment processor"],
  boleto: ["1. Configure through Stripe or dLocal", "2. Copy API Key from your payment processor"],
  pix: ["1. Configure through Stripe, Mercado Pago or dLocal", "2. Copy API Key from your payment processor"],
  coinbase: ["1. Go to commerce.coinbase.com → Settings → API Keys", "2. Create new API Key", "3. Copy the API Key (no secret needed)"],
  btcpay: ["1. Go to your BTCPay Server → Stores → Settings → Access Tokens", "2. Generate new token with invoice permissions", "3. Copy the Token"],
  nowpayments: ["1. Go to nowpayments.io → Dashboard → API Keys", "2. Copy API Key and IPN Secret"],
  coingate: ["1. Go to developer.coingate.com → Dashboard → API Apps", "2. Create new app", "3. Copy API Token"],
  binancepay: ["1. Go to merchant.binance.com → API Management", "2. Create API Key", "3. Copy API Key and Secret Key"],
  cryptomus: ["1. Go to app.cryptomus.com → Dashboard → Settings", "2. Copy Merchant UUID and API Key"],
  heleket: ["1. Go to heleket.com → Dashboard → API Keys", "2. Copy Merchant ID and API Key"],
  plisio: ["1. Go to plisio.net → Dashboard → API", "2. Copy API Key"],
  coinpayments: ["1. Go to coinpayments.net → Account → API Keys", "2. Generate new Key Pair", "3. Copy Public Key and Private Key"],
  triplea: ["1. Go to triple-a.io → Dashboard → API Keys", "2. Copy API Key and Secret"],
  bitpay: ["1. Go to bitpay.com → Dashboard → Payment Tools → API Tokens", "2. Generate new token", "3. Copy API Token"],
  klarna: ["1. Go to portal.klarna.com → Settings → API Credentials", "2. Copy API Username and Password"],
  afterpay: ["1. Go to portal.afterpay.com → Developer", "2. Copy Merchant ID and Secret Key"],
  tabby: ["1. Go to merchant.tabby.ai → Settings → API", "2. Copy Public Key and Secret Key"],
  tamara: ["1. Go to partner.tamara.co → Settings → API", "2. Copy API Token"],
  sezzle: ["1. Go to dashboard.sezzle.com → Settings → API Keys", "2. Copy Public Key and Private Key"],
  benefit: ["1. Contact Benefit Pay merchant support", "2. Obtain Merchant ID and API Key from onboarding"],
  stcpay: ["1. Go to merchant.stcpay.com.sa → Developer Settings", "2. Copy Merchant ID and API Key"],
  thawani: ["1. Go to dashboard.thawani.om → API Keys", "2. Copy Publishable Key and Secret Key"],
  accept_paymob: ["1. Go to accept.paymob.com → Dashboard → Settings", "2. Copy API Key and Integration ID", "3. Note your iFrame ID for card payments"],
  ipay_africa: ["1. Contact iPay Africa for merchant credentials", "2. Copy Vendor ID and Hash Key"],
  cellulant: ["1. Go to dashboard.cellulant.io → API Credentials", "2. Copy API Key and Secret Key"],
  dpo_group: ["1. Go to dashboard.dpogroup.com → Settings → API", "2. Copy Company Token and Service Type"],
  hubtel: ["1. Go to developers.hubtel.com → Dashboard", "2. Copy Client ID and Client Secret"],
  aza_finance: ["1. Go to dashboard.azafinance.com → API Keys", "2. Copy API Key and Secret"],
  flywire: ["1. Contact Flywire merchant support for API credentials", "2. Copy provided API Key and Secret"],
  boku: ["1. Contact Boku merchant team for credentials", "2. Copy Merchant ID and API Key"],
  gcash: ["1. Go to developer.gcash.com → My Apps", "2. Copy App ID and API Key from Live credentials"],
  grabpay: ["1. Go to developer.grab.com → Dashboard → Apps", "2. Copy Partner ID and Partner Secret"],
  opay: ["1. Go to merchant.opayweb.com → Settings → API Management", "2. Copy Public Key and Secret Key"],
  moov: ["1. Contact Moov Money for API credentials", "2. Copy API Key and Secret provided by Moov"],
  chipper: ["1. Go to developer.chipper.cash → Dashboard", "2. Generate API Key pair for Live environment"],
  paga: ["1. Go to developer.mypaga.com → My Account", "2. Copy Public Key and Private Key"],
  remita: ["1. Go to remita.net/developers → Dashboard", "2. Copy Merchant ID and API Key"],
  interswitch: ["1. Go to developer.interswitchgroup.com → Apps", "2. Copy Client ID and Secret from Production"],
  dana: ["1. Go to dashboard.dana.id → Developer Settings", "2. Copy Client ID and Client Secret"],
  ovo: ["1. Integrate via Xendit or DANA aggregator", "2. Copy API Key from your aggregator dashboard"],
  shopeepay: ["1. Integrate via Xendit, Stripe, or direct ShopeePay merchant API", "2. Copy Client ID and Secret Key"],
  truemoney: ["1. Go to developer.truemoney.com → Dashboard", "2. Copy App ID and Secret Key"],
  promptpay: ["1. Configure via Stripe or Omise for PromptPay QR", "2. Copy API Key from your payment processor", "3. PromptPay generates QR codes — no direct API needed"],
  aupay: ["1. Go to developer.au-payment.com → Dashboard", "2. Copy Merchant ID and API Key"],
  momo_vn: ["1. Go to developers.momo.vn → Dashboard → App Management", "2. Copy Partner Code and Access Key"],
  zalopay: ["1. Go to docs.zalopay.vn → Dashboard", "2. Copy App ID, Key1, and Key2"],
  linepay: ["1. Go to pay.line.me → Console → Manage Payment", "2. Copy Channel ID and Channel Secret"],
  konbini: ["1. Configure via Stripe Japan for Konbini payments", "2. Copy Stripe API Key — Konbini is a Stripe payment method", "3. No separate API needed"],
  paypay: ["1. Go to developer.paypay.ne.jp → Dashboard", "2. Copy API Key and API Secret"],
  alipay: ["1. Go to global.alipay.com → Developer Center", "2. Copy App ID and Private Key"],
  wechatpay: ["1. Go to pay.weixin.qq.com → Account Center → API Security", "2. Copy Merchant ID and API Key v3"],
  revolut: ["1. Go to business.revolut.com → Developers → API Settings", "2. Generate Production API Key"],
  venmo: ["1. Go to developer.paypal.com → Dashboard", "2. Enable Venmo in your PayPal app", "3. Use PayPal Client ID and Secret — Venmo is a PayPal feature"],
  zelle: ["1. Zelle is P2P — no merchant API available", "2. Use as a manual payment method instead", "3. Add via 'Manual Methods' with your Zelle email/phone"],
  paysera: ["1. Go to developers.paysera.com → Project Settings", "2. Copy Project ID and Sign Password"],
  paysafecard: ["1. Go to merchant.paysafecard.com → API Settings", "2. Copy API Key"],
  cashapp: ["1. Go to developer.squareup.com (Cash App uses Square API)", "2. Copy Application ID and Access Token"],
  applepay: ["1. Apple Pay requires an underlying gateway (Stripe, Adyen, etc.)", "2. Configure your primary gateway first", "3. Enable Apple Pay in your gateway dashboard"],
  googlepay: ["1. Google Pay requires an underlying gateway (Stripe, Adyen, etc.)", "2. Configure your primary gateway first", "3. Enable Google Pay in your gateway dashboard"],
  samsungpay: ["1. Samsung Pay requires an underlying gateway (Stripe, Adyen, etc.)", "2. Configure your primary gateway first", "3. Enable Samsung Pay in your gateway dashboard"],
  amazonpay: ["1. Go to sellercentral.amazon.com → Amazon Pay → Integration", "2. Copy Merchant ID, Client ID, and Store ID"],
  shoppay: ["1. Shop Pay requires Shopify Payments", "2. Go to shopify.dev → Payment Apps → API Settings", "3. Copy API Key and Secret"],
  afterpay: ["1. Go to portal.afterpay.com → Developer Settings", "2. Copy Merchant ID and Secret Key"],
  sezzle_bnpl: ["1. Go to dashboard.sezzle.com → Settings → API Keys", "2. Copy Public Key and Private Key"],
  zip: ["1. Go to merchant.zip.co → Settings → API Keys", "2. Copy API Key and Secret"],
  splitit: ["1. Go to merchant.splitit.com → Settings → API", "2. Copy API Key"],
  laybuy: ["1. Go to merchant.laybuy.com → Integration", "2. Copy Merchant ID and API Key"],
  openpay_bnpl: ["1. Go to admin.openpay.com.au → API Settings", "2. Copy Auth Token"],
  atome: ["1. Go to merchant.atome.sg → Settings → API", "2. Copy API Key and Secret"],
  hoolah: ["1. Contact hoolah merchant support for credentials", "2. Copy Merchant ID and API Key"],
  pace: ["1. Go to merchant.pacenow.co → Settings", "2. Copy API Key and Client ID"],
  blockonomics: ["1. Go to blockonomics.co → Dashboard → API", "2. Copy API Key"],
  opennode: ["1. Go to dashboard.opennode.com → Developers → API Keys", "2. Copy API Key"],
  mixpay: ["1. Go to dashboard.mixpay.me → Settings → API", "2. Copy App ID and Secret"],
  cryptocloud: ["1. Go to app.cryptocloud.plus → Settings → API", "2. Copy Shop ID and API Key"],
  spicepay: ["1. Go to spicepay.com → Dashboard → Settings → API", "2. Copy API Key"],
  confirmo: ["1. Go to confirmo.net → Settings → API", "2. Copy API Key"],
  speed: ["1. Go to dashboard.tryspeed.com → Settings → API Keys", "2. Copy API Key"],
  gourl: ["1. Go to gourl.io → Settings → API", "2. Copy Private Key"],
  b2binpay: ["1. Go to app.b2binpay.com → Settings → API Keys", "2. Copy API Key and Secret"],
  coinremitter: ["1. Go to coinremitter.com → Dashboard → API Key", "2. Copy API Key and Password"],
  spectrocoin: ["1. Go to spectrocoin.com → Merchant → API", "2. Copy Merchant ID and API Key"],
  simplex: ["1. Go to partners.simplex.com → Dashboard", "2. Copy API Key"],
  ramp: ["1. Go to dashboard.ramp.network → Developers → API Keys", "2. Copy API Key"],
  sardine: ["1. Go to dashboard.sardine.ai → Settings → API", "2. Copy Client ID and Client Secret"],
  payu: ["1. Go to payu.in → Dashboard → API Keys (or PayU Hub for other regions)", "2. Copy Merchant Key and Salt from Production"],
  paytm: ["1. Go to dashboard.paytm.com → Developer Settings", "2. Copy Merchant ID and Merchant Key"],
  ccavenue: ["1. Log in at login.ccavenue.com → Settings → API Keys", "2. Copy Merchant ID, Access Code, and Working Key"],
  paddle: ["1. Go to vendors.paddle.com → Developer Tools → Authentication", "2. Copy Vendor ID and API Key"],
  recurly: ["1. Go to app.recurly.com → Developers → API Credentials", "2. Copy your Private API Key"],
  chargebee: ["1. Go to your-site.chargebee.com → Settings → Configure Chargebee → API Keys", "2. Copy Full Access API Key"],
  "2c2p": ["1. Go to pgw.2c2p.com → Merchant Settings", "2. Copy Merchant ID and Secret Key"],
  ebanx: ["1. Go to dashboard.ebanx.com → Developer → API Keys", "2. Copy Integration Key and Public Key"],
  pagseguro: ["1. Go to pagseguro.uol.com.br → My Account → Integrations", "2. Copy Email and Token"],
  nuvei: ["1. Go to cpanel.safecharge.com → Settings → API Keys", "2. Copy Merchant ID, Site ID, and Secret Key"],
  cybersource: ["1. Go to ebc.cybersource.com → Payment Configuration → Key Management", "2. Copy Merchant ID and Transaction Key"],
  payfast: ["1. Go to payfast.co.za → Settings → Integration", "2. Copy Merchant ID, Merchant Key, and Passphrase"],
  tap: ["1. Go to dashboard.tap.company → Developers → API Keys", "2. Copy Public Key and Secret Key from Live"],
  moyasar: ["1. Go to dashboard.moyasar.com → API Keys", "2. Copy Publishable Key and Secret Key"],
  hyperpay: ["1. Go to dashboard.hyperpay.com → Administration → Account", "2. Copy Entity ID and Access Token"],
  fawry: ["1. Go to atfawry.com → Developer Portal → Settings", "2. Copy Merchant Code and Security Key"],
  kashier: ["1. Go to dashboard.kashier.io → Settings → API Keys", "2. Copy Merchant ID and API Key"],
  yoco: ["1. Go to portal.yoco.com → Developer → API Keys", "2. Copy Public Key and Secret Key"],
  pesapal: ["1. Go to dashboard.pesapal.com → API → Integration", "2. Copy Consumer Key and Consumer Secret"],
  toyyibpay: ["1. Go to toyyibpay.com → Dashboard → Your Profile → Secret Key", "2. Copy User Secret Key and create a Category"],
  billplz: ["1. Go to billplz.com → Settings → Keys", "2. Copy API Key and create a Collection"],
  bkash: ["1. Go to merchant.bka.sh → My Application", "2. Copy App Key, App Secret, Username, Password"],
  sslcommerz: ["1. Go to manager.sslcommerz.com → My Stores", "2. Copy Store ID and Store Password"],
  esewa: ["1. Go to merchant.esewa.com.np → My Apps", "2. Copy Merchant Code and configure callback"],
  khalti: ["1. Go to admin.khalti.com → Keys", "2. Copy Public Key and Secret Key"],
  jazzcash: ["1. Go to sandbox.jazzcash.com.pk → Dashboard", "2. Copy Merchant ID, Password, and Integrity Salt"],
  easypaisa: ["1. Go to developer.easypaisa.com.pk → Dashboard", "2. Copy Store ID, Hash Key, and configure callbacks"],
  cinetpay: ["1. Go to app.cinetpay.com → Settings → API", "2. Copy API Key and Site ID"],
  notchpay: ["1. Go to business.notchpay.co → Developers", "2. Copy Public Key (pk.xxxx)"],
  utrust: ["1. Go to merchants.utrust.com → Integrations", "2. Copy API Key and Webhook Secret"],
  coinspaid: ["1. Go to app.coinspaid.com → API", "2. Copy API Key and API Secret"],
  transak: ["1. Go to dashboard.transak.com → Developers", "2. Copy API Key"],
  moonpay: ["1. Go to dashboard.moonpay.com → Developers", "2. Copy Publishable Key and Secret Key"],
  affirm: ["1. Go to sandbox.affirm.com → Merchant Dashboard → API Keys", "2. Switch to Production", "3. Copy Public and Private API Keys"],
  vnpay: ["1. Go to sandbox.vnpayment.vn → Dashboard → Settings", "2. Copy TMN Code and Hash Secret"],
  kakaopay: ["1. Go to developers.kakaopay.com → Dashboard → My Application", "2. Copy CID and Admin Key"],
  toss: ["1. Go to developers.tosspayments.com → My Dashboard", "2. Copy Client Key and Secret Key"],
};


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
      setFormData({ apiKey: "", secretKey: "", minDeposit: "5", maxDeposit: "1000", feePercentage: "0", fixedFee: "0" });
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
          secretKey: config.secretKey,
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
            {/* Setup Instructions */}
            {selectedGateway && gatewaySetupSteps[selectedGateway.id] && (
              <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20 space-y-1.5">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  How to get your Live API keys:
                </p>
                {gatewaySetupSteps[selectedGateway.id].map((step, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{step}</p>
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
              <Input readOnly value={`${panel?.custom_domain ? `https://${panel.custom_domain}` : panel?.subdomain ? `https://${panel.subdomain}.smmpilot.online` : window.location.origin}/api/webhooks/${selectedGateway?.id}`} className="bg-muted/50 font-mono text-xs" />
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
