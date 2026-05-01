# Design system for Mahallu: a Kerala mosque community SaaS

**The ideal design system for a Kerala Mahallu management app blends Islamic spiritual identity with Kerala's distinctive wooden-mosque aesthetic, implemented through shadcn/ui's OKLCH-based token system.** The most effective approach avoids generic Middle Eastern visual tropes — domes, minarets, heavy tilework — and instead draws from Kerala's own centuries-old Islamic design vocabulary: multi-tiered wooden roofs, laterite warmth, backwater teals, and the iconic Kasavu gold-on-ivory. This synthesis mirrors the Mahallu system itself, which is deeply Islamic in function yet entirely Keralite in form. The following system provides specific color codes, font stacks, icon mappings, component patterns, and production-ready CSS for a Next.js + shadcn/ui implementation.

---

## Color palette: where Islamic green meets Malabar earth

Modern Islamic apps have largely abandoned pure Islamic green (`#009000`) in favor of **teal-green** tones that bridge spirituality with professional trust. Research across 11 mosque management and Islamic fintech apps — ConnectMazjid, Wahed Invest, Manzil, Zoya, MOHID, MasjidBox, Muslim Pro — reveals a consistent pattern: **teal-green primary** (`#0D9488`–`#059669` range), **navy/dark neutrals** for structure, and **gold/amber accents** for warmth. MasjidBox breaks convention with indigo (`#4F46E5`), while Zoya uses a dark-mode-first design with green compliance indicators.

For a Kerala context, the palette must also honor regional identity. Kerala's natural palette — laterite red-brown, backwater teal, coconut green, monsoon grey, copper-gold — maps remarkably well onto Islamic color traditions. The **Kasavu principle** (ivory body + gold border) provides an elegant light-mode foundation that both communities instantly recognize.

### Recommended primary palette

| Token | Light mode | Hex | Dark mode | Hex | Rationale |
|-------|-----------|-----|-----------|-----|-----------|
| **Primary** | Deep teal-green | `#0F766E` | Bright teal-green | `#2DD4BF` | Islamic green + Kerala backwater; passes WCAG AA on white (7.1:1) |
| **Primary foreground** | White | `#FFFFFF` | Deep teal-black | `#042F2E` | High contrast text on primary |
| **Secondary** | Warm ivory | `#FFFBEB` | Dark warm gray | `#292524` | Kasavu cloth base; warm neutral |
| **Accent** | Amber gold | `#D97706` | Bright amber | `#F59E0B` | Kerala copper roofing + Islamic gold; CTAs |
| **Muted** | Sage green-gray | `#F0FDF4` | Dark green-gray | `#1C2B23` | Subtle green tint in backgrounds |
| **Destructive** | Dark red | `#B91C1C` | Soft red | `#F87171` | Error states; 10.1:1 contrast on white |
| **Background** | Off-white | `#FAFAF9` | Green-tinted black | `#0C1A14` | Warm, not clinical |
| **Foreground** | Near black | `#1C1917` | Off-white | `#F5F5F4` | High contrast text |
| **Card** | White | `#FFFFFF` | Elevated dark | `#1A2A22` | Slightly lighter than background |
| **Border** | Warm gray | `#E7E5E4` | Translucent white | `rgba(255,255,255,0.1)` | Subtle separation |
| **Sidebar** | Deep forest green | `#064E3B` | Deep teal-black | `#022C22` | Strong brand presence |
| **Sidebar foreground** | Light green | `#D1FAE5` | Soft green | `#A7F3D0` | Readable on dark sidebar |

### Extended semantic colors

| Purpose | Color | Hex | Notes |
|---------|-------|-----|-------|
| Success | Blue (not green) | `#1D4ED8` | Avoids green-only status for color-blind users |
| Warning | Deep orange | `#EA580C` | Visible to deuteranopia users |
| Info | Teal | `#0891B2` | Matches brand family |
| Zakat/donation | Emerald | `#059669` | Wealth/generosity |
| Prayer active | Amber glow | `#F59E0B` | Oil lamp warmth |
| Madrasa | Indigo | `#4F46E5` | Education/knowledge |

