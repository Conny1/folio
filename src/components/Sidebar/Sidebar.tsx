import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Database, Info } from 'lucide-react';
import { TreeNode } from './TreeNode';
import { CardCreationWidget } from '../CardView/CardCreationWidget';

interface SidebarProps {
  onSelectCard?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectCard }) => {
  const { roots, addRootCard, activeCardId, setActiveCard } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleSelect = (id: string) => {
    setActiveCard(id, 'in');
    onSelectCard?.();
  };

  return (
    <div className="w-full h-screen bg-sidebar border-r border-border flex flex-col shrink-0 overflow-hidden">
      <div className="p-6 lg:p-6 pt-16 lg:pt-6">
        <h1 className="text-2xl font-bold tracking-tighter text-accent">fo.lio</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {roots.map(root => (
          <TreeNode 
            key={root.id} 
            card={root} 
            level={0} 
            activeId={activeCardId} 
            onSelect={handleSelect} 
          />
        ))}
      </div>

      <div className="p-4 space-y-4 border-t border-border/40">
        {isAdding ? (
          <CardCreationWidget 
            onCreate={(type, title) => {
              addRootCard(type, title);
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
            placeholder="Root title..."
          />
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full p-2 flex items-center justify-center gap-2 border border-dashed border-accent/40 rounded-small text-accent hover:bg-accent/5 transition-colors text-sm"
          >
            <Plus size={16} />
            New root card
          </button>
        )}

        {/* App Guide & PWA Download Button */}
        <button 
          onClick={() => {
            setActiveCard('info', 'out');
            onSelectCard?.();
          }}
          className={`w-full p-2.5 flex items-center justify-center gap-2 border rounded-small transition-all text-xs font-bold uppercase tracking-wider ${
            activeCardId === 'info' 
              ? 'bg-accent text-active-text border-accent' 
              : 'border-border/60 text-accent hover:bg-accent/5'
          }`}
        >
          <Info size={14} />
          App Guide & Download
        </button>

        {/* Local Storage / IndexedDB Status Indicator */}
        <div className="flex flex-col gap-1 pt-2 border-t border-border/20">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7A9A50]">
            <Database size={11} />
            <span>Saved to Device</span>
          </div>
          <div className="text-[10px] text-muted-text opacity-70">
            Secure browser database
          </div>
        </div>
      </div>
    </div>
  );
};
