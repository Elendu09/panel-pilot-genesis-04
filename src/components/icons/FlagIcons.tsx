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

// EU Flag
export const FlagEU: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#003399" width="36" height="36" rx="4"/>
    <g fill="#FFCC00">
      <polygon points="18,5 18.9,7.8 21.9,7.8 19.5,9.5 20.4,12.3 18,10.6 15.6,12.3 16.5,9.5 14.1,7.8 17.1,7.8"/>
      <polygon points="8,10 8.9,12.8 11.9,12.8 9.5,14.5 10.4,17.3 8,15.6 5.6,17.3 6.5,14.5 4.1,12.8 7.1,12.8"/>
      <polygon points="28,10 28.9,12.8 31.9,12.8 29.5,14.5 30.4,17.3 28,15.6 25.6,17.3 26.5,14.5 24.1,12.8 27.1,12.8"/>
      <polygon points="8,23 8.9,25.8 11.9,25.8 9.5,27.5 10.4,30.3 8,28.6 5.6,30.3 6.5,27.5 4.1,25.8 7.1,25.8"/>
      <polygon points="28,23 28.9,25.8 31.9,25.8 29.5,27.5 30.4,30.3 28,28.6 25.6,30.3 26.5,27.5 24.1,25.8 27.1,25.8"/>
      <polygon points="18,28 18.9,30.8 21.9,30.8 19.5,32.5 20.4,35.3 18,33.6 15.6,35.3 16.5,32.5 14.1,30.8 17.1,30.8"/>
    </g>
  </svg>
);

// GB Flag
export const FlagGB: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#012169" width="36" height="36" rx="4"/>
    <path fill="#FFFFFF" d="M0,0 L36,36 M36,0 L0,36" stroke="#FFFFFF" strokeWidth="6"/>
    <path fill="#C8102E" d="M0,0 L36,36 M36,0 L0,36" stroke="#C8102E" strokeWidth="2"/>
    <path fill="#FFFFFF" d="M18,0 L18,36 M0,18 L36,18" stroke="#FFFFFF" strokeWidth="10"/>
    <path fill="#C8102E" d="M18,0 L18,36 M0,18 L36,18" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

// Nigeria Flag
export const FlagNG: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#008751" width="12" height="36"/>
    <rect fill="#008751" x="24" width="12" height="36"/>
  </svg>
);

// South Africa Flag
export const FlagZA: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#E03C31" width="36" height="18" rx="4"/>
    <rect fill="#001489" y="18" width="36" height="18"/>
    <polygon fill="#FFB81C" points="0,18 12,18 0,10"/>
    <polygon fill="#FFB81C" points="0,18 12,18 0,26"/>
    <polygon fill="#007749" points="0,14 16,18 0,22"/>
    <rect fill="#FFFFFF" y="16" width="18" height="4"/>
  </svg>
);

// Kenya Flag
export const FlagKE: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#000000" width="36" height="10"/>
    <rect fill="#BB0000" y="12" width="36" height="12"/>
    <rect fill="#006600" y="26" width="36" height="10"/>
  </svg>
);

// Ghana Flag
export const FlagGH: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#006B3F" width="36" height="36" rx="4"/>
    <rect fill="#CE1126" width="36" height="12"/>
    <rect fill="#FCD116" y="12" width="36" height="12"/>
    <polygon fill="#000000" points="18,15 20,20 18,18 16,20"/>
  </svg>
);

// Canada Flag
export const FlagCA: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#FF0000" width="9" height="36"/>
    <rect fill="#FF0000" x="27" width="9" height="36"/>
    <polygon fill="#FF0000" points="18,10 20,16 18,14 16,16"/>
  </svg>
);

// Australia Flag
export const FlagAU: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#00008B" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" width="18" height="10"/>
    <rect fill="#C8102E" x="7" width="4" height="10"/>
    <rect fill="#C8102E" y="4" width="18" height="2"/>
    <polygon fill="#FFFFFF" points="26,28 27,31 30,31 28,33 29,36 26,34 23,36 24,33 22,31 25,31"/>
  </svg>
);