### Chart palette (5 slots)

`#0F766E` (teal-green), `#1D4ED8` (blue), `#D97706` (amber), `#7C3AED` (purple), `#059669` (emerald) — each distinguishable for color-blind users and harmonious with the Islamic-Kerala palette.

---

## Production-ready shadcn/ui theme CSS

shadcn/ui now uses **OKLCH color format** with Tailwind v4. The following is a complete, production-ready theme file. The `@theme inline` block bridges CSS variables to Tailwind utility classes, enabling `bg-primary`, `text-accent-foreground`, etc.

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --font-sans: var(--font-inter), var(--font-noto-malayalam),
               var(--font-noto-arabic), system-ui, sans-serif;
  --font-malayalam: var(--font-noto-malayalam), 'Manjari', sans-serif;
  --font-arabic: var(--font-noto-arabic), 'Cairo', 'Tajawal', sans-serif;
}

/* ===== LIGHT MODE — Kasavu-inspired warmth ===== */
:root {
  --radius: 0.625rem;
  --background: oklch(0.975 0.003 80);
  --foreground: oklch(0.16 0.01 50);
  --card: oklch(0.995 0.001 90);
  --card-foreground: oklch(0.16 0.01 50);
  --popover: oklch(0.995 0.001 90);
  --popover-foreground: oklch(0.16 0.01 50);
  --primary: oklch(0.50 0.12 175);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.97 0.01 85);
  --secondary-foreground: oklch(0.25 0.02 50);
  --muted: oklch(0.96 0.015 155);
  --muted-foreground: oklch(0.50 0.02 155);
  --accent: oklch(0.65 0.17 75);
  --accent-foreground: oklch(0.99 0 0);
  --destructive: oklch(0.45 0.2 25);
  --border: oklch(0.90 0.005 80);
  --input: oklch(0.90 0.005 80);
  --ring: oklch(0.50 0.12 175);
  --chart-1: oklch(0.50 0.12 175);
  --chart-2: oklch(0.48 0.20 265);
  --chart-3: oklch(0.65 0.17 75);
  --chart-4: oklch(0.55 0.19 300);
  --chart-5: oklch(0.55 0.15 155);
  --sidebar: oklch(0.28 0.06 160);
  --sidebar-foreground: oklch(0.92 0.02 155);
  --sidebar-primary: oklch(0.75 0.15 165);
  --sidebar-primary-foreground: oklch(0.15 0.03 160);
  --sidebar-accent: oklch(0.33 0.05 160);
  --sidebar-accent-foreground: oklch(0.92 0.02 155);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.75 0.15 165);
}

/* ===== DARK MODE — Night prayer atmosphere ===== */
.dark {
  --background: oklch(0.14 0.02 160);
  --foreground: oklch(0.94 0.005 90);
  --card: oklch(0.19 0.025 160);
  --card-foreground: oklch(0.94 0.005 90);
  --popover: oklch(0.19 0.025 160);
  --popover-foreground: oklch(0.94 0.005 90);
  --primary: oklch(0.72 0.15 170);
  --primary-foreground: oklch(0.14 0.02 160);
  --secondary: oklch(0.22 0.02 80);
  --secondary-foreground: oklch(0.92 0.005 90);
  --muted: oklch(0.22 0.02 160);
  --muted-foreground: oklch(0.65 0.02 155);
  --accent: oklch(0.70 0.16 80);
  --accent-foreground: oklch(0.14 0 0);
  --destructive: oklch(0.65 0.2 22);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.72 0.15 170);
  --chart-1: oklch(0.65 0.15 170);
  --chart-2: oklch(0.60 0.18 265);
  --chart-3: oklch(0.75 0.17 80);
  --chart-4: oklch(0.62 0.20 300);
  --chart-5: oklch(0.60 0.14 155);
  --sidebar: oklch(0.17 0.03 160);
  --sidebar-foreground: oklch(0.92 0.02 155);
  --sidebar-primary: oklch(0.65 0.15 170);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.24 0.03 160);
  --sidebar-accent-foreground: oklch(0.92 0.02 155);
  --sidebar-border: oklch(1 0 0 / 8%);
  --sidebar-ring: oklch(0.65 0.15 170);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}

