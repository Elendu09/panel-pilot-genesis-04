import React from "react";

// Official Stripe SVG Icon
export const StripeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#635BFF"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M15.2 13.2c0-.8.7-1.2 1.8-1.2 1.6 0 3.6.5 5.2 1.4V9.2c-1.7-.7-3.5-1-5.2-1-4.3 0-7.1 2.2-7.1 6 0 5.8 8 4.9 8 7.4 0 1-.9 1.3-2.1 1.3-1.8 0-4.2-.8-6-1.8v4.3c2 .9 4.1 1.3 6 1.3 4.4 0 7.4-2.2 7.4-6 0-6.3-8-5.2-8-7.5z" fill="white"/>
  </svg>
);

// Official PayPal SVG Icon
export const PayPalIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#003087"/>
    <path d="M23.2 11.2c0 3.5-2.8 6.2-6.8 6.2h-1.7l-.8 5.2H11l.2-1.2 2.6-16.2h5c2.8 0 4.4 1.6 4.4 4v2zm-6.5 3.5c1.9 0 3.2-1.2 3.2-3.2 0-1.2-.8-2-2.2-2h-1.4l-.8 5.2h1.2z" fill="#009CDE"/>
    <path d="M9.5 25.2l2.6-16.2h5c2.8 0 4.4 1.6 4.4 4v2c0 3.5-2.8 6.2-6.8 6.2h-1.7l-.8 5.2H9.5v-1.2zm5.2-8.7c1.9 0 3.2-1.2 3.2-3.2 0-1.2-.8-2-2.2-2h-1.4l-.8 5.2h1.2z" fill="white"/>
  </svg>
);

// Official Visa SVG Icon
export const VisaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1A1F71"/>
    <path d="M13.5 21H11.2L12.7 11H15L13.5 21Z" fill="white"/>
    <path d="M22 11.2C21.5 11 20.7 10.8 19.8 10.8C17.5 10.8 15.8 12 15.8 13.8C15.8 15.2 17 15.9 18 16.4C19 16.9 19.3 17.2 19.3 17.6C19.3 18.2 18.5 18.5 17.8 18.5C16.8 18.5 16.3 18.4 15.5 18L15.2 17.9L14.9 20C15.5 20.3 16.5 20.5 17.5 20.5C20 20.5 21.6 19.3 21.6 17.4C21.6 16.3 20.9 15.5 19.5 14.8C18.6 14.4 18 14.1 18 13.6C18 13.2 18.4 12.8 19.3 12.8C20.1 12.8 20.7 12.9 21.1 13.1L21.3 13.2L22 11.2Z" fill="white"/>
    <path d="M25.2 11H23.4C22.8 11 22.4 11.2 22.1 11.8L18.6 21H21.1L21.6 19.5H24.6L24.9 21H27.1L25.2 11ZM22.3 17.6L23.4 14.3L24 17.6H22.3Z" fill="white"/>
    <path d="M10.3 11L8 17.8L7.7 16.4C7.2 14.8 5.7 13.1 4 12.2L6.1 21H8.6L12.8 11H10.3Z" fill="white"/>
    <path d="M6.5 11H2.7L2.6 11.2C5.5 11.9 7.4 13.6 8.1 15.6L7.3 11.8C7.2 11.2 6.9 11 6.5 11Z" fill="#F9A51A"/>
  </svg>
);

// Official Mastercard SVG Icon
export const MastercardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1A1F71"/>
    <circle cx="12" cy="16" r="7" fill="#EB001B"/>
    <circle cx="20" cy="16" r="7" fill="#F79E1B"/>
    <path d="M16 10.5C17.5 11.8 18.5 13.8 18.5 16C18.5 18.2 17.5 20.2 16 21.5C14.5 20.2 13.5 18.2 13.5 16C13.5 13.8 14.5 11.8 16 10.5Z" fill="#FF5F00"/>
  </svg>
);