// Pakistan Flag
export const FlagPK: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#01411C" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" width="9" height="36"/>
    <circle fill="#FFFFFF" cx="22" cy="18" r="6"/>
    <circle fill="#01411C" cx="24" cy="18" r="5"/>
    <polygon fill="#FFFFFF" points="26,12 27,15 30,15 28,17 29,20 26,18 23,20 24,17 22,15 25,15"/>
  </svg>
);

// Bangladesh Flag
export const FlagBD: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#006A4E" width="36" height="36" rx="4"/>
    <circle fill="#F42A41" cx="16" cy="18" r="8"/>
  </svg>
);

// Indonesia Flag
export const FlagID: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#CE1126" width="36" height="18"/>
  </svg>
);

// Philippines Flag
export const FlagPH: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#0038A8" width="36" height="18" rx="4"/>
    <rect fill="#CE1126" y="18" width="36" height="18"/>
    <polygon fill="#FFFFFF" points="0,0 0,36 18,18"/>
    <polygon fill="#FCD116" points="6,18 8,14 10,18 8,22"/>
  </svg>
);

// Vietnam Flag
export const FlagVN: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#DA251D" width="36" height="36" rx="4"/>
    <polygon fill="#FFFF00" points="18,8 20.5,15 28,15 22,20 24.5,27 18,22 11.5,27 14,20 8,15 15.5,15"/>
  </svg>
);

// Mexico Flag
export const FlagMX: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <rect fill="#006847" width="12" height="36"/>
    <rect fill="#CE1126" x="24" width="12" height="36"/>
    <circle fill="#8B4513" cx="18" cy="18" r="4"/>
  </svg>
);

// UAE Flag
export const FlagAE: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#000000" width="36" height="36" rx="4"/>
    <rect fill="#00732F" width="36" height="12"/>
    <rect fill="#FFFFFF" y="12" width="36" height="12"/>
    <rect fill="#FF0000" width="9" height="36"/>
  </svg>
);

// New Zealand
export const FlagNZ: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#00247D" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" width="14" height="8"/>
    <rect fill="#CF101A" x="5" width="4" height="8"/>
    <rect fill="#CF101A" y="3" width="14" height="2"/>
    <g fill="#CC0001"><circle cx="24" cy="8" r="2"/><circle cx="30" cy="14" r="2"/><circle cx="28" cy="22" r="2"/><circle cx="22" cy="18" r="2"/></g>
  </svg>
);

// Switzerland
export const FlagCH: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FF0000" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" x="14" y="7" width="8" height="22"/>
    <rect fill="#FFFFFF" x="7" y="14" width="22" height="8"/>
  </svg>
);

// Egypt
export const FlagEG: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#CE1126" width="36" height="12" rx="4"/>
    <rect fill="#FFFFFF" y="12" width="36" height="12"/>
    <rect fill="#000000" y="24" width="36" height="12" rx="4"/>
    <circle fill="#C09300" cx="18" cy="18" r="4" opacity="0.8"/>
  </svg>
);

// Morocco
export const FlagMA: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#C1272D" width="36" height="36" rx="4"/>
    <polygon fill="none" stroke="#006233" strokeWidth="1.5" points="18,8 20,14 26,14 21,18 23,24 18,20 13,24 15,18 10,14 16,14"/>
  </svg>
);

// West/Central Africa generic (used for XOF/XAF)
export const FlagXF: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#009A44" width="12" height="36" rx="4"/>
    <rect fill="#FEDD00" x="12" width="12" height="36"/>
    <rect fill="#CE1126" x="24" width="12" height="36" rx="4"/>
  </svg>
);

// Sri Lanka
export const FlagLK: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#8D153A" width="36" height="36" rx="4"/>
    <rect fill="#FF7300" x="2" width="6" height="36"/>
    <rect fill="#009E49" x="8" width="6" height="36"/>
    <rect fill="#FBBF24" x="16" width="16" height="32" y="2" rx="2"/>
  </svg>
);

