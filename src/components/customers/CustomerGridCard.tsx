import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Wallet, 
  Ban, 
  Crown,
  DollarSign,
  ShoppingCart,
  Clock,
  UserCheck,
  Percent,
  Mail,
  Copy,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  segment: "vip" | "regular" | "new";
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  lastActive: string;
  isOnline?: boolean;
  customDiscount?: number;
  referralCode?: string;
  isBanned?: boolean;
}

interface CustomerGridCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onAdjustBalance: (customer: Customer) => void;
  onSuspend: (customer: Customer) => void;
  onActivate: (customer: Customer) => void;
  onSetPricing: (customer: Customer) => void;
  onEmail: (customer: Customer) => void;
  onCopyReferral?: (code: string) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomerGridCard({ 
  customer, 
  onView, 
  onEdit, 
  onAdjustBalance, 
  onSuspend,
  onActivate,
  onSetPricing,
  onEmail,
  onCopyReferral,
  onDelete
}: CustomerGridCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive": return "bg-muted text-muted-foreground";
      case "suspended": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  return (
    <Card className={cn(
      "bg-card/60 backdrop-blur-xl border-border/50 transition-all duration-200 hover:shadow-lg hover:border-primary/20 group",
      customer.segment === "vip" && "ring-1 ring-amber-500/20 hover:ring-amber-500/40"
    )}>
      <CardContent className="p-5">
        {/* Header: Avatar + Name + Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={customer.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {customer.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold truncate">{customer.name}</h3>
                {customer.segment === "vip" && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={() => onView(customer)}>
                <Eye className="w-4 h-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetPricing(customer)}>
                <Percent className="w-4 h-4 mr-2" /> Set Pricing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAdjustBalance(customer)}>
                <Wallet className="w-4 h-4 mr-2" /> Adjust Balance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEmail(customer)}>
                <Mail className="w-4 h-4 mr-2" /> Send Email
              </DropdownMenuItem>
              {customer.referralCode && onCopyReferral && (
                <DropdownMenuItem onClick={() => onCopyReferral(customer.referralCode!)}>
                  <Copy className="w-4 h-4 mr-2" /> Copy Referral
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className={customer.status === 'suspended' ? "text-green-500" : "text-amber-500"}
                onClick={() => customer.status === 'suspended' ? onActivate(customer) : onSuspend(customer)}
              >
                {customer.status === 'suspended' ? (
                  <><UserCheck className="w-4 h-4 mr-2" /> Unsuspend</>
                ) : (
                  <><Ban className="w-4 h-4 mr-2" /> Suspend</>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(customer)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className={getStatusColor(customer.status)}>
            {customer.status}
          </Badge>
          {customer.segment === "vip" && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">VIP</Badge>
          )}
          {customer.segment === "new" && (
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">New</Badge>
          )}
          {customer.customDiscount ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              {customer.customDiscount}% off
            </Badge>
          ) : null}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-muted/30 rounded-lg p-2.5">
            <DollarSign className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-bold text-primary">${customer.balance.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">Balance</p>
          </div>
          <div className="text-center bg-muted/30 rounded-lg p-2.5">
            <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-bold">${customer.totalSpent.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground">Spent</p>
          </div>
          <div className="text-center bg-muted/30 rounded-lg p-2.5">
            <ShoppingCart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-bold">{customer.totalOrders}</p>
            <p className="text-[10px] text-muted-foreground">Orders</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Active {customer.lastActive}</span>
          </div>
          <span>Joined {customer.joinedAt}</span>
        </div>
      </CardContent>
    </Card>
  );
}