// Official Apple Pay SVG Icon
export const ApplePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#000000"/>
    <path d="M9.8 12.5C9.5 12.9 9 13.2 8.5 13.2C8.4 12.6 8.7 12 9 11.6C9.3 11.2 9.9 10.8 10.3 10.8C10.4 11.4 10.1 12 9.8 12.5ZM10.3 13.4C9.5 13.4 8.8 13.9 8.4 13.9C8 13.9 7.4 13.4 6.7 13.5C5.8 13.5 5 14 4.5 14.8C3.5 16.4 4.2 18.8 5.2 20.1C5.7 20.7 6.3 21.5 7.1 21.4C7.8 21.4 8.1 21 8.9 21C9.7 21 10 21.4 10.7 21.4C11.5 21.4 12 20.7 12.5 20.1C13.1 19.4 13.3 18.7 13.3 18.7C13.3 18.7 12 18.2 12 16.7C12 15.4 13 14.8 13.1 14.7C12.5 13.8 11.5 13.4 10.3 13.4Z" fill="white"/>
    <path d="M17.5 11.4C19.2 11.4 20.4 12.6 20.4 14.3C20.4 16 19.2 17.2 17.4 17.2H15.4V20.1C15.4 20.9 15.8 21.3 16.6 21.3H17V21.9H13.9V21.3H14.3C15.1 21.3 15.4 20.9 15.4 20.1V12.6C15.4 11.8 15.1 11.4 14.3 11.4H13.9V10.8H17.5V11.4ZM15.4 16.6H17.2C18.6 16.6 19.4 15.8 19.4 14.3C19.4 12.8 18.6 12 17.2 12H15.4V16.6Z" fill="white"/>
    <path d="M24.5 21.9C22.7 21.9 21.5 20.6 21.5 18.8C21.5 17 22.7 15.7 24.4 15.7C26.1 15.7 27.2 16.9 27.2 18.6V19H22.4C22.5 20.3 23.2 21.3 24.6 21.3C25.5 21.3 26.2 20.9 26.5 20.2L27.1 20.5C26.6 21.4 25.7 21.9 24.5 21.9ZM24.4 16.3C23.3 16.3 22.6 17 22.4 18.4H26.3C26.2 17 25.5 16.3 24.4 16.3Z" fill="white"/>
  </svg>
);

// Official Google Pay SVG Icon
export const GooglePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="white" stroke="#E5E5E5" strokeWidth="0.5"/>
    <path d="M15.5 16.5V20H14V11.5H17.5C18.3 11.5 19 11.8 19.6 12.4C20.2 13 20.5 13.7 20.5 14.5C20.5 15.3 20.2 16 19.6 16.6C19 17.2 18.3 17.5 17.5 17.5H15.5V16.5ZM15.5 13V16H17.6C18 16 18.4 15.8 18.7 15.5C19 15.2 19.2 14.8 19.2 14.5C19.2 14.2 19 13.8 18.7 13.5C18.4 13.2 18 13 17.6 13H15.5Z" fill="#4285F4"/>
    <path d="M24 16.2C24 15.7 24 15.2 23.9 14.7H20.5V17.4H22.5C22.4 18 22.1 18.5 21.6 18.9L23.1 20C24 19.2 24.5 17.9 24.5 16.4L24 16.2Z" fill="#4285F4"/>
    <path d="M17.5 24C19 24 20.3 23.5 21.3 22.7L19.8 21.6C19.2 22 18.4 22.3 17.5 22.3C15.8 22.3 14.3 21.1 13.8 19.5L12.2 20.6C13.2 22.6 15.2 24 17.5 24Z" fill="#34A853"/>
    <path d="M13.8 19.5C13.6 19 13.5 18.5 13.5 18C13.5 17.5 13.6 17 13.8 16.5L12.2 15.4C11.7 16.4 11.5 17.2 11.5 18C11.5 18.8 11.7 19.6 12.2 20.6L13.8 19.5Z" fill="#FBBC05"/>
    <path d="M17.5 13.7C18.5 13.7 19.3 14 20 14.6L21.4 13.2C20.3 12.2 18.9 11.5 17.5 11.5C15.2 11.5 13.2 12.9 12.2 14.9L13.8 16C14.3 14.4 15.8 13.2 17.5 13.2V13.7Z" fill="#EA4335"/>
  </svg>
);

