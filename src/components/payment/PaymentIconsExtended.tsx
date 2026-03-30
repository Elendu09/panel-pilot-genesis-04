import React from "react";

// Helper to create simple initial-based icons with brand colors
const createBrandIcon = (initials: string, bgColor: string, textColor: string = "white") => {
  const IconComponent = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill={bgColor} />
      <text x="16" y="20" textAnchor="middle" fill={textColor} fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">{initials}</text>
    </svg>
  );
  IconComponent.displayName = `${initials}Icon`;
  return IconComponent;
};

// ===== Cards & Global =====
export const AdyenIcon = createBrandIcon("AD", "#0ABF53");
export const CheckoutComIcon = createBrandIcon("CO", "#0B5FFF");
export const WorldpayIcon = createBrandIcon("WP", "#EB001B");
export const AuthorizeNetIcon = createBrandIcon("AN", "#004B87");
export const TwoCheckoutIcon = createBrandIcon("2C", "#FF6600");
export const MollieIcon = createBrandIcon("ML", "#000000");
export const DLocalIcon = createBrandIcon("dL", "#FF6B35");
export const RapydIcon = createBrandIcon("RP", "#006DFF");
export const BraintreeIcon = createBrandIcon("BT", "#003366");
export const PayUIcon = createBrandIcon("PU", "#00B300");
export const PaytmIcon = createBrandIcon("PT", "#00BAF2");
export const CCAvenueIcon = createBrandIcon("CC", "#2B3990");
export const PaddleIcon = createBrandIcon("PD", "#000000");
export const GumroadIcon = createBrandIcon("GR", "#FF90E8");
export const FastSpringIcon = createBrandIcon("FS", "#E94E1B");
export const RecurlyIcon = createBrandIcon("RC", "#7B2D8E");
export const ChargebeeIcon = createBrandIcon("CB", "#FF6633");
export const TwoCTwoPIcon = createBrandIcon("2P", "#003399");
export const PayGateIcon = createBrandIcon("PG", "#00457C");
export const EbanxIcon = createBrandIcon("EB", "#003F7D");
export const PagSeguroIcon = createBrandIcon("PS", "#3CC839");
export const NuveiIcon = createBrandIcon("NV", "#5B2D86");
export const BlueSnapIcon = createBrandIcon("BS", "#0070C0");
export const CybersourceIcon = createBrandIcon("CS", "#003A70");
export const PayFastIcon = createBrandIcon("PF", "#00AEEF");
export const ThawaniIcon = createBrandIcon("TW", "#0D0D0D");
export const TapIcon = createBrandIcon("TP", "#2ACE80");
export const MoyasarIcon = createBrandIcon("MY", "#5F259F");
export const HyperPayIcon = createBrandIcon("HP", "#4285F4");
export const BenefitIcon = createBrandIcon("BN", "#C4122F");
export const STCPayIcon = createBrandIcon("ST", "#4F008C");
export const FawryIcon = createBrandIcon("FW", "#F5A623");
export const KashierIcon = createBrandIcon("KS", "#2E3192");
export const AcceptPaymobIcon = createBrandIcon("AC", "#2C2E83");
export const IPayAfricaIcon = createBrandIcon("iP", "#1B5E20");
export const YocoIcon = createBrandIcon("YC", "#00A1E0");
export const CellulantIcon = createBrandIcon("CL", "#FF6600");
export const DPOGroupIcon = createBrandIcon("DP", "#003087");
export const PesapalIcon = createBrandIcon("PP", "#FF6B00");
export const HubtelIcon = createBrandIcon("HB", "#00A651");
export const AZAFinanceIcon = createBrandIcon("AZ", "#003366");
export const FlywireIcon = createBrandIcon("FY", "#FF5733");
export const BokuIcon = createBrandIcon("BK", "#F26722");

