import { useState } from "react";
import { BookOpen, Plus, Trash2, Calendar, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { JournalNote } from "../types";

interface JournalTabProps {
  notes: JournalNote[];
  onChange: (notes: JournalNote[]) => void;
}

export function JournalTab({ notes, onChange }: JournalTabProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  const handleAddNote = () => {
    const newNote: JournalNote = {
      id: crypto.randomUUID(),
      title: "Nova Nota " + (notes.length + 1),
      content: "",
      createdAt: Date.now()
    };
    onChange([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, updates: Partial<JournalNote>) => {
    onChange(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    onChange(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-1 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row h-[700px]">
      {/* Sidebar - Lista de Notas */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col bg-slate-950/30">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <BookOpen size={18} />
            <span>CRÔNICAS</span>
          </div>
          <button 
            onClick={handleAddNote}
            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-all"
            title="Nova Nota"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {notes.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 text-sm italic">
              Nenhuma nota registrada...
            </div>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-3 rounded-xl transition-all border group relative ${
                  selectedNoteId === note.id 
                  ? 'bg-amber-500/10 border-amber-500/30' 
                  : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className={`font-bold text-sm truncate mb-1 ${selectedNoteId === note.id ? 'text-amber-300' : 'text-slate-300'}`}>
                  {note.title || "Sem Título"}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Calendar size={10} />
                  {formatDate(note.createdAt)}
                </div>
                <button 
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Main Area */}
      <div className="flex-1 flex flex-col relative bg-slate-900/20">
        <AnimatePresence mode="wait">
          {!selectedNote ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-4"
            >
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700">
                <FileText size={32} strokeWidth={1} />
              </div>
              <p className="text-sm italic">Selecione uma nota para visualizar ou editar</p>
            </motion.div>
          ) : (
            <motion.div 
              key={selectedNote.id}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="flex-1 flex flex-col p-6 space-y-4 h-full"
            >
              <div className="flex flex-col gap-2 border-b border-slate-800/50 pb-4">
                <input 
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })}
                  placeholder="Título da Crônica..."
                  className="bg-transparent text-2xl font-bold text-slate-100 placeholder:text-slate-700 focus:outline-none"
                />
                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <Calendar size={12} className="text-amber-500/50" />
                  {formatDate(selectedNote.createdAt).toUpperCase()}
                </div>
              </div>

              <textarea 
                value={selectedNote.content}
                onChange={(e) => handleUpdateNote(selectedNote.id, { content: e.target.value })}
                placeholder="Escreva aqui os detalhes da aventura, NPCs encontrados, recompensas ou mistérios..."
                className="flex-1 bg-transparent text-slate-300 placeholder:text-slate-700 focus:outline-none resize-none leading-relaxed text-sm font-serif custom-scrollbar"
                spellCheck={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