// Official Bitcoin SVG Icon
export const BitcoinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#F7931A"/>
    <path d="M22.5 13.9C22.8 11.8 21.2 10.7 19 10V8.2L17.8 8.5V10C17.5 10 17.1 10.1 16.8 10.1V8.5L15.6 8.8V10.5C15.3 10.5 15.1 10.6 14.8 10.6L13.2 10.9V12.2C13.2 12.2 14.1 12 14.1 12C14.5 12 14.7 12.2 14.7 12.5V17.8C14.7 18 14.6 18.3 14.2 18.4C14.2 18.4 13.3 18.2 13.3 18.2L13 19.7L14.5 20C14.8 20.1 15 20.1 15.3 20.2V22L16.5 21.7V20.3C16.8 20.4 17.2 20.4 17.5 20.4V21.8L18.7 21.5V19.9C20.8 19.7 22.3 19 22.5 17.2C22.7 15.7 22 15 21 14.6C21.8 14.2 22.4 13.5 22.5 13.9ZM19.5 17C19.5 18.2 17.5 18.4 16.8 18.4V15.7C17.5 15.7 19.5 15.7 19.5 17ZM18.8 13.5C18.8 14.6 17.1 14.7 16.5 14.7V12.3C17.1 12.3 18.8 12.3 18.8 13.5Z" fill="white"/>
  </svg>
);

// Official Razorpay SVG Icon
export const RazorpayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#072654"/>
    <path d="M13.2 9L9.5 23H12.2L13.5 19H16.2L18.5 23H21.5L16 13.5L17.5 9H13.2Z" fill="white"/>
    <path d="M18.5 9L22.5 23H19.8L18.5 9Z" fill="#3395FF"/>
  </svg>
);

// Official Coinbase SVG Icon
export const CoinbaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0052FF"/>
    <path d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26C21.5 26 26 21.5 26 16C26 10.5 21.5 6 16 6ZM16 22C12.7 22 10 19.3 10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16C22 19.3 19.3 22 16 22Z" fill="white"/>
    <circle cx="16" cy="16" r="3" fill="white"/>
  </svg>
);

// Official Wise SVG Icon
export const WiseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#9FE870"/>
    <path d="M7 14L10.5 20L14 14L17.5 20L21 14L24.5 20L25 14" stroke="#163300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Official Skrill SVG Icon
export const SkrillIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#862165"/>
    <path d="M20.5 13C20.5 11.1 18.9 10 16.5 10H11V22H13.5V18H16.5C18.9 18 20.5 16.9 20.5 15V13ZM18 15C18 15.8 17.3 16 16.5 16H13.5V12H16.5C17.3 12 18 12.2 18 13V15Z" fill="white"/>
  </svg>
);

// Paystack Icon
export const PaystackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#00C3F7"/>
    <path d="M8 10H24V12H8V10ZM8 14H20V16H8V14ZM8 18H24V20H8V18ZM8 22H16V24H8V22Z" fill="white"/>
  </svg>
);

// Kora Pay Icon
export const KoraPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#00B5E2"/>
    <path d="M8 8V24H12V18L18 24H24L16 16L24 8H18L12 14V8H8Z" fill="white"/>
  </svg>
);

// Monnify Icon
export const MonnifyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0057A7"/>
    <path d="M8 12L12 8L16 12L20 8L24 12V20L20 24L16 20L12 24L8 20V12Z" fill="white"/>
    <circle cx="16" cy="16" r="3" fill="#0057A7"/>
  </svg>
);

// NowPayments Icon
export const NowPaymentsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#05C46B"/>
    <path d="M10 22V10L16 16L22 10V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// CoinGate Icon
export const CoinGateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1E3A5F"/>
    <circle cx="16" cy="16" r="8" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <path d="M14 13V19M14 13H18M14 16H17M14 19H18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Binance Pay Icon
