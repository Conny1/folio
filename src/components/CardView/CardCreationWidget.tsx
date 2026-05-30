import React, { useState } from 'react';
import { CardType } from '../../store/useStore';
import { Plus, FileText, CheckSquare, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CardCreationWidgetProps {
  onCreate: (type: CardType, title: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export const CardCreationWidget: React.FC<CardCreationWidgetProps> = ({ 
  onCreate, 
  onCancel, 
  placeholder = "Title...",
  className 
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CardType>('note');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim()) {
      onCreate(type, title.trim());
      setTitle('');
      setType('note');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className={cn("bg-card border border-border rounded-card p-3 space-y-3", className)}>
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 font-medium placeholder:text-border"
      />
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setType('note')}
            className={cn(
              "p-1.5 rounded-small transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
              type === 'note' ? "bg-accent text-active-text" : "text-muted-text hover:bg-accent/5"
            )}
          >
            <FileText size={12} />
            Note
          </button>
          <button
            onClick={() => setType('checklist')}
            className={cn(
              "p-1.5 rounded-small transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
              type === 'checklist' ? "bg-accent text-active-text" : "text-muted-text hover:bg-accent/5"
            )}
          >
            <CheckSquare size={12} />
            Tasks
          </button>
          <button
            onClick={() => setType('mixed')}
            className={cn(
              "p-1.5 rounded-small transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
              type === 'mixed' ? "bg-accent text-active-text" : "text-muted-text hover:bg-accent/5"
            )}
          >
            <Layers size={12} />
            Mixed
          </button>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          className="bg-accent text-active-text p-1.5 rounded-small disabled:opacity-30 transition-opacity"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
