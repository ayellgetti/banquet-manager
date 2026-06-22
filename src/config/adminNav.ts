import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  ClipboardPen,
  Contact,
  LayoutGrid,
  LayoutDashboard,
  Receipt,
  ShoppingBasket,
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
    id: "dashboard",
    path: "/",
    icon: LayoutDashboard,
    titleKey: "admin.dashboard.title",
    subtitleKey: "admin.dashboard.subtitle",
    descKey: "admin.dashboard.desc",
  },
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
    id: "menu",
    path: "/menu-selection",
    icon: UtensilsCrossed,
    titleKey: "module.menu.title",
    subtitleKey: "module.menu.subtitle",
    descKey: "module.menu.desc",
  },
  {
    id: "bill",
    path: "/bill",
    icon: Receipt,
    titleKey: "module.bill.title",
    subtitleKey: "module.bill.subtitle",
    descKey: "module.bill.desc",
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
    id: "menu-package-card",
    path: "/menu-package-card",
    icon: LayoutGrid,
    titleKey: "module.menuPackageCard.title",
    subtitleKey: "module.menuPackageCard.subtitle",
    descKey: "module.menuPackageCard.desc",
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

export function getAdminNavItem(pathname: string): AdminNavItem {
  const exact = ADMIN_NAV_ITEMS.find((item) => item.path === pathname);
  if (exact) return exact;

  const nested = ADMIN_NAV_ITEMS.filter((item) => item.path !== "/").find((item) =>
    pathname.startsWith(item.path),
  );
  return nested ?? ADMIN_NAV_ITEMS[0];
}

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.path === "/") return pathname === "/";
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
