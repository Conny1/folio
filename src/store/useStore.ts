import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { indexedDBStorage } from '../lib/indexedDBStorage';

export type CardType = 'note' | 'checklist' | 'mixed';

export interface Task {
  id: string;
  text: string;
  done: boolean;
  isCheckbox?: boolean; // whether this is checkable or just a note line
  childCardId?: string; // optional linked child card ID
}

export interface Card {
  id: string;
  title: string;
  note: string;
  type: CardType;
  tasks: Task[];
  children: Card[];
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

interface FolioState {
  roots: Card[];
  activeCardId: string | null;
  navigationDirection: 'in' | 'out';
  
  // Actions
  setRoots: (roots: Card[]) => void;
  setActiveCard: (id: string | null, direction?: 'in' | 'out') => void;
  addRootCard: (type: CardType, title: string) => void;
  addChildCard: (parentId: string, type: CardType, title: string) => void;
  addChildCardForTask: (cardId: string, taskId: string, type: CardType, title: string) => string;
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'children'>>) => void;
  updateCardType: (id: string, type: CardType) => void;
  deleteCard: (id: string) => void;
  addTask: (cardId: string, text: string, isCheckbox?: boolean) => void;
  toggleTask: (cardId: string, taskId: string) => void;
  toggleTaskCheckboxMode: (cardId: string, taskId: string) => void;
  deleteTask: (cardId: string, taskId: string) => void;
  updateTask: (cardId: string, taskId: string, text: string) => void;
}

