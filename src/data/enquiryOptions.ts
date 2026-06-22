export type PackageSlot = { id: string; label: string; hours: number };

export type Package = {
  id: string;
  name: string;
  tagline: string;
  pricePerPlate: number;
  perks: string[];
  minPax?: number;
  hourlyRate?: number;
  slots?: PackageSlot[];
};

export type MenuItem = { id: string; name: string; category: string; subcategory?: string; price: number };
export type MenuCategory =
  | "Welcome Drink"
  | "Starters"
  | "Salads"
  | "Farsan"
  | "Main Course"
  | "Breakfast"
  | "Kathiawadi"
  | "Rajasthani"
  | "Indian Breads"
  | "Raita"
  | "Rice"
  | "Dal"
  | "Sweets & Ice Cream"
  | "Live Counters";

/** Display order for menu categories across plate packages and summaries. */
export const MENU_CATEGORY_ORDER: MenuCategory[] = [
  "Welcome Drink",
  "Salads",
  "Starters",
  "Main Course",
  "Breakfast",
  "Kathiawadi",
  "Rajasthani",
  "Indian Breads",
  "Raita",
  "Rice",
  "Dal",
  "Farsan",
  "Sweets & Ice Cream",
  "Live Counters",
];

export function sortMenuCategories(categories: string[]): string[] {
  const rank = new Map(MENU_CATEGORY_ORDER.map((cat, index) => [cat, index]));
  return [...categories].sort((a, b) => {
    const rankA = rank.get(a as MenuCategory) ?? Number.MAX_SAFE_INTEGER;
    const rankB = rank.get(b as MenuCategory) ?? Number.MAX_SAFE_INTEGER;
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });
}

export type PlatePackage = {
  id: string;
  name: string;
  basePrice: number;
  minPax?: number;
  limits: Partial<Record<MenuCategory, number>>;
  /** When set for a category, only these menu item IDs can be chosen on this package. */
  allowedItems?: Partial<Record<MenuCategory, string[]>>;
  extras?: string[];
};

export type RecommendedPackage = {
  id: string;
  name: string;
  basePrice?: number;
  items: string[];
};

export type DecorOption = { id: string; name: string; price: number; description: string; events?: string[] };
export type ChairOption = { id: string; name: string; pricePerUnit: number };
export type ExtraService = {
  id: string;
  name: string;
  price: number;
  unit: string;
  priceMax?: number;
  subtitle?: string;
  quoteOnly?: boolean;
};
export type VenueOption = { id: string; name: string; pricePerHour: number; description: string };

export const EVENT_TYPES = [
  "Wedding Ceremony & Reception",
  "Engagement Ceremony",
  "Sangeet",
  "Mehendi",
  "Haldi",
  "Birthday",
  "Anniversary",
  "Retirement Party",
  "Naming Ceremony",
  "Baby Shower",
  "Bridal Shower",
  "Kitty Party",
  "Karaoke Night",
  "Garba",
  "Dance Practice",
  "Preschool",
  "School Annual Day",
  "Corporate Event (Meeting, Conference, Gala)",
  "Corporate Gala",
  "Awards Dinner",
  "Seminar",
  "AGM",
  "Society Meeting",
  "Re-Development Meeting",
  "Charity Event",
  "Fundraiser Event",
];

export const SOURCES = [
  "Walk-in",
  "Referral",
  "Instagram",
  "Facebook",
  "Google",
  "WhatsApp",
  "Wedding Wire",
  "Other",
];

export const APPROX_BUDGET_RANGES = [
  "1k - 50k",
  "50k - 1Lac",
  "1Lac - 2Lac",
  "2Lac - 3Lac",
  "3Lac - 4Lac",
  "4Lac - 5Lac",
  "More than 5lac",
] as const;

export type ApproxBudgetRange = (typeof APPROX_BUDGET_RANGES)[number];

const SILVER_PERKS = [
  "Hall Rent + AC Electricity",
  "Basic Decoration",
  "Changing Room",
  "Mic & Music",
  "Stage Light",
  "Stage Sofa",
  "Chair",
  "Separate Dining Area",
  "Dedicated Elevator",
  "2 Parking Spaces",
];

const slotPkg = (
  id: string,
  name: string,
  label: string,
  hours: number,
): Package => ({
  id,
  name,
  tagline: `${label} · ${hours}h`,
  pricePerPlate: 0,
  minPax: 100,
  hourlyRate: 6000,
  slots: [{ id, label, hours }],
  perks: SILVER_PERKS,
});

export const PACKAGES: Package[] = [
  slotPkg("silver-morning", "Morning", "Morning 08:00 AM – 02:00 PM", 6),
  slotPkg("silver-evening", "Evening", "Evening 04:00 PM – 10:00 PM", 6),
  slotPkg("silver-fullday-1", "Full Day (Early)", "Full Day 08:00 AM – 08:00 PM", 12),
  slotPkg("silver-fullday-2", "Full Day (Late)", "Full Day 10:00 AM – 10:00 PM", 12),
];

/** Per-plate extra charge by menu category (beyond package limit). */
export const CATEGORY_EXTRA_PRICES: Record<MenuCategory, number> = {
  "Welcome Drink": 30,
  "Starters": 40,
  "Salads": 30,
  "Farsan": 40,
  "Main Course": 100,
  "Breakfast": 45,
  "Kathiawadi": 100,
  "Rajasthani": 100,
  "Indian Breads": 30,
  "Raita": 30,
  "Rice": 60,
  "Dal": 75,
  "Sweets & Ice Cream": 50,
  "Live Counters": 110,
};

export type LiveCounterRule = {
  flatPrice?: number;
  pricePerItem?: number;
  minSelection?: number;
  bundlePrice?: number;
};

/** Live counter subcategory pricing — flat per counter or bundled minimums. */
export const LIVE_COUNTER_RULES: Record<string, LiveCounterRule> = {
  "Chaat Counter": { flatPrice: 40 },
  "Pasta Counter": { flatPrice: 40 },
  "Pizza": { flatPrice: 50 },
  "South Indian Counter": { bundlePrice: 75, minSelection: 3, pricePerItem: 25 },
  "Chinese / Oriental Counter": { pricePerItem: 30, minSelection: 3 },
  "Additional Counters": { flatPrice: 110 },
};

