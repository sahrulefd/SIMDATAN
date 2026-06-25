# UI Design Specification & Theme System
## Styling Architecture: Tailwind CSS, Shadcn UI, HSL Variables

This document defines the branding identity, visual rules, and CSS tokens of the SIMDATAN platform.

---

### 1. Color Palette (HSL Design Tokens)
Our theme uses dynamic HSL variables supporting light/dark theme transition.

#### Light Mode Variables
- `--background`: `0 0% 100%` (Pure White)
- `--foreground`: `222.2 47.4% 11.2%` (Deep Slate)
- `--card`: `0 0% 100%` (Card Background)
- `--primary`: `142.1 76.2% 36.3%` (Forest Green - `#15803d` branding)
- `--primary-foreground`: `355.7 100% 97.3%`
- `--secondary`: `210 40% 96.1%` (Light Blue Gray)
- `--accent`: `142.1 70% 95%` (Soft Mint Green Accent)
- `--destructive`: `0 84.2% 60.2%` (Crimson Alert)
- `--border`: `214.3 31.8% 91.4%`

#### Dark Mode Variables
- `--background`: `224 71.4% 4.1%` (Deep Dark Navy)
- `--foreground`: `210 20% 98%` (Soft White)
- `--card`: `224 71.4% 6.4%` (Darker Card panel)
- `--primary`: `142.1 70.6% 45.3%` (Bright Neon Green - branding)
- `--primary-foreground`: `144.4 96.6% 11.4%`
- `--secondary`: `217.2 32.6% 17.5%`
- `--accent`: `217.2 32.6% 17.5%`
- `--destructive`: `0 62.8% 30.6%` (Dark Red Alert)
- `--border`: `217.2 32.6% 17.5%`

---

### 2. Typography
- **Primary Font**: `Inter` (sans-serif) - Google Fonts. Loaded for highly clean numbers and reports.
- **Header Font**: `Outfit` (sans-serif) - Google Fonts. Used for cards headers, widgets, and main page titles.
- **Sizes**:
  - `h1`: `2.25rem` (36px), Bold, tracking-tight.
  - `h2`: `1.5rem` (24px), SemiBold.
  - `body`: `0.875rem` (14px), Regular.
  - `caption`: `0.75rem` (12px), Medium.

---

### 3. Layout Grid & Breakpoints
- **Mobile First**: Default layout is single column.
- **Breakpoints**:
  - Small (`sm`): `640px`
  - Medium (`md`): `768px` (Sidebar hides into hamburger menu drawer)
  - Large (`lg`): `1024px` (Sidebar docks statically)
  - Extra Large (`xl`): `1280px` (Max layout bounds)

---

### 4. Interactive Micro-Animations
- **Hover Transitions**: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` on all buttons, table rows, and navigations.
- **Card Hover Elevation**: Small scale scale-up (`scale-[1.01]`) and border color brightening on dashboard components.
- **Page Load Fade**: Simple opacity-transition (`fade-in`) on routes.
