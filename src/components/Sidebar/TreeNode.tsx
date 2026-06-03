import React from 'react';
import { Card, calculateProgress } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { Folder, FolderOpen } from 'lucide-react';

interface TreeNodeProps {
  card: Card;
  level: number;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({ card, level, activeId, onSelect }) => {
  const isActive = activeId === card.id;
  const progress = calculateProgress(card);
  const hasChildren = card.children && card.children.length > 0;

  return (
    <div className="w-full">
      {/* Interactive Row Line Container */}
      <div 
        className={cn(
          "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-card cursor-pointer transition-all text-[13px] font-medium relative select-none",
          isActive 
            ? "bg-accent/10 text-accent font-semibold" 
            : "text-muted-text/80 hover:text-text hover:bg-accent/5"
        )}
        style={{ paddingLeft: `${level * 14 + 10}px` }}
        onClick={() => onSelect(card.id)}
      >
        {/* Organic Left Hierarchy Guide Marker */}
        {level > 0 && (
          <div 
            className="absolute top-0 bottom-0 w-px bg-border/10 group-hover:bg-accent/10 transition-colors" 
            style={{ left: `${(level - 1) * 14 + 16}px` }}
          />
        )}

        {/* Content Prefix and Folder Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-accent" : "text-muted-text/40 group-hover:text-muted-text/60"
          )}>
            {hasChildren ? (
              isActive ? <FolderOpen size={13} /> : <Folder size={13} />
            ) : (
              <div className={cn("w-1 h-1 rounded-full ml-1", isActive ? "bg-accent" : "bg-muted-text/30")} />
            )}
          </div>
          
          <span className="truncate tracking-wide">{card.title || "Untitled Folder"}</span>
        </div>

        {/* Floating Percentage Progress Pill */}
        {progress > 0 && (
          <span className={cn(
            "text-[9px] font-mono font-bold tracking-tight px-1.5 py-0.2 rounded transition-colors shrink-0",
            isActive ? "bg-accent/10 text-accent" : "bg-accent/5 text-accent/60 group-hover:bg-accent/10"
          )}>
            {progress}%
          </span>
        )}
      </div>

      {/* Recursive Deep Child Sub-Trees Container */}
      {hasChildren && (
        <div className="mt-0.5 space-y-0.5">
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