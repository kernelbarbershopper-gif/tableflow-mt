import { MenuItem, Ingredient, Table, Customer, Reservation } from '../types';

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Bison Smoked Burger',
    description: 'Montana-raised bison patty on a toasted brioche bun, sharp cheddar, local bourbon caramelized onions, and house rustic dynamic BBQ sauce. Served with skin-on fries.',
    price: 18.50,
    cost: 5.20,
    category: 'Burgers',
    ingredients: [
      { name: 'Bison Patty (8oz)', quantityNeeded: 1, unit: 'pcs' },
      { name: 'Brioche Bun', quantityNeeded: 1, unit: 'pcs' },
      { name: 'Cheddar Cheese', quantityNeeded: 1, unit: 'slice' },
      { name: 'Onions', quantityNeeded: 0.25, unit: 'kg' },
      { name: 'Potatoes (Fries)', quantityNeeded: 0.3, unit: 'kg' }
    ],
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    popular: true,
    available: true
  },
  {
    id: 'm2',
    name: 'Glacier Flathead Cherry Ribeye',
    description: '14oz flame-grilled Montana-certified Angus Ribeye topped with a sweet & tangy reduction of freshly picked Flathead Lake sweet cherries and organic rosemary.',
    price: 36.50,
    cost: 11.80,
    category: 'Steaks & Fish',
    ingredients: [
      { name: 'Angus Ribeye (14oz)', quantityNeeded: 1, unit: 'pcs' },
      { name: 'Flathead Cherries', quantityNeeded: 0.05, unit: 'kg' },
      { name: 'Butter', quantityNeeded: 0.02, unit: 'kg' },
      { name: 'Rosemary', quantityNeeded: 1, unit: 'sprig' }
    ],
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    popular: true,
    available: true
  },
  {
    id: 'm3',
    name: 'Flathead Lake Trout',
    description: 'Pan-seared fresh rainbow trout caught from the crystal clear waters of Flathead Lake, finished with direct garlic-herb lemon butter and wild pine nuts.',
    price: 24.50,
    cost: 7.10,
    category: 'Steaks & Fish',
    ingredients: [
      { name: 'Flathead Rainbow Trout', quantityNeeded: 1, unit: 'pcs' },
      { name: 'Lemon', quantityNeeded: 0.5, unit: 'pcs' },
      { name: 'Garlic Butter', quantityNeeded: 0.03, unit: 'kg' },
      { name: 'Pine Nuts', quantityNeeded: 0.01, unit: 'kg' }
    ],
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    popular: false,
    available: true
  },
  {
    id: 'm4',
    name: 'Wild Huckleberry Cheesecake',
    description: 'Deep and rich mountain cheesecake topped with a compote of hand-harvested wild forest Montana huckleberries from Glacier National Park region.',
    price: 9.50,
    cost: 1.95,
    category: 'Desserts',
    ingredients: [
      { name: 'Cheesecake Base Slice', quantityNeeded: 1, unit: 'pcs' },
      { name: 'Wild Huckleberries', quantityNeeded: 0.06, unit: 'kg' }
    ],
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    popular: true,
    available: true
  },
  {
    id: 'm5',
    name: 'Bozeman Gold Amber Ale',
    description: 'Crisp, locally brewed traditional copper-colored amber ale. Crafted by Bozeman brewing masters with fresh Gallatin valley mountain spring water.',
    price: 7.50,
    cost: 1.50,
    category: 'Drinks',
    ingredients: [
      { name: 'Bozeman Amber Keg', quantityNeeded: 1, unit: 'pint' }
    ],
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80',
    popular: true,
    available: true
  },
  {
    id: 'm6',
    name: 'Bitterroot Bison Sliders',
    description: 'Three mini bison patties on toasted brioche with huckleberry BBQ sauce, Montana cheddar, and pickled jalapeños.',
    price: 15.00,
    cost: 4.10,
    category: 'Burgers',
    ingredients: [
      { name: 'Bison Patty (Mini Spec)', quantityNeeded: 3, unit: 'pcs' },
      { name: 'Brioche Bun', quantityNeeded: 3, unit: 'pcs' },
      { name: 'Cheddar Cheese', quantityNeeded: 1.5, unit: 'slice' }
    ],
    image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=600&q=80',
    popular: false,
    available: true
  },
  {
    id: 'm7',
    name: 'Yellowstone Garden Salad',
    description: 'Organic field greens, fresh heirloom tomatoes, sheep milk feta cheese, direct Billings pine nuts, tossed in a house mountain lavender vinaigrette.',
    price: 12.00,
    cost: 2.30,
    category: 'Sides & Salads',
    ingredients: [
      { name: 'Organic Salad Mix', quantityNeeded: 0.15, unit: 'kg' },
      { name: 'Onions', quantityNeeded: 0.05, unit: 'kg' }
    ],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    popular: false,
    available: true
  }
];