// Nepal
export const FlagNP: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <polygon fill="#003893" points="4,4 4,28 24,28"/>
    <polygon fill="#CE1126" points="6,6 6,25 21,25"/>
    <circle fill="#FFFFFF" cx="12" cy="14" r="2"/>
    <polygon fill="#FFFFFF" points="12,20 14,24 10,24"/>
  </svg>
);

// Thailand
export const FlagTH: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#A51931" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" y="6" width="36" height="24"/>
    <rect fill="#2D2A4A" y="12" width="36" height="12"/>
  </svg>
);

// Malaysia
export const FlagMY: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#CC0001" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" y="4" width="36" height="4"/>
    <rect fill="#FFFFFF" y="12" width="36" height="4"/>
    <rect fill="#FFFFFF" y="20" width="36" height="4"/>
    <rect fill="#FFFFFF" y="28" width="36" height="4"/>
    <rect fill="#010066" width="18" height="20"/>
    <circle fill="#FC0" cx="10" cy="10" r="4"/>
    <circle fill="#010066" cx="12" cy="10" r="3"/>
    <polygon fill="#FC0" points="16,6 16.8,8.5 19.5,8.5 17.3,10 18.2,12.5 16,11 13.8,12.5 14.7,10 12.5,8.5 15.2,8.5"/>
  </svg>
);

// Singapore
export const FlagSG: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#EF3340" width="36" height="18" rx="4"/>
    <rect fill="#FFFFFF" y="18" width="36" height="18" rx="4"/>
    <circle fill="#FFFFFF" cx="10" cy="12" r="5"/>
    <circle fill="#EF3340" cx="12" cy="12" r="4"/>
    <g fill="#FFFFFF" transform="translate(16,8)"><circle cx="0" cy="0" r="1"/><circle cx="2" cy="3" r="1"/><circle cx="-2" cy="3" r="1"/><circle cx="1.5" cy="-1" r="1"/><circle cx="-1.5" cy="-1" r="1"/></g>
  </svg>
);

// Hong Kong
export const FlagHK: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#DE2910" width="36" height="36" rx="4"/>
    <g fill="#FFFFFF" opacity="0.9">
      <path d="M18,6 Q22,12 18,18 Q14,12 18,6Z" transform="rotate(0,18,18)"/>
      <path d="M18,6 Q22,12 18,18 Q14,12 18,6Z" transform="rotate(72,18,18)"/>
      <path d="M18,6 Q22,12 18,18 Q14,12 18,6Z" transform="rotate(144,18,18)"/>
      <path d="M18,6 Q22,12 18,18 Q14,12 18,6Z" transform="rotate(216,18,18)"/>
      <path d="M18,6 Q22,12 18,18 Q14,12 18,6Z" transform="rotate(288,18,18)"/>
    </g>
  </svg>
);

// Japan
export const FlagJP: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <circle fill="#BC002D" cx="18" cy="18" r="9"/>
  </svg>
);

// South Korea
export const FlagKR: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="36" rx="4"/>
    <circle fill="#CD2E3A" cx="18" cy="18" r="7"/>
    <path fill="#003478" d="M18,11 Q25,11 25,18 Q25,14 18,14Z"/>
    <path fill="#CD2E3A" d="M11,18 Q11,25 18,25 Q14,25 14,18Z"/>
    <g stroke="#000" strokeWidth="1.5" opacity="0.7">
      <line x1="6" y1="8" x2="11" y2="13"/><line x1="8" y1="6" x2="13" y2="11"/><line x1="4" y1="10" x2="9" y2="15"/>
      <line x1="25" y1="23" x2="30" y2="28"/><line x1="23" y1="25" x2="28" y2="30"/><line x1="27" y1="21" x2="32" y2="26"/>
    </g>
  </svg>
);

