import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  Mail, 
  Ban, 
  DollarSign,
  Eye,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      avatar: "",
      balance: 125.50,
      totalSpent: 1250.00,
      orders: 45,
      status: "active",
      joinDate: "2024-01-15",
      lastActive: "2024-01-20"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      avatar: "",
      balance: 89.20,
      totalSpent: 890.75,
      orders: 32,
      status: "active",
      joinDate: "2024-01-10",
      lastActive: "2024-01-19"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "",
      balance: 0.00,
      totalSpent: 2100.40,
      orders: 78,
      status: "suspended",
      joinDate: "2023-12-05",
      lastActive: "2024-01-18"
    },
    {
      id: 4,
      name: "Emily Chen",
      email: "emily@example.com",
      avatar: "",
      balance: 234.80,
      totalSpent: 567.30,
      orders: 23,
      status: "active",
      joinDate: "2024-01-08",
      lastActive: "2024-01-20"
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "suspended": return "destructive";
      case "pending": return "secondary";
      default: return "secondary";
    }
  };

  const handleUserAction = (action: string, userId: number) => {
    toast({
      title: `User ${action}`,
      description: `Successfully ${action.toLowerCase()}d user.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage your panel users and their accounts</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users Overview</CardTitle>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <span>Total Users: {users.length}</span>
              <span>Active: {users.filter(u => u.status === 'active').length}</span>
              <span>Suspended: {users.filter(u => u.status === 'suspended').length}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge variant={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(user.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-primary">${user.balance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">${user.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{user.orders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Last active</p>
                    <p className="text-xs">{new Date(user.lastActive).toLocaleDateString()}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUserAction("View", user.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction("Edit", user.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction("Email", user.id)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUserAction("Adjust Balance", user.id)}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Adjust Balance
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleUserAction("Suspend", user.id)}
                        className="text-destructive"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspend User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;