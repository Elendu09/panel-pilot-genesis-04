import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTeamData } from '@/hooks/useTeamData';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export default function TeamSupportTab() {
  const { callTeamApi, loading } = useTeamData();
  const [sessions, setSessions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchSessions = useCallback(async () => {
    const res = await callTeamApi('list-support', { status: 'all' });
    if (res) {
      setSessions(res.data || []);
      setTotal(res.total || 0);
    }
  }, [callTeamApi]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const openSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setLoadingMessages(true);
    // Fetch messages directly — team-data edge function could handle this,
    // but for simplicity use the service role through a dedicated query
    // We'll use the anon client since chat_messages might have open RLS for reading
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedSession) return;
    setSending(true);
    const res = await callTeamApi('reply-support', { sessionId: selectedSession, content: reply.trim() });
    if (res?.success) {
      setReply('');
      await openSession(selectedSession);
      fetchSessions();
    }
    setSending(false);
  };

  if (selectedSession) {
    const session = sessions.find(s => s.id === selectedSession);
    return (
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSession(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <CardTitle className="text-base">{session?.visitor_name || session?.visitor_email || 'Visitor'}</CardTitle>
              <p className="text-xs text-muted-foreground">{session?.visitor_email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMessages ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
            <ScrollArea className="h-[400px] mb-4 pr-4">
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                      msg.sender_type === 'agent'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="flex gap-2">
            <Input
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type your reply..."
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
            />
            <Button size="icon" onClick={handleReply} disabled={sending || !reply.trim()}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Support Tickets ({total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No support sessions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                className="w-full text-left p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{s.visitor_name || s.visitor_email || 'Visitor'}</p>
                    {s.last_message && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{s.last_message.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {s.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {s.last_message_at ? format(new Date(s.last_message_at), 'MMM d, HH:mm') : '—'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
