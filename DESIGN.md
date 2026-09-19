# Design System: Booknplay.lk
**Project ID:** Not applicable — this system is derived from the BookNPlay React application and the supplied dashboard reference.

## 1. Visual Theme & Atmosphere

Booknplay.lk feels energetic, trustworthy, direct, and distinctly sports-led. It pairs generous white space and clear booking controls with deep navy anchors and sharp lime signals. Customer screens are open and image-forward; owner screens are denser and operational without feeling administrative or cold.

The interface should communicate “less planning, more playing.” Every screen prioritizes one obvious next action, short scannable copy, visible system status, and honest states. Photography comes only from venue data. When photography is unavailable, a navy sports illustration placeholder preserves the brand without implying a real venue image.

Light and dark modes are equal first-class themes. Dark mode uses layered blue-black surfaces rather than pure black and preserves the lime accent without flooding the interface.

## 2. Color Palette & Roles

### Brand and interaction

- **Midnight Court Navy (#061032):** Brand anchor, dark sections, primary text on lime, and the logo core.
- **Action Navy (#152C6E):** Primary buttons, active navigation, links, and focus-supporting interaction color.
- **Energy Lime (#A3E635):** Primary emphasis, selected states, promotional highlights, and customer-facing calls to action.
- **Strong Lime (#84CC16):** Hover, pressed, and darker accent treatment.
- **Soft Lime (#ECFCCB):** Tinted badges, onboarding selections, and calm promotional backgrounds.

### Light theme

- **Cloud Canvas (#F7F9FC):** Page background.
- **Pure Surface (#FFFFFF):** Cards, navigation, forms, and overlays.
- **Ink Slate (#0F172A):** Primary text.
- **Muted Slate (#64748B):** Supporting copy and metadata.
- **Quiet Line (#E2E8F0):** Borders and separators.

### Dark theme

- **Night Canvas (#050B16):** Page background.
- **Deep Surface (#0D1726):** Cards, navigation, and forms.
- **Raised Surface (#132238):** Hovered or nested surfaces.
- **Snow Text (#F8FAFC):** Primary text.
- **Cool Muted Text (#94A3B8):** Supporting copy.
- **Night Line (#25324A):** Borders and separators.

### Status

- **Available Green (#22C55E):** Available, approved, complete, and successful.
- **Attention Amber (#F59E0B):** Held, pending, incomplete, and cautionary.
- **Error Red (#EF4444):** Failed, destructive, cancelled, and invalid.
- **Information Blue (#38BDF8):** Neutral information and live operational cues.

Never communicate a status by color alone; pair it with text, an icon, or both. Lime buttons always use Midnight Court Navy text for contrast.

## 3. Typography Rules

Use **Inter** with system sans-serif fallback. Display headings use 800–900 weight, tight negative tracking, and compact line height. Page titles use 800 weight. Section titles and card titles use 750–800 weight. Body copy uses 400–500 weight with relaxed line height; controls use 700–800 weight.

- Marketing display: responsive 40–76px, line height 0.94–1.02.
- Page title: 30–48px, line height 1.05–1.15.
- Section title: 24–36px.
- Card title: 16–20px.
- Body: 14–16px with 1.55–1.65 line height.
- Eyebrow: 12px, 800 weight, uppercase, widely tracked, lime.

Use sentence case for actions and headings. Keep labels concise and use Sri Lankan English, LKR currency formatting, and clear 12-hour times where customer-facing.

## 4. Component Stylings

- **Brand mark:** A circular navy sports mark crossed by lime arcs, paired with a compact lowercase `booknplay.lk` wordmark.
- **Buttons:** Gently rounded 12px corners and a minimum 44px touch height. Primary actions use Action Navy; high-energy conversion actions use Energy Lime with navy text. Outlined actions use the semantic border.
- **Cards and containers:** Confidently rounded 18px corners, a fine semantic border, and whisper-soft navy-tinted shadows in light mode or low black shadows in dark mode. Hover elevation is restrained.
- **Inputs and forms:** 12px corners, 50px standard height, always-visible labels, semantic surface fill, and a two-pixel focused outline. Errors sit beside the affected field.
- **Navigation:** Customer navigation is a translucent 72px sticky bar. Owner navigation uses a persistent desktop rail and temporary mobile drawer. Active owner items use a lime fill with navy text.
- **Venue cards:** Use API photography at a stable aspect ratio, venue name, location, real returned price, and one clear detail/booking action. Never use unrelated stock imagery or invented availability.
- **Badges:** Pill-shaped, compact, and paired with explicit text. Status badges follow the status palette.
- **Dialogs:** 20px corners, focused titles, concise copy, clear primary and secondary actions, and trapped keyboard focus.
- **Tables and calendars:** Dense but breathable. Use sticky or emphasized headers where useful, explicit legends, row hover treatment, and horizontal scrolling on narrow screens.
- **Loading and empty states:** Use skeletons that resemble the final layout. Empty states explain why the area is empty and offer one relevant action only when supported.
- **Motion:** Use 150–250ms color, shadow, and small translation transitions. Respect reduced-motion preferences and avoid decorative looping movement.

## 5. Layout Principles

Customer pages use a centered maximum width of 1280px with 16px mobile, 24px tablet, and 32px desktop gutters. Marketing sections use 56–80px vertical rhythm. Product workflows use 24–40px rhythm and keep the next action visible.

The homepage flows from discovery to confidence: navigation, split hero, supported search, trust cues, sports, venue results, promotion, three booking steps, owner callout, and footer. Customer booking pages become progressively more focused and use sticky summaries only where they do not obscure mobile content.

Owner screens prioritize operational density. Dashboards use metric cards and clear action groups; onboarding uses a visible step count, progress, inline validation, and a final review; calendars always provide status legends.

At widths below 768px, columns stack, sidebars become scrollable tabs or drawers, tables scroll horizontally, and primary actions may expand to full width. At 1024px and above, customer detail pages may use supporting sidebars and owner navigation remains persistent.

All interactive elements need visible keyboard focus, semantic labels, a minimum 44px touch target, and WCAG AA color contrast. Do not add UI for capabilities that the current backend does not support.

## 6. Theme and Imagery Usage

The first visit follows the operating-system color preference. A visible toggle in customer and owner shells persists a manual light or dark choice locally under `booknplay-theme`; theme selection never calls an API.

Venue and business photography must come from existing API fields. Missing imagery uses the branded navy-and-lime sports placeholder. Logos and interface illustrations may be code-native SVGs. Remote stock-photo fallbacks are not permitted.
