import React from 'react';
import { Card } from '../../store/useStore';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BreadcrumbProps {
  path: Card[];
  onNavigate: (id: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  if (!path || path.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-[13px] overflow-x-auto whitespace-nowrap scrollbar-none py-2 select-none w-full base-fade-edge">
      {path.map((card, index) => {
        const isLast = index === path.length - 1;
        const isFirst = index === 0;

        return (
          <React.Fragment key={card.id}>
            {isLast ? (
              /* Current Active Page Header Focus */
              <span className="text-[15px] font-bold text-text tracking-tight pl-0.5 animate-in fade-in slide-in-from-left-1 duration-200">
                {card.title || "Untitled Folder"}
              </span>
            ) : (
              /* Distant Ancestor Navigation Tokens */
              <button
                onClick={() => onNavigate(card.id)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-card text-muted-text/50 hover:text-accent bg-accent/5 hover:bg-accent/10 transition-all font-medium tracking-wide text-[12px] max-w-[110px] cursor-pointer shrink-0"
                )}
              >
                {isFirst && <Home size={11} className="opacity-70 shrink-0 -mt-0.5" />}
                <span className="truncate">{card.title || "Untitled"}</span>
              </button>
            )}
            
            {!isLast && (
              <ChevronRight size={11} className="shrink-0 text-muted-text/25 stroke-[2.5]" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};