const createNewCard = (title: string, type: CardType = 'note'): Card => ({
  id: uuidv4(),
  title,
  note: '',
  type,
  tasks: [],
  children: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const findAndModify = (cards: Card[], id: string, modifier: (card: Card) => Card): Card[] => {
  return cards.map(card => {
    if (card.id === id) {
      return modifier(card);
    }
    if (card.children.length > 0) {
      return { ...card, children: findAndModify(card.children, id, modifier) };
    }
    return card;
  });
};

const findAndDelete = (cards: Card[], id: string): Card[] => {
  return cards
    .filter(card => card.id !== id)
    .map(card => ({
      ...card,
      children: findAndDelete(card.children, id)
    }));
};

export const useStore = create<FolioState>()(
  persist(
    (set, get) => ({
      roots: [],
      activeCardId: null,
      navigationDirection: 'in',

      setRoots: (roots) => set({ roots }),
      setActiveCard: (id, direction = 'in') => set({ activeCardId: id, navigationDirection: direction }),

      addRootCard: (type, title) => set((state) => {
        const newCard = createNewCard(title, type);
        return { 
          roots: [...state.roots, newCard],
          activeCardId: newCard.id
        };
      }),

      addChildCard: (parentId, type, title) => set((state) => {
        const newCard = createNewCard(title, type);
        const newRoots = findAndModify(state.roots, parentId, (card) => ({
          ...card,
          children: [...card.children, newCard],
          updatedAt: Date.now()
        }));

        return { 
          roots: newRoots,
          activeCardId: newCard.id
        };
      }),

      addChildCardForTask: (cardId, taskId, type, title) => {
        const newCardId = uuidv4();
        set((state) => {
          const newCard: Card = {
            id: newCardId,
            title,
            note: '',
            type,
            tasks: [],
            children: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          const newRoots = findAndModify(state.roots, cardId, (card) => {
            return {
              ...card,
              children: [...card.children, newCard],
              tasks: card.tasks.map(t => t.id === taskId ? { ...t, childCardId: newCardId } : t),
              updatedAt: Date.now()
            };
          });
          
          return {
            roots: newRoots
          };
        });
        return newCardId;
      },

      updateCard: (id, updates) => set((state) => {
        const newRoots = findAndModify(state.roots, id, (card) => ({
          ...card,
          ...updates,
          updatedAt: Date.now()
        }));
        return { roots: newRoots };
      }),

      updateCardType: (id, type) => set((state) => {
        const newRoots = findAndModify(state.roots, id, (card) => ({
          ...card,
          type,
          updatedAt: Date.now()
        }));
        return { roots: newRoots };
      }),

      deleteCard: (id) => set((state) => {
        const newRoots = findAndDelete(state.roots, id);
        return {
          roots: newRoots,
          activeCardId: state.activeCardId === id ? (newRoots[0]?.id || null) : state.activeCardId
        };
      }),

      addTask: (cardId, text, isCheckbox = false) => set((state) => {
        const newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: [...card.tasks, { id: uuidv4(), text, done: false, isCheckbox }],
          updatedAt: Date.now()
        }));
        return { roots: newRoots };
      }),

      toggleTask: (cardId, taskId) => set((state) => {
        const newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: card.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
          updatedAt: Date.now()
        }));
        return { roots: newRoots };
      }),

      toggleTaskCheckboxMode: (cardId, taskId) => set((state) => {
        const newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: card.tasks.map(t => {
            if (t.id === taskId) {
              const nextIsCheckbox = !t.isCheckbox;
              return { 
                ...t, 
                isCheckbox: nextIsCheckbox,
                done: nextIsCheckbox ? t.done : false
              };
            }
            return t;
          }),
          updatedAt: Date.now()
        }));
        return { roots: newRoots };
      }),

      deleteTask: (cardId, taskId) => set((state) => {
        // Also clean up linked child cards if user deletes a task
        const cardToModify = findCardAndPath(state.roots, cardId);
        let childIdToDelete: string | undefined;
        if (cardToModify) {
          const task = cardToModify.card.tasks.find(t => t.id === taskId);
          childIdToDelete = task?.childCardId;
        }

        let newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: card.tasks.filter(t => t.id !== taskId),
          updatedAt: Date.now()
        }));

        if (childIdToDelete) {
          newRoots = findAndDelete(newRoots, childIdToDelete);
        }

        return { 
          roots: newRoots 
        };
      }),

      updateTask: (cardId, taskId, text) => set((state) => {
        // Also update linked child card's title to match task's new text
        const cardToModify = findCardAndPath(state.roots, cardId);
        let childIdToUpdate: string | undefined;
        if (cardToModify) {
          const task = cardToModify.card.tasks.find(t => t.id === taskId);
          childIdToUpdate = task?.childCardId;
        }

        let newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: card.tasks.map(t => t.id === taskId ? { ...t, text } : t),
          updatedAt: Date.now()
        }));

        if (childIdToUpdate) {
          newRoots = findAndModify(newRoots, childIdToUpdate, (child) => ({
            ...child,
            title: text,
            updatedAt: Date.now()
          }));
        }

        return { roots: newRoots };
      }),
    }),
    {
      name: 'folio-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        const sanitizeCard = (card: Card, parentId: string | null = null): Card => {
          let newId = card.id;
          if (!isUuid(card.id)) {
            newId = uuidv4();
          }

          return {
            ...card,
            id: newId,
            tasks: card.tasks.map(t => ({
              ...t,
              id: isUuid(t.id) ? t.id : uuidv4(),
              isCheckbox: t.isCheckbox !== undefined ? t.isCheckbox : true
            })),
            children: card.children.map(child => sanitizeCard(child, newId))
          };
        };

        // Seed if empty after hydration
        if (state.roots.length === 0) {
          const rootId = uuidv4();
          const child1Id = uuidv4();
          const child2Id = uuidv4();

          const demoRoot: Card = {
            id: rootId,
            title: '🚀 Folio Interactive Guide',
            note: '',
            type: 'mixed',
            tasks: [
              { id: uuidv4(), text: 'Welcome to your new spatial notebook! Each line can be a plain note or a tracked task.', done: false, isCheckbox: false },
              { id: uuidv4(), text: 'Click the toggle checkbox icon on any line to switch between "Note" and "Checkbox Task" modes.', done: false, isCheckbox: false },
              { id: uuidv4(), text: 'Try completing this checklist task to see progress update in real-time!', done: false, isCheckbox: true },
              { id: uuidv4(), text: 'You can nest sub-cards within tasks recursively using the Plus (+) button next to any line.', done: false, isCheckbox: false },
              { id: uuidv4(), text: 'Explore the "Personal Goals" checklist attached directly as a child card!', done: false, isCheckbox: true, childCardId: child1Id },
              { id: uuidv4(), text: 'Check out "Work Workspace" here', done: false, isCheckbox: true, childCardId: child2Id }
            ],
            children: [
              {
                id: child1Id,
                title: 'Personal Goals',
                note: '',
                type: 'note',
                tasks: [
                  { id: uuidv4(), text: 'Drink more water daily', done: true, isCheckbox: true },
                  { id: uuidv4(), text: 'Read 12 books this year (One book per month)', done: false, isCheckbox: true },
                  { id: uuidv4(), text: 'Start morning meditation routines', done: false, isCheckbox: false }
                ],
                children: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
              },
              {
                id: child2Id,
                title: 'Work Workspace',
                note: '',
                type: 'checklist',
                tasks: [
                  { id: uuidv4(), text: 'Finalize Q1 strategic briefing notes', done: false, isCheckbox: true },
                  { id: uuidv4(), text: 'Send updated project budget sheets', done: false, isCheckbox: true }
                ],
                children: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
            ],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          state.roots = [demoRoot];
          state.activeCardId = demoRoot.id;
        } else {
          // Sanitize existing roots if they contain non-UUID IDs
          const needsSanitization = state.roots.some(r => !isUuid(r.id));
          if (needsSanitization) {
            const oldActiveId = state.activeCardId;
            let newActiveId = null;

            const sanitizedRoots = state.roots.map(root => {
              const sanitized = sanitizeCard(root);
              if (root.id === oldActiveId) newActiveId = sanitized.id;
              return sanitized;
            });

            state.roots = sanitizedRoots;
            state.activeCardId = newActiveId || (sanitizedRoots[0]?.id || null);
          }
        }
      }
    }
  )
);

