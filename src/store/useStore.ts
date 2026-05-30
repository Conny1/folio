import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { indexedDBStorage } from '../lib/indexedDBStorage';

export type CardType = 'note' | 'checklist' | 'mixed';

export interface Task {
  id: string;
  text: string;
  done: boolean;
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
  updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'children'>>) => void;
  updateCardType: (id: string, type: CardType) => void;
  deleteCard: (id: string) => void;
  addTask: (cardId: string, text: string) => void;
  toggleTask: (cardId: string, taskId: string) => void;
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

const findInTree = (cards: Card[], id: string): Card | null => {
  for (const card of cards) {
    if (card.id === id) return card;
    if (card.children.length > 0) {
      const found = findInTree(card.children, id);
      if (found) return found;
    }
  }
  return null;
};

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

      addTask: (cardId, text) => set((state) => {
        const newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: [...card.tasks, { id: uuidv4(), text, done: false }],
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

      deleteTask: (cardId, taskId) => set((state) => {
        const newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: card.tasks.filter(t => t.id !== taskId),
          updatedAt: Date.now()
        }));
        return { roots: newRoots };
      }),

      updateTask: (cardId, taskId, text) => set((state) => {
        const newRoots = findAndModify(state.roots, cardId, (card) => ({
          ...card,
          tasks: card.tasks.map(t => t.id === taskId ? { ...t, text } : t),
          updatedAt: Date.now()
        }));
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
              id: isUuid(t.id) ? t.id : uuidv4()
            })),
            children: card.children.map(child => sanitizeCard(child, newId))
          };
        };

        // Seed if empty after hydration
        if (state.roots.length === 0) {
          const rootId = uuidv4();
          const child1Id = uuidv4();
          const grandchild1Id = uuidv4();
          const child2Id = uuidv4();

          const demoRoot: Card = {
            id: rootId,
            title: '🚀 2026 Plan',
            note: 'Welcome to Folio! This is a tree-based note manager.\n\n- Everything is a card\n- Cards can have tasks\n- Cards can have children\n- Progress is automatic',
            type: 'mixed',
            tasks: [
              { id: uuidv4(), text: 'Learn Folio basics', done: true },
              { id: uuidv4(), text: 'Create my first tree', done: false }
            ],
            children: [
              {
                id: child1Id,
                title: 'Personal Goals',
                note: 'Focus on health and learning.',
                type: 'note',
                tasks: [],
                children: [
                   {
                    id: grandchild1Id,
                    title: 'Read 12 books',
                    note: 'One book per month.',
                    type: 'checklist',
                    tasks: [
                       { id: uuidv4(), text: 'Pick first book', done: false }
                    ],
                    children: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  }
                ],
                createdAt: Date.now(),
                updatedAt: Date.now()
              },
              {
                id: child2Id,
                title: 'Work Projects',
                note: 'Upcoming deadlines.',
                type: 'checklist',
                tasks: [
                  { id: uuidv4(), text: 'Finish Q1 report', done: false }
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

// Helper to calculate progress
export const calculateProgress = (card: Card): number => {
  if (card.tasks.length > 0) {
    const done = card.tasks.filter(t => t.done).length;
    return Math.round((done / card.tasks.length) * 100);
  }
  
  if (card.children.length > 0) {
    const totalProgress = card.children.reduce((acc, child) => acc + calculateProgress(child), 0);
    return Math.round(totalProgress / card.children.length);
  }
  
  return 0;
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
