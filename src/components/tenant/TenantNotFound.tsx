import { Link } from 'react-router-dom';
import { useTenant } from '@/hooks/useTenant';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const TenantNotFound = () => {
  const { panel } = useTenant();
  const customBranding = panel?.custom_branding as any;
  const panelName = customBranding?.companyName || panel?.name || 'Panel';
  const logoUrl = customBranding?.logoUrl || panel?.logo_url;
  const primaryColor = customBranding?.primaryColor || panel?.primary_color || '#6366F1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--buyer-bg,#0F172A)] relative overflow-hidden" data-testid="tenant-404-page">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(600px circle at 50% 40%, ${primaryColor}22, transparent 60%)`,
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={panelName}
            className="w-16 h-16 rounded-xl object-contain mx-auto mb-6 opacity-80"
            data-testid="img-panel-logo"
          />
        )}

        <div className="relative mb-8">
          <h1
            className="text-[8rem] sm:text-[10rem] font-black leading-none tracking-tight select-none"
            style={{ color: `${primaryColor}33` }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 opacity-40" style={{ color: primaryColor }} />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--buyer-text,#FFFFFF)] mb-3" data-testid="text-404-title">
          Page Not Found
        </h2>
        <p className="text-[var(--buyer-muted,#94A3B8)] text-base mb-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-[var(--buyer-muted,#94A3B8)] text-sm opacity-60 font-mono mb-10">
          {typeof window !== 'undefined' ? window.location.pathname : ''}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ backgroundColor: primaryColor }}
            data-testid="link-go-home"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[var(--buyer-muted,#94A3B8)] border border-[var(--buyer-border,#334155)] hover:bg-white/5 transition-all"
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        <div className="mt-16 pt-6 border-t border-[var(--buyer-border,#334155)]/30">
          <p className="text-xs text-[var(--buyer-muted,#94A3B8)] opacity-50">
            {panelName}
          </p>
        </div>
      </div>
    </div>
  );
};
