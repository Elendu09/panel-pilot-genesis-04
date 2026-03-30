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

// ===== Proper SVG Brand Icons for top gateways =====

// Apple Pay - Apple logo mark
export const ApplePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#000000" />
    <path d="M20.4 10.8c-.7.8-1.8 1.4-2.9 1.3-.1-1.1.4-2.3 1.1-3 .7-.8 1.9-1.4 2.8-1.4.1 1.2-.4 2.3-1 3.1zm1 1.6c-1.6-.1-3 .9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.8 0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.5-2z" fill="white"/>
  </svg>
);
ApplePayIcon.displayName = "ApplePayIcon";

// Google Pay - G mark
export const GooglePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5"/>
    <path d="M23.5 16.3c0-.5 0-1-.1-1.5H16v2.8h4.2c-.2 1-.7 1.8-1.5 2.4v2h2.4c1.4-1.3 2.4-3.2 2.4-5.7z" fill="#4285F4"/>
    <path d="M16 24c2 0 3.7-.7 5-1.8l-2.4-2c-.7.5-1.5.7-2.5.7-2 0-3.6-1.3-4.2-3.1H9.3v2c1.3 2.5 3.8 4.2 6.7 4.2z" fill="#34A853"/>
    <path d="M11.8 17.8c-.2-.5-.2-1 0-1.5v-2H9.3c-.7 1.3-.7 2.8 0 4.2l2.5-2.2v1.5z" fill="#FBBC05"/>
    <path d="M16 12.7c1.1 0 2.1.4 2.9 1.1l2.2-2.2C19.7 10.2 18 9.5 16 9.5c-2.9 0-5.4 1.7-6.7 4.2l2.5 2c.6-1.8 2.2-3 4.2-3z" fill="#EA4335"/>
  </svg>
);
GooglePayIcon.displayName = "GooglePayIcon";

// Klarna - K mark
export const KlarnaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#FFB3C7" />
    <path d="M13 8h-3v16h3V8zm8.5 0c0 3.5-1.5 6.7-4 8.8L22 24h-3.5l-4-6.5c2.4-1.7 4-4.6 4-7.8V8h3v0z" fill="#0A0B09"/>
    <circle cx="22" cy="22" r="2" fill="#0A0B09"/>
  </svg>
);
KlarnaIcon.displayName = "KlarnaIcon";

// Alipay - A mark
export const AlipayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1677FF" />
    <path d="M24 20.5c-2-.8-4.2-1.8-5.5-2.5.8-1.5 1.3-3.2 1.5-5h-3.5v-1.5H21V10H16.5V8.5h-2V10H10v1.5h4.5V13H10v1.5h7c-.2 1.3-.6 2.5-1.2 3.5-1.5-.6-3-1-4.3-1C9 17 7.5 18.2 7.5 19.8c0 1.5 1.3 2.7 3.5 2.7 2.3 0 4-1.3 5.2-3.2 2 1 4.8 2.2 7 3l.8-1.8z" fill="white"/>
  </svg>
);
AlipayIcon.displayName = "AlipayIcon";

// WeChat Pay - chat bubble
export const WeChatPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#07C160" />
    <path d="M13 10c-3.3 0-6 2.2-6 5 0 1.6.9 3 2.3 4l-.6 2 2.3-1.2c.6.2 1.3.2 2 .2.2 0 .5 0 .7 0-.2-.5-.2-1-.2-1.5 0-3.1 2.9-5.5 6.5-5.5.2 0 .5 0 .7 0C20 11.5 16.8 10 13 10z" fill="white" opacity="0.9"/>
    <path d="M25.5 18.5c0-2.5-2.5-4.5-5.5-4.5s-5.5 2-5.5 4.5 2.5 4.5 5.5 4.5c.6 0 1.2-.1 1.7-.2l1.8 1-.5-1.5c1.5-.8 2.5-2.2 2.5-3.8z" fill="white"/>
  </svg>
);
WeChatPayIcon.displayName = "WeChatPayIcon";

