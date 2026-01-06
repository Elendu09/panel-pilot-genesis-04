import React from 'react';

interface FlagProps {
  className?: string;
}

export const FlagUS: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#B22234" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" y="2.77" width="36" height="2.77"/>
    <rect fill="#FFFFFF" y="8.31" width="36" height="2.77"/>
    <rect fill="#FFFFFF" y="13.85" width="36" height="2.77"/>
    <rect fill="#FFFFFF" y="19.38" width="36" height="2.77"/>
    <rect fill="#FFFFFF" y="24.92" width="36" height="2.77"/>
    <rect fill="#FFFFFF" y="30.46" width="36" height="2.77"/>
    <rect fill="#3C3B6E" width="14.4" height="16.62"/>
    <g fill="#FFFFFF">
      <circle cx="2.4" cy="1.85" r="0.9"/>
      <circle cx="4.8" cy="1.85" r="0.9"/>
      <circle cx="7.2" cy="1.85" r="0.9"/>
      <circle cx="9.6" cy="1.85" r="0.9"/>
      <circle cx="12" cy="1.85" r="0.9"/>
      <circle cx="3.6" cy="3.69" r="0.9"/>
      <circle cx="6" cy="3.69" r="0.9"/>
      <circle cx="8.4" cy="3.69" r="0.9"/>
      <circle cx="10.8" cy="3.69" r="0.9"/>
      <circle cx="2.4" cy="5.54" r="0.9"/>
      <circle cx="4.8" cy="5.54" r="0.9"/>
      <circle cx="7.2" cy="5.54" r="0.9"/>
      <circle cx="9.6" cy="5.54" r="0.9"/>
      <circle cx="12" cy="5.54" r="0.9"/>
      <circle cx="3.6" cy="7.38" r="0.9"/>
      <circle cx="6" cy="7.38" r="0.9"/>
      <circle cx="8.4" cy="7.38" r="0.9"/>
      <circle cx="10.8" cy="7.38" r="0.9"/>
      <circle cx="2.4" cy="9.23" r="0.9"/>
      <circle cx="4.8" cy="9.23" r="0.9"/>
      <circle cx="7.2" cy="9.23" r="0.9"/>
      <circle cx="9.6" cy="9.23" r="0.9"/>
      <circle cx="12" cy="9.23" r="0.9"/>
      <circle cx="3.6" cy="11.08" r="0.9"/>
      <circle cx="6" cy="11.08" r="0.9"/>
      <circle cx="8.4" cy="11.08" r="0.9"/>
      <circle cx="10.8" cy="11.08" r="0.9"/>
      <circle cx="2.4" cy="12.92" r="0.9"/>
      <circle cx="4.8" cy="12.92" r="0.9"/>
      <circle cx="7.2" cy="12.92" r="0.9"/>
      <circle cx="9.6" cy="12.92" r="0.9"/>
      <circle cx="12" cy="12.92" r="0.9"/>
      <circle cx="3.6" cy="14.77" r="0.9"/>
      <circle cx="6" cy="14.77" r="0.9"/>
      <circle cx="8.4" cy="14.77" r="0.9"/>
      <circle cx="10.8" cy="14.77" r="0.9"/>
    </g>
  </svg>
);

export const FlagES: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#C60A1D" width="36" height="36" rx="4"/>
    <rect fill="#FFC400" y="9" width="36" height="18"/>
  </svg>
);

export const FlagBR: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#009B3A" width="36" height="36" rx="4"/>
    <polygon fill="#FEDF00" points="18,6 32,18 18,30 4,18"/>
    <circle fill="#002776" cx="18" cy="18" r="7"/>
    <path d="M11,18 Q18,14 25,18" stroke="#FFFFFF" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const FlagFR: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#002395" width="12" height="36"/>
    <rect fill="#ED2939" x="24" width="12" height="36"/>
  </svg>
);

export const FlagDE: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFCE00" width="36" height="36" rx="4"/>
    <rect fill="#000000" width="36" height="12"/>
    <rect fill="#DD0000" y="12" width="36" height="12"/>
  </svg>
);

export const FlagSA: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#006C35" width="36" height="36" rx="4"/>
    <text x="18" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial">العربية</text>
  </svg>
);

export const FlagTR: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#E30A17" width="36" height="36" rx="4"/>
    <circle fill="#FFFFFF" cx="13" cy="18" r="7"/>
    <circle fill="#E30A17" cx="15" cy="18" r="5.5"/>
    <polygon fill="#FFFFFF" points="22,18 24,14 25,18 24,22"/>
  </svg>
);

export const FlagRU: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#CE2029" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" width="36" height="12"/>
    <rect fill="#0039A6" y="12" width="36" height="12"/>
  </svg>
);

export const FlagCN: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#DE2910" width="36" height="36" rx="4"/>
    <polygon fill="#FFDE00" points="8,6 9.5,10.5 6,8 10,8 6.5,10.5"/>
    <polygon fill="#FFDE00" points="14,3 14.5,4.5 13,4 15,4 13.5,4.5"/>
    <polygon fill="#FFDE00" points="16,6 16.5,7.5 15,7 17,7 15.5,7.5"/>
    <polygon fill="#FFDE00" points="16,10 16.5,11.5 15,11 17,11 15.5,11.5"/>
    <polygon fill="#FFDE00" points="14,13 14.5,14.5 13,14 15,14 13.5,14.5"/>
  </svg>
);

export const FlagIN: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#FF9933" width="36" height="12"/>
    <rect fill="#138808" y="24" width="36" height="12"/>
    <circle fill="none" stroke="#000080" strokeWidth="1.5" cx="18" cy="18" r="4"/>
    <circle fill="#000080" cx="18" cy="18" r="1"/>
  </svg>
);

export const flagComponents: Record<string, React.FC<FlagProps>> = {
  en: FlagUS,
  es: FlagES,
  pt: FlagBR,
  fr: FlagFR,
  de: FlagDE,
  ar: FlagSA,
  tr: FlagTR,
  ru: FlagRU,
  zh: FlagCN,
  hi: FlagIN,
};

export type { FlagProps };
