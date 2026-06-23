export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: 'Burgers' | 'Steaks & Fish' | 'Sides & Salads' | 'Desserts' | 'Drinks' | 'Entradas' | 'Pratos Principais' | 'Sobremesas' | 'Bebidas' | 'Acompanhamentos';
  ingredients: { name: string; quantityNeeded: number; unit: string }[];
  image: string;
  popular: boolean;
  available: boolean;
  image_url?: string;
  isAvailable?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  created_at?: string;
  updated_at?: string;
}

export interface Table {
  id: string;
  name: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  occupiedSince?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  type?: 'dine-in' | 'takeout' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  tip?: number;
  total: number;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
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
  reservationTime?: string;
  tableId?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  joinDate?: string;
  notes?: string;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinium';
  totalSpent?: number;
  visitCount?: number;
  lastVisit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WasteRecord {
  id: string;
  ingredientId?: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
  reason: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
  recordedBy?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}