// Revolut - R mark
export const RevolutIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0075EB" />
    <path d="M11 8h6c2.8 0 4.5 1.5 4.5 4 0 2-1.2 3.3-3 3.8L22 24h-3.5l-3.2-7.5H14V24h-3V8zm3 2.5v4h2.5c1.3 0 2-.7 2-2s-.7-2-2-2H14z" fill="white"/>
  </svg>
);
RevolutIcon.displayName = "RevolutIcon";

// Venmo - V mark
export const VenmoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#3D95CE" />
    <path d="M22 8.5c.7 1.1 1 2.3 1 3.8 0 4.7-4 10.7-7.3 15H11l-2.5-14.7 3.8-.4 1.5 11.5c1.8-2.9 4-7.5 4-10.1 0-1.3-.2-2.2-.6-2.9L22 8.5z" fill="white"/>
  </svg>
);
VenmoIcon.displayName = "VenmoIcon";

// Cash App - $ mark
export const CashAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#00D632" />
    <path d="M16 7v2.5c-2 .3-3.5 1.5-3.5 3.2 0 2 1.5 2.8 3.5 3.3 1.3.3 2 .7 2 1.5s-.8 1.3-2 1.3c-1.2 0-2.2-.5-3-1.3l-1.5 2c1 1 2.5 1.6 4 1.8V23h1.5v-2.5c2.2-.3 3.5-1.6 3.5-3.3 0-2-1.3-2.8-3.5-3.3-1.2-.3-2-.7-2-1.4 0-.7.7-1.2 1.8-1.2 1 0 2 .4 2.7 1l1.5-1.8c-1-.8-2.3-1.3-3.5-1.5V7H16z" fill="white"/>
  </svg>
);
CashAppIcon.displayName = "CashAppIcon";

// Samsung Pay
export const SamsungPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1428A0" />
    <path d="M7 18.5c0 .8.5 1.5 1.2 1.5h.3c.5 0 .8-.3.8-.7 0-.5-.3-.7-.8-.8-.5-.2-.7-.3-.7-.5 0-.2.2-.3.4-.3.3 0 .5.1.7.3l.4-.5c-.3-.3-.7-.4-1.1-.4-.6 0-1.1.4-1.1 1 0 .5.3.7.8.9.5.2.7.3.7.5s-.2.4-.5.4c-.3 0-.6-.2-.8-.4L7 18.5z" fill="white"/>
    <text x="16" y="20" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">PAY</text>
  </svg>
);
SamsungPayIcon.displayName = "SamsungPayIcon";

// Amazon Pay
export const AmazonPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#FF9900" />
    <path d="M8 17c0 0 3.5 3 8 3s8-3 8-3" stroke="#232F3E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M22 17l2 1.5-1.5 2" stroke="#232F3E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="16" y="15" textAnchor="middle" fill="#232F3E" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">a</text>
  </svg>
);
AmazonPayIcon.displayName = "AmazonPayIcon";

// Shop Pay
export const ShopPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#5A31F4" />
    <path d="M10 11c0 0 1-2 4-2s4 2 4 4-2 4-4 4h-2v4h-2V11z" fill="white"/>
    <path d="M16 21l2-2h4l-2 4h-4v-2z" fill="white" opacity="0.7"/>
  </svg>
);
ShopPayIcon.displayName = "ShopPayIcon";

// Affirm
export const AffirmIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0FA0EA" />
    <text x="16" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">affirm</text>
  </svg>
);
AffirmIcon.displayName = "AffirmIcon";

// Afterpay
export const AfterpayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#B2FCE4" />
    <path d="M16 8l-8 12h5v4l8-12h-5V8z" fill="#000000"/>
  </svg>
);
AfterpayIcon.displayName = "AfterpayIcon";

// PIX - Brazilian instant payment
export const PIXIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#32BCAD" />
    <path d="M20.5 11.5L16 16l-4.5-4.5L9 14l4.5 4.5L9 23l2.5 2.5L16 21l4.5 4.5L23 23l-4.5-4.5L23 14l-2.5-2.5z" fill="white"/>
  </svg>
);
PIXIcon.displayName = "PIXIcon";

