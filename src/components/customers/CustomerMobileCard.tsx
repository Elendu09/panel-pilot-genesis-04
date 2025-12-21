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
  Clock
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "suspended";
  segment: "vip" | "regular" | "new";
  balance: number;
  totalSpent: number;
  totalOrders: number;
  joinedAt: string;
  lastActive: string;
}

interface CustomerMobileCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onAdjustBalance: (customer: Customer) => void;
  onSuspend: (customer: Customer) => void;
}

export function CustomerMobileCard({ 
  customer, 
  onView, 
  onEdit, 
  onAdjustBalance, 
  onSuspend 
}: CustomerMobileCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive": return "bg-muted text-muted-foreground";
      case "suspended": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted";
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "vip": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "new": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardContent className="p-4">
        {/* Header with avatar and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold">{customer.name}</h3>
                {customer.segment === "vip" && <Crown className="w-4 h-4 text-purple-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(customer)}>
                <Eye className="w-4 h-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(customer)}>
                <Edit className="w-4 h-4 mr-2" />Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAdjustBalance(customer)}>
                <Wallet className="w-4 h-4 mr-2" />Adjust Balance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSuspend(customer)} className="text-destructive">
                <Ban className="w-4 h-4 mr-2" />Suspend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex gap-2 mb-3">
          <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
          <Badge className={getSegmentColor(customer.segment)} variant="outline">{customer.segment}</Badge>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <DollarSign className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-sm font-semibold text-primary">${customer.balance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Balance</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-semibold">${customer.totalSpent.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Spent</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <ShoppingCart className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-semibold">{customer.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
        </div>

        {/* Last active */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Active {customer.lastActive}</span>
        </div>
      </CardContent>
    </Card>
  );
}
