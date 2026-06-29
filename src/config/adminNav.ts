import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  ClipboardPen,
  NotebookPen,
  Contact,
  CreditCard,
  FileText,
  LayoutGrid,
  ScrollText,
  Package,
  ShoppingBasket,
  Sparkles,
  Settings,
  Store,
  UserRound,
  CalendarCheck,
  PhoneForwarded,
  UtensilsCrossed,
} from "lucide-react";

export type AdminNavItem = {
  id: string;
  path: string;
  icon: LucideIcon;
  titleKey: string;
  subtitleKey: string;
  descKey?: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "calendar",
    path: "/calendar",
    icon: CalendarDays,
    titleKey: "module.calendar.title",
    subtitleKey: "module.calendar.subtitle",
    descKey: "module.calendar.desc",
  },
  {
    id: "enquiries",
    path: "/enquiries",
    icon: ClipboardList,
    titleKey: "module.enquiries.title",
    subtitleKey: "module.enquiries.subtitle",
    descKey: "module.enquiries.desc",
  },
  {
    id: "follow-up",
    path: "/follow-up",
    icon: PhoneForwarded,
    titleKey: "module.followUp.title",
    subtitleKey: "module.followUp.subtitle",
    descKey: "module.followUp.desc",
  },
  {
    id: "customers",
    path: "/customers",
    icon: UserRound,
    titleKey: "module.customers.title",
    subtitleKey: "module.customers.subtitle",
    descKey: "module.customers.desc",
  },
  {
    id: "bookings",
    path: "/bookings",
    icon: CalendarCheck,
    titleKey: "module.bookings.title",
    subtitleKey: "module.bookings.subtitle",
    descKey: "module.bookings.desc",
  },
  {
    id: "vendors",
    path: "/vendors",
    icon: Store,
    titleKey: "module.vendors.title",
    subtitleKey: "module.vendors.subtitle",
    descKey: "module.vendors.desc",
  },
  {
    id: "inventory",
    path: "/inventory",
    icon: Package,
    titleKey: "module.inventory.title",
    subtitleKey: "module.inventory.subtitle",
    descKey: "module.inventory.desc",
  },
  {
    id: "payments",
    path: "/payments",
    icon: CreditCard,
    titleKey: "module.payments.title",
    subtitleKey: "module.payments.subtitle",
    descKey: "module.payments.desc",
  },
  {
    id: "generate-invoice",
    path: "/generate-invoice",
    icon: FileText,
    titleKey: "module.generateInvoice.title",
    subtitleKey: "module.generateInvoice.subtitle",
    descKey: "module.generateInvoice.desc",
  },
  {
    id: "visiting-card",
    path: "/visiting-card",
    icon: Contact,
    titleKey: "module.visitingCard.title",
    subtitleKey: "module.visitingCard.subtitle",
    descKey: "module.visitingCard.desc",
  },
  {
    id: "extra",
    path: "/extra",
    icon: Sparkles,
    titleKey: "module.extra.title",
    subtitleKey: "module.extra.subtitle",
    descKey: "module.extra.desc",
  },
];

export const EXTRA_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "enquiry",
    path: "/enquiry",
    icon: ClipboardList,
    titleKey: "module.enquiry.title",
    subtitleKey: "module.enquiry.subtitle",
    descKey: "module.enquiry.desc",
  },
  {
    id: "enquiry-v2",
    path: "/enquiry-v2",
    icon: ClipboardPen,
    titleKey: "module.enquiryV2.title",
    subtitleKey: "module.enquiryV2.subtitle",
    descKey: "module.enquiryV2.desc",
  },
  {
    id: "enquiry-v3",
    path: "/enquiry-v3",
    icon: NotebookPen,
    titleKey: "module.enquiryV3.title",
    subtitleKey: "module.enquiryV3.subtitle",
    descKey: "module.enquiryV3.desc",
  },
  {
    id: "menu",
    path: "/menu-selection",
    icon: UtensilsCrossed,
    titleKey: "module.menu.title",
    subtitleKey: "module.menu.subtitle",
    descKey: "module.menu.desc",
  },
  {
    id: "menu-package-card",
    path: "/menu-package-card",
    icon: LayoutGrid,
    titleKey: "module.menuPackageCard.title",
    subtitleKey: "module.menuPackageCard.subtitle",
    descKey: "module.menuPackageCard.desc",
  },
  {
    id: "menu-catalog",
    path: "/menu-catalog",
    icon: ScrollText,
    titleKey: "module.menuCatalog.title",
    subtitleKey: "module.menuCatalog.subtitle",
    descKey: "module.menuCatalog.desc",
  },
  {
    id: "procurement",
    path: "/procurement",
    icon: ShoppingBasket,
    titleKey: "module.procurement.title",
    subtitleKey: "module.procurement.subtitle",
    descKey: "module.procurement.desc",
  },
];

const ACCOUNT_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "profile",
    path: "/profile",
    icon: UserRound,
    titleKey: "profile.title",
    subtitleKey: "profile.subtitle",
    descKey: "profile.desc",
  },
  {
    id: "settings",
    path: "/settings",
    icon: Settings,
    titleKey: "settings.title",
    subtitleKey: "settings.subtitle",
    descKey: "settings.desc",
  },
];

const ALL_NAV_ITEMS = [...ADMIN_NAV_ITEMS, ...EXTRA_NAV_ITEMS, ...ACCOUNT_NAV_ITEMS];

export function isGenerateInvoicePath(pathname: string): boolean {
  return pathname === "/generate-invoice" || pathname === "/bill" || pathname.startsWith("/bill/");
}

export function isExtraNavPath(pathname: string): boolean {
  return pathname === "/extra" || EXTRA_NAV_ITEMS.some((item) => isAdminNavActive(pathname, item));
}

export function getAdminNavItem(pathname: string): AdminNavItem {
  if (isGenerateInvoicePath(pathname)) {
    return ADMIN_NAV_ITEMS.find((item) => item.id === "generate-invoice") ?? ADMIN_NAV_ITEMS[0];
  }

  const exact = ALL_NAV_ITEMS.find((item) => item.path === pathname);
  if (exact) return exact;

  const nested = ALL_NAV_ITEMS.filter((item) => item.path !== "/").find((item) =>
    pathname.startsWith(item.path),
  );
  return nested ?? ADMIN_NAV_ITEMS[0];
}

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.path === "/") return pathname === "/";
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
