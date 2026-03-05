import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  fitScore: number;
  category: string;
  price: string;
}

interface TailoredStore {
  // User profile
  userName: string;
  height: number; // cm
  weight: number; // kg
  bodyType: "ectomorph" | "mesomorph" | "endomorph" | null;
  measurements: { chest: number; waist: number; hips: number; shoulder: number; inseam: number };
  hasCompletedProfile: boolean;
  hasCompletedOnboarding: boolean;
  setProfile: (data: Partial<Omit<TailoredStore, "setProfile" | "addItem" | "toggleStylePreference">>) => void;

  // Clothing items
  savedItems: ClothingItem[];
  addItem: (item: ClothingItem) => void;

  // Style preferences
  stylePreferences: string[];
  toggleStylePreference: (pref: string) => void;
}

const useTailoredStore = create<TailoredStore>()(
  persist(
    (set, get) => ({
      // Default profile state
      userName: "Alex",
      height: 175,
      weight: 70,
      bodyType: null,
      measurements: { chest: 0, waist: 0, hips: 0, shoulder: 0, inseam: 0 },
      hasCompletedProfile: false,
      hasCompletedOnboarding: false,

      setProfile: (data) => set((state) => ({ ...state, ...data })),

      // Clothing items
      savedItems: [
        { id: "1", name: "Slim Fit Oxford Shirt", brand: "Uniqlo", imageUrl: null, fitScore: 92, category: "shirt", price: "$29.90" },
        { id: "2", name: "Tapered Chino Trousers", brand: "Zara", imageUrl: null, fitScore: 76, category: "pants", price: "$49.90" },
        { id: "3", name: "Oversized Linen Blazer", brand: "H&M", imageUrl: null, fitScore: 58, category: "jacket", price: "$79.99" },
        { id: "4", name: "Ribbed Turtleneck Sweater", brand: "COS", imageUrl: null, fitScore: 88, category: "top", price: "$89.00" },
        { id: "5", name: "Wide Leg Denim Jeans", brand: "Levi's", imageUrl: null, fitScore: 71, category: "pants", price: "$98.00" },
      ],
      addItem: (item) => set((state) => ({ savedItems: [...state.savedItems, item] })),

      // Style preferences
      stylePreferences: ["Minimalist"],
      toggleStylePreference: (pref) =>
        set((state) => ({
          stylePreferences: state.stylePreferences.includes(pref)
            ? state.stylePreferences.filter((p) => p !== pref)
            : [...state.stylePreferences, pref],
        })),
    }),
    {
      name: "tailored-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTailoredStore;
