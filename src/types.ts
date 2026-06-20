export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: 'Burgers' | 'Steaks & Fish' | 'Sides & Salads' | 'Desserts' | 'Drinks';
  ingredients: { name: string; quantityNeeded: number; unit: string }[];
  image: string;
  popular: boolean;
  available: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  occupiedSince?: string; // ISO date string
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tableId?: string; // undefined if takeout/delivery
  type: 'dine-in' | 'takeout' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  tax: number; // Resort Tax (Montana Specific: 3% or 4%)
  tip: number;
  total: number;
  createdAt: string;
  paymentMethod?: 'cash' | 'card' | 'gift-card';
  customerPhone?: string;
  customerName?: string;
  deliveryPlatform?: 'direct' | 'doordash' | 'ubereats';
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  dateTime: string;
  tableId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  joinDate: string;
  notes?: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinium';
}

export interface WasteRecord {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: string;
  date: string;
}