const LIVE_COUNTER_CATEGORY = "Live Counters" as const;

function counterSortPrice(sub: string): number {
  const rule = LIVE_COUNTER_RULES[sub];
  if (!rule) return CATEGORY_EXTRA_PRICES["Live Counters"];
  if (rule.flatPrice != null) return rule.flatPrice;
  if (rule.bundlePrice != null) return rule.bundlePrice;
  if (rule.pricePerItem != null && rule.minSelection != null) {
    return rule.pricePerItem * rule.minSelection;
  }
  return rule.pricePerItem ?? CATEGORY_EXTRA_PRICES["Live Counters"];
}

export function getCategoryExtraPrice(category: string): number {
  return CATEGORY_EXTRA_PRICES[category as MenuCategory] ?? 50;
}

/** Per-plate extra for a single regular (non–live-counter) dish, incl. item premium. */
export function getItemExtraPrice(item: MenuItem): number {
  if (item.category === LIVE_COUNTER_CATEGORY) return 0;
  return getCategoryExtraPrice(item.category) + item.price;
}

function calcLiveCounterSubExtra(sub: string, items: MenuItem[]): number {
  const rule = LIVE_COUNTER_RULES[sub];
  if (!rule) return CATEGORY_EXTRA_PRICES["Live Counters"];
  if (rule.flatPrice != null) return rule.flatPrice;
  if (rule.bundlePrice != null) return rule.bundlePrice;
  if (rule.pricePerItem != null) {
    const count = items.length;
    return rule.minSelection != null
      ? rule.pricePerItem * Math.max(count, rule.minSelection)
      : rule.pricePerItem * count;
  }
  return CATEGORY_EXTRA_PRICES["Live Counters"];
}

export function getLiveCounterExtraLabel(sub: string): string {
  const rule = LIVE_COUNTER_RULES[sub];
  if (!rule) return `+₹${CATEGORY_EXTRA_PRICES["Live Counters"]}/plate`;
  if (rule.flatPrice != null) return `+₹${rule.flatPrice}/plate (counter)`;
  if (rule.bundlePrice != null) {
    const min = rule.minSelection ?? 1;
    return `+₹${rule.bundlePrice}/plate (min ${min} varieties)`;
  }
  if (rule.pricePerItem != null && rule.minSelection != null) {
    return `+₹${rule.pricePerItem}/plate × min ${rule.minSelection}`;
  }
  return `+₹${rule.pricePerItem}/plate`;
}

export const CUSTOM_PLATE_PACKAGE_ID = "plate-custom";

export function isCustomPlatePackage(platePackageId: string): boolean {
  return platePackageId === CUSTOM_PLATE_PACKAGE_ID;
}

function formatLiveCounterPlateRate(sub: string): string {
  const rule = LIVE_COUNTER_RULES[sub];
  if (!rule) return `₹${CATEGORY_EXTRA_PRICES["Live Counters"]}/plate`;
  if (rule.flatPrice != null) return `₹${rule.flatPrice}/plate`;
  if (rule.bundlePrice != null) {
    const min = rule.minSelection ?? 1;
    return `₹${rule.bundlePrice}/plate (min ${min} varieties)`;
  }
  if (rule.pricePerItem != null && rule.minSelection != null) {
    return `₹${rule.pricePerItem}/plate × min ${rule.minSelection}`;
  }
  if (rule.pricePerItem != null) return `₹${rule.pricePerItem}/plate`;
  return `₹${CATEGORY_EXTRA_PRICES["Live Counters"]}/plate`;
}

export function getMenuCardPriceLabel(
  item: MenuItem,
  opts: {
    selected: boolean;
    customPlate: boolean;
    beyondIncluded: boolean;
    includedLabel: string;
    extraCounterLabel: string;
    beyondLimitLabel: string;
  },
): { price?: string; subtitle?: string } {
  const { selected, customPlate, beyondIncluded, includedLabel, extraCounterLabel, beyondLimitLabel } = opts;

  if (customPlate) {
    const rate =
      item.category === LIVE_COUNTER_CATEGORY && item.subcategory
        ? formatLiveCounterPlateRate(item.subcategory)
        : `₹${getItemExtraPrice(item)}/plate`;
    return { price: rate };
  }

  if (!selected) return {};

  if (beyondIncluded) {
    return {
      price:
        item.category === LIVE_COUNTER_CATEGORY
          ? extraCounterLabel
          : `+₹${getItemExtraPrice(item)}/plate`,
      subtitle: beyondLimitLabel,
    };
  }

  return { price: includedLabel };
}

/** Main Course, Rice, Dal & Live Counters share one interchangeable slot pool per package. */
export const SWAPPABLE_MENU_CATEGORIES = [
  "Main Course",
  "Rice",
  "Dal",
  "Live Counters",
] as const;

export type SwappableMenuCategory = (typeof SWAPPABLE_MENU_CATEGORIES)[number];

export function isSwappableMenuCategory(cat: string): cat is SwappableMenuCategory {
  return (SWAPPABLE_MENU_CATEGORIES as readonly string[]).includes(cat);
}

export function getSwappablePoolLimit(limits: Partial<Record<MenuCategory, number>>): number {
  return SWAPPABLE_MENU_CATEGORIES.reduce((sum, cat) => sum + (limits[cat] ?? 0), 0);
}

function countLiveCounterSlots(menuItemIds: string[]): number {
  const subs = new Set<string>();
  menuItemIds.forEach((id) => {
    const m = MENU_ITEMS.find((i) => i.id === id);
    if (m?.category === LIVE_COUNTER_CATEGORY && m.subcategory) subs.add(m.subcategory);
  });
  return subs.size;
}

export function countSwappablePoolSelections(menuItemIds: string[]): number {
  let count = 0;
  menuItemIds.forEach((id) => {
    const m = MENU_ITEMS.find((i) => i.id === id);
    if (!m || m.category === LIVE_COUNTER_CATEGORY) return;
    if (isSwappableMenuCategory(m.category)) count += 1;
  });
  return count + countLiveCounterSlots(menuItemIds);
}

