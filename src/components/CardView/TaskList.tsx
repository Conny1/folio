import React, { useState, useRef, useEffect } from 'react';
import { useStore, calculateProgress } from '../../store/useStore';
import { Plus, Trash2, CheckCircle2, Circle, ChevronRight, FileText, CheckSquare, CornerDownRight, ArrowLeft } from 'lucide-react';
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
  const [isCheckMode, setIsCheckMode] = useState(false);
  
  // Modal State for focused full-screen writing
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

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
    const fallbackTitle = originalText.trim().substring(0, 20) + (originalText.length > 20 ? "..." : "");
    const defaultTitle = fallbackTitle || "Untitled Sub-Note";
    const subCardId = addChildCardForTask(cardId, taskId, 'mixed', defaultTitle);
    setActiveCard(subCardId, 'in');
  };

  // Keep modal view synchronized with global store modifications
  const activeTaskInStore = card.tasks.find((t: any) => t.id === selectedTask?.id);

  return (
    <div className="space-y-4">
      
      {/* 1. THE STREAM LISTING COMPONENT WITH ALL ACTIONS ACCESSIBLE */}
      <div className="space-y-1 divide-y divide-border/5">
        {card.tasks.map((task: any) => {
          const hasChildCard = !!task.childCardId;
          const childCardData = hasChildCard ? card.children?.find((c: any) => c.id === task.childCardId) : null;
          const childProgress = childCardData ? calculateProgress(childCardData) : 0;
          const isChildDone = childCardData && childProgress === 100;
          const displayDone = hasChildCard ? isChildDone : task.done;

          const subNodeDisplayName = childCardData?.title 
            ? (childCardData.title.length > 22 ? childCardData.title.substring(0, 22) + '...' : childCardData.title)
            : "Sub-Node";

          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="group flex flex-col sm:flex-row sm:items-start justify-between gap-2 py-3 px-2 -mx-2 rounded-small cursor-pointer transition-colors hover:bg-accent/5 active:bg-accent/10"
            >
              {/* Left Side: Content Stream & Prefix */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Context Marker */}
                {task.isCheckbox ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasChildCard) toggleTask(cardId, task.id);
                      else setActiveCard(task.childCardId, 'in');
                    }}
                    className="transition-colors shrink-0 mt-0.5 text-border hover:text-accent cursor-pointer"
                  >
                    {displayDone ? <CheckCircle2 size={17} className="text-[#7A9A50]" /> : <Circle size={17} />}
                  </button>
                ) : (
                  <div className="text-muted-text/40 shrink-0 select-none pt-0.5 pl-1 text-xs font-mono">•</div>
                )}

                {/* Note Content Block */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-[14px] leading-relaxed text-text font-sans break-words whitespace-pre-wrap line-clamp-3",
                    displayDone && "line-through text-muted-text/40",
                    !task.text && "italic text-border/60 text-[13px]"
                  )}>
                    {task.text || "Empty note. Tap to write..."}
                  </p>

                  {/* Sub-Node Attachment Badge (Clean layout wrapper) */}
                  {hasChildCard && childCardData && (
                    <div className="mt-2 flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCard(task.childCardId, 'in');
                        }}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/5 border border-accent/10 text-[11px] font-medium text-accent hover:bg-accent/10 transition-colors cursor-pointer"
                      >
                        <CornerDownRight size={10} />
                        <span className="font-semibold">{subNodeDisplayName}</span>
                        <span className="text-[10px] opacity-60 font-mono">({childProgress}%)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: INLINE RESTORED ACTIONS TRAY (Mobile & Desktop Responsive) */}
              <div 
                className="flex items-center justify-end gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity pt-1 sm:pt-0 shrink-0"
                onClick={(e) => e.stopPropagation()} // Stop action taps from triggering full-screen modal
              >
                {/* Note / Checkbox Mode Switcher */}
                <button
                  onClick={() => toggleTaskCheckboxMode(cardId, task.id)}
                  className="p-1.5 rounded-small text-muted-text hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer"
                  title={task.isCheckbox ? "Turn into text note" : "Turn into task checkbox"}
                >
                  {task.isCheckbox ? <FileText size={14} /> : <CheckSquare size={14} />}
                </button>

                {/* Subnode Creation / Explicit Drill-down Navigate Button */}
                {hasChildCard ? (
                  <button
                    onClick={() => setActiveCard(task.childCardId, 'in')}
                    className="p-1.5 rounded-small bg-accent/5 hover:bg-accent/10 text-accent transition-colors flex items-center gap-0.5 text-[11px] font-bold px-2 cursor-pointer"
                    title="Navigate directly down to sub-node"
                  >
                    <span>Go</span>
                    <ChevronRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateSubNode(task.id, task.text)}
                    className="p-1.5 rounded-small text-accent hover:bg-accent/5 transition-colors cursor-pointer"
                    title="Nesting sub-node inside this entry"
                  >
                    <Plus size={14} />
                  </button>
                )}

                {/* Delete Entry directly from list */}
                <button 
                  onClick={() => deleteTask(cardId, task.id)}
                  className="p-1.5 rounded-small text-border hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          );
        })}

        {card.tasks.length === 0 && (
          <div className="text-center py-12 text-xs text-muted-text/50 italic font-sans">
            No notes or streams captured yet. Tap below to write.
          </div>
        )}
      </div>

      {/* QUICK INTAKE FOOTER */}
      <form 
        onSubmit={handleAddTask} 
        className="pt-3 border-t border-border/10 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsCheckMode(!isCheckMode)}
            className="p-1.5 rounded text-muted-text/60 hover:text-accent hover:bg-accent/5 transition-colors cursor-pointer shrink-0"
          >
            {isCheckMode ? <CheckSquare size={15} /> : <FileText size={15} />}
          </button>

          <input
            type="text"
            placeholder={isCheckMode ? "Take a quick checklist item..." : "Take a quick stream note..."}
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[13.5px] p-0 placeholder:text-muted-text/30 text-text"
          />
        </div>
        
        {newTaskText.trim() && (
          <button
            type="submit"
            className="text-[11px] font-bold text-accent px-2 py-1 hover:bg-accent/5 rounded cursor-pointer"
          >
            Save
          </button>
        )}
      </form>

      {/* 2. FULL SCREEN MODAL WRITING SHEET */}
      <AnimatePresence>
        {selectedTask && activeTaskInStore && (
          <NoteWorkspaceModal
            task={activeTaskInStore}
            card={card}
            cardId={cardId}
            onClose={() => setSelectedTask(null)}
            updateTask={updateTask}
            toggleTaskCheckboxMode={toggleTaskCheckboxMode}
            handleCreateSubNode={handleCreateSubNode}
            deleteTask={deleteTask}
            setActiveCard={setActiveCard}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

/* --- DETACHED WORKSPACE COMPONENT LAYER --- */
interface NoteWorkspaceModalProps {
  task: any;
  card: any;
  cardId: string;
  onClose: () => void;
  updateTask: (cardId: string, taskId: string, text: string) => void;
  toggleTaskCheckboxMode: (cardId: string, taskId: string) => void;
  handleCreateSubNode: (taskId: string, text: string) => void;
  deleteTask: (cardId: string, taskId: string) => void;
  setActiveCard: (id: string, dir: "in" | "out") => void;
}

const NoteWorkspaceModal: React.FC<NoteWorkspaceModalProps> = ({
  task,
  card,
  cardId,
  onClose,
  updateTask,
  toggleTaskCheckboxMode,
  handleCreateSubNode,
  deleteTask,
  setActiveCard
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hasChildCard = !!task.childCardId;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between"
    >
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full">
        
        {/* Top Control Header Utilities */}
        <div className="flex items-center justify-between pb-4 border-b border-border/10 shrink-0">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full text-muted-text hover:text-text hover:bg-accent/10 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Close Note</span>
          </button>

          {/* Modal Action Matrix */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleTaskCheckboxMode(cardId, task.id)}
              className="p-2 rounded-small text-muted-text hover:text-accent hover:bg-accent/5 cursor-pointer"
            >
              {task.isCheckbox ? <FileText size={15} /> : <CheckSquare size={15} />}
            </button>

            {hasChildCard ? (
              <button
                onClick={() => {
                  onClose();
                  setActiveCard(task.childCardId, 'in');
                }}
                className="p-1.5 px-2.5 rounded-small bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Subnode</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  handleCreateSubNode(task.id, task.text);
                }}
                className="p-1.5 px-2.5 rounded-small text-accent hover:bg-accent/5 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Sub-card</span>
              </button>
            )}

            <button 
              onClick={() => {
                deleteTask(cardId, task.id);
                onClose();
              }}
              className="p-2 rounded-small text-muted-text/50 hover:text-red-500 hover:bg-red-500/5 cursor-pointer ml-1"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Deep Writing Canvas Area */}
        <div className="flex-1 w-full pt-6 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={task.text}
            onChange={(e) => updateTask(cardId, task.id, e.target.value)}
            placeholder="Type absolute freedom notes here..."
            className="w-full h-full  bg-active-text p-3 border-none outline-none focus:ring-0 text-[15.5px] sm:text-[16px] leading-relaxed text-text font-sans  placeholder:text-muted-text/30 resize-none min-h-[300px]"
          />
        </div>
      </div>
    </motion.div>
  );
};