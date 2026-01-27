import React from 'react';
import { Megaphone, Code } from 'lucide-react';

interface IconProps {
  className?: string;
  size?: number;
  fill?: string; // Optional fill override for colored backgrounds
}

// Google OAuth Icon (Colored)
export const GoogleIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Telegram Icon (Official SimpleIcons path)
export const TelegramIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#26A5E4"}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// VK Icon (Official SimpleIcons path)
export const VKIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#0077FF"}>
    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
  </svg>
);

// Discord Icon (Official SimpleIcons path)
export const DiscordIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#5865F2"}>
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
  </svg>
);

// WhatsApp Icon (Official SimpleIcons path)
export const WhatsAppIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#25D366"}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Facebook Icon (Official SimpleIcons path)
export const FacebookIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#1877F2"}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 18.062 24 12.073z"/>
  </svg>
);

// Google Analytics Icon (Official SimpleIcons style)
export const GoogleAnalyticsIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <path fill="#F9AB00" d="M22.84 2.9982v17.9987c.0086.7986-.4248 1.5378-1.1362 1.9402-.7115.4023-1.5869.4023-2.2984 0-.7114-.4024-1.1449-1.1416-1.1362-1.9402V2.9982c-.0086-.7987.4248-1.5379 1.1362-1.9403.7115-.4023 1.5869-.4023 2.2984 0 .7114.4024 1.1448 1.1416 1.1362 1.9403z"/>
    <path fill="#E37400" d="M14.2536 7.9974v13.0003c.0087.7987-.4247 1.5379-1.1362 1.9403-.7114.4023-1.5868.4023-2.2983 0-.7115-.4024-1.1449-1.1416-1.1363-1.9403V7.9974c-.0086-.7987.4248-1.5379 1.1363-1.9403.7115-.4023 1.5869-.4023 2.2983 0 .7115.4024 1.1449 1.1416 1.1362 1.9403z"/>
    <circle fill="#E37400" cx="3.7329" cy="20.9982" r="2.5003"/>
  </svg>
);

// Google Tag Manager Icon (Official SimpleIcons style)
export const GoogleTagManagerIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <path fill="#8AB4F8" d="m14.09 22.91 3.32-3.32-5.05-5.05-3.32 3.32a2.28 2.28 0 0 0 0 3.23l1.82 1.82a2.28 2.28 0 0 0 3.23 0z"/>
    <path fill="#4285F4" d="M13.64 22.46a2.28 2.28 0 0 0 0-3.23L2.59 8.18a2.28 2.28 0 0 0-3.23 0l-.91.91a2.28 2.28 0 0 0 0 3.23L9.5 23.37a2.28 2.28 0 0 0 3.23 0l.91-.91z" transform="rotate(-45 8.18 15.77)"/>
    <path fill="#8AB4F8" d="m21.41 9.41-8.82-8.82a2.28 2.28 0 0 0-3.23 0L6.04 3.91l8.82 8.82 3.32-3.32z"/>
    <path fill="#246FDB" d="M9.36 1.54a2.28 2.28 0 0 0 0 3.23l11.05 11.05a2.28 2.28 0 0 0 3.23 0l.91-.91a2.28 2.28 0 0 0 0-3.23L13.5.63a2.28 2.28 0 0 0-3.23 0l-.91.91z" transform="rotate(-45 14.77 8.18)"/>
    <circle fill="#246FDB" cx="6.04" cy="17.96" r="2.5"/>
  </svg>
);

// Yandex Metrica Icon (Official brand target logo - red)
export const YandexMetrikaIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <path fill="#FC3F1D" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4a8 8 0 110 16 8 8 0 010-16zm0 2a6 6 0 100 12 6 6 0 000-12zm0 2a4 4 0 110 8 4 4 0 010-8z"/>
    <circle fill="#FC3F1D" cx="12" cy="12" r="2"/>
  </svg>
);

// OneSignal Icon (Official bell with gradient)
export const OneSignalIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="onesignalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E54B4D"/>
        <stop offset="100%" stopColor="#E24B4B"/>
      </linearGradient>
    </defs>
    <path fill="url(#onesignalGrad)" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 2c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2c2.209 0 4 1.791 4 4s-1.791 4-4 4-4-1.791-4-4 1.791-4 4-4z"/>
    <circle fill="#E54B4D" cx="12" cy="12" r="2"/>
  </svg>
);

// Zendesk Icon (Official Z logo)
export const ZendeskIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#03363D"}>
    <path d="M11.086 5.71v12.42L1.143 5.71h9.943zm1.828-2.57v12.42L22.857 3.14h-9.943zM1.143 21c0-2.73 2.229-4.94 4.971-4.94s4.972 2.21 4.972 4.94H1.143zm12.771-4.94c0-2.73 2.229-4.92 4.972-4.92s4.971 2.19 4.971 4.92h-9.943z"/>
  </svg>
);

