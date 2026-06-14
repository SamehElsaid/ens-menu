"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CAFE_LINA_MENU } from "./cafeLinaMenu";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type ExperienceContextValue = {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  addItem: (id: string, name: string, price: number) => void;
  addItemsById: (ids: string[], getName: (id: string) => string) => void;
  activeScene: number;
  setActiveScene: (index: number) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeScene, setActiveScene] = useState(0);

  const addItem = useCallback((id: string, name: string, price: number) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) =>
          line.id === id ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...prev, { id, name, price, qty: 1 }];
    });
  }, []);

  const addItemsById = useCallback(
    (ids: string[], getName: (id: string) => string) => {
      ids.forEach((id) => {
        const item = CAFE_LINA_MENU.find((m) => m.id === id);
        if (item) addItem(id, getName(id), item.price);
      });
    },
    [addItem],
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.qty, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      cartTotal,
      addItem,
      addItemsById,
      activeScene,
      setActiveScene,
    }),
    [cart, cartCount, cartTotal, addItem, addItemsById, activeScene],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience must be used within ExperienceProvider");
  }
  return ctx;
}