export function getSwappablePoolStatus(
  menuItemIds: string[],
  limits: Partial<Record<MenuCategory, number>>,
): { selected: number; required: number; remaining: number; isComplete: boolean } {
  const required = getSwappablePoolLimit(limits);
  const selected = countSwappablePoolSelections(menuItemIds);
  return {
    selected,
    required,
    remaining: Math.max(0, required - selected),
    isComplete: required === 0 || selected >= required,
  };
}

type PoolUnit = { ids: string[]; price: number };

function buildSwappablePoolUnits(items: MenuItem[]): PoolUnit[] {
  const units: PoolUnit[] = [];
  const lcBySub: Record<string, MenuItem[]> = {};
  items.forEach((m) => {
    if (m.category === LIVE_COUNTER_CATEGORY) {
      const sub = m.subcategory || "";
      (lcBySub[sub] ||= []).push(m);
    } else {
      units.push({ ids: [m.id], price: getItemExtraPrice(m) });
    }
  });
  Object.entries(lcBySub).forEach(([sub, subItems]) => {
    units.push({ ids: subItems.map((item) => item.id), price: counterSortPrice(sub) });
  });
  return units.sort((a, b) => a.price - b.price);
}

export function getIncludedMenuItemIds(
  menuItemIds: string[],
  limits: Partial<Record<MenuCategory, number>>,
): Set<string> {
  const byCat: Record<string, MenuItem[]> = {};
  menuItemIds.forEach((id) => {
    const m = MENU_ITEMS.find((i) => i.id === id);
    if (!m) return;
    (byCat[m.category] ||= []).push(m);
  });

  const included = new Set<string>();
  const poolLimit = getSwappablePoolLimit(limits);
  const swappableItems: MenuItem[] = [];
  const otherCats: Record<string, MenuItem[]> = {};

  Object.entries(byCat).forEach(([cat, list]) => {
    if (isSwappableMenuCategory(cat)) swappableItems.push(...list);
    else otherCats[cat] = list;
  });

  if (poolLimit > 0 && swappableItems.length > 0) {
    buildSwappablePoolUnits(swappableItems)
      .slice(0, poolLimit)
      .forEach((unit) => unit.ids.forEach((id) => included.add(id)));
  }

  Object.entries(otherCats).forEach(([cat, list]) => {
    const limit = limits[cat as MenuCategory] ?? 0;
    const sorted = [...list].sort((a, b) => getItemExtraPrice(a) - getItemExtraPrice(b));
    sorted.slice(0, limit).forEach((m) => included.add(m.id));
  });

  return included;
}

export function calcExtraDishesPerPlate(
  menuItemIds: string[],
  limits: Partial<Record<MenuCategory, number>>,
): { extraCount: number; extrasPerPlate: number } {
  const includedIds = getIncludedMenuItemIds(menuItemIds, limits);
  const extras = menuItemIds
    .map((id) => MENU_ITEMS.find((i) => i.id === id))
    .filter((m): m is MenuItem => !!m && !includedIds.has(m.id));

  let extrasPerPlate = 0;
  let extraCount = 0;

  extras
    .filter((m) => m.category !== LIVE_COUNTER_CATEGORY)
    .forEach((m) => {
      extrasPerPlate += getItemExtraPrice(m);
      extraCount += 1;
    });

  const bySub: Record<string, MenuItem[]> = {};
  extras
    .filter((m) => m.category === LIVE_COUNTER_CATEGORY)
    .forEach((m) => {
      const sub = m.subcategory || "";
      (bySub[sub] ||= []).push(m);
    });
  Object.entries(bySub).forEach(([sub, items]) => {
    extrasPerPlate += calcLiveCounterSubExtra(sub, items);
    extraCount += items.length;
  });

  return { extraCount, extrasPerPlate };
}

export function getMenuSubcategoryErrors(
  menuItemIds: string[],
): { subcategory: string; message: string }[] {
  const errors: { subcategory: string; message: string }[] = [];
  for (const [sub, rule] of Object.entries(LIVE_COUNTER_RULES)) {
    if (!rule.minSelection) continue;
    const selected = menuItemIds.filter((id) => {
      const m = MENU_ITEMS.find((i) => i.id === id);
      return m?.category === LIVE_COUNTER_CATEGORY && m.subcategory === sub;
    });
    if (selected.length === 0) continue;
    const available = MENU_ITEMS.filter(
      (m) => m.category === LIVE_COUNTER_CATEGORY && m.subcategory === sub,
    ).length;
    const required = Math.min(rule.minSelection, available);
    if (selected.length < required) {
      errors.push({
        subcategory: sub,
        message: `Select at least ${required} item${required > 1 ? "s" : ""} from ${sub}`,
      });
    }
  }
  return errors;
}

