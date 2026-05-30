import React from 'react';
import { Card } from '../../store/useStore';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
  path: Card[];
  onNavigate: (id: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-text overflow-x-auto whitespace-nowrap no-scrollbar py-1">
      {path.map((card, index) => (
        <React.Fragment key={card.id}>
          <button
            onClick={() => onNavigate(card.id)}
            className="hover:text-accent transition-colors px-1 rounded-small hover:bg-accent/5"
          >
            {card.title}
          </button>
          {index < path.length - 1 && (
            <ChevronRight size={14} className="shrink-0 opacity-40" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