// ===== Regional =====
export const MercadoPagoIcon = createBrandIcon("MP", "#009EE3");
export const IyzicoIcon = createBrandIcon("IZ", "#1E64FF");
export const PaymobIcon = createBrandIcon("PM", "#2C2E83");
export const XenditIcon = createBrandIcon("XN", "#0051FF");
export const MidtransIcon = createBrandIcon("MT", "#002855");
export const GCashIcon = createBrandIcon("GC", "#007DFE");
export const GrabPayIcon = createBrandIcon("GP", "#00B14F");
export const OpayIcon = createBrandIcon("OP", "#1DCE59");
export const MoovIcon = createBrandIcon("MV", "#FF6600");
export const ChipperIcon = createBrandIcon("CH", "#7B61FF");
export const PagaIcon = createBrandIcon("PG", "#1A3C6E");
export const RemitaIcon = createBrandIcon("RM", "#FF6633");
export const InterswitchIcon = createBrandIcon("IS", "#F7941D");
export const MTNMoMoIcon = createBrandIcon("MM", "#FFCC00", "#000");
export const MPesaIcon = createBrandIcon("MP", "#4DAF50");
export const ToyyibPayIcon = createBrandIcon("TB", "#2F5496");
export const BillplzIcon = createBrandIcon("BZ", "#F5A623");
export const PayHereIcon = createBrandIcon("PH", "#2196F3");
export const BkashIcon = createBrandIcon("bK", "#E2136E");
export const SSLCommerzIcon = createBrandIcon("SS", "#2C3E50");
export const ESewaIcon = createBrandIcon("eS", "#60BB46");
export const KhaltiIcon = createBrandIcon("KH", "#5C2D91");
export const JazzCashIcon = createBrandIcon("JC", "#ED1C24");
export const EasypaisaIcon = createBrandIcon("EP", "#00A651");
export const FlouciIcon = createBrandIcon("FL", "#FF6B35");
export const CinetPayIcon = createBrandIcon("CP", "#003366");
export const PayDunyaIcon = createBrandIcon("PD", "#FF9900");
export const CampayIcon = createBrandIcon("CA", "#1B5E20");
export const NotchPayIcon = createBrandIcon("NP", "#6C63FF");
export const WaveIcon = createBrandIcon("WV", "#1A82C4");
export const TigoMoneyIcon = createBrandIcon("TG", "#003399");
export const AirtelMoneyIcon = createBrandIcon("AM", "#ED1C24");
export const UPIIcon = createBrandIcon("UP", "#4CAF50");
export const PhonePeIcon = createBrandIcon("PP", "#5F259F");
export const DANAIcon = createBrandIcon("DA", "#108EE9");
export const OVOIcon = createBrandIcon("OV", "#4C3494");
export const ShopeePayIcon = createBrandIcon("SP", "#EE4D2D");
export const TrueMoneyIcon = createBrandIcon("TM", "#FF6600");
export const PromptPayIcon = createBrandIcon("PP", "#003580");
export const KakaoPayIcon = createBrandIcon("KP", "#FFCD00", "#000");
export const TossPaymentsIcon = createBrandIcon("TS", "#0064FF");
export const LinePayIcon = createBrandIcon("LP", "#00C300");
export const KonbiniIcon = createBrandIcon("KB", "#FF5722");
export const PayPayIcon = createBrandIcon("PY", "#FF0033");
export const AuPayIcon = createBrandIcon("AU", "#FF5722");
export const VNPayIcon = createBrandIcon("VN", "#003087");
export const MoMoVNIcon = createBrandIcon("MM", "#A50064");
export const ZaloPayIcon = createBrandIcon("ZP", "#0068FF");

