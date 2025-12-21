import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  DollarSign,
  Search,
  Edit,
  Ban,
  Calendar,
  Save,
  Mail,
  CreditCard,
  Activity,
  Crown,
  Eye
} from "lucide-react";

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'panel_owner';
  balance: number;
  total_spent: number;
  is_active: boolean;
  created_at: string;
  avatar_url?: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  granted_at: string;
  expires_at?: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPanels, setUserPanels] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    full_name: "",
    balance: 0,
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (user: User) => {
    try {
      const [rolesRes, panelsRes] = await Promise.all([
        supabase.from('user_roles').select('*').eq('user_id', user.user_id),
        supabase.from('panels').select('*').eq('owner_id', user.id)
      ]);
      
      setUserRoles(rolesRes.data || []);
      setUserPanels(panelsRes.data || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      fetchUsers();
      toast({
        title: "Status Updated",
        description: `User ${!user.is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status"
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || "",
      balance: user.balance || 0,
      is_active: user.is_active
    });
    setEditDialogOpen(true);
  };

  const openDetailsDialog = async (user: User) => {
    setSelectedUser(user);
    await fetchUserDetails(user);
    setDetailsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          balance: editForm.balance,
          is_active: editForm.is_active
        })
        .eq('id', selectedUser.id);

      toast({
        title: "User Updated",
        description: "User settings saved successfully"
      });
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user"
      });
    }
  };

  const adjustBalance = async (amount: number) => {
    if (!selectedUser) return;
    
    try {
      const newBalance = (selectedUser.balance || 0) + amount;
      await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', selectedUser.id);

      toast({
        title: "Balance Updated",
        description: `Balance adjusted by $${amount.toFixed(2)}`
      });
      fetchUsers();
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to adjust balance"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const panelOwners = users.filter(u => u.role === 'panel_owner').length;
  const totalRevenue = users.reduce((sum, user) => sum + (user.total_spent || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage all platform users, roles, and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{totalUsers}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{activeUsers}</p>
              </div>
              <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Panel Owners</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{panelOwners}</p>
              </div>
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-xl md:text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="panel_owner">Panel Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name || user.email} className="w-8 h-8 rounded-full" />
                              ) : (
                                <span className="text-sm font-medium">{(user.full_name || user.email).charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || 'No Name'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'destructive' : 'default'} className={user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                            {user.role === 'admin' ? <><Shield className="w-3 h-3 mr-1" />Admin</> : <><Users className="w-3 h-3 mr-1" />Panel Owner</>}
                          </Badge>
                        </TableCell>
                        <TableCell><span className="font-medium">${user.balance?.toFixed(2) || '0.00'}</span></TableCell>
                        <TableCell><span className="font-medium">${user.total_spent?.toFixed(2) || '0.00'}</span></TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"} className={user.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                            {user.is_active ? <><UserCheck className="w-3 h-3 mr-1" />Active</> : <><UserX className="w-3 h-3 mr-1" />Inactive</>}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />{new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button onClick={() => openDetailsDialog(user)} variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details"><Eye className="w-4 h-4" /></Button>
                            <Button onClick={() => openEditDialog(user)} variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit User"><Edit className="w-4 h-4" /></Button>
                            <Button onClick={() => toggleUserStatus(user)} variant="ghost" size="sm" className={`h-8 w-8 p-0 ${!user.is_active ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`} title={user.is_active ? 'Deactivate' : 'Activate'}>
                              {user.is_active ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 rounded-xl border border-border bg-accent/30">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name || user.email} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium">{(user.full_name || user.email).charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.is_active ? "default" : "secondary"} className={`shrink-0 ${user.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <Badge variant="outline" className="text-xs mt-1">{user.role === 'admin' ? 'Admin' : 'Panel Owner'}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="font-medium">${user.balance?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-medium">${user.total_spent?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />{new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button onClick={() => openDetailsDialog(user)} variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="w-4 h-4" /></Button>
                        <Button onClick={() => openEditDialog(user)} variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit className="w-4 h-4" /></Button>
                        <Button onClick={() => toggleUserStatus(user)} variant="ghost" size="sm" className={`h-8 w-8 p-0 ${!user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                          {user.is_active ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedUser?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={editForm.balance}
                onChange={(e) => setEditForm({ ...editForm, balance: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <Label>Account Status</Label>
                <p className="text-sm text-muted-foreground">Enable or disable user access</p>
              </div>
              <Button
                variant={editForm.is_active ? "default" : "outline"}
                size="sm"
                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
              >
                {editForm.is_active ? "Active" : "Inactive"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedUser?.full_name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="panels">Panels</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={selectedUser.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="font-medium text-lg">${selectedUser.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="font-medium text-lg">${selectedUser.total_spent?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => adjustBalance(10)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add $10
                  </Button>
                  <Button size="sm" onClick={() => adjustBalance(50)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add $50
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => adjustBalance(-10)}>
                    Deduct $10
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="panels" className="mt-4">
                {userPanels.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No panels owned</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userPanels.map((panel) => (
                      <div key={panel.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                        <div>
                          <p className="font-medium">{panel.name}</p>
                          <p className="text-sm text-muted-foreground">{panel.subdomain}.smmpilot.online</p>
                        </div>
                        <Badge className={panel.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {panel.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="roles" className="mt-4">
                <div className="space-y-4">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <p className="font-medium">Current Role</p>
                    </div>
                    <Badge className={selectedUser.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  {userRoles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Additional Roles</p>
                      {userRoles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <Badge>{role.role}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Granted: {new Date(role.granted_at).toLocaleDateString()}
                            </p>
                          </div>
                          {role.expires_at && (
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(role.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
