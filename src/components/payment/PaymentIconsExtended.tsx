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

// Cards & Global
export const AdyenIcon = createBrandIcon("AD", "#0ABF53");
export const CheckoutComIcon = createBrandIcon("CO", "#0B5FFF");
export const WorldpayIcon = createBrandIcon("WP", "#EB001B");
export const AuthorizeNetIcon = createBrandIcon("AN", "#004B87");
export const TwoCheckoutIcon = createBrandIcon("2C", "#FF6600");
export const MollieIcon = createBrandIcon("ML", "#000000");
export const DLocalIcon = createBrandIcon("dL", "#FF6B35");
export const RapydIcon = createBrandIcon("RP", "#006DFF");

// Regional
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

// E-Wallets
export const NetellerIcon = createBrandIcon("NT", "#85BC22");
export const WebMoneyIcon = createBrandIcon("WM", "#036CB5");
export const PayoneerIcon = createBrandIcon("PY", "#FF4800");
export const AlipayIcon = createBrandIcon("AP", "#1677FF");
export const WeChatPayIcon = createBrandIcon("WC", "#07C160");
export const RevolutIcon = createBrandIcon("RV", "#0075EB");
export const VenmoIcon = createBrandIcon("VN", "#3D95CE");
export const ZelleIcon = createBrandIcon("ZL", "#6D1ED4");

// Bank
export const WireTransferIcon = createBrandIcon("WT", "#2C3E50");
export const IDealIcon = createBrandIcon("iD", "#CC0066");
export const BancontactIcon = createBrandIcon("BC", "#005498");
export const BoletoIcon = createBrandIcon("BL", "#2D2D2D");
export const PIXIcon = createBrandIcon("PX", "#32BCAD");

// Crypto
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

// BNPL / Alternative
export const KlarnaIcon = createBrandIcon("KL", "#FFB3C7", "#000");
export const AfterpayIcon = createBrandIcon("AP", "#B2FCE4", "#000");
export const TabbyIcon = createBrandIcon("TB", "#3BFFC1", "#000");
export const TamaraIcon = createBrandIcon("TM", "#2E294E");
export const SezzleIcon = createBrandIcon("SZ", "#392B85");

// Extended icon map (to add to getPaymentIcon)
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
  neteller: NetellerIcon,
  webmoney: WebMoneyIcon,
  payoneer: PayoneerIcon,
  alipay: AlipayIcon,
  wechatpay: WeChatPayIcon,
  wechat_pay: WeChatPayIcon,
  revolut: RevolutIcon,
  venmo: VenmoIcon,
  zelle: ZelleIcon,
  wire_transfer: WireTransferIcon,
  wiretransfer: WireTransferIcon,
  ideal: IDealIcon,
  bancontact: BancontactIcon,
  boleto: BoletoIcon,
  pix: PIXIcon,
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
  klarna: KlarnaIcon,
  afterpay: AfterpayIcon,
  clearpay: AfterpayIcon,
  tabby: TabbyIcon,
  tamara: TamaraIcon,
  sezzle: SezzleIcon,
};
