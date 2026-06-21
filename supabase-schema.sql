-- TableFlow MT - Supabase Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu Items
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2),
  category TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingredients
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock NUMERIC(10,2) DEFAULT 0,
  cost_per_unit NUMERIC(10,2) DEFAULT 0,
  min_stock NUMERIC(10,2) DEFAULT 0,
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables
CREATE TABLE tables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  current_order_id TEXT,
  occupied_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  party_size INTEGER NOT NULL,
  reservation_time TIMESTAMPTZ NOT NULL,
  table_id TEXT REFERENCES tables(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  points INTEGER DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinium')),
  total_spent NUMERIC(10,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Orders
CREATE TABLE active_orders (
  id TEXT PRIMARY KEY,
  table_id TEXT REFERENCES tables(id),
  type TEXT DEFAULT 'dine-in' CHECK (type IN ('dine-in', 'takeout', 'delivery')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  tip NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'gift-card')),
  customer_name TEXT,
  customer_phone TEXT,
  delivery_platform TEXT CHECK (delivery_platform IN ('direct', 'doordash', 'ubereats')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Completed Orders
CREATE TABLE completed_orders (
  id TEXT PRIMARY KEY,
  table_id TEXT REFERENCES tables(id),
  type TEXT DEFAULT 'dine-in' CHECK (type IN ('dine-in', 'takeout', 'delivery')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  tip NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'gift-card')),
  customer_name TEXT,
  customer_phone TEXT,
  delivery_platform TEXT CHECK (delivery_platform IN ('direct', 'doordash', 'ubereats')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waste Records
CREATE TABLE waste_records (
  id TEXT PRIMARY KEY,
  ingredient_id TEXT REFERENCES ingredients(id),
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  reason TEXT NOT NULL,
  cost NUMERIC(10,2) NOT NULL,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_ingredients_stock ON ingredients(stock);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_reservations_time ON reservations(reservation_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_active_orders_table ON active_orders(table_id);
CREATE INDEX idx_active_orders_status ON active_orders(status);
CREATE INDEX idx_completed_orders_created ON completed_orders(created_at);
CREATE INDEX idx_waste_records_created ON waste_records(created_at);

-- Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for anon - adjust for production)
CREATE POLICY "Allow all operations on menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tables" ON tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reservations" ON reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on active_orders" ON active_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on completed_orders" ON completed_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on waste_records" ON waste_records FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_active_orders_updated_at BEFORE UPDATE ON active_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_completed_orders_updated_at BEFORE UPDATE ON completed_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waste_records_updated_at BEFORE UPDATE ON waste_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();