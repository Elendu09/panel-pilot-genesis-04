import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SupportCenter = () => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [tickets] = useState([
    {
      id: 1,
      subject: "Payment not processed",
      status: "open",
      priority: "high",
      user: "John Doe",
      userEmail: "john@example.com",
      created: "2024-01-20T10:30:00Z",
      updated: "2024-01-20T14:15:00Z",
      messages: [
        {
          id: 1,
          sender: "John Doe",
          message: "I made a payment 2 hours ago but my balance hasn't updated. Can you please check?",
          timestamp: "2024-01-20T10:30:00Z",
          isStaff: false
        },
        {
          id: 2,
          sender: "Support Team",
          message: "Hello John, thank you for contacting us. I'm looking into your payment now. Could you please provide the transaction ID?",
          timestamp: "2024-01-20T11:45:00Z",
          isStaff: true
        }
      ]
    },
    {
      id: 2,
      subject: "Order not delivered",
      status: "pending",
      priority: "medium",
      user: "Sarah Wilson",
      userEmail: "sarah@example.com",
      created: "2024-01-19T15:20:00Z",
      updated: "2024-01-19T16:30:00Z",
      messages: [
        {
          id: 1,
          sender: "Sarah Wilson",
          message: "My Instagram followers order was placed 24 hours ago but still shows as 'processing'. When will it be completed?",
          timestamp: "2024-01-19T15:20:00Z",
          isStaff: false
        }
      ]
    },
    {
      id: 3,
      subject: "Account access issue",
      status: "resolved",
      priority: "low",
      user: "Mike Johnson",
      userEmail: "mike@example.com",
      created: "2024-01-18T09:15:00Z",
      updated: "2024-01-18T12:00:00Z",
      messages: [
        {
          id: 1,
          sender: "Mike Johnson",
          message: "I can't log into my account. It says my password is incorrect but I'm sure it's right.",
          timestamp: "2024-01-18T09:15:00Z",
          isStaff: false
        },
        {
          id: 2,
          sender: "Support Team",
          message: "Hi Mike, I've reset your password and sent you a new one via email. Please check your inbox.",
          timestamp: "2024-01-18T10:30:00Z",
          isStaff: true
        },
        {
          id: 3,
          sender: "Mike Johnson",
          message: "Perfect! I can access my account now. Thank you for the quick help!",
          timestamp: "2024-01-18T11:45:00Z",
          isStaff: false
        }
      ]
    }
  ]);

  const [newMessage, setNewMessage] = useState("");

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "pending": return "secondary";
      case "resolved": return "default";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    toast({
      title: "Message sent",
      description: "Your reply has been sent to the customer.",
    });
    setNewMessage("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
        </div>
        <Button className="bg-gradient-primary hover:shadow-glow">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Support Tickets
                <div className="flex space-x-2 text-sm">
                  <Badge variant="destructive">{tickets.filter(t => t.status === 'open').length}</Badge>
                  <Badge variant="secondary">{tickets.filter(t => t.status === 'pending').length}</Badge>
                </div>
              </CardTitle>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === "open" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("open")}
                  >
                    Open
                  </Button>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus("pending")}
                  >
                    Pending
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 cursor-pointer border-b border-border hover:bg-accent transition-colors ${
                      selectedTicket === ticket.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Badge variant={getStatusColor(ticket.status)} className="text-xs">
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{ticket.user}</span>
                      <div className="flex items-center space-x-1">
                        <AlertCircle className={`w-3 h-3 ${getPriorityColor(ticket.priority)}`} />
                        <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatDate(ticket.created)}</span>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{ticket.messages.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="bg-gradient-card border-border shadow-card h-full">
              <CardHeader>
                {(() => {
                  const ticket = tickets.find(t => t.id === selectedTicket);
                  return ticket ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <CardTitle>{ticket.subject}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{ticket.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{ticket.user}</span>
                        </div>
                        <span>•</span>
                        <span>{ticket.userEmail}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Created {formatDate(ticket.created)}</span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                {(() => {
                  const ticket = tickets.find(t => t.id === selectedTicket);
                  return ticket ? (
                    <>
                      <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                        {ticket.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isStaff ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.isStaff
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium">{message.sender}</span>
                                <span className="text-xs opacity-70">
                                  {formatDate(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-border pt-4">
                        <div className="flex space-x-2">
                          <Textarea
                            placeholder="Type your reply..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1"
                            rows={3}
                          />
                          <div className="flex flex-col space-y-2">
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              className="bg-gradient-primary hover:shadow-glow"
                            >
                              Send
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-card border-border shadow-card h-96">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;