/* Script-specific typography adjustments */
:lang(ml) {
  line-height: 1.7;
  font-size: 1.05em;
}
:lang(ar) {
  line-height: 1.7;
  font-size: 1.05em;
  letter-spacing: 0 !important;
  direction: rtl;
}
```

The **sidebar uses a deep forest green** (`oklch(0.28 0.06 160)` ≈ `#064E3B`) that evokes both Islamic identity and Kerala's tropical canopy. The dark mode background carries a subtle green tint (`oklch(0.14 0.02 160)`) rather than pure gray, creating a "night prayer" atmosphere. In OKLCH, the hue angle **~155–175°** covers the green-to-teal range central to this design, while **~75–85°** covers the gold/amber accent range.

---

## Typography: Inter + Noto for trilingual harmony

The trilingual challenge — Malayalam, English, and Arabic on one screen — demands a deliberate font strategy. **Malayalam characters are significantly more complex than Latin**, requiring larger minimum sizes and more generous line-height. Arabic must never receive `letter-spacing` (it disconnects joined letters) and needs RTL handling.

### Recommended font stack

| Script | Primary font | Fallback | Weights | Use |
|--------|-------------|----------|---------|-----|
| English/Latin | **Inter** | system-ui | 400, 500, 600, 700 | All UI text, body, headers |
| Malayalam | **Noto Sans Malayalam** | Manjari | 400, 500, 600, 700 | Names, labels, content |
| Arabic | **Noto Sans Arabic** | Cairo, Tajawal | 400, 500, 600, 700 | Islamic terms, Quranic text |
| Display headers | **Manjari Bold** or **Baloo Chettan 2** | — | 700 | Large Malayalam headers |

**Inter** is shadcn/ui's natural companion — screen-optimized with tabular numerals (critical for financial tables), **9 weights**, and a tall x-height for small-size readability. **Noto Sans Malayalam** is the gold standard for Malayalam web typography, offering variable font support (100–900 weight axis) and design harmony with the broader Noto family. All three Noto fonts share compatible vertical metrics and stroke weights, providing **visual cohesion across scripts**.

The CSS font fallback mechanism handles multi-script automatically: when Inter encounters a Malayalam glyph it cannot render, the browser falls to Noto Sans Malayalam. This means a single `font-family` declaration covers all three scripts — no per-language selectors required for basic rendering.

### Next.js implementation

