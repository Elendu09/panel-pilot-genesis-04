import { Wrench, Clock } from 'lucide-react';

interface MaintenancePageProps {
  panelName: string;
  logoUrl?: string;
  primaryColor?: string;
  message?: string;
}

export const MaintenancePage = ({ panelName, logoUrl, primaryColor = '#6366F1', message }: MaintenancePageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden" data-testid="maintenance-page">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(600px circle at 50% 40%, ${primaryColor}33, transparent 60%)`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={panelName}
            className="w-20 h-20 rounded-2xl object-contain mx-auto mb-8 opacity-90"
            data-testid="img-maintenance-logo"
          />
        )}

        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
          <Wrench className="w-10 h-10" style={{ color: primaryColor }} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6" style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}10` }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
          <span className="text-sm font-medium" style={{ color: primaryColor }}>Under Maintenance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" data-testid="text-maintenance-title">
          We'll Be Back Soon
        </h1>

        <p className="text-slate-400 text-base leading-relaxed mb-6" data-testid="text-maintenance-message">
          {message || `${panelName} is currently undergoing scheduled maintenance. We're working hard to improve your experience.`}
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Please check back shortly</span>
        </div>

        <div className="mt-16 pt-6 border-t border-slate-800/50">
          <p className="text-xs text-slate-600">
            {panelName}
          </p>
        </div>
      </div>
    </div>
  );
};
