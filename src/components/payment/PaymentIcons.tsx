import React from "react";

// Official payment gateway SVG icons
export const StripeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#635BFF"/>
    <path d="M14.5 12.5C14.5 11.67 15.17 11 16 11C17.5 11 19 11.75 20 13L22.5 10.5C21 8.5 18.5 7.5 16 7.5C12.67 7.5 10 10 10 13C10 18.5 18 17.5 18 20.5C18 21.5 17 22 16 22C14 22 12.5 21 11.5 19.5L9 22C10.5 24 13 25 16 25C19.33 25 22 22.67 22 20C22 14 14.5 15.5 14.5 12.5Z" fill="white"/>
  </svg>
);

export const PayPalIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#003087"/>
    <path d="M22.5 10.5C22.5 7.5 20 6 16.5 6H10L7 24H11L12 18H15C19 18 22.5 16 22.5 12V10.5Z" fill="#27346A"/>
    <path d="M11 10H15.5C17.5 10 18.5 11 18.5 12.5C18.5 14.5 17 16 14.5 16H12L11 10Z" fill="white"/>
    <path d="M24.5 12.5C24.5 9.5 22 8 18.5 8H14L11 26H15L16 20H19C23 20 24.5 17 24.5 14V12.5Z" fill="#0079C1"/>
    <path d="M15 12H18.5C20 12 20.5 13 20.5 14.5C20.5 16.5 19 18 16.5 18H14L15 12Z" fill="white"/>
  </svg>
);

export const VisaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#1A1F71"/>
    <path d="M13.5 20.5L15 11.5H17.5L16 20.5H13.5Z" fill="white"/>
    <path d="M22.5 11.5L20.5 17.5L20 14.5L19 12.5C19 12.5 18.5 11.5 17 11.5H13L12.5 11.75L15 14.5L16.5 20.5H19L24 11.5H22.5Z" fill="white"/>
    <path d="M11 20.5L8.5 11.5H6L6.25 12C7.5 14.5 9 17.5 9.5 20.5H11Z" fill="white"/>
  </svg>
);

export const MastercardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#000000"/>
    <circle cx="12" cy="16" r="7" fill="#EB001B"/>
    <circle cx="20" cy="16" r="7" fill="#F79E1B"/>
    <path d="M16 10.5C17.5 11.5 18.5 13.5 18.5 16C18.5 18.5 17.5 20.5 16 21.5C14.5 20.5 13.5 18.5 13.5 16C13.5 13.5 14.5 11.5 16 10.5Z" fill="#FF5F00"/>
  </svg>
);

export const ApplePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#000000"/>
    <path d="M10.5 12C10.5 10.5 11.5 9.5 13 9.5C13.5 9.5 14 9.75 14.5 10C14 9 13 8 11.5 8C10 8 9 9.5 9 11.5C9 13.5 10.5 15 11.5 15C12 15 12.5 14.75 13 14.5C12.5 14.75 12 15 11.5 15C10 15 9 14 9 12.5C9 13.5 9.5 14.5 10.5 15C10 15 9.5 14.5 9.5 13.5C9.5 12.5 10 12 10.5 12Z" fill="white"/>
    <text x="8" y="23" fill="white" fontSize="7" fontFamily="system-ui" fontWeight="600">Pay</text>
  </svg>
);

