import React, { useState, useEffect } from 'react';
import { useStore, calculateProgress } from '../../store/useStore';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface TaskListProps {
  cardId: string;
}

export const TaskList: React.FC<TaskListProps> = ({ cardId }) => {
  const { roots, addTask, toggleTask, deleteTask, updateTask } = useStore();
  const [newTaskText, setNewTaskText] = useState('');

  // Find the card in the tree to get its tasks
  const findCard = (cards: any[]): any => {
    for (const c of cards) {
      if (c.id === cardId) return c;
      if (c.children.length > 0) {
        const found = findCard(c.children);
        if (found) return found;
      }
    }
    return null;
  };

  const card = findCard(roots);
  if (!card) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      addTask(cardId, newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-text">Tasks</h3>
      
      <div className="space-y-1">
        {card.tasks.map((task: any) => (
          <div key={task.id} className="group flex items-center gap-3 py-1">
            <button 
              onClick={() => toggleTask(cardId, task.id)}
              className={cn(
                "transition-colors",
                task.done ? "text-progress-fill" : "text-border hover:text-accent"
              )}
            >
              {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>
            
            <input
              type="text"
              value={task.text}
              onChange={(e) => updateTask(cardId, task.id, e.target.value)}
              className={cn(
                "flex-1 bg-transparent border-none focus:ring-0 text-sm p-0",
                task.done && "line-through text-muted-text"
              )}
            />

            <button 
              onClick={() => deleteTask(cardId, task.id)}
              className="opacity-0 group-hover:opacity-100 text-border hover:text-red-500 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddTask} className="flex items-center gap-3">
        <div className="text-border">
          <Plus size={18} />
        </div>
        <input
          type="text"
          placeholder="Add a task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-border"
        />
      </form>
    </div>
  );
};
