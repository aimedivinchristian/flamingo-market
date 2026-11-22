import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
export interface CartItem { id: string; name: string; price: number; oldPrice?: number | null; image?: string; seller: string; category: string; quantity: number; size?: string; color?: string; }
interface CartState {
  items: CartItem[]; isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void; updateQty: (id: string, qty: number) => void; clearCart: () => void;
  openCart: () => void; closeCart: () => void; toggleCart: () => void;
  totalItems: () => number; totalPrice: () => number; isInCart: (id: string) => boolean;
}
export const useCart = create<CartState>()(persist((set, get) => ({
  items: [], isOpen: false,
  addItem: (item, qty = 1) => set(state => {
    const existing = state.items.find(i => i.id === item.id);
    if (existing) return { items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i), isOpen: true };
    return { items: [...state.items, { ...item, quantity: qty }], isOpen: true };
  }),
  removeItem: (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),
  updateQty: (id, qty) => { if (qty <= 0) { get().removeItem(id); return; } set(state => ({ items: state.items.map(i => i.id === id ? { ...i, quantity: qty } : i) })); },
  clearCart: () => set({ items: [] }), openCart: () => set({ isOpen: true }), closeCart: () => set({ isOpen: false }), toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0), totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0), isInCart: (id) => get().items.some(i => i.id === id),
}), { name: "flamingo-cart", storage: createJSONStorage(() => typeof window !== "undefined" ? localStorage : ({ getItem:()=>null, setItem:()=>{}, removeItem:()=>{} } as any)), partialize: (state) => ({ items: state.items }) }));