// Taiwan
export const FlagTW: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FE0000" width="36" height="36" rx="4"/>
    <rect fill="#000095" width="18" height="18"/>
    <circle fill="#FFFFFF" cx="9" cy="9" r="5"/>
    <circle fill="#000095" cx="9" cy="9" r="3"/>
    <circle fill="#FFFFFF" cx="9" cy="9" r="1.5"/>
  </svg>
);

// Colombia
export const FlagCO: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FCD116" width="36" height="18" rx="4"/>
    <rect fill="#003087" y="18" width="36" height="9"/>
    <rect fill="#CE1126" y="27" width="36" height="9" rx="4"/>
  </svg>
);

// Argentina
export const FlagAR: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#74ACDF" width="36" height="12" rx="4"/>
    <rect fill="#FFFFFF" y="12" width="36" height="12"/>
    <rect fill="#74ACDF" y="24" width="36" height="12" rx="4"/>
    <circle fill="#F6B40E" cx="18" cy="18" r="4"/>
  </svg>
);

// Chile
export const FlagCL: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="18" rx="4"/>
    <rect fill="#D52B1E" y="18" width="36" height="18" rx="4"/>
    <rect fill="#0039A6" width="14" height="18"/>
    <polygon fill="#FFFFFF" points="7,5 8.2,9 12,9 9,11 10.2,15 7,13 3.8,15 5,11 2,9 5.8,9"/>
  </svg>
);

// Peru
export const FlagPE: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#D91023" width="12" height="36" rx="4"/>
    <rect fill="#FFFFFF" x="12" width="12" height="36"/>
    <rect fill="#D91023" x="24" width="12" height="36" rx="4"/>
  </svg>
);

// Ukraine
export const FlagUA: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#005BBB" width="36" height="18" rx="4"/>
    <rect fill="#FFD500" y="18" width="36" height="18" rx="4"/>
  </svg>
);

// Poland
export const FlagPL: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="18" rx="4"/>
    <rect fill="#DC143C" y="18" width="36" height="18" rx="4"/>
  </svg>
);

// Czech Republic
export const FlagCZ: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="18" rx="4"/>
    <rect fill="#D7141A" y="18" width="36" height="18" rx="4"/>
    <polygon fill="#11457E" points="0,0 18,18 0,36"/>
  </svg>
);

// Hungary
export const FlagHU: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#CE2939" width="36" height="12" rx="4"/>
    <rect fill="#FFFFFF" y="12" width="36" height="12"/>
    <rect fill="#477050" y="24" width="36" height="12" rx="4"/>
  </svg>
);

// Romania
export const FlagRO: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#002B7F" width="12" height="36" rx="4"/>
    <rect fill="#FCD116" x="12" width="12" height="36"/>
    <rect fill="#CE1126" x="24" width="12" height="36" rx="4"/>
  </svg>
);

// Bulgaria
export const FlagBG: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#FFFFFF" width="36" height="12" rx="4"/>
    <rect fill="#00966E" y="12" width="36" height="12"/>
    <rect fill="#D62612" y="24" width="36" height="12" rx="4"/>
  </svg>
);

// Sweden
export const FlagSE: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#006AA7" width="36" height="36" rx="4"/>
    <rect fill="#FECC02" x="12" width="6" height="36"/>
    <rect fill="#FECC02" y="15" width="36" height="6"/>
  </svg>
);

// Norway
export const FlagNO: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#EF2B2D" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" x="10" width="6" height="36"/>
    <rect fill="#FFFFFF" y="15" width="36" height="6"/>
    <rect fill="#002868" x="12" width="2" height="36"/>
    <rect fill="#002868" y="17" width="36" height="2"/>
  </svg>
);

// Denmark
export const FlagDK: React.FC<FlagProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#C60C30" width="36" height="36" rx="4"/>
    <rect fill="#FFFFFF" x="12" width="5" height="36"/>
    <rect fill="#FFFFFF" y="15" width="36" height="5"/>
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
