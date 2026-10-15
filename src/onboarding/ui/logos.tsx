/**
 * Simplified platform marks, drawn as SVG for nominative reference only (to identify the platform
 * a connection is for). No endorsement implied.
 */
import { GoogleG, MetaMark } from "@/components/visuals/platforms/BrandMarks";

export function PlatformLogo({ platform, className = "" }: { platform: string; className?: string }) {
  switch (platform) {
    case "meta":
    case "meta_create":
      return <MetaMark uid={`pl-${platform}`} className={className} />;
    case "google_ads":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path fill="#FBBC04" d="M17.6 6.6 4.2 29.8a7.4 7.4 0 1 0 12.8 7.4L30.4 14z" />
          <path fill="#4285F4" d="M30.4 6.6a7.4 7.4 0 0 0-12.8 7.4l13.4 23.2a7.4 7.4 0 1 0 12.8-7.4z" />
          <circle cx="10.6" cy="33.5" r="7.4" fill="#34A853" />
        </svg>
      );
    case "ga4":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="15.5" y="2" width="6" height="20" rx="3" fill="#F9AB00" />
          <rect x="9" y="9" width="6" height="13" rx="3" fill="#E37400" />
          <circle cx="5.5" cy="19" r="3" fill="#E37400" />
        </svg>
      );
    case "gtm":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path fill="#8AB4F8" d="M27.6 4.2 44 20.4a5 5 0 0 1 0 7.1L27.6 43.8a5 5 0 0 1-7.1 0 5 5 0 0 1 0-7.1l12.9-12.8-12.9-12.6a5 5 0 1 1 7.1-7.1z" />
          <path fill="#4285F4" d="M20.5 4.2a5 5 0 0 1 7.1 7.1L14.8 24l12.8 12.7a5 5 0 1 1-7.1 7.1L4 27.4a5 5 0 0 1 0-7z" />
          <circle cx="24" cy="40.3" r="5" fill="#246FDB" />
        </svg>
      );
    case "search_console":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="5" y="7" width="38" height="26" rx="4" fill="#4285F4" />
          <rect x="9" y="11" width="30" height="18" rx="2" fill="#fff" />
          <circle cx="22" cy="20" r="5.5" fill="none" stroke="#EA4335" strokeWidth="3" />
          <path d="m26 24 6 6" stroke="#FBBC04" strokeWidth="3.4" strokeLinecap="round" />
          <rect x="18" y="35" width="12" height="6" rx="2" fill="#34A853" />
        </svg>
      );
    case "gbp":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path fill="#4285F4" d="M6 18h36v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" />
          <path fill="#1A73E8" d="M10 6h28l5 12H5z" />
          <path fill="#fff" d="M18 26h12v12H18z" opacity=".95" />
          <path fill="#34A853" d="M5 18h9.5a4.75 4.75 0 0 1-9.5 0zM14.5 18H24a4.75 4.75 0 0 1-9.5 0z" />
          <path fill="#FBBC04" d="M24 18h9.5a4.75 4.75 0 0 1-9.5 0zM33.5 18H43a4.75 4.75 0 0 1-9.5 0z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="3" y="10" width="42" height="28" rx="9" fill="#FF0000" />
          <path d="M20 17.5v13L31 24z" fill="#fff" />
        </svg>
      );
    case "merchant_center":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path fill="#4285F4" d="M8 14h32l-3 26H11z" />
          <path d="M17 18v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#34A853" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="24" cy="28" r="5" fill="#FBBC04" />
        </svg>
      );
    case "google":
      return <GoogleG className={className} />;
    case "whatsapp":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <path fill="#25D366" d="M24 4a20 20 0 0 0-17.2 30.2L4 44l10.1-2.7A20 20 0 1 0 24 4z" />
          <path fill="#fff" d="M18.2 14.4c-.5-1-1-1-1.4-1h-1.2c-.4 0-1.1.2-1.7.8s-2.2 2.1-2.2 5.2 2.2 6 2.5 6.4c.3.4 4.3 6.9 10.7 9.4 5.3 2.1 6.4 1.7 7.5 1.6 1.2-.1 3.7-1.5 4.2-3 .5-1.4.5-2.7.4-3-.2-.2-.6-.4-1.2-.7l-4.2-2c-.6-.2-1-.3-1.4.3l-1.9 2.4c-.3.4-.7.5-1.3.2-.6-.3-2.6-1-5-3.1-1.8-1.6-3.1-3.7-3.4-4.3-.4-.6 0-1 .3-1.3l.9-1.1c.3-.4.4-.6.6-1 .2-.4.1-.8 0-1.1z" />
        </svg>
      );
    case "website":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="pl-web" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#0a5cff" />
              <stop offset="1" stopColor="#00d9ff" />
            </linearGradient>
          </defs>
          <rect x="4" y="8" width="40" height="32" rx="6" fill="url(#pl-web)" />
          <rect x="8" y="17" width="32" height="19" rx="3" fill="#fff" opacity=".95" />
          <circle cx="10" cy="12.5" r="1.6" fill="#fff" />
          <circle cx="15" cy="12.5" r="1.6" fill="#fff" opacity=".7" />
          <rect x="12" y="21" width="14" height="3" rx="1.5" fill="#0a5cff" />
          <rect x="12" y="27" width="22" height="2.4" rx="1.2" fill="#9cc8ff" />
        </svg>
      );
    case "domain":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="pl-dns" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#0a5cff" />
              <stop offset="1" stopColor="#00d9ff" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="19" fill="url(#pl-dns)" />
          <path d="M5 24h38M24 5c6 6 6 32 0 38M24 5c-6 6-6 32 0 38M9 14h30M9 34h30" fill="none" stroke="#fff" strokeWidth="2" opacity=".9" />
        </svg>
      );
    case "crm":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="pl-crm" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#0a5cff" />
              <stop offset="1" stopColor="#00d9ff" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#pl-crm)" />
          <circle cx="19" cy="19" r="5" fill="#fff" />
          <path d="M10 35c1.4-5 4.8-8 9-8s7.6 3 9 8" fill="#fff" />
          <path d="M30 14h9M30 21h9M33 28h6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".85" />
        </svg>
      );
    case "social":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <defs>
            <linearGradient id="pl-ig" x1="0" x2="1" y1="1" y2="0">
              <stop offset="0" stopColor="#FEDA75" />
              <stop offset="0.35" stopColor="#FA7E1E" />
              <stop offset="0.6" stopColor="#D62976" />
              <stop offset="1" stopColor="#4F5BD5" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="11" fill="url(#pl-ig)" />
          <circle cx="24" cy="24" r="8" fill="none" stroke="#fff" strokeWidth="3.4" />
          <circle cx="34" cy="14" r="2.4" fill="#fff" />
        </svg>
      );
    case "repository":
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="12" fill="#0a0f1c" />
          <path d="m18 17-7 7 7 7M30 17l7 7-7 7M26 13l-4 22" fill="none" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
          <rect x="4" y="4" width="40" height="40" rx="12" fill="#0a5cff" />
        </svg>
      );
  }
}