export const BinancePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#F0B90B"/>
    <path d="M16 8L19 11L16 14L13 11L16 8Z" fill="white"/>
    <path d="M10 14L13 17L10 20L7 17L10 14Z" fill="white"/>
    <path d="M22 14L25 17L22 20L19 17L22 14Z" fill="white"/>
    <path d="M16 17L19 20L16 23L13 20L16 17Z" fill="white"/>
  </svg>
);

// Perfect Money Icon
export const PerfectMoneyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#E31C23"/>
    <path d="M10 10H18C20.2 10 22 11.8 22 14C22 16.2 20.2 18 18 18H14V22H10V10Z" fill="white"/>
    <path d="M14 13V15H17.5C18.1 15 18.5 14.6 18.5 14C18.5 13.4 18.1 13 17.5 13H14Z" fill="#E31C23"/>
  </svg>
);

// Flutterwave Icon
export const FlutterwaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#F5A623"/>
    <path d="M8 11C8 9.9 8.9 9 10 9H22C23.1 9 24 9.9 24 11V21C24 22.1 23.1 23 22 23H10C8.9 23 8 22.1 8 21V11Z" fill="white" fillOpacity="0.2"/>
    <path d="M12 14L16 18L20 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Square Icon
export const SquareIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#000000"/>
    <rect x="8" y="8" width="16" height="16" rx="3" fill="white"/>
    <rect x="11" y="11" width="10" height="10" rx="1" fill="#000000"/>
  </svg>
);

// Amazon Pay Icon
export const AmazonPayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#FF9900"/>
    <path d="M10 16C10 13.2 12.2 11 15 11H17C19.8 11 22 13.2 22 16C22 18.8 19.8 21 17 21H15C12.2 21 10 18.8 10 16Z" fill="white"/>
    <path d="M14 15L16 17L20 13" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Generic payment icon for unknown gateways
export const GenericPaymentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="hsl(var(--muted))"/>
    <rect x="6" y="10" width="20" height="12" rx="2" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none"/>
    <rect x="6" y="14" width="20" height="3" fill="hsl(var(--muted-foreground))" opacity="0.3"/>
    <rect x="8" y="18" width="6" height="2" rx="1" fill="hsl(var(--muted-foreground))" opacity="0.5"/>
  </svg>
);

// Map gateway IDs to their icons
import { extendedPaymentIcons } from "./PaymentIconsExtended";

export const getPaymentIcon = (gatewayId: string): React.FC<{ className?: string }> => {
  const icons: Record<string, React.FC<{ className?: string }>> = {
    stripe: StripeIcon,
    paypal: PayPalIcon,
    visa: VisaIcon,
    mastercard: MastercardIcon,
    applepay: ApplePayIcon,
    apple_pay: ApplePayIcon,
    googlepay: GooglePayIcon,
    google_pay: GooglePayIcon,
    coinbase: CoinbaseIcon,
    btcpay: BitcoinIcon,
    bitcoin: BitcoinIcon,
    crypto: BitcoinIcon,
    razorpay: RazorpayIcon,
    wise: WiseIcon,
    transferwise: WiseIcon,
    skrill: SkrillIcon,
    paystack: PaystackIcon,
    flutterwave: FlutterwaveIcon,
    square: SquareIcon,
    amazonpay: AmazonPayIcon,
    amazon_pay: AmazonPayIcon,
    korapay: KoraPayIcon,
    kora_pay: KoraPayIcon,
    monnify: MonnifyIcon,
    nowpayments: NowPaymentsIcon,
    now_payments: NowPaymentsIcon,
    coingate: CoinGateIcon,
    coin_gate: CoinGateIcon,
    binancepay: BinancePayIcon,
    binance_pay: BinancePayIcon,
    perfectmoney: PerfectMoneyIcon,
    perfect_money: PerfectMoneyIcon,
    ...extendedPaymentIcons,
  };
  return icons[gatewayId.toLowerCase()] || GenericPaymentIcon;
};