// iDEAL - Dutch payment
export const IDealIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#CC0066" />
    <text x="16" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">iDEAL</text>
  </svg>
);
IDealIcon.displayName = "IDealIcon";

// BitPay
export const BitPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1A3B8B" />
    <path d="M19 12c0-1.5-1-2.5-2.5-2.5H14V8h-1.5v1.5H11V8H9.5v1.5H8v2h1v9h-1v2h1.5V24H11v-1.5h1.5V24H14v-1.5h2c1.8 0 3-1.2 3-2.8 0-1.2-.7-2.2-1.8-2.7.8-.5 1.3-1.3 1.3-2.2v-.3zM11.5 13h3c.8 0 1.5.5 1.5 1.3s-.7 1.2-1.5 1.2h-3V13zm3.5 7.5h-3.5V18H15c1 0 1.5.5 1.5 1.3 0 .7-.5 1.2-1.5 1.2z" fill="white"/>
  </svg>
);
BitPayIcon.displayName = "BitPayIcon";

// Bancontact
export const BancontactIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#005498" />
    <circle cx="13" cy="14" r="4" fill="#FFD800"/>
    <circle cx="19" cy="14" r="4" fill="#005498" stroke="#FFD800" strokeWidth="1"/>
    <text x="16" y="25" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial, sans-serif">Bancontact</text>
  </svg>
);
BancontactIcon.displayName = "BancontactIcon";

// Boleto
export const BoletoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#2D2D2D" />
    <rect x="8" y="10" width="1.5" height="12" fill="white"/>
    <rect x="11" y="10" width="1" height="12" fill="white"/>
    <rect x="13.5" y="10" width="2" height="12" fill="white"/>
    <rect x="17" y="10" width="1" height="12" fill="white"/>
    <rect x="19.5" y="10" width="1.5" height="12" fill="white"/>
    <rect x="22.5" y="10" width="1" height="12" fill="white"/>
  </svg>
);
BoletoIcon.displayName = "BoletoIcon";

// Zelle
export const ZelleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#6D1ED4" />
    <path d="M10 11h12v2.5l-8 5H22V21H10v-2.5l8-5H10V11z" fill="white"/>
  </svg>
);
ZelleIcon.displayName = "ZelleIcon";

// ===== Rest use branded initials =====
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

// E-Wallets
export const NetellerIcon = createBrandIcon("NT", "#85BC22");
export const WebMoneyIcon = createBrandIcon("WM", "#036CB5");
export const PayoneerIcon = createBrandIcon("PY", "#FF4800");
export const PaySeraIcon = createBrandIcon("PS", "#3F51B5");
export const PaysafecardIcon = createBrandIcon("PC", "#003087");

// Bank
export const WireTransferIcon = createBrandIcon("WT", "#2C3E50");
export const TrustlyIcon = createBrandIcon("TL", "#0EE06E");
export const SofortIcon = createBrandIcon("SF", "#EF6C00");
export const GiropayIcon = createBrandIcon("GI", "#003A7D");
export const EPSIcon = createBrandIcon("EP", "#C8202F");
export const Przelewy24Icon = createBrandIcon("P2", "#D32F2F");
export const MultiBancoIcon = createBrandIcon("MB", "#003366");
export const OXXOIcon = createBrandIcon("OX", "#C8202F");
export const SPEIIcon = createBrandIcon("SP", "#003366");

// Crypto
export const PlisioIcon = createBrandIcon("PL", "#2B2D42");
export const CoinPaymentsIcon = createBrandIcon("CP", "#203461");
export const TripleAIcon = createBrandIcon("3A", "#FF6B00");
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

// BNPL
export const TabbyIcon = createBrandIcon("TB", "#3BFFC1", "#000");
export const TamaraIcon = createBrandIcon("TM", "#2E294E");
export const SezzleIcon = createBrandIcon("SZ", "#392B85");
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