// `price` on each item = premium on top of category rate (e.g. mocktails +₹20, ice cream special +₹25).
export const MENU_ITEMS: MenuItem[] = [
  // Welcome Drink — Basic
  { id: "wd-b1", name: "Assorted Soft Drinks", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b2", name: "Masala Chaas", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b3", name: "Fresh Lime Juice", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b4", name: "Jal Jeera", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b5", name: "Litchi Squash", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b6", name: "Kiwi Squash", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b7", name: "Rose Sharbat", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b8", name: "Ice Tea", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b9", name: "Keri Panna", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b10", name: "Summer Cool", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b11", name: "Minty Kacchi Keri", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b12", name: "Kala Khatta", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b13", name: "Kokam Sharbat", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b14", name: "Lemon Ginger Mojito", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b15", name: "Lemon Litchi Fizz", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  { id: "wd-b16", name: "Blue Lagoon", category: "Welcome Drink", subcategory: "Basic", price: 0 },
  // Welcome Drink — Fresh Fruit Juice
  { id: "wd-f1", name: "Mosambi", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f2", name: "Pineapple", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f3", name: "Watermelon", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f4", name: "Orange (Seasonal)", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f5", name: "Peru Pineapple", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f6", name: "Orange Pineapple Ginger", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f7", name: "Special Cocktail Juice", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f8", name: "Special Boomerang (Pineapple, Orange & Peru)", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f9", name: "Special Tulsidhar (Pineapple, Chikku & Tulsi)", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f10", name: "Special Golden Punch (Pineapple & Orange)", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  { id: "wd-f11", name: "Special Raja Rani (Pineapple & Rose Syrup)", category: "Welcome Drink", subcategory: "Fresh Fruit Juice", price: 0 },
  // Welcome Drink — Mocktails (+₹20 Extra)
  { id: "wd-m1", name: "Special Fruit Punch", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },
  { id: "wd-m2", name: "Special Virgin Pina Colada", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },
  { id: "wd-m3", name: "Special Anar Peru Punch", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },
  { id: "wd-m4", name: "Special Thandai", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },
  { id: "wd-m5", name: "Special Mango Smoothie", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },
  { id: "wd-m6", name: "Special Peach Muskmelon", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },
  { id: "wd-m7", name: "Special Strawberry Colada", category: "Welcome Drink", subcategory: "Mocktails (+₹20 Extra)", price: 20 },

  // Salads
  { id: "sa1", name: "Green Salad", category: "Salads", price: 0 },
  { id: "sa2", name: "Chana Chaat Salad", category: "Salads", price: 0 },
  { id: "sa3", name: "Corn Chaat", category: "Salads", price: 0 },
  { id: "sa4", name: "Beetroot Salad", category: "Salads", price: 0 },
  { id: "sa5", name: "Russian Salad", category: "Salads", price: 0 },

  // Farsan
  { id: "fa1", name: "Mini Samosa", category: "Farsan", price: 0 },
  { id: "fa2", name: "Moong Dal Bhajia", category: "Farsan", price: 0 },
  { id: "fa3", name: "Dal Wada", category: "Farsan", price: 0 },
  { id: "fa4", name: "Veg Pakoda", category: "Farsan", price: 0 },
  { id: "fa5", name: "Veg Cutlet", category: "Farsan", price: 0 },
  { id: "fa6", name: "Vagari Idli", category: "Farsan", price: 0 },
  { id: "fa7", name: "Masala Idli", category: "Farsan", price: 0 },
  { id: "fa8", name: "Idli Podi", category: "Farsan", price: 0 },
  { id: "fa9", name: "Khandvi", category: "Farsan", price: 0 },
  { id: "fa10", name: "Patra", category: "Farsan", price: 0 },
  { id: "fa11", name: "Dhokla", category: "Farsan", price: 0 },
  { id: "fa12", name: "Sandwich Dhokla", category: "Farsan", price: 0 },
  { id: "fa13", name: "Tiranga Dhokla", category: "Farsan", price: 0 },
  { id: "fa14", name: "White Dhokla", category: "Farsan", price: 0 },
  { id: "fa15", name: "Khaman", category: "Farsan", price: 0 },
  { id: "fa16", name: "Dahiwada", category: "Farsan", price: 0 },
  { id: "fa17", name: "Batata Wada", category: "Farsan", price: 0 },
  { id: "fa18", name: "Mutter Pattis / Karanji", category: "Farsan", price: 0 },
  { id: "fa19", name: "Corn Pattis", category: "Farsan", price: 0 },
  { id: "fa20", name: "Kothmir Wadi", category: "Farsan", price: 0 },

  // Veg Starter
  { id: "vs1", name: "Papad Pudina Roll", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs2", name: "Veg Spring Roll", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs3", name: "Hara Bhara Kabab", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs4", name: "Veg Manchurian Dry", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs5", name: "Special Veg Potli", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs6", name: "Veg Gold Coin", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs7", name: "Cheese Corn Ball", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs8", name: "Cheese Chilly Toast", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs9", name: "Veg Timmili Kabab", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs10", name: "Corn Karari Tikki", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs11", name: "Kung Pao Potato", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs12", name: "Veg Crispy", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs13", name: "Veg Finger Schezwan", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs14", name: "American Roll", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs15", name: "Cheese Palak Roll", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs16", name: "Cigar Roll", category: "Starters", subcategory: "Veg Starter", price: 0 },
  { id: "vs17", name: "Salsa Shots", category: "Starters", subcategory: "Veg Starter", price: 0 },

  // Paneer Starter
  { id: "ps1", name: "Paneer Salt-N-Pepper", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps2", name: "Paneer Chilli Dry", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps3", name: "Paneer Lifafa", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps4", name: "Papad Paneer Roll", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps5", name: "Chupurstum Kabab", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps6", name: "Special Paneer Pahadi Tikka", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps7", name: "Special Paneer Kalimari", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps8", name: "Special Maladi Paneer Tikka Dry", category: "Starters", subcategory: "Paneer Starter", price: 0 },
  { id: "ps9", name: "Paneer Gold Coin", category: "Starters", subcategory: "Paneer Starter", price: 0 },

  // Paneer Main Course
  { id: "pm1", name: "Paneer Bhuna Masala", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm2", name: "Paneer Handi", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm3", name: "Paneer Tikka Masala", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm4", name: "Dhabe Wala Paneer", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm5", name: "Palak Paneer (Green)", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm6", name: "Paneer Lababdar", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm7", name: "Paneer Butter Masala", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm8", name: "Paneer Kadai", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm9", name: "Achari Paneer", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },
  { id: "pm10", name: "Lasuni Corn Palak Paneer", category: "Main Course", subcategory: "Paneer Main Course", price: 0 },

  // Veg Main Course
  { id: "vm1", name: "Bhindi Fry Masala", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm2", name: "Kurkuri Bhindi", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm3", name: "Veg Makhanwala", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm4", name: "Veg Hangama", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm5", name: "Chana Masala", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm6", name: "Navratan Kurma", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm7", name: "Veg Kurma", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm8", name: "Veg Kofta", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm9", name: "Veg Tawa Mehfil", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm10", name: "Veg Amritsari", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm11", name: "Veg Diwani Handi", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm12", name: "Veg Handi", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm13", name: "Veg Kolhapuri", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm14", name: "Veg Pahadi", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm15", name: "Veg Hyderabadi (Green)", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm16", name: "Punjabi Saag", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm17", name: "Mix Vegetables", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm18", name: "Veg Kadai", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm19", name: "Dum Aloo Punjabi", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm20", name: "Veg Bhuna Masala", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm21", name: "Aloo Matar", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm22", name: "Aloo Flower / Gobi", category: "Main Course", subcategory: "Veg Main Course", price: 0 },
  { id: "vm23", name: "Methi Matar Malai", category: "Main Course", subcategory: "Veg Main Course", price: 0 },

  // Breakfast
  { id: "bf1", name: "Upma", category: "Breakfast", price: 0 },
  { id: "bf2", name: "Sheera", category: "Breakfast", price: 0 },
  { id: "bf3", name: "Poha", category: "Breakfast", price: 0 },
  { id: "bf4", name: "Khichadi", category: "Breakfast", price: 0 },
  { id: "bf5", name: "Idli", category: "Breakfast", price: 0 },
  { id: "bf6", name: "Medu Vada", category: "Breakfast", price: 0 },
  { id: "bf7", name: "Chutney", category: "Breakfast", price: 0 },
  { id: "bf8", name: "Sambhar", category: "Breakfast", price: 0 },
  { id: "bf9", name: "Chai", category: "Breakfast", price: 0 },
  { id: "bf10", name: "Coffee", category: "Breakfast", price: 0 },
  { id: "bf11", name: "Batata Vada", category: "Breakfast", price: 0 },
  { id: "bf12", name: "Sabudana Vada", category: "Breakfast", price: 0 },
  { id: "bf13", name: "Sevaiya Upma", category: "Breakfast", price: 0 },

  // Kathiawadi Items
  { id: "kt1", name: "Dhokli Nu Shaak", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt2", name: "Kathiawadi Undhiyu", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt3", name: "Khichu", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt4", name: "Dal Dhokli", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt5", name: "Sev Tomato Nu Sak", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt6", name: "Bharela Bhinda Nu Shaak", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt7", name: "Green Gujrat", category: "Main Course", subcategory: "Kathiawadi", price: 0 },
  { id: "kt8", name: "Ringan Batete Nu Shaak", category: "Main Course", subcategory: "Kathiawadi", price: 0 },

  // Rajasthani
  { id: "rj1", name: "Gatte Ki Sabzi", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj2", name: "Rajasthani Mogar", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj3", name: "Dal Bati Churma", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj4", name: "Rajasthani Kadhi", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj5", name: "Vadi Ki Sabzi", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj6", name: "Rajasthani Bhindi", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj7", name: "Gatte Ka Pulav", category: "Main Course", subcategory: "Rajasthani", price: 0 },
  { id: "rj8", name: "Hara Kanda Sabzi", category: "Main Course", subcategory: "Rajasthani", price: 0 },

  // Indian Breads
  { id: "br1", name: "Poori", category: "Indian Breads", price: 0 },
  { id: "br2", name: "Fulka", category: "Indian Breads", price: 0 },
  { id: "br3", name: "Roti (Live)", category: "Indian Breads", price: 0 },
  { id: "br4", name: "Naan (Live)", category: "Indian Breads", price: 0 },
  { id: "br5", name: "Kulcha (Live)", category: "Indian Breads", price: 0 },
  { id: "br6", name: "Paratha (Live)", category: "Indian Breads", price: 0 },
  { id: "br7", name: "Missi Roti (Live)", category: "Indian Breads", price: 0 },
  { id: "br8", name: "Stuff Kulcha (Live)", category: "Indian Breads", price: 0 },

  // Raita
  { id: "ra1", name: "Boondi Raita", category: "Raita", price: 0 },
  { id: "ra2", name: "Pineapple Raita", category: "Raita", price: 0 },
  { id: "ra3", name: "Vegetable Raita", category: "Raita", price: 0 },
  { id: "ra4", name: "Corn Salad", category: "Raita", price: 0 },
  { id: "ra5", name: "Chana Salad", category: "Raita", price: 0 },

  // Rice
  { id: "ri1", name: "Steam Rice", category: "Rice", price: 0 },
  { id: "ri2", name: "Jeera Rice", category: "Rice", price: 0 },
  { id: "ri3", name: "Peas Pulav", category: "Rice", price: 0 },
  { id: "ri4", name: "Tava Pulav", category: "Rice", price: 0 },
  { id: "ri5", name: "Veg Biryani", category: "Rice", price: 0 },
  { id: "ri6", name: "Gujarati Khichdi", category: "Rice", price: 0 },

  // Dal
  { id: "dl1", name: "Dal Fry", category: "Dal", price: 0 },
  { id: "dl2", name: "Dal Tadka", category: "Dal", price: 0 },
  { id: "dl3", name: "Dal Makhani", category: "Dal", price: 0 },
  { id: "dl4", name: "Gujarati Kadhi (Sweet/Spicy)", category: "Dal", price: 0 },
  { id: "dl5", name: "Gujarati Dal (Sweet/Spicy)", category: "Dal", price: 0 },
  { id: "dl6", name: "Punjabi Pakodi Kadhi", category: "Dal", price: 0 },

  // Sweets
  { id: "sw1", name: "Gulab Jamun", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw2", name: "Special Badam Moongdal Halwa", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw3", name: "Special Moongdal Halwa", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw4", name: "Fruit Salad", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw5", name: "Gajar Halwa (Seasonal)", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw6", name: "Dudhi Halwa", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw7", name: "Special Jalebi with Rabdi", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw8", name: "Jalebi", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw9", name: "Special Kesar Phirni", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw10", name: "Shrikhand / Amrakhand", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw11", name: "Aam Ras (Seasonal)", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw12", name: "Basundi (All Type)", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw13", name: "Rasgulla", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw14", name: "Kala Jamun", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw15", name: "Special Malai Sandwich", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw16", name: "Special Ras Malai", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw17", name: "Special Chum Chum", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw18", name: "Special Strawberry Cream", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw19", name: "Special Chocolate Mousse", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw20", name: "Special Shahi Tukda", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },
  { id: "sw21", name: "Mohanthal", category: "Sweets & Ice Cream", subcategory: "Sweets", price: 0 },

  // Ice Cream — Special (+₹25)
  { id: "ic-s1", name: "Black Current", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s2", name: "Chocolate Chips", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s3", name: "Guava", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s4", name: "Anjeer Badam", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s5", name: "Almond", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s6", name: "Raj Bhog", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s7", name: "Kesar Pista", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s8", name: "Pan", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s9", name: "Rose Gulkand", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  { id: "ic-s10", name: "Kulfi Faluda", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Special (+₹25 Extra)", price: 25 },
  // Ice Cream — Regular
  { id: "ic-r1", name: "Vanilla", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },
  { id: "ic-r2", name: "Strawberry", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },
  { id: "ic-r3", name: "Butter Scotch", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },
  { id: "ic-r4", name: "Chocolate", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },
  { id: "ic-r5", name: "Vanilla with Choco Sauce", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },
  { id: "ic-r6", name: "Malai Kulfi", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },
  { id: "ic-r7", name: "Kulfi Sticky", category: "Sweets & Ice Cream", subcategory: "Ice Cream — Regular", price: 0 },

  // Live Counters — Chaat
  { id: "lc-c1", name: "Pani Puri", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c2", name: "Sev Puri", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c3", name: "Dahi Puri", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c4", name: "Papdi Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c5", name: "Bhel", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c6", name: "Ragda Pattice", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c7", name: "Cutori Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c8", name: "Basket Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c9", name: "Dahi Wada", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c10", name: "Aloo Tikki Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c11", name: "Dabeli", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c12", name: "Chole Tikki Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c13", name: "Raj Kachori", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c14", name: "Samosa Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c15", name: "Corn Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c16", name: "Cheese Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c17", name: "Palak Patta Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c18", name: "Delhi Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  { id: "lc-c19", name: "Mumbai Chaat", category: "Live Counters", subcategory: "Chaat Counter", price: 0 },
  // Live Counters — Pasta
  { id: "lc-p1", name: "Red Sauce Pasta", category: "Live Counters", subcategory: "Pasta Counter", price: 0 },
  { id: "lc-p2", name: "White Sauce Pasta", category: "Live Counters", subcategory: "Pasta Counter", price: 0 },
  { id: "lc-p3", name: "Pesto Sauce Pasta", category: "Live Counters", subcategory: "Pasta Counter", price: 0 },
  // Live Counters — Pizza
  { id: "lc-pz1", name: "Margherita", category: "Live Counters", subcategory: "Pizza", price: 0 },
  { id: "lc-pz2", name: "Veg Farmyard Pizza", category: "Live Counters", subcategory: "Pizza", price: 0 },
  { id: "lc-pz3", name: "Paneer Tikka Pizza", category: "Live Counters", subcategory: "Pizza", price: 0 },
  { id: "lc-pz4", name: "Al Fungi Pizza", category: "Live Counters", subcategory: "Pizza", price: 0 },
  // Live Counters — South Indian
  { id: "lc-si1", name: "Assorted Dosa / Uttapam", category: "Live Counters", subcategory: "South Indian Counter", price: 0 },
  // Live Counters — Chinese / Oriental
  { id: "lc-ch1", name: "Veg Fried Rice", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch2", name: "Basil Rice", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch3", name: "Veg Combination Rice", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch4", name: "Veg Schezwan Fried Rice", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch5", name: "Veg Burnt Garlic Rice", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch6", name: "Veg Hakka Noodles", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch7", name: "Veg Chilly Garlic Sauce", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch8", name: "Veg Human Sauce", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch9", name: "Veg Manchurian Gravy", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch10", name: "Veg in Black Pepper Sauce", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  { id: "lc-ch11", name: "Veg Thai Curry (Red/Green)", category: "Live Counters", subcategory: "Chinese / Oriental Counter", price: 0 },
  // Live Counters — Additional
  { id: "lc-a1", name: "Pav Bhaji Counter", category: "Live Counters", subcategory: "Additional Counters", price: 0 },
  { id: "lc-a2", name: "Fruit Counter", category: "Live Counters", subcategory: "Additional Counters", price: 0 },
  { id: "lc-a3", name: "Chole Bhature", category: "Live Counters", subcategory: "Additional Counters", price: 0 },
  { id: "lc-a4", name: "Delhi Chaat", category: "Live Counters", subcategory: "Additional Counters", price: 0 },
  { id: "lc-a5", name: "Soup", category: "Live Counters", subcategory: "Additional Counters", price: 0 },
];

export const COMMON_PLATE_ITEMS = [
  "Salad", "Papad", "Achar", "Raita", "Chutney", "Mukhwas", "Packaged Drinking Water",
];

export function isMenuItemAllowedForPackage(itemId: string, platePackageId: string): boolean {
  const plate = PLATE_PACKAGES.find((p) => p.id === platePackageId);
  const item = MENU_ITEMS.find((m) => m.id === itemId);
  if (!plate || !item) return false;
  const allowed = plate.allowedItems?.[item.category as MenuCategory];
  if (!allowed) return true;
  return allowed.includes(itemId);
}

export function filterMenuIdsForPackage(menuItemIds: string[], platePackageId: string): string[] {
  return menuItemIds.filter((id) => isMenuItemAllowedForPackage(id, platePackageId));
}

export function getMenuItemsForPackage(platePackageId: string, category: string): MenuItem[] {
  const plate = PLATE_PACKAGES.find((p) => p.id === platePackageId);
  const items = MENU_ITEMS.filter((m) => m.category === category);
  const allowed = plate?.allowedItems?.[category as MenuCategory];
  if (!allowed) return items;
  return items.filter((m) => allowed.includes(m.id));
}

export const PLATE_PACKAGES: PlatePackage[] = [
  {
    id: "plate-600",
    name: "Bronze",
    basePrice: 650,
    minPax: 100,
    limits: {
      "Welcome Drink": 1,
      "Starters": 1,
      "Main Course": 1,
      "Indian Breads": 1,
      "Rice": 1,
      "Dal": 1,
      "Sweets & Ice Cream": 1,
    },
    allowedItems: {
      "Indian Breads": ["br1"],
      "Sweets & Ice Cream": ["sw1"],
    },
    extras: ["Indian Breads: Poori only · Sweets: Gulab Jamun only"],
  },
  {
    id: "plate-750",
    name: "Silver",
    basePrice: 800,
    limits: {
      "Welcome Drink": 1,
      "Starters": 1,
      "Main Course": 2,
      "Indian Breads": 1,
      "Rice": 1,
      "Dal": 1,
      "Farsan": 1,
      "Sweets & Ice Cream": 1,
    },
  },
  {
    id: "plate-950",
    name: "Gold",
    basePrice: 950,
    limits: {
      "Welcome Drink": 2,
      "Salads": 1,
      "Farsan": 1,
      "Starters": 2,
      "Main Course": 2,
      "Indian Breads": 2,
      "Raita": 1,
      "Rice": 1,
      "Dal": 1,
      "Sweets & Ice Cream": 2,
    },
  },
  {
    id: "plate-1150",
    name: "Platinum",
    basePrice: 1150,
    limits: {
      "Welcome Drink": 2,
      "Salads": 1,
      "Starters": 2,
      "Main Course": 2,
      "Indian Breads": 2,
      "Raita": 1,
      "Rice": 2,
      "Dal": 2,
      "Farsan": 1,
      "Sweets & Ice Cream": 2,
    },
  },
  {
    id: "plate-custom",
    name: "Elite",
    basePrice: 0,
    minPax: 100,
    limits: {},
    extras: ["Build your own menu — each dish charged at its category rate"],
  },
];

export const RECOMMENDED_PACKAGES: RecommendedPackage[] = [
  {
    id: "recommended-beginner",
    name: "Beginner",
    basePrice: 300,
    items: [
      "Welcome Drink 1",
      "Starter 1",
      "Pav Bhaji / Chole Puri - 1",
      "Briyani - 1",
      "Gulamjamun - 1",
    ],
  },
  {
    id: "recommended-intermediate",
    name: "Intermediate",
    basePrice: 475,
    items: [
      "Welcome Drink 1",
      "Starter 1",
      "Pani Puri / Chat - 1",
      "Pav Bhaji - 1",
      "Chole Puri - 1",
      "Dosa - 3",
      "Ice Cream - 1",
    ],
  },
  {
    id: "recommended-advanced",
    name: "Advanced",
    basePrice: 500,
    items: [
      "Welcome Drink 1",
      "Starter 1",
      "Pani Puri / Chat - 1",
      "Pav Bhaji / Chole Puri - 1",
      "Chinese - 3",
      "Dosa - 3",
      "Ice Cream - 1",
    ],
  },
  {
    id: "recommended-pro",
    name: "Professional",
    basePrice: 550,
    items: [
      "Welcome Drink 1",
      "Starter 1",
      "Pani Puri / Chat - 1",
      "Pizza - 1",
      "Pasta - 2",
      "Dosa - 3",
      "Ice Cream - 1",
    ],
  },
];

const WEDDING = "Wedding Ceremony & Reception";
const ENGAGEMENT = "Engagement Ceremony";
const SANGEET = "Sangeet";
const MEHENDI = "Mehendi";
const HALDI = "Haldi";
const BIRTHDAY = "Birthday";
const ANNIVERSARY = "Anniversary";
const RETIREMENT = "Retirement Party";
const NAMING = "Naming Ceremony";
const BABY_SHOWER = "Baby Shower";
const BRIDAL_SHOWER = "Bridal Shower";
const CORPORATE = "Corporate Event (Meeting, Conference, Gala)";
const KITTY = "Kitty Party";
const KARAOKE = "Karaoke Night";
const GARBA = "Garba";
const DANCE_PRACTICE = "Dance Practice";
const PRESCHOOL = "Preschool";
const SCHOOL = "School Annual Day";
const GALA = "Corporate Gala";
const AWARDS = "Awards Dinner";
const SEMINAR = "Seminar";
const AGM = "AGM";
const SOCIETY = "Society Meeting";
const REDEV = "Re-Development Meeting";
const CHARITY = "Charity Event";
const FUNDRAISER = "Fundraiser Event";

export const DECOR_OPTIONS: DecorOption[] = [
  { id: "d1", name: "Floral Entrance Arch", price: 8000, description: "Fresh flower entry gate", events: [WEDDING, ENGAGEMENT, SANGEET, MEHENDI, HALDI, NAMING, BABY_SHOWER, BRIDAL_SHOWER] },
  { id: "d2", name: "Fairy Light Canopy", price: 6000, description: "Warm fairy lights overhead", events: [WEDDING, ENGAGEMENT, SANGEET, MEHENDI, HALDI, BIRTHDAY, ANNIVERSARY, RETIREMENT, KITTY, KARAOKE] },
  { id: "d3", name: "Balloon Décor", price: 12000, description: "Themed balloon arrangements", events: [BIRTHDAY, ANNIVERSARY, RETIREMENT, NAMING, BABY_SHOWER, BRIDAL_SHOWER, PRESCHOOL, SCHOOL, KITTY, KARAOKE] },
  { id: "d4", name: "Table Centerpieces", price: 3500, description: "Per 10 tables", events: [WEDDING, ENGAGEMENT, CORPORATE, GALA, AWARDS, SEMINAR, CHARITY, FUNDRAISER, NAMING, BABY_SHOWER, BRIDAL_SHOWER, BIRTHDAY, ANNIVERSARY, RETIREMENT] },
  { id: "d5", name: "Theme Backdrop", price: 7000, description: "Custom photo backdrop", events: [BIRTHDAY, ANNIVERSARY, RETIREMENT, NAMING, BABY_SHOWER, BRIDAL_SHOWER, KITTY, KARAOKE, PRESCHOOL, SCHOOL, SANGEET, MEHENDI, HALDI] },
  { id: "d6", name: "Mandap Floral Setup", price: 25000, description: "Traditional flower mandap", events: [WEDDING] },
  { id: "d7", name: "Haldi Yellow Theme", price: 9000, description: "Marigold & yellow drapes", events: [HALDI] },
  { id: "d8", name: "Mehendi Green Theme", price: 9000, description: "Green florals & jhumkas", events: [MEHENDI] },
  { id: "d9", name: "Ring Ceremony Platter", price: 3000, description: "Decorated ring tray", events: [ENGAGEMENT] },
  { id: "d10", name: "Cradle Decoration", price: 6500, description: "Floral cradle for baby", events: [NAMING, BABY_SHOWER] },
  { id: "d11", name: "Baby Shower Drapes", price: 5500, description: "Pastel drapes & props", events: [BABY_SHOWER] },
  { id: "d12", name: "Corporate Branding Standee", price: 4000, description: "Logo standees & flags", events: [CORPORATE, GALA, AWARDS, SEMINAR, AGM, SOCIETY, REDEV, CHARITY, FUNDRAISER] },
  { id: "d13", name: "Stage Podium & Banner", price: 5000, description: "Podium with branded banner", events: [CORPORATE, GALA, AWARDS, SEMINAR, AGM, SOCIETY, REDEV, CHARITY, FUNDRAISER, PRESCHOOL, SCHOOL] },
  { id: "d14", name: "Conference Table Setup", price: 3500, description: "Table linens & notepads", events: [CORPORATE, AGM, SOCIETY, REDEV, SEMINAR] },
  { id: "d15", name: "Awards Spotlight Setup", price: 12000, description: "Spotlight + red carpet", events: [GALA, AWARDS, CHARITY, FUNDRAISER] },
  { id: "d16", name: "Garba Dandiya Décor", price: 8500, description: "Traditional chaniya theme", events: [GARBA] },
  { id: "d17", name: "LED Dance Floor", price: 18000, description: "Illuminated dance floor", events: [GARBA, DANCE_PRACTICE, SANGEET, MEHENDI, HALDI, WEDDING, BIRTHDAY, ANNIVERSARY, RETIREMENT] },
  { id: "d18", name: "Karaoke Lounge Setup", price: 6000, description: "Mood lighting + props", events: [KARAOKE, KITTY] },
  { id: "d19", name: "Cake Table Décor", price: 2500, description: "Decorated cake table", events: [BIRTHDAY, ANNIVERSARY, RETIREMENT, NAMING, BABY_SHOWER, BRIDAL_SHOWER, KITTY, KARAOKE] },
  { id: "d20", name: "School Theme Cutouts", price: 5500, description: "Cartoon/educational props", events: [PRESCHOOL, SCHOOL] },
  { id: "d21", name: "Charity Donor Wall", price: 7000, description: "Sponsor & donor display", events: [CHARITY, FUNDRAISER] },
];

export const STAGE_OPTIONS: DecorOption[] = [
  { id: "s0", name: "Basic Stage Decoration", price: 0, description: "Basic stage setup" },
  { id: "s1", name: "Classic Floral Stage", price: 15000, description: "Roses + drapes" },
  { id: "s2", name: "Royal Mandap", price: 35000, description: "Traditional wedding mandap" },
  { id: "s3", name: "LED Wall Stage", price: 45000, description: "Full LED backdrop with visuals" },
  { id: "s4", name: "Minimal Modern", price: 18000, description: "Clean geometric stage design" },
  { id: "s5", name: "Birthday Theme Stage", price: 12000, description: "Character / theme based" },
];

export const CHAIR_OPTIONS: ChairOption[] = [
  { id: "c1", name: "Standard Chair", pricePerUnit: 25 },
  { id: "c2", name: "Cushioned Chair", pricePerUnit: 60 },
  { id: "c3", name: "Chiavari Chair", pricePerUnit: 120 },
  { id: "c4", name: "VIP Sofa Seating", pricePerUnit: 350 },
];

export const EXTRA_SERVICES: ExtraService[] = [
  { id: "e1", name: "Photography", price: 25000, unit: "package" },
  { id: "e2", name: "Videography + Drone", price: 35000, unit: "package" },
  { id: "e3", name: "DJ & Sound", price: 6000, unit: "event" },
  { id: "e5", name: "Valet Parking", price: 8000, unit: "event" },
  { id: "e6", name: "Anchor / MC", price: 12000, unit: "event" },
  { id: "e7", name: "Smoke & Cold Pyro Entry With Smoke Bubble Machine", price: 15000, unit: "show" },
  { id: "e8", name: "Return Gifts", price: 150, unit: "per guest" },
  { id: "e9", name: "Projector", price: 3500, unit: "event" },
  { id: "e10", name: "Vidhi Mandap", price: 15000, priceMax: 25000, unit: "event" },
  {
    id: "e11",
    name: "Digital Screen",
    price: 15000,
    priceMax: 25000,
    unit: "event",
    subtitle: "10' * 10' or 10' * 12'",
  },
];

export const DJ_EXTRA_ID = "e3";

export type MenuPackageCardExtra = {
  id: string;
  name: string;
  price?: number;
  priceMax?: number;
  detail?: string;
};

export function formatMenuPackageExtraPrice(item: MenuPackageCardExtra): string {
  if (item.price != null && item.priceMax != null) {
    return `₹${item.price.toLocaleString("en-IN")} – ₹${item.priceMax.toLocaleString("en-IN")}`;
  }
  if (item.price != null) return `₹${item.price.toLocaleString("en-IN")}`;
  return item.detail ?? "";
}

/** Named add-ons for the menu package card (matches enquiry tab labels). */
export const MENU_PACKAGE_CARD_EXTRAS: MenuPackageCardExtra[] = [
  { id: "e3", name: "DJ & Sound", price: 6000 },
  { id: "extra-balloon", name: "Balloon Decoration", price: 15000 },
  { id: "e1", name: "Photography", price: 25000 },
  { id: "e2", name: "Videography + Drone", price: 35000 },
  { id: "e5", name: "Valet Parking", price: 8000 },
  { id: "e6", name: "Anchor / MC", price: 12000 },
  { id: "e7", name: "Smoke & Cold Pyro Entry With Smoke Bubble Machine", price: 15000 },
  { id: "e8", name: "Return Gifts", price: 150 },
  { id: "e9", name: "Projector", price: 3500 },
  { id: "e10", name: "Vidhi Mandap", price: 15000, priceMax: 25000 },
  { id: "e11", name: "Digital Screen", price: 15000, priceMax: 25000, detail: "10' * 10' or 10' * 12'" },
];

export const VENUE_OPTIONS: VenueOption[] = [
  { id: "v1", name: "Main Banquet Hall", pricePerHour: 6000, description: "Indoor AC hall · up to 400 guests" },
];

export function getDefaultVenueId(): string {
  return VENUE_OPTIONS.length === 1 ? VENUE_OPTIONS[0].id : "";
}