// Tidio Icon (Official brand - blue chat bubble with smile)
export const TidioIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#0066FF"}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 17c-1.5 0-2.91-.38-4.14-1.04l-.3-.18-3.06.8.8-3.06-.18-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm3.5-9a1 1 0 100-2 1 1 0 000 2zm-7 0a1 1 0 100-2 1 1 0 000 2zm6.78 3.5a.5.5 0 00-.7.08A4.48 4.48 0 0112 15a4.48 4.48 0 01-2.58-1.42.5.5 0 10-.78.62A5.48 5.48 0 0012 16a5.48 5.48 0 003.36-1.8.5.5 0 00-.08-.7z"/>
  </svg>
);

// Smartsupp Icon (Official brand - orange chat)
export const SmartsuppIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#F26322"}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 17c-1.5 0-2.91-.38-4.14-1.04l-.3-.18-3.06.8.8-3.06-.18-.3A7.96 7.96 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
    <circle cx="8.5" cy="11" r="1.5"/>
    <circle cx="12" cy="11" r="1.5"/>
    <circle cx="15.5" cy="11" r="1.5"/>
  </svg>
);

// Crisp Icon (Official brand - purple speech bubble)
export const CrispIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#7C3AED"}>
    <path d="M0 11.5C0 5.149 5.373 0 12 0s12 5.149 12 11.5c0 5.579-4.298 10.194-9.87 11.279a.374.374 0 01-.428-.211.359.359 0 01.137-.449C17.156 20.044 19.5 16.081 19.5 11.5 19.5 6.813 16.136 3 12 3S4.5 6.813 4.5 11.5c0 4.581 2.344 8.544 5.661 10.619a.359.359 0 01.137.449.374.374 0 01-.428.211C4.298 21.694 0 17.079 0 11.5z"/>
  </svg>
);

// JivoChat Icon (Official brand - green gradient chat)
export const JivoChatIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <defs>
      <linearGradient id="jivoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5CC970"/>
        <stop offset="100%" stopColor="#1AAD19"/>
      </linearGradient>
    </defs>
    <path fill="url(#jivoGradient)" d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17z"/>
    <path fill="url(#jivoGradient)" d="M7 9h10v2H7zm0-3h10v2H7z"/>
  </svg>
);

// GetButton Icon (Official multi-button design)
export const GetButtonIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
    <circle fill="#25D366" cx="7" cy="17" r="4"/>
    <circle fill="#0088cc" cx="17" cy="17" r="4"/>
    <circle fill="#1877F2" cx="12" cy="7" r="4"/>
  </svg>
);

// Beamer Icon (Official megaphone/notification logo)
export const BeamerIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#7C3AED">
    <path d="M2 12c0-3.309 2.691-6 6-6h2V4H8C3.582 4 0 7.582 0 12s3.582 8 8 8h2v-2H8c-3.309 0-6-2.691-6-6z"/>
    <path d="M14 4h2c4.418 0 8 3.582 8 8s-3.582 8-8 8h-2v-2h2c3.309 0 6-2.691 6-6s-2.691-6-6-6h-2V4z"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M20 12h2M2 12H0M12 2v2M12 20v2" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// GetSiteControl Icon (Official popup/form style - teal)
export const GetSiteControlIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="#14B8A6">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 13.5h-3v3a1.5 1.5 0 01-3 0v-3h-3a1.5 1.5 0 010-3h3v-3a1.5 1.5 0 013 0v3h3a1.5 1.5 0 010 3z"/>
  </svg>
);

// Intercom Icon (Official brand - blue bars)
export const IntercomIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#1F8DED"}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.25 16.5c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-5a.75.75 0 011.5 0v5zm-3 1c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-7a.75.75 0 011.5 0v7zm-3 0c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-7a.75.75 0 011.5 0v7zm-3-1c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-5a.75.75 0 011.5 0v5zm-3-2c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-3a.75.75 0 011.5 0v3zm12.75 3.5c0 .138-.112.25-.25.25H7.25a.25.25 0 01-.25-.25v-.5c0-.138.112-.25.25-.25h9.5c.138 0 .25.112.25.25v.5z"/>
  </svg>
);

// LiveChat Icon (Official brand - orange chat bubble)
export const LiveChatIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#FF5100"}>
    <path d="M12 0C5.383 0 0 5.383 0 12c0 2.247.62 4.347 1.693 6.15L.076 23.614a.5.5 0 00.633.633l5.465-1.618A11.947 11.947 0 0012 24c6.617 0 12-5.383 12-12S18.617 0 12 0zm0 20c-1.85 0-3.58-.5-5.07-1.38l-.36-.22-3.5.92.92-3.5-.22-.36A7.936 7.936 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);

// Tawk.to Icon (Official brand - green chat)
export const TawkToIcon = ({ className = "", size = 24, fill }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill={fill || "#03A84E"}>
    <path d="M12 0C5.373 0 0 4.925 0 11c0 3.207 1.462 6.105 3.828 8.098-.063 1.516-.374 3.312-.86 4.63-.134.36.168.732.526.618 2.27-.723 4.377-1.767 6.003-2.735.8.127 1.624.189 2.503.189 6.627 0 12-4.925 12-11S18.627 0 12 0zm-4 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
  </svg>
);

// Re-export Lucide icons for convenience
export { Megaphone as AnnouncementsIcon, Code as CustomCodeIcon };