export const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Bison Patty (8oz)', stock: 45, minStock: 15, unit: 'pcs', costPerUnit: 3.50, supplier: 'Gallatin Valley Bison Ranch' },
  { id: 'i2', name: 'Brioche Bun', stock: 60, minStock: 20, unit: 'pcs', costPerUnit: 0.40, supplier: 'Bozeman Artisan Bakery' },
  { id: 'i3', name: 'Angus Ribeye (14oz)', stock: 18, minStock: 6, unit: 'pcs', costPerUnit: 8.50, supplier: 'Montana Cattle Country' },
  { id: 'i4', name: 'Flathead Rainbow Trout', stock: 12, minStock: 5, unit: 'pcs', costPerUnit: 4.80, supplier: 'Flathead Lake Fish Co.' },
  { id: 'i5', name: 'Wild Huckleberries', stock: 8.4, minStock: 3.0, unit: 'kg', costPerUnit: 18.00, supplier: 'Foragers of Flathead' },
  { id: 'i6', name: 'Cheddar Cheese', stock: 80, minStock: 25, unit: 'slices', costPerUnit: 0.15, supplier: 'Kalispell Cheese Creamery' },
  { id: 'i7', name: 'Bozeman Amber Keg', stock: 180, minStock: 50, unit: 'pints', costPerUnit: 1.50, supplier: 'Bozeman Brewing Co.' },
  { id: 'i8', name: 'Organic Salad Mix', stock: 12.5, minStock: 4.0, unit: 'kg', costPerUnit: 5.50, supplier: 'Gallatin Greens Farm' },
  { id: 'i9', name: 'Onions', stock: 15.0, minStock: 5.0, unit: 'kg', costPerUnit: 1.20, supplier: 'Helena Wholesale' },
  { id: 'i10', name: 'Potatoes (Fries)', stock: 45.0, minStock: 15.0, unit: 'kg', costPerUnit: 0.80, supplier: 'Helena Wholesale' }
];

export const DEFAULT_TABLES: Table[] = [
  { id: 't1', number: '10', capacity: 2, status: 'available' },
  { id: 't2', number: '11', capacity: 2, status: 'occupied', currentOrderId: 'test-o1', occupiedSince: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 't3', number: '12', capacity: 4, status: 'available' },
  { id: 't4', number: '14', capacity: 4, status: 'reserved' },
  { id: 't5', number: '20 (Bar)', capacity: 1, status: 'available' },
  { id: 't6', number: '21 (Bar)', capacity: 1, status: 'occupied', currentOrderId: 'test-o2', occupiedSince: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 't7', number: '30 (Patio)', capacity: 6, status: 'available' },
  { id: 't8', number: '31 (Patio)', capacity: 4, status: 'available' }
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Jim Bridger', phone: '(406) 555-0142', email: 'bridger.jim@yellowstone.org', points: 420, joinDate: '2025-01-12', loyaltyTier: 'Gold', notes: 'Prefers Flathead Trout and Yellowstone salad.' },
  { id: 'c2', name: 'Calamity Jane', phone: '(406) 555-0199', email: 'jane.wild@deadwood.net', points: 680, joinDate: '2024-11-05', loyaltyTier: 'Platinium', notes: 'Always dines on patio. Likes extra spicy BBQ.' },
  { id: 'c3', name: 'Charles Marion', phone: '(406) 555-0177', email: 'marion.arts@russell.com', points: 120, joinDate: '2025-04-20', loyaltyTier: 'Bronze', notes: 'Prefers Bozeman Amber Ale. Quick dinners.' },
  { id: 'c4', name: 'Sacajawea Lewis', phone: '(406) 555-0123', email: 'sacajawea.guide@shoshone.us', points: 310, joinDate: '2025-03-01', loyaltyTier: 'Silver', notes: 'Bison Burger lover. Brings large groups.' }
];

export const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    id: 'res1',
    customerName: 'Marcus Daly',
    customerEmail: 'daly_copper@butte.com',
    customerPhone: '(406) 555-0222',
    partySize: 4,
    dateTime: '2026-06-20T19:00:00',
    tableId: 't3',
    status: 'confirmed',
    notes: 'Hosting prospective miners. Needs fine ribeye.'
  },
  {
    id: 'res2',
    customerName: 'Myrna Loy',
    customerEmail: 'myrna.loy@hollywood.com',
    customerPhone: '(406) 555-0333',
    partySize: 2,
    dateTime: '2026-06-21T18:30:00',
    tableId: 't1',
    status: 'pending',
    notes: 'Window seat if available, please.'
  }
];
