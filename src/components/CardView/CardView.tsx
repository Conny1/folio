import React, { useMemo } from 'react';
import { useStore, calculateProgress, findCardAndPath, CardType } from '../../store/useStore';
import { Breadcrumb } from '../Breadcrumb/Breadcrumb';
import { TaskList } from './TaskList';
import { ChildCards } from './ChildCards';
import { NoteEditor } from './NoteEditor';
import { AppGuideView } from './AppGuideView';
import { motion } from 'motion/react';
import { Trash2, FileText, CheckSquare, Layers, Inbox, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CardView: React.FC = () => {
  const { roots, activeCardId, updateCard, deleteCard, setActiveCard, updateCardType, navigationDirection } = useStore();

  const activeCardData = useMemo(() => {
    if (!activeCardId || activeCardId === 'info') return null;
    return findCardAndPath(roots, activeCardId);
  }, [roots, activeCardId]);

  if (activeCardId === 'info') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex-1 flex flex-col h-screen overflow-hidden bg-bg"
      >
        {/* Top Bar */}
        <div className="h-14 border-b border-border flex items-center px-4 lg:px-8 shrink-0 justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">System Dashboard</span>
          </div>
          {roots.length > 0 && (
            <button
              onClick={() => setActiveCard(roots[0].id, 'out')}
              className="px-3.5 py-1.5 cursor-pointer bg-accent text-[10px] font-black text-active-text rounded-small uppercase tracking-widest hover:opacity-90"
            >
              Back to notebook
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-10">
          <AppGuideView />
        </div>
      </motion.div>
    );
  }

  if (!activeCardId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-muted-text">
        <Inbox size={64} className="mb-6 opacity-30 text-accent" />
        <h2 className="text-lg font-bold mb-2 text-text">Welcome to Folio</h2>
        <p className="text-sm max-w-[280px] leading-relaxed">
          Select a card from the sidebar or create a new one to start organizing your thoughts.
        </p>
      </div>
    );
  }

  if (!activeCardData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-muted-text">
        <Search size={64} className="mb-6 opacity-30 text-accent" />
        <h2 className="text-lg font-bold mb-2 text-text">Card not found</h2>
        <p className="text-sm max-w-[280px] leading-relaxed">
          The card you're looking for might have been deleted or moved.
        </p>
      </div>
    );
  }

  const { card, path } = activeCardData;
  const progress = calculateProgress(card);

  const types: { id: CardType; icon: any; label: string }[] = [
    { id: 'note', icon: FileText, label: 'Note' },
    { id: 'checklist', icon: CheckSquare, label: 'Tasks' },
    { id: 'mixed', icon: Layers, label: 'Mixed' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: navigationDirection === 'in' ? 0.96 : 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex-1 flex flex-col h-screen overflow-hidden bg-bg" 
      key={activeCardId}
    >
      {/* Top Bar */}
      <div className="h-14 border-b border-border flex items-center px-4 lg:px-8 shrink-0 justify-between gap-4">
        <div className="flex-1 min-w-0 pl-10 lg:pl-0">
          <Breadcrumb path={path} onNavigate={(id) => setActiveCard(id, 'out')} />
        </div>
        
        <div className="flex items-center gap-1 bg-accent/5 p-1 rounded-small shrink-0">
          {types.map(t => {
            const Icon = t.icon;
            const isActive = card.type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updateCardType(card.id, t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-small text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  isActive ? "bg-accent text-active-text" : "text-muted-text hover:bg-accent/10"
                )}
                title={t.label}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="max-w-3xl mx-auto space-y-8 lg:space-y-10">
          
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCard(card.id, { title: e.target.value })}
                className="text-2xl lg:text-4xl font-bold bg-transparent border-none focus:ring-0 p-0 flex-1 tracking-tight text-text"
              />
              <button 
                onClick={() => deleteCard(card.id)}
                className="mt-2 text-border hover:text-red-500 transition-colors cursor-pointer"
                title="Delete card"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {(card.type === 'checklist' || card.type === 'mixed') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-text">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-progress-bg rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-progress-fill"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Sections based on Type */}
          <div className="space-y-12">
            {(card.type === 'note' || card.type === 'mixed') && (
              <div className="space-y-4">
                {card.type === 'mixed' && (
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-text">Note</h3>
                )}
                <NoteEditor cardId={card.id} initialNote={card.note} />
              </div>
            )}

            {(card.type === 'checklist' || card.type === 'mixed') && (
              <div className="space-y-4">
                {card.type === 'mixed' && <hr className="border-border/40" />}
                <TaskList cardId={card.id} />
              </div>
            )}
          </div>

          <hr className="border-border/40" />

          {/* Child Cards Section */}
          <ChildCards card={card} />

          <div className="h-20" /> {/* Spacer */}
        </div>
      </div>
    </motion.div>
  );
};
