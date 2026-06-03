import React, { useState } from 'react';
import { CardType } from '../../store/useStore';
import { Plus } from 'lucide-react';
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
    <div className={cn("px-2 py-1 space-y-2 w-full", className)}>
      {/* Seamless Borderless Input Field */}
      <input
        autoFocus
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent border-none outline-none focus:ring-0 text-[13px] font-medium text-text placeholder:text-muted-text/30 p-0"
      />
      
      {/* Action Tray */}
      <div className="flex items-center justify-end gap-1.5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-text/60 hover:text-text px-2 py-1 rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!title.trim()}
          className="text-[10px] font-bold uppercase tracking-wider text-accent disabled:opacity-30 disabled:hover:bg-transparent hover:bg-accent/5 px-2.5 py-1 rounded transition-all flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>Create</span>
        </button>
      </div>
    </div>
  );
};