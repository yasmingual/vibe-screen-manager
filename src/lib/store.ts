import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from "@/integrations/supabase/client";

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
  leftBackgroundImage?: string; // New property for left background image
  rightBackgroundImage?: string; // New property for right background image
  description?: string;
}

interface ContentStore {
  items: ContentItem[];
  activeItemIndex: number;
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<Omit<ContentItem, 'id' | 'createdAt'>>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  setActiveItemIndex: (index: number) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      items: [],
      activeItemIndex: 0,
      isLoading: false,
      
      fetchItems: async () => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase
            .from('content_items')
            .select('*')
            .order('created_at', { ascending: true });
            
          if (error) {
            console.error('Error fetching items:', error);
            throw error;
          }
          
          // Transform from DB format to store format
          const items = data.map((item) => ({
            id: item.id,
            type: item.type as ContentType,
            title: item.title,
            source: item.source,
            videoSource: item.video_source as VideoSource | undefined,
            duration: item.duration,
            useVideoDuration: item.use_video_duration,
            active: item.active,
            createdAt: new Date(item.created_at),
            leftBackgroundImage: item.left_background_image,
            rightBackgroundImage: item.right_background_image
          }));
          
          set({ items, isLoading: false });
        } catch (error) {
          console.error('Error fetching items:', error);
          set({ isLoading: false });
        }
      },
      
      addItem: async (item) => {
        try {
          // Insert into Supabase
          const { data, error } = await supabase
            .from('content_items')
            .insert({
              type: item.type,
              title: item.title,
              source: item.source,
              video_source: item.videoSource,
              duration: item.duration,
              use_video_duration: item.useVideoDuration,
              active: item.active,
              left_background_image: item.leftBackgroundImage,
              right_background_image: item.rightBackgroundImage
            })
            .select()
            .single();
            
          if (error) {
            console.error('Error adding item:', error);
            return;
          }
          
          // Add to local state
          const newItem = {
            id: data.id,
            type: data.type as ContentType,
            title: data.title,
            source: data.source,
            videoSource: data.video_source as VideoSource | undefined,
            duration: data.duration,
            useVideoDuration: data.use_video_duration,
            active: data.active,
            createdAt: new Date(data.created_at),
            leftBackgroundImage: data.left_background_image,
            rightBackgroundImage: data.right_background_image
          };
          
          set((state) => ({ items: [...state.items, newItem] }));
        } catch (error) {
          console.error('Error adding item:', error);
        }
      },
      
      updateItem: async (id, updates) => {
        try {
          // Convert store format to DB format
          const dbUpdates: any = {};
          if (updates.title !== undefined) dbUpdates.title = updates.title;
          if (updates.source !== undefined) dbUpdates.source = updates.source;
          if (updates.videoSource !== undefined) dbUpdates.video_source = updates.videoSource;
          if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
          if (updates.useVideoDuration !== undefined) dbUpdates.use_video_duration = updates.useVideoDuration;
          if (updates.active !== undefined) dbUpdates.active = updates.active;
          if (updates.type !== undefined) dbUpdates.type = updates.type;
          if (updates.leftBackgroundImage !== undefined) dbUpdates.left_background_image = updates.leftBackgroundImage;
          if (updates.rightBackgroundImage !== undefined) dbUpdates.right_background_image = updates.rightBackgroundImage;
          
          // Update in Supabase
          const { error } = await supabase
            .from('content_items')
            .update(dbUpdates)
            .eq('id', id);
            
          if (error) {
            console.error('Error updating item:', error);
            return;
          }
          
          // Update local state
          set((state) => ({
            items: state.items.map((item) => 
              item.id === id ? { ...item, ...updates } : item
            )
          }));
        } catch (error) {
          console.error('Error updating item:', error);
        }
      },
      
      removeItem: async (id) => {
        try {
          // Delete from Supabase
          const { error } = await supabase
            .from('content_items')
            .delete()
            .eq('id', id);
            
          if (error) {
            console.error('Error removing item:', error);
            return;
          }
          
          // Remove from local state
          set((state) => ({
            items: state.items.filter((item) => item.id !== id)
          }));
        } catch (error) {
          console.error('Error removing item:', error);
        }
      },
      
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