// Helper to calculate progress recursively taking into account:
// 1. All checkable tasks.
// 2. Unreferenced child cards.
// If a task is linked to a child card, the task's progress matches the child card's progress, 
// and the task cannot be set 100% done until the child card is 100% complete.
export const calculateProgress = (card: Card): number => {
  const checkableTasks = card.tasks.filter(t => t.isCheckbox);
  
  const referencedChildIds = new Set(
    card.tasks.map(t => t.childCardId).filter(Boolean)
  );
  
  const unreferencedChildren = card.children.filter(child => !referencedChildIds.has(child.id));
  
  const items: number[] = [];
  
  for (const task of checkableTasks) {
    if (task.childCardId) {
      const childCard = card.children.find(child => child.id === task.childCardId);
      if (childCard) {
        const childProg = calculateProgress(childCard);
        items.push(childProg);
      } else {
        items.push(task.done ? 100 : 0);
      }
    } else {
      items.push(task.done ? 100 : 0);
    }
  }
  
  for (const child of unreferencedChildren) {
    items.push(calculateProgress(child));
  }
  
  if (items.length === 0) {
    return 0;
  }
  
  const sum = items.reduce((acc, val) => acc + val, 0);
  const result = Math.round(sum / items.length);
  return result;
};

// Helper to find a card and its path
export const findCardAndPath = (roots: Card[], id: string, path: Card[] = []): { card: Card; path: Card[] } | null => {
  for (const root of roots) {
    if (root.id === id) return { card: root, path: [...path, root] };
    if (root.children.length > 0) {
      const found = findCardAndPath(root.children, id, [...path, root]);
      if (found) return found;
    }
  }
  return null;
};