// ===== E-Wallets =====
export const NetellerIcon = createBrandIcon("NT", "#85BC22");
export const WebMoneyIcon = createBrandIcon("WM", "#036CB5");
export const PayoneerIcon = createBrandIcon("PY", "#FF4800");
export const AlipayIcon = createBrandIcon("AP", "#1677FF");
export const WeChatPayIcon = createBrandIcon("WC", "#07C160");
export const RevolutIcon = createBrandIcon("RV", "#0075EB");
export const VenmoIcon = createBrandIcon("VN", "#3D95CE");
export const ZelleIcon = createBrandIcon("ZL", "#6D1ED4");
export const PaySeraIcon = createBrandIcon("PS", "#3F51B5");
export const PaysafecardIcon = createBrandIcon("PC", "#003087");
export const CashAppIcon = createBrandIcon("CA", "#00D632");
export const ApplePayIcon = createBrandIcon("AP", "#000000");
export const GooglePayIcon = createBrandIcon("GP", "#4285F4");
export const SamsungPayIcon = createBrandIcon("SM", "#1428A0");
export const AmazonPayIcon = createBrandIcon("AZ", "#FF9900");
export const ShopPayIcon = createBrandIcon("SH", "#5A31F4");

// ===== Bank =====
export const WireTransferIcon = createBrandIcon("WT", "#2C3E50");
export const IDealIcon = createBrandIcon("iD", "#CC0066");
export const BancontactIcon = createBrandIcon("BC", "#005498");
export const BoletoIcon = createBrandIcon("BL", "#2D2D2D");
export const PIXIcon = createBrandIcon("PX", "#32BCAD");
export const TrustlyIcon = createBrandIcon("TL", "#0EE06E");
export const SofortIcon = createBrandIcon("SF", "#EF6C00");
export const GiropayIcon = createBrandIcon("GI", "#003A7D");
export const EPSIcon = createBrandIcon("EP", "#C8202F");
export const Przelewy24Icon = createBrandIcon("P2", "#D32F2F");
export const MultiBancoIcon = createBrandIcon("MB", "#003366");
export const OXXOIcon = createBrandIcon("OX", "#C8202F");
export const SPEIIcon = createBrandIcon("SP", "#003366");

// ===== Crypto =====
export const PlisioIcon = createBrandIcon("PL", "#2B2D42");
export const CoinPaymentsIcon = createBrandIcon("CP", "#203461");
export const TripleAIcon = createBrandIcon("3A", "#FF6B00");
export const BitPayIcon = createBrandIcon("BP", "#1A3B8B");
export const BlockonomicsIcon = createBrandIcon("BN", "#F7931A");
export const OpenNodeIcon = createBrandIcon("ON", "#266EFF");
export const MixPayIcon = createBrandIcon("MX", "#4D69FA");
export const CryptocloudIcon = createBrandIcon("CC", "#6366F1");
export const OxapayIcon = createBrandIcon("OX", "#00B894");
export const SpicePayIcon = createBrandIcon("SP", "#FF4500");
export const CryptomusIcon = createBrandIcon("CM", "#2563EB");
export const HeleketIcon = createBrandIcon("HK", "#1A1A2E");
export const UtrustIcon = createBrandIcon("UT", "#3C8C5E");
export const ConfirmoIcon = createBrandIcon("CF", "#1A237E");
export const SpeedIcon = createBrandIcon("SD", "#FF6F00");
export const GoURLIcon = createBrandIcon("GU", "#4CAF50");
export const B2BinPayIcon = createBrandIcon("B2", "#1E88E5");
export const CoinremitterIcon = createBrandIcon("CR", "#FF9800");
export const CoinsPaidIcon = createBrandIcon("CP", "#2962FF");
export const SpectrocoinIcon = createBrandIcon("SC", "#2196F3");
export const TransakIcon = createBrandIcon("TK", "#0364FF");
export const MoonPayIcon = createBrandIcon("MN", "#7C3AED");
export const SimplexIcon = createBrandIcon("SX", "#4A90E2");
export const RampIcon = createBrandIcon("RM", "#21BF73");
export const SardineIcon = createBrandIcon("SR", "#FF5A5F");

