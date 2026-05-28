// Simulated database with LocalStorage persistence

export const PRODUCTS = [
  {
    id: 'buffalo-milk',
    name: 'Premium Buffalo Milk',
    category: 'milk',
    price: 74,
    unit: 'Litre',
    description: 'Thick, creamy, and farm-fresh A2 buffalo milk. Ideal for making thick curd, paneer, and rich tea/coffee.',
    badges: ['High Fat', '100% Pure', 'Best Seller'],
    image: 'buffalo_milk',
    nutrients: { fat: '7.8%', protein: '4.2%', calcium: '140mg' },
    stock: 250
  },
  {
    id: 'cow-milk',
    name: 'Fresh Desi Cow Milk',
    category: 'milk',
    price: 62,
    unit: 'Litre',
    description: 'Highly nutritious, easily digestible A2 cow milk sourced directly from local pastures. Rich in beta-casein.',
    badges: ['Easily Digestible', 'A2 Protein', 'Organic'],
    image: 'cow_milk',
    nutrients: { fat: '4.2%', protein: '3.6%', calcium: '120mg' },
    stock: 300
  },
  {
    id: 'desi-ghee',
    name: 'Pure Danedar Buffalo Ghee',
    category: 'ghee',
    price: 680,
    unit: 'Litre',
    description: 'Traditionally prepared using the Vedic Bilona method. Rich granular texture with a divine aroma.',
    badges: ['Granular', 'Vedic Bilona', 'Superfood'],
    image: 'desi_ghee',
    nutrients: { fat: '99.8g', energy: '898 kcal', vitaminA: 'Yes' },
    stock: 120
  },
  {
    id: 'cow-ghee',
    name: 'A2 Vedic Gir Cow Ghee',
    category: 'ghee',
    price: 1250,
    unit: 'Litre',
    description: 'Premium golden ghee made exclusively from pure breed Gir cow milk. High medicinal value and rich taste.',
    badges: ['A2 Gir Cow', 'Medicinal', 'Pure Gold'],
    image: 'cow_ghee',
    nutrients: { fat: '99.9g', energy: '900 kcal', omega3: 'Rich' },
    stock: 80
  },
  {
    id: 'masala-chach',
    name: 'Spiced Masala Chach',
    category: 'beverage',
    price: 25,
    unit: '500ml',
    description: 'Traditional spiced buttermilk churned in earthen matkas. Infused with roasted cumin, mint, and black salt.',
    badges: ['Matka Churned', 'Probiotic', 'Cooling'],
    image: 'masala_chach',
    nutrients: { fat: '0.8%', protein: '1.2%', hydration: 'Excellent' },
    stock: 500
  },
  {
    id: 'sweet-lassi',
    name: 'Royal Kesar Sweet Lassi',
    category: 'beverage',
    price: 35,
    unit: '300ml',
    description: 'Thick, creamy sweet lassi enriched with pure saffron (Kesar) strands and chopped pistachios.',
    badges: ['Kesar Pista', 'Thick & Creamy', 'Royal Taste'],
    image: 'sweet_lassi',
    nutrients: { fat: '3.5%', sugar: '12g', cooling: 'High' },
    stock: 180
  },
  {
    id: 'malai-paneer',
    name: 'Fresh Malai Paneer',
    category: 'paneer',
    price: 95,
    unit: '250g',
    description: 'Mouth-meltingly soft paneer crafted daily. Absolutely zero preservatives, zero starch, high protein.',
    badges: ['Melt-in-mouth', 'High Protein', 'Fresh Daily'],
    image: 'malai_paneer',
    nutrients: { protein: '18.5g', fat: '20.2g', calcium: '240mg' },
    stock: 150
  },
  {
    id: 'fresh-dahi',
    name: 'Thick Creamy Dahi',
    category: 'dahi',
    price: 45,
    unit: '500g',
    description: 'Thick, set curd with natural probiotic cultures. Set in temperature-controlled chambers for optimal sweetness.',
    badges: ['Probiotic Rich', 'Thick Set', 'Low Acidity'],
    image: 'fresh_dahi',
    nutrients: { calcium: '180mg', fat: '3.5%', protein: '3.4g' },
    stock: 220
  },
  {
    id: 'white-butter',
    name: 'Fresh Makhan (White Butter)',
    category: 'butter',
    price: 110,
    unit: '200g',
    description: 'Unsalted white butter straight from the churner. A traditional favorite with parathas and hot rotis.',
    badges: ['Unsalted', 'Traditional Makhan', '100% Cream'],
    image: 'white_butter',
    nutrients: { fat: '82.5g', salt: '0%', energy: '740 kcal' },
    stock: 100
  }
];

// Seed initial database state if empty
export function initDB() {
  if (!localStorage.getItem('gdd_initialized')) {
    localStorage.setItem('gdd_initialized', 'true');
    localStorage.setItem('gdd_products', JSON.stringify(PRODUCTS));
    localStorage.setItem('gdd_subscriptions', JSON.stringify([]));
    localStorage.setItem('gdd_orders', JSON.stringify(MOCK_ORDERS));
    localStorage.setItem('gdd_inventory', JSON.stringify(MOCK_INVENTORY));
    localStorage.setItem('gdd_user', JSON.stringify({
      name: 'Sahil Sharma',
      phone: '+91 98765 43210',
      points: 250,
      address: 'Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur',
      coords: { lat: 26.9082, lng: 75.7485 } // Defaults to Vaishali Nagar coordinates
    }));
  }
}

