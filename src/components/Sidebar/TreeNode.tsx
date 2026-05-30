import React from 'react';
import { Card, calculateProgress } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface TreeNodeProps {
  card: Card;
  level: number;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ card, level, activeId, onSelect }) => {
  const isActive = activeId === card.id;
  const progress = calculateProgress(card);

  return (
    <div>
      <div 
        className={cn(
          "group flex items-center gap-2 px-2 py-1.5 rounded-small cursor-pointer transition-colors text-sm relative",
          isActive ? "bg-active-bg text-active-text" : "hover:bg-accent/10 text-text"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(card.id)}
      >
        {/* Indent line */}
        {level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-px bg-border/40" 
            style={{ left: `${(level - 1) * 12 + 14}px` }}
          />
        )}

        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            isActive ? "bg-active-text" : "bg-accent/40"
          )} />
          <span className="truncate">{card.title}</span>
        </div>

        {progress > 0 && (
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
            isActive ? "bg-active-text/20 text-active-text" : "bg-progress-bg text-accent"
          )}>
            {progress}%
          </span>
        )}
      </div>

      {card.children.length > 0 && (
        <div className="mt-0.5">
          {card.children.map(child => (
            <TreeNode 
              key={child.id} 
              card={child} 
              level={level + 1} 
              activeId={activeId} 
              onSelect={onSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