// ===== BNPL =====
export const KlarnaIcon = createBrandIcon("KL", "#FFB3C7", "#000");
export const AfterpayIcon = createBrandIcon("AP", "#B2FCE4", "#000");
export const TabbyIcon = createBrandIcon("TB", "#3BFFC1", "#000");
export const TamaraIcon = createBrandIcon("TM", "#2E294E");
export const SezzleIcon = createBrandIcon("SZ", "#392B85");
export const AffirmIcon = createBrandIcon("AF", "#0FA0EA");
export const ZipPayIcon = createBrandIcon("ZP", "#AA8FFF");
export const SplititIcon = createBrandIcon("SI", "#00C389");
export const LaybuyIcon = createBrandIcon("LB", "#FF6B6B");
export const OpenpayIcon = createBrandIcon("OP", "#012169");
export const AtomeIcon = createBrandIcon("AT", "#00D4AA");
export const HoolahIcon = createBrandIcon("HL", "#D4145A");
export const PaceIcon = createBrandIcon("PC", "#5A31F4");

// Extended icon map
export const extendedPaymentIcons: Record<string, React.FC<{ className?: string }>> = {
  adyen: AdyenIcon,
  "checkout.com": CheckoutComIcon,
  checkoutcom: CheckoutComIcon,
  worldpay: WorldpayIcon,
  "authorize.net": AuthorizeNetIcon,
  authorizenet: AuthorizeNetIcon,
  "2checkout": TwoCheckoutIcon,
  twocheckout: TwoCheckoutIcon,
  mollie: MollieIcon,
  dlocal: DLocalIcon,
  rapyd: RapydIcon,
  braintree: BraintreeIcon,
  payu: PayUIcon,
  paytm: PaytmIcon,
  ccavenue: CCAvenueIcon,
  paddle: PaddleIcon,
  gumroad: GumroadIcon,
  fastspring: FastSpringIcon,
  recurly: RecurlyIcon,
  chargebee: ChargebeeIcon,
  "2c2p": TwoCTwoPIcon,
  paygate: PayGateIcon,
  ebanx: EbanxIcon,
  pagseguro: PagSeguroIcon,
  nuvei: NuveiIcon,
  bluesnap: BlueSnapIcon,
  cybersource: CybersourceIcon,
  payfast: PayFastIcon,
  thawani: ThawaniIcon,
  tap: TapIcon,
  moyasar: MoyasarIcon,
  hyperpay: HyperPayIcon,
  benefit: BenefitIcon,
  stcpay: STCPayIcon,
  fawry: FawryIcon,
  kashier: KashierIcon,
  accept_paymob: AcceptPaymobIcon,
  ipay_africa: IPayAfricaIcon,
  yoco: YocoIcon,
  cellulant: CellulantIcon,
  dpo_group: DPOGroupIcon,
  pesapal: PesapalIcon,
  hubtel: HubtelIcon,
  aza_finance: AZAFinanceIcon,
  flywire: FlywireIcon,
  boku: BokuIcon,
  mercadopago: MercadoPagoIcon,
  mercado_pago: MercadoPagoIcon,
  iyzico: IyzicoIcon,
  paymob: PaymobIcon,
  xendit: XenditIcon,
  midtrans: MidtransIcon,
  gcash: GCashIcon,
  grabpay: GrabPayIcon,
  grab_pay: GrabPayIcon,
  opay: OpayIcon,
  moov: MoovIcon,
  moov_money: MoovIcon,
  chipper: ChipperIcon,
  chipper_cash: ChipperIcon,
  paga: PagaIcon,
  remita: RemitaIcon,
  interswitch: InterswitchIcon,
  mtn_momo: MTNMoMoIcon,
  mtnmomo: MTNMoMoIcon,
  mpesa: MPesaIcon,
  m_pesa: MPesaIcon,
  toyyibpay: ToyyibPayIcon,
  billplz: BillplzIcon,
  payhere: PayHereIcon,
  bkash: BkashIcon,
  sslcommerz: SSLCommerzIcon,
  esewa: ESewaIcon,
  khalti: KhaltiIcon,
  jazzcash: JazzCashIcon,
  easypaisa: EasypaisaIcon,
  flouci: FlouciIcon,
  cinetpay: CinetPayIcon,
  paydunya: PayDunyaIcon,
  campay: CampayIcon,
  notchpay: NotchPayIcon,
  wave: WaveIcon,
  tigomoney: TigoMoneyIcon,
  airtel_money: AirtelMoneyIcon,
  upi: UPIIcon,
  phonepe: PhonePeIcon,
  dana: DANAIcon,
  ovo: OVOIcon,
  shopeepay: ShopeePayIcon,
  truemoney: TrueMoneyIcon,
  promptpay: PromptPayIcon,
  kakaopay: KakaoPayIcon,
  toss: TossPaymentsIcon,
  linepay: LinePayIcon,
  konbini: KonbiniIcon,
  paypay: PayPayIcon,
  aupay: AuPayIcon,
  vnpay: VNPayIcon,
  momo_vn: MoMoVNIcon,
  zalopay: ZaloPayIcon,
  neteller: NetellerIcon,
  webmoney: WebMoneyIcon,
  payoneer: PayoneerIcon,
  alipay: AlipayIcon,
  wechatpay: WeChatPayIcon,
  wechat_pay: WeChatPayIcon,
  revolut: RevolutIcon,
  venmo: VenmoIcon,
  zelle: ZelleIcon,
  paysera: PaySeraIcon,
  paysafecard: PaysafecardIcon,
  cashapp: CashAppIcon,
  applepay: ApplePayIcon,
  googlepay: GooglePayIcon,
  samsungpay: SamsungPayIcon,
  amazonpay: AmazonPayIcon,
  shoppay: ShopPayIcon,
  wire_transfer: WireTransferIcon,
  wiretransfer: WireTransferIcon,
  ideal: IDealIcon,
  bancontact: BancontactIcon,
  boleto: BoletoIcon,
  pix: PIXIcon,
  trustly: TrustlyIcon,
  sofort: SofortIcon,
  giropay: GiropayIcon,
  eps: EPSIcon,
  przelewy24: Przelewy24Icon,
  multibanco: MultiBancoIcon,
  oxxo: OXXOIcon,
  spei: SPEIIcon,
  plisio: PlisioIcon,
  coinpayments: CoinPaymentsIcon,
  coin_payments: CoinPaymentsIcon,
  triplea: TripleAIcon,
  triple_a: TripleAIcon,
  bitpay: BitPayIcon,
  blockonomics: BlockonomicsIcon,
  opennode: OpenNodeIcon,
  open_node: OpenNodeIcon,
  mixpay: MixPayIcon,
  mix_pay: MixPayIcon,
  cryptocloud: CryptocloudIcon,
  crypto_cloud: CryptocloudIcon,
  oxapay: OxapayIcon,
  spicepay: SpicePayIcon,
  spice_pay: SpicePayIcon,
  cryptomus: CryptomusIcon,
  heleket: HeleketIcon,
  utrust: UtrustIcon,
  confirmo: ConfirmoIcon,
  speed: SpeedIcon,
  gourl: GoURLIcon,
  b2binpay: B2BinPayIcon,
  coinremitter: CoinremitterIcon,
  coinspaid: CoinsPaidIcon,
  spectrocoin: SpectrocoinIcon,
  transak: TransakIcon,
  moonpay: MoonPayIcon,
  simplex: SimplexIcon,
  ramp: RampIcon,
  sardine: SardineIcon,
  klarna: KlarnaIcon,
  afterpay: AfterpayIcon,
  clearpay: AfterpayIcon,
  tabby: TabbyIcon,
  tamara: TamaraIcon,
  sezzle: SezzleIcon,
  affirm: AffirmIcon,
  zip: ZipPayIcon,
  quadpay: ZipPayIcon,
  splitit: SplititIcon,
  laybuy: LaybuyIcon,
  openpay_bnpl: OpenpayIcon,
  atome: AtomeIcon,
  hoolah: HoolahIcon,
  pace: PaceIcon,
};
