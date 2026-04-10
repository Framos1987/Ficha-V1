import { useState } from "react";
import { BookOpen, Plus, Trash2, Calendar, ChevronRight, Hash } from "lucide-react";
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

  const addNote = () => {
    const newNote: JournalNote = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Nova Crônica",
      content: "",
      createdAt: Date.now()
    };
    onChange([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<JournalNote>) => {
    onChange(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    onChange(filtered);
    if (selectedNoteId === id) {
      setSelectedNoteId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] h-[70vh]">
      
      {/* Sidebar: Note List */}
      <div className="w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/50">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <BookOpen size={20} />
            <span>Crônicas</span>
          </div>
          <button 
            onClick={addNote}
            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/20 transition-all"
            title="Nova Crônica"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
          {notes.length === 0 ? (
            <div className="text-center p-8 text-slate-500 text-sm italic">
              Nenhuma crônica registrada...
            </div>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all group relative overflow-hidden ${
                  selectedNoteId === note.id 
                    ? "bg-slate-800 border border-slate-700 shadow-lg" 
                    : "hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                {selectedNoteId === note.id && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-amber-500" />
                )}
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold truncate pr-6 ${selectedNoteId === note.id ? "text-white" : "text-slate-300 group-hover:text-slate-200"}`}>
                    {note.title || "Sem título"}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                  <Calendar size={10} />
                  {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-slate-950/20 relative">
        {selectedNote ? (
          <>
            <div className="p-6 border-b border-slate-800 flex flex-col gap-2">
              <input 
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                placeholder="Título da Crônica..."
                className="bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-slate-700 w-full"
              />
              <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                <Hash size={12} />
                ID: {selectedNote.id} • Criado em {new Date(selectedNote.createdAt).toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="flex-1 p-6 relative">
              <textarea 
                value={selectedNote.content}
                onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                placeholder="Comece a registrar sua saga aqui..."
                className="w-full h-full bg-transparent text-slate-300 focus:outline-none resize-none leading-relaxed font-serif text-lg scrollbar-thin scrollbar-thumb-slate-800"
                spellCheck="false"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 select-none">
            <BookOpen size={48} className="mb-4 opacity-10" />
            <p className="text-sm italic">Selecione uma crônica ou crie uma nova nota</p>
          </div>
        )}

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
      </div>

    </div>
  );
}
