import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { StoredUser } from "@/lib/authStorage";

type Props = {
  onNavigate?: () => void;
  className?: string;
};

function getUserDisplayName(user: StoredUser | null, fallback: string): string {
  if (!user) return fallback;
  const name = `${user.firstName} ${user.lastName}`.replace(/\s+\./g, "").trim();
  return name || user.username;
}

function getUserInitials(user: StoredUser | null): string {
  if (!user) return "?";
  const name = getUserDisplayName(user, "");
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export const SidebarProfileMenu = ({ onNavigate, className }: Props) => {
  const { user, logout } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  const displayName = getUserDisplayName(user, t("profile.guest"));
  const initials = getUserInitials(user);

  const goTo = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-left transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
            className,
          )}
          aria-label={t("profile.menu")}
        >
          <Avatar className="h-9 w-9 border border-white/15">
            <AvatarFallback className="bg-gradient-gold text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{displayName}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-52">
        <DropdownMenuItem onClick={() => goTo("/profile")} className="gap-2">
          <UserRound className="h-4 w-4" />
          {t("profile.view")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => goTo("/settings")} className="gap-2">
          <Settings className="h-4 w-4" />
          {t("profile.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          {t("profile.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
