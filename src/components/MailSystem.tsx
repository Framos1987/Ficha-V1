import { useState, useEffect } from "react";
import { Mail, Send, Trash2, User, Clock, ChevronRight, Inbox, PlusCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MailMessage, MasterState } from "../types";
import { supabase } from "../lib/supabase";

interface MailSystemProps {
  messages: MailMessage[];
  setMasterState: (state: MasterState | ((prev: MasterState) => MasterState)) => void;
  charName: string;
  isMaster: boolean;
}

export function MailSystem({ messages, setMasterState, charName, isMaster }: MailSystemProps) {
  const [view, setView] = useState<"inbox" | "sent" | "compose">("inbox");
  const [selectedMsg, setSelectedMsg] = useState<MailMessage | null>(null);
  const [newMsg, setNewMsg] = useState({ recipient: "", subject: "", content: "" });
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Sync with Supabase on Mount & Realtime ──
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as MailMessage;
          if (msg.recipient === charName || msg.isGlobal || msg.sender === charName) {
            setMasterState(prev => {
              if (prev.messages.some(m => m.id === msg.id)) return prev;
              return { ...prev, messages: [msg, ...prev.messages] };
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [charName]);

  const fetchMessages = async () => {
    setIsSyncing(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`recipient.eq.${charName},sender.eq.${charName},is_global.eq.true`)
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setMasterState(prev => ({
        ...prev,
        messages: data as MailMessage[]
      }));
    }
    setIsSyncing(false);
  };

  const filteredMessages = messages.filter(m => {
    if (view === "inbox") return m.recipient === charName || m.isGlobal;
    if (view === "sent") return m.sender === charName;
    return false;
  }).sort((a, b) => b.timestamp - a.timestamp);

  const handleSendMessage = async () => {
    if (!newMsg.recipient || !newMsg.subject || !newMsg.content) return;
    setIsSending(true);

    const msg: Partial<MailMessage> = {
      sender: charName,
      recipient: newMsg.recipient,
      subject: newMsg.subject,
      content: newMsg.content,
      timestamp: Date.now(),
      read: false,
      isGlobal: newMsg.recipient.toLowerCase() === "todos"
    };

    const { error } = await supabase.from('messages').insert([msg]);

    if (error) {
      alert("Erro ao enviar mensagem mística: " + error.message);
    } else {
      setNewMsg({ recipient: "", subject: "", content: "" });
      setView("sent");
      fetchMessages();
    }
    setIsSending(false);
  };

  const handleDeleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMasterState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== id)
      }));
      if (selectedMsg?.id === id) setSelectedMsg(null);
    }
  };

  const markAsRead = async (msg: MailMessage) => {
    if (msg.read || msg.sender === charName) return;
    const { error } = await supabase.from('messages').update({ read: true }).eq('id', msg.id);
    if (!error) {
      setMasterState(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === msg.id ? { ...m, read: true } : m)
      }));
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl h-[600px] flex overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-56 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-2">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
          <Mail size={16} /> Correio Arcano
        </h2>
        
        <button 
          onClick={() => { setView("inbox"); setSelectedMsg(null); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "inbox" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-slate-800"}`}
        >
          <Inbox size={18} /> Inbox
        </button>
        <button 
          onClick={() => { setView("sent"); setSelectedMsg(null); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "sent" ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/30" : "text-slate-400 hover:bg-slate-800"}`}
        >
          <Send size={18} /> Enviados
        </button>
        <button 
          onClick={() => { setView("compose"); setSelectedMsg(null); }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mt-4 border border-dashed ${view === "compose" ? "bg-cyan-600 text-white border-cyan-400" : "border-slate-700 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400"}`}
        >
          <PlusCircle size={18} /> Escrever
        </button>

        <div className="mt-auto p-2">
          <button 
            onClick={fetchMessages}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-2 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors py-2 uppercase tracking-tighter"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnimatePresence mode="wait">
          {view === "compose" ? (
            <motion.div 
              key="compose"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 space-y-4"
            >
              <h3 className="text-xl font-bold text-white mb-6">Nova Mensagem</h3>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Destinatário</label>
                  <input 
                    type="text" 
                    placeholder={isMaster ? "Nome do jogador ou 'Todos'" : "Nome do Mestre"}
                    value={newMsg.recipient} 
                    onChange={e => setNewMsg({...newMsg, recipient: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Assunto</label>
                  <input 
                    type="text" 
                    placeholder="Assunto da mensagem"
                    value={newMsg.subject} 
                    onChange={e => setNewMsg({...newMsg, subject: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Conteúdo</label>
                  <textarea 
                    rows={8}
                    placeholder="Sua mensagem aqui..."
                    value={newMsg.content} 
                    onChange={e => setNewMsg({...newMsg, content: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none"
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-cyan-900/20"
                >
                  {isSending ? "Invocando Mensagem..." : "Enviar Mensagem"}
                </button>
              </div>
            </motion.div>
          ) : selectedMsg ? (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <button onClick={() => setSelectedMsg(null)} className="text-cyan-400 text-sm hover:underline flex items-center gap-1 mb-4">
                    &larr; Voltar para a lista
                  </button>
                  <h3 className="text-2xl font-bold text-white">{selectedMsg.subject}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><User size={14} /> De: {selectedMsg.sender}</span>
                    <span className="flex items-center gap-1"><User size={14} /> Para: {selectedMsg.recipient}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(selectedMsg.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteMessage(selectedMsg.id)} className="p-3 bg-red-900/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-900/40 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="flex-1 bg-slate-950/30 border border-slate-800 p-6 rounded-2xl text-slate-300 leading-relaxed whitespace-pre-wrap overflow-y-auto font-serif">
                {selectedMsg.content}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/20 overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-slate-800">
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-slate-600">
                    <Mail size={48} className="mb-4 opacity-20" />
                    <p>Nenhuma mensagem nesta pasta.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMessages.map(msg => (
                      <button 
                        key={msg.id}
                        onClick={() => { setSelectedMsg(msg); markAsRead(msg); }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-slate-800/80 text-left ${!msg.read && msg.recipient === charName ? 'bg-cyan-600/5 border-cyan-500/30' : 'bg-slate-900/40 border-slate-800'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${!msg.read && msg.recipient === charName ? 'bg-cyan-500' : 'bg-transparent'}`} />
                          <div>
                            <div className="font-bold text-slate-200 flex items-center gap-2">
                              {msg.subject}
                              {msg.isGlobal && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 font-black uppercase tracking-tighter">Global</span>}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                              <span>{msg.sender === charName ? `Para: ${msg.recipient}` : `De: ${msg.sender}`}</span>
                              <span>•</span>
                              <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