export const GooglePayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="white" stroke="#E5E5E5"/>
    <path d="M16.5 16.5V20H14.5V12H18C18.75 12 19.5 12.25 20 12.75C20.5 13.25 20.75 14 20.75 14.5C20.75 15 20.5 15.75 20 16.25C19.5 16.75 18.75 17 18 17H16.5V16.5ZM16.5 13.5V15.5H18C18.5 15.5 18.75 15.25 19 15C19.25 14.75 19.25 14.25 19 14C18.75 13.75 18.5 13.5 18 13.5H16.5Z" fill="#4285F4"/>
    <path d="M24 16C24 15.5 24 15 23.75 14.5H20V17H22.25C22 17.75 21.5 18.25 21 18.5V20H22.75C23.75 19 24 17.5 24 16Z" fill="#4285F4"/>
    <path d="M17 21C18.25 21 19.25 20.5 20 20L18.25 18.5C17.75 18.75 17.25 19 16.5 19C15.25 19 14.25 18 14 17H12.25V18.5C13 20 15 21 17 21Z" fill="#34A853"/>
    <path d="M14 16.5C14 16.25 14 16 14 15.75C14 15.5 14 15.25 14 15H12.25V16.5C12 17 12 17.25 12.25 17.5L14 16.5Z" fill="#FBBC05"/>
    <path d="M17 13C17.75 13 18.25 13.25 18.75 13.75L20.25 12.25C19.25 11.5 18.25 11 17 11C15 11 13 12 12.25 14L14 15.5C14.25 14.25 15.5 13 17 13Z" fill="#EA4335"/>
  </svg>
);

export const BitcoinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#F7931A"/>
    <path d="M22 14C22.5 11.5 20.5 10.25 18 9.75L18.5 7.5L17 7.25L16.5 9.5C16.25 9.5 15.75 9.5 15.5 9.5L16 7.25L14.5 7L14 9.25C13.75 9.25 13.5 9.25 13.25 9.25L11 9L10.75 10.5C10.75 10.5 12 10.75 12 10.75C12.5 10.75 12.75 11.25 12.75 11.5L12 15.25C12 15.25 12 15.25 12.25 15.25L12 15.25L11 20C11 20.25 10.75 20.5 10.5 20.5C10.5 20.5 9.25 20.25 9.25 20.25L9 22L11 22.5L10.5 25L12 25.25L12.5 23C12.75 23 13 23 13.25 23L12.75 25.25L14.25 25.5L14.75 23.25C17.25 23.5 19.25 23.25 20 21C20.5 19 19.75 17.75 18 17.25C19.25 16.75 20 16 20.25 14.5L22 14ZM17.5 20C17.25 21.75 14.5 21 13.5 20.75L14 18C15 18.25 17.75 18.25 17.5 20ZM18 14.25C17.75 15.75 15.5 15.25 14.75 15L15.25 12.5C16 12.75 18.25 12.5 18 14.25Z" fill="white"/>
  </svg>
);

export const RazorpayIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#072654"/>
    <path d="M10 8L14 24H17L21 12L23 24H26L20 8H17L13 20L11 8H10Z" fill="white"/>
  </svg>
);

export const CoinbaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#0052FF"/>
    <circle cx="16" cy="16" r="10" fill="white"/>
    <circle cx="16" cy="16" r="6" fill="#0052FF"/>
  </svg>
);

export const WiseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#9FE870"/>
    <path d="M8 12L12 20L16 12L20 20L24 12" stroke="#163300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const SkrillIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="#8B2B92"/>
    <text x="6" y="21" fill="white" fontSize="10" fontFamily="system-ui" fontWeight="700">S</text>
  </svg>
);

// Generic payment icon for unknown gateways
export const GenericPaymentIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="hsl(var(--muted))"/>
    <rect x="6" y="10" width="20" height="12" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5"/>
    <rect x="6" y="14" width="20" height="3" fill="hsl(var(--muted-foreground))" opacity="0.3"/>
    <rect x="8" y="18" width="6" height="2" rx="1" fill="hsl(var(--muted-foreground))" opacity="0.5"/>
  </svg>
);

// Map gateway IDs to their icons
export const getPaymentIcon = (gatewayId: string) => {
  const icons: Record<string, React.FC<{ className?: string }>> = {
    stripe: StripeIcon,
    paypal: PayPalIcon,
    visa: VisaIcon,
    mastercard: MastercardIcon,
    applepay: ApplePayIcon,
    googlepay: GooglePayIcon,
    coinbase: BitcoinIcon,
    btcpay: BitcoinIcon,
    bitcoin: BitcoinIcon,
    razorpay: RazorpayIcon,
    wise: WiseIcon,
    skrill: SkrillIcon,
  };
  return icons[gatewayId] || GenericPaymentIcon;
};
