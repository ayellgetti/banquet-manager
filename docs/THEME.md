# Noir & Gold — Design System

Color tones and theme guidelines for websites that match the Banquet Enquiry app aesthetic: warm, premium, and event-focused.

## Core concept

| Role | Mood |
|------|------|
| **Base** | Warm cream / ivory (not pure white) — feels like fine paper or a banquet hall |
| **Text** | Deep noir (blue-charcoal, not pure black) — elegant and readable |
| **Accent** | Rich gold — buttons, highlights, pricing, CTAs |
| **Contrast blocks** | Dark noir headers/footers with gold accents |

**One-line brand definition:** Warm cream base, deep noir text, antique gold accents, dark hero sections with gold highlights — banquet / wedding luxury, not flashy yellow.

---

## Main palette

Define these five colors first.

### 1. Background — Warm cream

| | Value |
|---|------|
| **HSL** | `40 33% 97%` |
| **Hex** | `#FAF8F4` |
| **Use** | Page background |

Avoid pure white (`#FFFFFF`). The slight warmth creates the premium feel.

### 2. Foreground / text — Noir

| | Value |
|---|------|
| **HSL** | `220 18% 11%` |
| **Hex** | `#161B22` |
| **Use** | Body text, headings, labels |

Softer than pure black; reads as elegant charcoal.

### 3. Primary — Gold (brand color)

| | Value |
|---|------|
| **HSL** | `43 56% 47%` |
| **Hex** | `#B8952E` |
| **Use** | Buttons, links, active states, icons, selected borders |

### 4. Gold glow (highlights)

| | Value |
|---|------|
| **HSL** | `43 75% 65%` |
| **Hex** | `#E8C96A` |
| **Use** | Gradients, hover states, decorative glows |

### 5. Dark sections — Noir gradient

| | Value |
|---|------|
| **From** | `hsl(220 25% 8%)` → `#0F1218` |
| **To** | `hsl(220 18% 18%)` → `#252A33` |
| **Use** | Headers, hero, footer, pricing cards |

Pair with gold text or gold accent lines.

---

## Supporting tones

| Token | HSL | Hex (approx.) | Use |
|-------|-----|---------------|-----|
| **Card** | `0 0% 100%` | `#FFFFFF` | White cards on cream background |
| **Muted** | `40 22% 93%` | `#F0EDE8` | Secondary panels, disabled areas |
| **Muted text** | `220 10% 40%` | `#5C6169` | Captions, hints, secondary copy |
| **Border** | `40 18% 86%` | `#E0D9CF` | Card borders, dividers |
| **Accent (soft gold)** | `43 70% 92%` | `#F9F3E3` | Selected / hover backgrounds |
| **Destructive** | `0 72% 48%` | `#D92D20` | Errors, validation messages |

### Alert / info (optional)

| Type | Background | Text | Border |
|------|------------|------|--------|
| **Warning / package notes** | `amber-50` | `amber-950` | `amber-200` |
| **Info / tips** | `blue-50` | `blue-950` | `blue-200` |

---

## Usage rule (60-30-10)

```
60% → Cream background + white cards
30% → Noir text + muted grays
10% → Gold accents (buttons, highlights, borders)
```

### Do

- Use gold on primary buttons and CTAs
- Use dark noir headers with a gold line or gradient text
- Keep the page cream with white content cards
- Add soft gold shadows on primary actions

### Avoid

- Covering everything in gold
- Pure white + pure black (too harsh)
- Bright yellow (`#FFD700`) — keep gold muted and warm

---

## Gradients & shadows

```css
/* Gold gradient — buttons, badges, active tabs */
--gradient-gold: linear-gradient(135deg, hsl(43 65% 52%), hsl(43 80% 68%));

/* Noir gradient — header, hero, footer */
--gradient-noir: linear-gradient(135deg, hsl(220 25% 8%), hsl(220 18% 18%));

/* Soft shadow */
--shadow-soft: 0 10px 30px -12px hsl(43 50% 25% / 0.18);

/* Gold glow shadow */
--shadow-gold: 0 14px 40px -16px hsl(43 75% 50% / 0.45);
```

---

## Typography

| Use | Font | Notes |
|-----|------|-------|
| **Body** | [DM Sans](https://fonts.google.com/specimen/DM+Sans) | Clean, readable UI text |
| **Headings / display** | [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | Slightly geometric; use `letter-spacing: -0.01em` |

Pair a geometric display font with a neutral sans for a modern luxury look.

---

## CSS variables (starter kit)

Copy into `:root` for a new project. Values match `src/index.css` in this repo.

```css
:root {
  /* Noir & Gold */
  --background: 40 33% 97%;
  --foreground: 220 18% 11%;

  --card: 0 0% 100%;
  --card-foreground: 220 18% 11%;

  --primary: 43 56% 47%;
  --primary-foreground: 220 25% 8%;
  --primary-glow: 43 75% 65%;

  --secondary: 40 25% 94%;
  --secondary-foreground: 220 18% 14%;

  --muted: 40 22% 93%;
  --muted-foreground: 220 10% 40%;

  --accent: 43 70% 92%;
  --accent-foreground: 35 65% 22%;

  --destructive: 0 72% 48%;
  --destructive-foreground: 0 0% 100%;

  --border: 40 18% 86%;
  --input: 40 18% 86%;
  --ring: 43 56% 47%;

  --radius: 0.75rem;

  --gradient-gold: linear-gradient(135deg, hsl(43 65% 52%), hsl(43 80% 68%));
  --gradient-noir: linear-gradient(135deg, hsl(220 25% 8%), hsl(220 18% 18%));
  --shadow-soft: 0 10px 30px -12px hsl(43 50% 25% / 0.18);
  --shadow-gold: 0 14px 40px -16px hsl(43 75% 50% / 0.45);
}
```

### Tailwind usage

When using Tailwind with CSS variables:

```css
color: hsl(var(--primary));
background: hsl(var(--background));
```

Utility classes in this app include:

- `bg-gradient-gold` — gold gradient background
- `bg-gradient-noir` — dark header/footer gradient
- `text-gradient-gold` — gold gradient text
- `shadow-soft` / `shadow-gold` — elevation

---

## Dark mode (optional)

For a dark variant, invert the base while keeping gold accents:

| Token | HSL |
|-------|-----|
| Background | `220 25% 7%` |
| Foreground | `40 30% 94%` |
| Primary | `43 70% 60%` |
| Card | `220 22% 10%` |
| Border | `220 16% 20%` |

See `src/index.css` (`.dark` block) for the full dark palette.

---

## Source of truth

Live tokens are defined in:

- `src/index.css` — CSS variables and utility classes
- `tailwind.config.ts` — Tailwind color mapping

When updating the theme, change `src/index.css` first, then keep this document in sync.