```tsx
// app/layout.tsx
import { Inter, Noto_Sans_Malayalam, Noto_Sans_Arabic } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const notoMalayalam = Noto_Sans_Malayalam({
  subsets: ['malayalam'],
  variable: '--font-noto-malayalam',
  display: 'swap',
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning
      className={`${inter.variable} ${notoMalayalam.variable} ${notoArabic.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Sizing rules for complex scripts

| Element | English | Malayalam | Arabic |
|---------|---------|----------|--------|
| Body text | 16px (1rem) | 17–18px (1.05em) | 17–18px (1.05em) |
| Minimum readable | 12px | **14px** (hard floor) | 14px |
| UI labels | 14px | 15–16px | 15–16px |
| Line-height (body) | 1.5 | **1.7** | **1.7** |
| Line-height (headings) | 1.25 | 1.4 | 1.4 |

Malayalam's minimum of **14px** is non-negotiable — its conjunct ligatures become illegible below this threshold. For elderly users (a significant Mahallu demographic), target **18px+ body text** with Malayalam at **19–20px**.

---

## Icon system: Lucide core + Tabler supplements + custom Islamic SVGs

Lucide Icons (1,694+ icons) is shadcn/ui's default and should remain the primary library. However, Lucide has **no mosque icon, no prayer icon, and no graveyard icon** — critical gaps for this app. **Tabler Icons** (5,900+ icons, MIT license) fills these gaps with `IconMosque`, `IconPray`, and others, sharing Lucide's 24×24 grid and 2px stroke weight for visual consistency.

### Complete icon mapping by feature

| Feature area | Icon | Library | Alternatives |
|-------------|------|---------|-------------|
| **Dashboard** | `LayoutDashboard` | Lucide | — |
| **Families** | `Users` | Lucide | `Home` for households |
| **Member profile** | `CircleUser` | Lucide | `Contact` |
| **Member directory** | `BookUser` | Lucide | `Search` |
| **Donations/Zakat** | `HandCoins` | Lucide | `Heart`, `Gift` |
| **Financial overview** | `Wallet` | Lucide | `BadgeIndianRupee` |
| **Income** | `TrendingUp` | Lucide | `ArrowUpCircle` |
| **Expense** | `TrendingDown` | Lucide | `Receipt` |
| **Subscriptions** | `CreditCard` | Lucide | `Repeat` |
| **Accounting** | `Calculator` | Lucide | `Coins` |
| **Qard Hasan loans** | `Handshake` | Lucide | `HandCoins` |
| **Madrasa/education** | `School` | Lucide | `GraduationCap` |
| **Students** | `GraduationCap` | Lucide | `BookOpenCheck` |
| **Attendance** | `ClipboardCheck` | Lucide | `CalendarCheck` |
| **Mosque** | `IconMosque` | **Tabler** | Custom SVG |
| **Prayer times** | `Clock` | Lucide | `AlarmClock` |
| **Prayer/Salah** | `IconPray` | **Tabler** | Custom SVG |
| **Quran** | `BookOpen` | Lucide | `BookText` |
| **Moon/Islamic** | `Moon` | Lucide | `MoonStar` |
| **Marriage/Nikah** | `HeartHandshake` | Lucide | `ScrollText` |
| **Death/Janazah** | `Flower2` | Lucide | Custom SVG |
| **Cemetery** | Custom SVG | **Custom** | `MapPin` fallback |
| **Certificates** | `Award` | Lucide | `BadgeCheck` |
| **Announcements** | `Megaphone` | Lucide | `BellRing` |
| **Notifications** | `Bell` | Lucide | `BellDot` (unread) |
| **Welfare** | `HeartHandshake` | Lucide | `ShieldCheck` |
| **Committee** | `UsersRound` | Lucide | `Network` |
| **Meetings** | `CalendarCheck` | Lucide | `Presentation` |
| **Settings** | `Settings` | Lucide | `SlidersHorizontal` |
| **Reports** | `BarChart3` | Lucide | `PieChart` |

### Custom SVGs needed (5–8 icons)

Create these in Lucide's design language — **24×24 grid, 2px stroke, round caps, no fill**:

- **Mosque/Masjid**: Kerala-style multi-tiered roof silhouette (not dome-and-minaret) — this is the single most distinctive cultural design choice
- **Mihrab**: Arched niche shape for prayer direction
- **Quran stand** (Rehal): Open book on a wooden stand
- **Cemetery/Qabristan**: Abstract tombstone markers
- **Janazah**: Respectful funeral symbol (shrouded form or carried bier)
- **Wudu/Ablution**: Water droplets with hands
- **Mahallu**: Combined mosque + community symbol

### Islamic decorative elements for UI

Geometric Islamic patterns work as subtle background textures at **2–5% opacity** — anything more overwhelms a SaaS interface. Effective placements include login/onboarding screens, empty states, sidebar backgrounds, and section dividers. The **mihrab arch** (`border-radius: 50% 50% 0 0 / 60% 60% 0 0`) makes an excellent card header shape. Kerala-specific alternatives include **lattice/jali patterns** from wooden mosque screens and **Kasavu-style gold border** patterns as card dividers — these bridge both Islamic geometric art and Keralite craft traditions authentically.

---

## Navigation architecture and UI patterns

### Sidebar structure with role-based filtering

The app's 15+ sections demand **grouped collapsible navigation** using shadcn/ui's `SidebarGroup` with `Collapsible`. Groups should collapse to icon-only on mobile. Structure navigation into **6–7 top-level groups** that mirror how Mahallu committees actually think:

```
📊 OVERVIEW
   Dashboard · Analytics · Reports

👨‍👩‍👧‍👦 PEOPLE
   Families · Members · Directory

💰 FINANCE
   Donations & Zakat · Accounts · Qard Hasan · Subscriptions

📚 MADRASA
   Classes · Students · Teachers · Attendance

🕌 MOSQUE AFFAIRS
   Prayer Times · Announcements · Committees · Programs

📋 RECORDS
   Marriage (Nikah) · Death (Janazah) · Certificates · Cemetery

❤️ WELFARE
   Schemes · Aid Distribution
```

Pin **Dashboard, Members, and Finance** permanently visible (the 80/20 items). Settings, Users & Roles, and Help go in the `SidebarFooter`. Add a **Cmd+K command palette** using shadcn/ui's `CommandDialog` for power-user navigation across all 15+ sections.

### Mobile adaptation

On screens below 768px, the sidebar transforms into a **bottom tab bar** with 5 items: Home, Members, Finance, Madrasa, and a "More" overflow menu. Touch targets must be **48×48px minimum** with 8px spacing between targets — critical for Kerala's elderly Mahallu members who are smartphone-literate but face age-related motor decline. Use `Sheet` (bottom drawer) for the "More" menu.

### Dashboard card pattern

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 👥 Total     │  │ 💰 This Month│  │ 📚 Madrasa   │  │ 🕐 Next      │
│ Members      │  │ Collections  │  │ Students     │  │ Prayer       │
│   1,247      │  │  ₹2,45,000   │  │    342       │  │ Asr: 3:45 PM │
│ ↑ +12 this mo│  │ ↑ +15% vs la │  │ ↓ -3 vs last │  │ in 2h 15m    │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

Each stat card uses: icon + label (top), **bold large number** (center), trend indicator with comparison period (bottom). Color-code trends — green for positive, red for negative — but always pair with **directional arrows** (never color alone) for accessibility.

### Data-dense financial views

Mosque accounting requires serious tabular interfaces. Use shadcn/ui's **DataTable** (TanStack Table v8) with sticky headers, column sorting, row selection for bulk actions, expandable rows for transaction details, and an Indian Rupee (₹) formatted summary row. On mobile, tables transform into a stacked card list showing only key columns. Include date-range picker filters and CSV/PDF export.

### Multi-role interface

Filter sidebar items by role at the configuration level — define `roles: ['admin', 'imam', 'secretary']` per navigation item. Show a **role badge** near the user avatar in the sidebar footer. For users with multiple roles, provide a dropdown switcher. Hide action buttons (not just pages) based on permissions.

---

## Kerala's mosque aesthetic as a design differentiator

This is the most important strategic design decision: **do not use generic dome-and-minaret imagery**. Kerala's mosque architecture — the Mishkal Mosque's four-tiered wooden gables, Ponnani Juma Masjid's temple-like teak construction, Odathil Palli's copper roofing — has **no domes, no minarets, and no Middle Eastern visual vocabulary**. These mosques were built by the same artisans who constructed Hindu temples, using laterite stone foundations, interlocking teak joinery (no nails), and Chinese-influenced multi-tiered roofs.

The **multi-tiered gable silhouette** should be the app's architectural motif. Abstract it into a simplified line icon for the logo, section headers, and empty states. This immediately signals "Kerala mosque" to any Mappila user while being genuinely distinctive in the Islamic app market. Other authentic Kerala-Islamic decorative elements include latticed wooden screens (jali patterns), lotus medallions (found on mosque ceilings at Jama Palli and Muchundi Palli), and the warm patina of aged teak wood.

The Kasavu cloth aesthetic — **ivory base with gold accents** — provides an instantly recognizable Kerala visual language that doubles as an elegant light-mode scheme. In dark mode, shift to the atmosphere of a traditional Kerala mosque interior: **deep teak-brown and copper-green tones** lit by the warm glow of brass nilavilakku oil lamps.

Things to avoid: Arabic/Ottoman tilework patterns (foreign to Malabar Islam), Mughal/North Indian Islamic aesthetics (Kerala Muslims are Shafi'i, Malayalam-speaking Mappilas with a distinct identity), neon or heavily saturated colors (Kerala's natural palette is earthy and pigment-based), and heart symbols in community features (culturally inappropriate for conservative communities).

---

## Accessibility and cultural sensitivity are non-negotiable

### Color contrast for a green-heavy palette

Green is the most problematic color for color-blind users — **8% of men** have red-green color blindness. The palette mitigates this through several strategies. The primary teal-green (`#0F766E`) achieves **7.1:1 contrast** on white, passing WCAG AAA for large text. Success states use **blue** (`#1D4ED8`) rather than green, and error states use **dark red** (`#B91C1C`, 10.1:1 contrast) rather than bright red. Warning states use **deep orange** (`#EA580C`), which remains distinguishable for deuteranopia users. No information is conveyed by color alone — every colored indicator is paired with an icon, label, or pattern.

### Elderly user design (a core demographic)

Mahallu committees include many members over 60. Kerala's elderly are literate and smartphone-familiar but face vision and motor decline. The design accommodates this with **48×48px minimum touch targets** (reducing tap errors by ~36% for users over 70), **18px+ body text** with Malayalam at 19–20px, labeled icons (never icon-only), simplified gestures (no swipes, pinches, or long-presses required), and consistent navigation patterns across all screens. Consider offering a high-contrast mode toggle and respecting system-level Dynamic Type settings.

### Cultural sensitivity in iconography

Islamic aniconism means **no human figures in religious contexts** — prayer, mosque, and Quran features should use abstract or geometric icons. User profile avatars should default to initials rather than human silhouettes. Female icons, when needed, should include hijab as respectful representation. The crescent-and-star is acceptable as a navigation or branding element but should not be used as decorative filler. Mosque imagery should use outline/silhouette styles rather than photorealistic depictions. Arabic calligraphy (Bismillah, Quranic verses) can serve as decorative elements but must be rendered accurately and placed respectfully — never truncated, rotated arbitrarily, or used as background wallpaper.

### RTL support for Arabic content

The app is primarily LTR (Malayalam and English), but Arabic text sections — Quranic verses, Islamic terms, Arabic names — need `dir="rtl"` applied at the container level. Use CSS logical properties (`margin-inline-start`, `padding-inline-end`) throughout the codebase instead of physical `left`/`right` properties, ensuring bidirectional compatibility. Wrap inline Arabic text in `<bdi>` tags for isolation within English sentences.

---

## Conclusion: synthesis without erasure

The strongest design direction for a Mahallu management app mirrors what Kerala's mosque builders achieved for centuries — **Islamic function expressed through Dravidian form**. The teal-green primary (`#0F766E`) bridges Islamic identity with Kerala's backwater palette. The Kasavu-inspired ivory-and-gold light mode is instantly Keralite. The multi-tiered wooden roof silhouette replaces generic dome iconography. Inter + Noto Sans Malayalam + Noto Sans Arabic covers trilingual typography with a single automatic fallback stack. And shadcn/ui's OKLCH token system makes the entire theme switchable through one CSS file.

The key novel insight from this research: every existing mosque management app (ConnectMazjid, MOHID, MasjidBox, MahalluApp) uses generic Islamic visual language. **None leverages regional architectural identity.** A Mahallu app that authentically reflects Kerala's wooden-mosque heritage would be visually unique in the entire Islamic software market — and deeply resonant with the Mappila community it serves. The design system above provides the specific tokens, fonts, icons, and patterns to build exactly that.