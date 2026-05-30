import React, { useState } from 'react';
import { useStore, Card, calculateProgress } from '../../store/useStore';
import { Plus, FileText, CheckSquare, Layers } from 'lucide-react';
import { motion } from 'motion/react';
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
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-text">Cards inside</h3>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-accent hover:bg-accent/5 p-1 rounded-small transition-colors"
          >
            <Plus size={16} />
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
          const TypeIcon = child.type === 'note' ? FileText : child.type === 'checklist' ? CheckSquare : Layers;
          
          return (
            <div 
              key={child.id}
              onClick={() => setActiveCard(child.id, 'in')}
              className="bg-card border border-border rounded-card p-3.5 cursor-pointer hover:bg-[#E8DFD0] transition-all group relative flex flex-col min-h-[120px]"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-medium text-[13.5px] text-text leading-tight group-hover:text-accent transition-colors line-clamp-2">
                  {child.title}
                </h4>
                <TypeIcon size={14} className="text-muted-text shrink-0 mt-0.5" />
              </div>
              
              {/* Content Preview */}
              <div className="flex-1 overflow-hidden mb-3">
                {(child.type === 'note' || child.type === 'mixed') && child.note && (
                  <p className="text-[12px] text-[#5C4A30] line-clamp-3 leading-relaxed mb-2">
                    {child.note}
                  </p>
                )}
                
                {(child.type === 'checklist' || child.type === 'mixed') && child.tasks.length > 0 && (
                  <div className="space-y-1">
                    {child.tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-1.5 text-[11px]">
                        <div className={cn(
                          "w-3 h-3 border-[1.5px] border-[#B8A88A] rounded-[3px] shrink-0",
                          task.done && "bg-progress-fill border-progress-fill"
                        )} />
                        <span className={cn(
                          "truncate",
                          task.done ? "line-through text-muted-text" : "text-[#5C4A30]"
                        )}>
                          {task.text}
                        </span>
                      </div>
                    ))}
                    {child.tasks.length > 3 && (
                      <span className="text-[10px] text-muted-text font-medium">
                        + {child.tasks.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {(child.type === 'checklist' || child.type === 'mixed' || child.children.length > 0) && (
                <div className="mt-auto pt-2">
                  <div className="h-[3px] bg-progress-bg rounded-full overflow-hidden">
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
          );
        })}

        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="border border-dashed border-border rounded-card p-4 flex flex-col items-center justify-center gap-2 text-muted-text hover:bg-accent/5 hover:text-accent transition-all min-h-[120px]"
          >
            <Plus size={20} />
            <span className="text-xs font-medium">Add card here</span>
          </button>
        )}
      </div>
    </div>
  );
};
