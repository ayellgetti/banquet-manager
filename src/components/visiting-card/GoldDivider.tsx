import { GOLD } from "./cardTheme";

type GoldDividerProps = {
  className?: string;
};

export const GoldDivider = ({ className = "max-w-[240px]" }: GoldDividerProps) => (
  <svg viewBox="0 0 320 16" className={`mx-auto h-3.5 w-full ${className}`} aria-hidden="true">
    <path
      d="M0 12 H120 Q160 12 160 12 Q200 12 240 12 H320"
      fill="none"
      stroke={GOLD}
      strokeWidth="1"
    />
    <path
      d="M150 4 L160 12 L170 4 M155 20 L160 12 L165 20"
      fill="none"
      stroke={GOLD}
      strokeWidth="1"
    />
  </svg>
);
