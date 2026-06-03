import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Database, Info, FolderPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
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
    <div className="w-full h-full min-h-screen bg-sidebar flex flex-col justify-between shrink-0 overflow-hidden select-none">
      
      {/* Top Segment: Brand Title & Tree Structure */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Dynamic Mobile Safe Top Padding for PWA installs */}
        <div className="pt-12 sm:pt-6 pb-4 px-5">
          <h1 
            onClick={() => { setActiveCard(roots[0]?.id || '', 'out'); onSelectCard?.(); }}
            className="text-xl font-black tracking-widest text-accent cursor-pointer hover:opacity-80 transition-opacity"
          >
            fo.lio
          </h1>
        </div>
        
        {/* Scrollable Tree Workspace */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 custom-scrollbar">
          {roots.map(root => (
            <TreeNode 
              key={root.id} 
              card={root} 
              level={0} 
              activeId={activeCardId} 
              onSelect={handleSelect} 
            />
          ))}
          
          {roots.length === 0 && (
            <p className="text-[11px] text-muted-text/40 italic px-3 pt-2">No folders or root books created.</p>
          )}
        </div>
      </div>

      {/* Bottom Segment: Seamless Workspace Action Dashboard */}
      <div className="p-4 space-y-3 bg-sidebar/80 shrink-0">
        
        {/* Creation Layer */}
        <div className="px-1">
          {isAdding ? (
            <div className="p-1.5 bg-card/40 rounded-card border border-border/10">
              <CardCreationWidget 
                onCreate={(type, title) => {
                  addRootCard(type, title);
                  setIsAdding(false);
                }}
                onCancel={() => setIsAdding(false)}
                placeholder="Name your folder..."
              />
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-2 px-3 flex items-center gap-3 text-muted-text/70 hover:text-accent hover:bg-accent/5 rounded-card transition-all text-[13px] font-medium cursor-pointer"
            >
              <FolderPlus size={16} className="text-accent/60" />
              <span>Create new section</span>
            </button>
          )}
        </div>

        {/* Dynamic App Guide Block */}
        <button 
          onClick={() => {
            setActiveCard('info', 'out');
            onSelectCard?.();
          }}
          className={cn(
            "w-full py-2.5 px-3 flex items-center gap-3 rounded-card transition-all text-left text-[12px] font-medium cursor-pointer",
            activeCardId === 'info' 
              ? 'bg-accent/10 text-accent font-semibold' 
              : 'text-muted-text/80 hover:text-text hover:bg-accent/5'
          )}
        >
          <Info size={15} className={activeCardId === 'info' ? 'text-accent' : 'text-muted-text/50'} />
          <span>Guide & PWA Installation</span>
        </button>

        {/* Minimal Local Storage / Device Sync Status Bar */}
        <div className="pt-2.5 px-1 border-t border-border/5 flex items-center justify-between text-[10px] text-muted-text/40 font-mono">
          <div className="flex items-center gap-1">
            <Database size={10} className="text-[#7A9A50]/70 animate-pulse" />
            <span className="font-sans text-muted-text/50">Local Native Sandbox</span>
          </div>
          <span className="text-[9px] bg-accent/5 px-1 py-0.2 rounded text-accent/60">Encrypted</span>
        </div>
        
      </div>
    </div>
  );
};