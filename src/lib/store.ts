
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContentType = 'image' | 'video';
export type VideoSource = 'youtube' | 'tiktok' | 'url';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  source: string;
  videoSource?: VideoSource;
  duration: number; // Duration in seconds
  useVideoDuration?: boolean; // Nova propriedade para indicar se deve usar a duração real do vídeo
  active: boolean;
  createdAt: Date;
}

interface ContentStore {
  items: ContentItem[];
  activeItemIndex: number;
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<Omit<ContentItem, 'id' | 'createdAt'>>) => void;
  removeItem: (id: string) => void;
  setActiveItemIndex: (index: number) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      items: [],
      activeItemIndex: 0,
      addItem: (item) => 
        set((state) => ({
          items: [
            ...state.items,
            { 
              ...item, 
              id: crypto.randomUUID(),
              createdAt: new Date() 
            }
          ]
        })),
      updateItem: (id, updates) => 
        set((state) => ({
          items: state.items.map((item) => 
            item.id === id ? { ...item, ...updates } : item
          )
        })),
      removeItem: (id) => 
        set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        })),
      setActiveItemIndex: (index) => 
        set({ activeItemIndex: index }),
      moveItem: (fromIndex, toIndex) => 
        set((state) => {
          const newItems = [...state.items];
          const [movedItem] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, movedItem);
          return { items: newItems };
        }),
    }),
    {
      name: 'vibe-screen-content'
    }
  )
);
