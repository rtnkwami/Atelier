import { create } from "zustand";
import { CartItem, Cart } from "contracts";

const LOCAL_STORAGE_KEY = "cart";

type CartState = {
  items: CartItem[];
  loading: boolean;
  error?: string;
  isAuthenticated: boolean;
  // Actions
  setAuth: (authenticated: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: undefined,
  isAuthenticated: false,

  setAuth: (authenticated) => set({ isAuthenticated: authenticated }),

  fetchCart: async () => {
    const { isAuthenticated } = get();
    set({ loading: true, error: undefined });

    if (isAuthenticated) {
      const res = await fetch("/api/cart");
      
      if (!res.ok) {
        set({ error: "Failed to fetch cart", loading: false });
        return;
      }
      
      const data: Cart = await res.json();
      set({ items: data.items, loading: false });
    } else {
      // Guest → fetch from localStorage
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      set({ items: stored ? JSON.parse(stored) : [], loading: false });
    }
  },

  addItem: (item: CartItem) => {
    const { items } = get();
    const index = items.findIndex((i) => i.id === item.id);
    let newItems: CartItem[];

    if (index > -1) {
      newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        quantity: newItems[index].quantity + item.quantity,
      };
    } else {
      newItems = [...items, item];
    }

    set({ items: newItems });
    get().syncCart();
  },

  removeItem: (id: string) => {
    const { items } = get();
    const newItems = items.filter((i) => i.id !== id);
    set({ items: newItems });
    get().syncCart();
  },

  clearCart: () => {
    set({ items: [] });
    get().syncCart();
  },

  syncCart: async () => {
    const { isAuthenticated, items } = get();
    
    if (isAuthenticated) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  },
}));