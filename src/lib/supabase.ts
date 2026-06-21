import { createClient, SupabaseClient } from '@supabase/supabase-js';

/// <reference types="vite/client" />

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Tables {
  menu_items: MenuItem;
  ingredients: Ingredient;
  tables: Table;
  reservations: Reservation;
  customers: Customer;
  active_orders: Order;
  completed_orders: Order;
  waste_records: WasteRecord;
}

export type TableName = keyof Tables;

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  ingredients: Array<{ name: string; quantityNeeded: number; unit: string }>;
  isAvailable: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  costPerUnit: number;
  minStock: number;
  created_at?: string;
  updated_at?: string;
};

export type Table = {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  occupiedSince?: string;
  created_at?: string;
  updated_at?: string;
};

export type Reservation = {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinium';
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: string;
  tableId?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    name: string;
    price: number;
    notes?: string;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'gift-card';
  customerName?: string;
  customerPhone?: string;
  created_at?: string;
  updated_at?: string;
};

export type WasteRecord = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  reason: string;
  cost: number;
  recordedBy?: string;
  created_at?: string;
  updated_at?: string;
};

class SupabaseStorageService {
  private static isOnline = true;

  static async getData<T>(tableName: TableName): Promise<T[]> {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          localStorage.setItem(`tableflow_${tableName}`, JSON.stringify(data));
          return data as T[];
        }
      }
    } catch (e) {
      console.warn(`Supabase table ${tableName} error, falling back to LocalStorage:`, e);
      this.isOnline = false;
    }

    const localData = localStorage.getItem(`tableflow_${tableName}`);
    return localData ? JSON.parse(localData) : [];
  }

  static async saveData<T extends { id: string }>(tableName: TableName, items: T[]): Promise<void> {
    localStorage.setItem(`tableflow_${tableName}`, JSON.stringify(items));

    try {
      if (this.isOnline) {
        const { error } = await supabase
          .from(tableName)
          .upsert(items, { onConflict: 'id' });

        if (error) throw error;
      }
    } catch (e) {
      console.warn(`Error writing to Supabase ${tableName}:`, e);
      this.isOnline = false;
    }
  }

  static async saveSingleItem<T extends { id: string }>(tableName: TableName, item: T): Promise<void> {
    const localData = localStorage.getItem(`tableflow_${tableName}`);
    const list: T[] = localData ? JSON.parse(localData) : [];

    const index = list.findIndex(i => i.id === item.id);
    if (index > -1) {
      list[index] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(`tableflow_${tableName}`, JSON.stringify(list));

    try {
      if (this.isOnline) {
        const { error } = await supabase
          .from(tableName)
          .upsert(item, { onConflict: 'id' });

        if (error) throw error;
      }
    } catch (e) {
      console.warn(`Error saving single item in ${tableName}:`, e);
      this.isOnline = false;
    }
  }

  static async deleteItem(tableName: TableName, id: string): Promise<void> {
    const localData = localStorage.getItem(`tableflow_${tableName}`);
    const list = localData ? JSON.parse(localData) : [];
    const filtered = list.filter((item: { id: string }) => item.id !== id);
    localStorage.setItem(`tableflow_${tableName}`, JSON.stringify(filtered));

    try {
      if (this.isOnline) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
    } catch (e) {
      console.warn(`Error deleting item from ${tableName}:`, e);
      this.isOnline = false;
    }
  }

  static async seedIfEmpty<T extends { id: string }>(tableName: TableName, defaults: T[]): Promise<T[]> {
    const existing = await this.getData<T>(tableName);
    if (existing.length === 0) {
      await this.saveData(tableName, defaults);
      return defaults;
    }
    return existing;
  }

  static async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from('menu_items').select('id', { count: 'exact', head: true });
      this.isOnline = !error;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }
}

export const StorageService = SupabaseStorageService;