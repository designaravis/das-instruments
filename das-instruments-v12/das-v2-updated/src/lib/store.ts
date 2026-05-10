import { Product } from "@/data/products";
import { CATEGORIES } from "@/data/categories";

interface CartItem extends Product {
  qty: number;
}

interface AppState {
  page: string;
  setPage: (page: string) => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCat: string | null;
  setSelectedCat: (cat: string | null) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product) => void;
}

export type { CartItem, AppState };

export function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function getCategoryName(categoryId: string): string {
  return CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
}
