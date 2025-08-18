import { TagItem } from "@/types/tagview";
import { create } from "zustand";

export const TagsViewMax = 1000;

// 定义 store 的状态和动作类型
interface TagsViewState {
  tags: TagItem[];
  addTag: (tag: Omit<TagItem, 'active'>) => void;
  removeTag: (key: string) => void;
  clearTags: () => void;
  updateTag: (tag: TagItem) => void;
  updateTags: (tags: TagItem[]) => void;
  include: string[];
}

// 辅助函数（从你的reducer中提取）
const deleteKeepAlive = (state: TagItem[], { key }: { key: string }): TagItem[] => {
  const index = state.findIndex((item) => item.key === key);
  if (index === -1) return state;
  return state.filter((_, i) => i !== index);
};

const addKeepAlive = (state: TagItem[], newItem: Omit<TagItem, 'active'>): TagItem[] => {
  if (state.some((item) => item.key === newItem.key && item.active)) {
    return state;
  }

  let isNew = true;
  const updatedState = state.map(item => {
    if (item.key === newItem.key) {
      isNew = false;
      return { ...item, active: true };
    }
    return { ...item, active: false };
  });

  if (isNew) {
    if (updatedState.length >= TagsViewMax) {
      updatedState.shift();
    }
    updatedState.push({ ...newItem, active: true });
  }
  return updatedState;
};

const updateKeepAlive = (state: TagItem[], item: TagItem): TagItem[] => {
  return state.map(existing =>
    existing.key === item.key ? { ...existing, ...item } : existing
  );
};

const updateKeepAliveList = (state: TagItem[], items: TagItem[]): TagItem[] => {
  return state.map(existing => {
    const updatedItem = items.find(item => item.key === existing.key);
    return updatedItem ? { ...existing, ...updatedItem } : existing;
  });
};

// 创建 store
export const useTagsViewStore = create<TagsViewState>((set, get) => ({
  tags: [],
  include: [],
  
  addTag: (tag) => {
    set((state) => ({
      tags: addKeepAlive(state.tags, tag),
      include: [...state.include, tag.key]
    }));
  },
  
  removeTag: (key) => {
    set((state) => ({
      tags: deleteKeepAlive(state.tags, { key }),
      include: state.include.filter(k => k !== key)
    }));
  },
  
  clearTags: () => {
    set({ tags: [], include: [] });
  },
  
  updateTag: (tag) => {
    set((state) => ({
      tags: updateKeepAlive(state.tags, tag)
    }));
  },
  
  updateTags: (tags) => {
    set((state) => ({
      tags: updateKeepAliveList(state.tags, tags)
    }));
  }
}));