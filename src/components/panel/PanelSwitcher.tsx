import { useState } from 'react';
import { usePanel, PANEL_LIMITS } from '@/hooks/usePanel';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, ChevronDown, Plus, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface PanelSwitcherProps {
  collapsed?: boolean;
}

export function PanelSwitcher({ collapsed = false }: PanelSwitcherProps) {
  const { panel, allPanels, switchPanel, canCreatePanel, getMaxPanels, isPanelLocked } = usePanel();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  // Sort panels by created_at ascending for panel numbering
  const sortedPanels = [...allPanels].sort(
    (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
  );
  const getPanelNumber = (panelId: string) => {
    const idx = sortedPanels.findIndex(p => p.id === panelId);
    return idx >= 0 ? idx + 1 : 1;
  };

  const handleSwitch = async (panelId: string) => {
    if (panelId === panel?.id || isPanelLocked(panelId)) return;
    setSwitching(true);
    await switchPanel(panelId);
    setSwitching(false);
    window.location.reload();
  };

  const handleCreateNew = () => {
    navigate('/panel/onboarding?new=true');
  };

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-10 h-10 relative">
            <Avatar className="w-7 h-7 ring-2 ring-muted-foreground/40 ring-offset-1 ring-offset-background">
              {panel?.logo_url ? (
                <AvatarImage src={panel.logo_url} alt={panel.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                {panel?.name?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            {allPanels.length > 1 && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full text-[8px] text-primary-foreground flex items-center justify-center font-bold">
                {getPanelNumber(panel?.id || '')}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Switch Panel ({allPanels.length}/{getMaxPanels()})
          </DropdownMenuLabel>
          {sortedPanels.map((p, idx) => {
            const locked = isPanelLocked(p.id);
            return (
              <DropdownMenuItem
                key={p.id}
                onClick={() => handleSwitch(p.id)}
                className={cn("flex items-center gap-2", locked && "opacity-50")}
                disabled={locked}
              >
                <Avatar className="w-5 h-5">
                  {p.logo_url ? <AvatarImage src={p.logo_url} /> : null}
                  <AvatarFallback className="text-[8px]">{p.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm truncate">{p.name}</span>
                  <span className="text-[9px] text-muted-foreground">Panel {idx + 1}</span>
                </div>
                {locked ? (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                ) : p.id === panel?.id ? (
                  <Check className="w-3.5 h-3.5 text-primary" />
                ) : null}
              </DropdownMenuItem>
            );
          })}
          {canCreatePanel() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateNew} className="text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create New Panel
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors text-left">
          <Avatar className="w-7 h-7 shrink-0 ring-2 ring-muted-foreground/40 ring-offset-1 ring-offset-background">
            {panel?.logo_url ? (
              <AvatarImage src={panel.logo_url} alt={panel.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
              {panel?.name?.charAt(0) || 'P'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{panel?.name || 'Select Panel'}</p>
            <p className="text-[9px] text-muted-foreground truncate">
              {panel?.subdomain}.smmpilot.online
            </p>
          </div>
          {switching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Your Panels ({allPanels.length}/{getMaxPanels()})
        </DropdownMenuLabel>
        {sortedPanels.map((p, idx) => {
          const locked = isPanelLocked(p.id);
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => handleSwitch(p.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                p.id === panel?.id && "bg-primary/5",
                locked && "opacity-50 cursor-not-allowed"
              )}
              disabled={locked}
            >
              <Avatar className="w-6 h-6">
                {p.logo_url ? <AvatarImage src={p.logo_url} /> : null}
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                  {p.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <span className="text-[9px] text-muted-foreground shrink-0">#{idx + 1}</span>
                </div>
                {locked && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-destructive border-destructive/30">Locked</Badge>
                )}
                {!locked && !p.onboarding_completed && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3.5">Setup</Badge>
                )}
              </div>
              {locked ? (
                <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              ) : p.id === panel?.id ? (
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
        {canCreatePanel() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCreateNew} className="text-primary cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Create New Panel</span>
            </DropdownMenuItem>
          </>
        )}
        {!canCreatePanel() && allPanels.length >= getMaxPanels() && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <p className="text-[10px] text-muted-foreground">
                Upgrade your plan for more panels
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
