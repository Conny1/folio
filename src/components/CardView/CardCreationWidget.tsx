import React, { useState } from 'react';
import { CardType } from '../../store/useStore';
import { Plus, CheckSquare } from 'lucide-react';
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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (title.trim()) {
      onCreate('mixed', title.trim());
      setTitle('');
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
    <div className={cn("bg-card border border-border rounded-card p-3.5 space-y-3.5 shadow-xs", className)}>
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent border-none focus:ring-0 text-[13px] p-0 font-bold text-text placeholder:text-border"
      />
      
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] text-muted-text font-black tracking-wider uppercase flex items-center gap-1">
          <CheckSquare size={12} className="text-accent" />
          <span>New Journal Node</span>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-[10px] font-black uppercase tracking-wider text-muted-text hover:text-accent px-2.5 py-1.5 rounded-small transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => handleSubmit()}
            disabled={!title.trim()}
            className="bg-accent text-active-text font-black uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-small disabled:opacity-35 hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={12} />
            <span>Create</span>
          </button>
        </div>
      </div>
    </div>
  );
};