// Helper methods to read/write from local storage
export function getDBData(key) {
  initDB();
  return JSON.parse(localStorage.getItem(`gdd_${key}`));
}

export function setDBData(key, data) {
  localStorage.setItem(`gdd_${key}`, JSON.stringify(data));
}

// Add a subscriber
export function addSubscription(sub) {
  const subs = getDBData('subscriptions');
  const newSub = {
    id: 'sub_' + Math.random().toString(36).substr(2, 9),
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    deliveriesCompleted: 0,
    ...sub
  };
  subs.unshift(newSub);
  setDBData('subscriptions', subs);
  
  // Deduct inventory for tomorrow
  updateInventoryForBranch(sub.branchId, sub.productId, sub.quantity);
  
  // Award points
  const user = getDBData('user');
  user.points += Math.round(sub.totalPrice * 0.05); // 5% cash back in points
  setDBData('user', user);
  
  return newSub;
}

// Update local inventory on order
function updateInventoryForBranch(branchId, productId, qty) {
  const inv = getDBData('inventory');
  if (inv[branchId] && inv[branchId][productId] !== undefined) {
    inv[branchId][productId] = Math.max(0, inv[branchId][productId] - qty);
    setDBData('inventory', inv);
  }
}

// Add a standard order
export function addOrder(order) {
  const orders = getDBData('orders');
  const newOrder = {
    id: 'GDD_' + Math.floor(100000 + Math.random() * 90000).toString(),
    date: new Date().toISOString(),
    status: 'Preparing', // Preparing -> Out for Delivery -> Delivered
    ...order
  };
  orders.unshift(newOrder);
  setDBData('orders', orders);

  // Update inventories for all items in the order
  order.items.forEach(item => {
    updateInventoryForBranch(order.branchId, item.id, item.quantity);
  });

  // Award points
  const user = getDBData('user');
  user.points += Math.round(order.totalAmount * 0.05);
  setDBData('user', user);

  return newOrder;
}

// MOCK DATA SEED
const MOCK_INVENTORY = {
  vaishali: { 'buffalo-milk': 120, 'cow-milk': 150, 'desi-ghee': 40, 'cow-ghee': 30, 'masala-chach': 150, 'sweet-lassi': 90, 'malai-paneer': 60, 'fresh-dahi': 80, 'white-butter': 40 },
  malviya: { 'buffalo-milk': 90, 'cow-milk': 110, 'desi-ghee': 30, 'cow-ghee': 20, 'masala-chach': 120, 'sweet-lassi': 70, 'malai-paneer': 50, 'fresh-dahi': 60, 'white-butter': 30 },
  mansarovar: { 'buffalo-milk': 100, 'cow-milk': 130, 'desi-ghee': 35, 'cow-ghee': 25, 'masala-chach': 130, 'sweet-lassi': 80, 'malai-paneer': 55, 'fresh-dahi': 70, 'white-butter': 35 },
  rajapark: { 'buffalo-milk': 80, 'cow-milk': 100, 'desi-ghee': 25, 'cow-ghee': 15, 'masala-chach': 100, 'sweet-lassi': 60, 'malai-paneer': 45, 'fresh-dahi': 50, 'white-butter': 25 },
  cscheme: { 'buffalo-milk': 70, 'cow-milk': 90, 'desi-ghee': 20, 'cow-ghee': 10, 'masala-chach': 80, 'sweet-lassi': 50, 'malai-paneer': 40, 'fresh-dahi': 40, 'white-butter': 20 }
};

const MOCK_ORDERS = [
  {
    id: 'GDD_48921',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'Out for Delivery',
    branchId: 'vaishali',
    customerName: 'Sahil Sharma',
    address: 'Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur',
    coords: { lat: 26.9082, lng: 75.7485 },
    items: [
      { id: 'buffalo-milk', name: 'Premium Buffalo Milk', quantity: 2, price: 74, unit: 'Litre' },
      { id: 'masala-chach', name: 'Spiced Masala Chach', quantity: 3, price: 25, unit: '500ml' }
    ],
    deliveryFee: 15,
    totalAmount: 238
  },
  {
    id: 'GDD_48210',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    status: 'Delivered',
    branchId: 'vaishali',
    customerName: 'Sahil Sharma',
    address: 'Plot 45, Amrapali Circle, Vaishali Nagar, Jaipur',
    coords: { lat: 26.9082, lng: 75.7485 },
    items: [
      { id: 'cow-ghee', name: 'A2 Vedic Gir Cow Ghee', quantity: 1, price: 1250, unit: 'Litre' },
      { id: 'malai-paneer', name: 'Fresh Malai Paneer', quantity: 2, price: 95, unit: '250g' }
    ],
    deliveryFee: 0,
    totalAmount: 1440
  }
];
