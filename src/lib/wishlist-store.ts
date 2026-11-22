import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export interface WishlistItem { id: string; name: string; price: number; oldPrice?: number | null; image?: string; seller: string; category: string; rating?: number; stock: number; }
interface WishlistState { items: WishlistItem[]; addItem: (item: WishlistItem) => void; removeItem: (id: string) => void; toggle: (item: WishlistItem) => boolean; isWished: (id: string) => boolean; clear: () => void; count: () => number; }
export const useWishlist = create<WishlistState>()(persist((set, get) => ({
  items: [],
  addItem: (item) => set(state => ({ items: state.items.some(i => i.id === item.id) ? state.items : [...state.items, item] })),
  removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
  toggle: (item) => { const exists = get().isWished(item.id); exists ? get().removeItem(item.id) : get().addItem(item); return !exists; },
  isWished: (id) => get().items.some(i => i.id === id), clear: () => set({ items: [] }), count: () => get().items.length,
}), { name: "flamingo-wishlist", storage: createJSONStorage(() => typeof window !== "undefined" ? localStorage : ({ getItem:()=>null, setItem:()=>{}, removeItem:()=>{} } as any)) }));
