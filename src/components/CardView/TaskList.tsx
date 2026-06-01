import React, { useState, useRef, useEffect } from 'react';
import { useStore, calculateProgress } from '../../store/useStore';
import { Plus, Trash2, CheckCircle2, Circle, ChevronRight, FileText, CheckSquare, List, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TaskListProps {
  cardId: string;
}

export const TaskList: React.FC<TaskListProps> = ({ cardId }) => {
  const { 
    roots, 
    addTask, 
    toggleTask, 
    toggleTaskCheckboxMode, 
    deleteTask, 
    updateTask, 
    addChildCardForTask,
    setActiveCard 
  } = useStore();

  const [newTaskText, setNewTaskText] = useState('');
  const [isCheckMode, setIsCheckMode] = useState(false); // default adding mode

  // Find the current card in the tree
  const findCard = (cards: any[]): any => {
    for (const c of cards) {
      if (c.id === cardId) return c;
      if (c.children && c.children.length > 0) {
        const found = findCard(c.children);
        if (found) return found;
      }
    }
    return null;
  };

  const card = findCard(roots);
  if (!card) return null;

  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newTaskText.trim()) {
      addTask(cardId, newTaskText.trim(), isCheckMode);
      setNewTaskText('');
    }
  };

  const handleCreateSubNode = (taskId: string, originalText: string) => {
    const defaultTitle = originalText.trim() || "Untitled Sub-Card";
    const subCardId = addChildCardForTask(cardId, taskId, 'mixed', defaultTitle);
    setActiveCard(subCardId, 'in');
  };

  const handleEnterKeyOnItem = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Add an empty task right below if not empty
      addTask(cardId, "", false);
    }
  };

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/20">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#7A9A50]">
          Notebook Stream & Tasks
        </h3>
        <span className="text-[10px] text-muted-text font-mono">
          {card.tasks.length} {card.tasks.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Main List */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {card.tasks.map((task: any, index: number) => {
            // Find if there's a child card linked to this task
            const hasChildCard = !!task.childCardId;
            const childCardData = hasChildCard 
              ? card.children?.find((c: any) => c.id === task.childCardId) 
              : null;
            
            const childProgress = childCardData ? calculateProgress(childCardData) : 0;
            const isChildDone = childCardData && childProgress === 100;

            // Auto-align done status if child exists
            const displayDone = hasChildCard ? isChildDone : task.done;

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 rounded-small transition-all border border-transparent hover:bg-accent/5 hover:border-accent/10",
                  task.isCheckbox ? "bg-card border-border/40 shadow-xs" : "bg-transparent"
                )}
              >
                {/* Visual Prefix */}
                {task.isCheckbox ? (
                  <button 
                    onClick={() => {
                      if (!hasChildCard) {
                        toggleTask(cardId, task.id);
                      } else {
                        // Click goes to child node
                        setActiveCard(task.childCardId, 'in');
                      }
                    }}
                    className={cn(
                      "transition-colors shrink-0 cursor-pointer p-0.5 rounded-[4px] hover:bg-accent/10",
                      displayDone ? "text-progress-fill" : "text-border hover:text-accent"
                    )}
                    title={hasChildCard ? `Sub-card progress: ${childProgress}%` : "Toggle task completion"}
                  >
                    {displayDone ? (
                      <CheckCircle2 size={18} className="text-[#7A9A50]" />
                    ) : (
                      <Circle size={18} />
                    )}
                  </button>
                ) : (
                  <div className="text-border/80 shrink-0 select-none pl-1 pr-1 font-mono text-xs">
                    •
                  </div>
                )}

                {/* Inline Text Input */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <input
                    type="text"
                    value={task.text}
                    placeholder="Empty line... type something!"
                    onKeyDown={(e) => handleEnterKeyOnItem(e, index)}
                    onChange={(e) => updateTask(cardId, task.id, e.target.value)}
                    className={cn(
                      "w-full bg-transparent border-none focus:ring-0 text-[13.5px] p-0 font-sans text-text placeholder:text-border placeholder:italic focus:bg-transparent",
                      displayDone && "line-through text-muted-text/70"
                    )}
                  />
                  {/* Embedded sub-card link/progress mini-view */}
                  {hasChildCard && childCardData && (
                    <button
                      onClick={() => setActiveCard(task.childCardId, 'in')}
                      className="text-left mt-0.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-accent hover:underline uppercase tracking-wide"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span>↳ Sub-Node: {childCardData.title}</span>
                      <span className="font-mono text-muted-text">({childProgress}% completed)</span>
                    </button>
                  )}
                </div>

                {/*  controls / actions */}
                <div className=" flex items-center gap-1 transition-opacity shrink-0">
                  {/* Note / Checkbox switcher */}
                  <button
                    onClick={() => toggleTaskCheckboxMode(cardId, task.id)}
                    className={cn(
                      "p-1.5 rounded-small hover:bg-accent/10 transition-colors text-muted-text hover:text-accent cursor-pointer"
                    )}
                    title={task.isCheckbox ? "Make inline Plain Note" : "Turn into Checkbox Task"}
                  >
                    {task.isCheckbox ? (
                      <FileText size={13} className="text-accent" />
                    ) : (
                      <CheckSquare size={13} />
                    )}
                  </button>

                  {/* Create / Navigate Sub-Node sign */}
                  {hasChildCard ? (
                    <button
                      onClick={() => setActiveCard(task.childCardId, 'in')}
                      className="p-1.5 rounded-small hover:bg-accent/10 text-accent transition-colors cursor-pointer"
                      title="Navigate down to sub-node"
                    >
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateSubNode(task.id, task.text)}
                      className="p-1.5 rounded-small hover:bg-accent/10 text-accent hover:scale-105 transition-all cursor-pointer"
                      title="Nesting sub-node inside this task"
                    >
                      <Plus size={14} />
                    </button>
                  )}

                  {/* Delete Item */}
                  <button 
                    onClick={() => deleteTask(cardId, task.id)}
                    className="p-1.5 rounded-small hover:bg-red-500/10 text-border hover:text-red-500 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {card.tasks.length === 0 && (
          <div className="text-center py-6 border border-dashed border-border/40 rounded-card p-4 space-y-2">
            <p className="text-xs text-muted-text italic">
              Stream is empty. No tasks or notes written yet.
            </p>
          </div>
        )}
      </div>

      {/* Adding Box Form */}
      <form onSubmit={handleAddTask} className="p-3 bg-card border border-border rounded-card shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Quick indicator switcher in footer */}
          <button
            type="button"
            onClick={() => setIsCheckMode(!isCheckMode)}
            className={cn(
              "p-1.5 rounded-small border transition-all cursor-pointer",
              isCheckMode 
                ? "bg-accent/10 border-accent/20 text-accent" 
                : "border-border/60 text-muted-text hover:bg-accent/5 hover:text-accent"
            )}
            title={isCheckMode ? "Adding Checklist Tasks" : "Adding Plain Notes"}
          >
            {isCheckMode ? <CheckSquare size={14} /> : <FileText size={14} />}
          </button>

          <input
            type="text"
            placeholder={isCheckMode ? "Add a checkbox task..." : "Write a note line..."}
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] p-0 placeholder:text-border"
          />
        </div>
        
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-accent hover:opacity-90 transition-all text-active-text text-[10px] font-black uppercase tracking-wider rounded-small cursor-pointer"
        >
          Add Stream
        </button>
      </form>
    </div>
  );
};
