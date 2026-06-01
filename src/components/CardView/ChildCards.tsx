import React, { useState } from 'react';
import { useStore, Card, calculateProgress } from '../../store/useStore';
import { Plus, FileText, CheckSquare, Layers, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CardCreationWidget } from './CardCreationWidget';
import { cn } from '../../lib/utils';

interface ChildCardsProps {
  card: Card;
}

export const ChildCards: React.FC<ChildCardsProps> = ({ card }) => {
  const { addChildCard, setActiveCard } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#7A9A50]">
          Cards inside
        </h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-accent hover:bg-accent/5 p-1 rounded-small transition-colors flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} />
            <span>Add card</span>
          </button>
        )}
      </div>

      {isAdding && (
        <CardCreationWidget 
          onCreate={(type, title) => {
            addChildCard(card.id, type, title);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {card.children.map(child => {
          const progress = calculateProgress(child);
          const hasCheckables = child.tasks?.some(t => t.isCheckbox);
          const hasChildren = child.children && child.children.length > 0;
          const showBar = hasCheckables || hasChildren;
          
          return (
            <div 
              key={child.id}
              onClick={() => setActiveCard(child.id, 'in')}
              className="bg-card border border-border rounded-card p-4 cursor-pointer hover:bg-[#E8DFD0] transition-all group relative flex flex-col min-h-[140px] shadow-xs"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-bold text-[14px] text-text leading-tight group-hover:text-accent transition-colors line-clamp-2">
                  {child.title}
                </h4>
                <FileText size={14} className="text-muted-text shrink-0 mt-0.5" />
              </div>
              
              {/* Content Preview */}
              <div className="flex-1 overflow-hidden mb-3">
                {child.tasks && child.tasks.length > 0 ? (
                  <div className="space-y-1.5">
                    {child.tasks.slice(0, 3).map((task: any) => (
                      <div key={task.id} className="flex items-center gap-1.5 text-[11.5px]">
                        {task.isCheckbox ? (
                          <div className={cn(
                            "w-3 h-3 border-[1.5px] border-[#B8A88A] rounded-[3px] shrink-0",
                            task.done && "bg-progress-fill border-progress-fill"
                          )} />
                        ) : (
                          <span className="text-muted-text/80 font-mono pl-0.5 shrink-0">•</span>
                        )}
                        <span className={cn(
                          "truncate text-[#5C4A30]",
                          task.isCheckbox && task.done && "line-through text-muted-text"
                        )}>
                          {task.text || <span className="italic opacity-40">Untitled note</span>}
                        </span>
                      </div>
                    ))}
                    {child.tasks.length > 3 && (
                      <span className="text-[10px] text-muted-text font-black tracking-wider uppercase">
                        + {child.tasks.length - 3} more items
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11.5px] text-muted-text italic">Empty card node</p>
                )}
              </div>

              {/* Progress Bar & Sub-nodes Count */}
              <div className="mt-auto pt-2 flex items-center justify-between gap-4">
                {child.children && child.children.length > 0 && (
                  <span className="text-[10px] text-accent font-bold uppercase tracking-wide">
                    {child.children.length} {child.children.length === 1 ? 'sub-node' : 'sub-nodes'}
                  </span>
                )}
                
                {showBar && (
                  <div className="flex-1 max-w-[100px]">
                    <div className="text-[9px] text-right font-black text-[#7A9A50] mb-0.5">
                      {progress}%
                    </div>
                    <div className="h-[3.5px] bg-progress-bg rounded-full overflow-hidden">
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
            </div>
          );
        })}

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="border border-dashed border-border rounded-card p-4 flex flex-col items-center justify-center gap-2 text-muted-text hover:bg-accent/5 hover:text-accent transition-all min-h-[140px] cursor-pointer"
          >
            <Plus size={20} />
            <span className="text-xs font-black uppercase tracking-wider">Add card here</span>
          </button>
        )}
      </div>
    </div>
  );
};
