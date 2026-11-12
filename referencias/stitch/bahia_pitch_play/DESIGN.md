---
name: Bahia Pitch & Play
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3f4941'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7a70'
  outline-variant: '#becabe'
  surface-tint: '#006d3d'
  primary: '#006438'
  on-primary: '#ffffff'
  primary-container: '#1b7f4c'
  on-primary-container: '#d1ffdb'
  inverse-primary: '#7dda9e'
  secondary: '#216b43'
  on-secondary: '#ffffff'
  secondary-container: '#a8f3c0'
  on-secondary-container: '#297149'
  tertiary: '#794e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996400'
  on-tertiary-container: '#fff1e4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#99f6b8'
  primary-fixed-dim: '#7dda9e'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522d'
  secondary-fixed: '#a8f3c0'
  secondary-fixed-dim: '#8dd6a5'
  on-secondary-fixed: '#00210f'
  on-secondary-fixed-variant: '#00522e'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb955'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1rem
  margin-md: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets court owners, team captains, and amateur futsal and society football players throughout Salvador, Brazil. The emotional tone bridges energetic grassroots sports enthusiasm with operational efficiency, reliability, and warm local approachability. 

The aesthetic is clean, athletic, and modern-utilitarian. Drawing from contemporary mobile product design, it relies on crisp spatial clarity, generous touch targets, subtle tactile depth, and a high-contrast palette anchored by athletic field greens. Visual friction is minimized to enable quick group decision-making, fast schedule lookups under bright sunlight, and frictionless reservation checkouts on mobile devices.

## Colors

The palette is engineered for outdoors high-legibility and functional sports states:

- **Primary (`#1B7F4C`)**: Pitch Green, representing lush synthetic turf, vitality, and primary confirmation flows.
- **Primary Hover/Active (`#14613A`)**: Deep pitch shade for pressed interactive states and heavy emphasis.
- **Accent / Warning (`#F5A623`)**: Warm tropical amber for live matches, booking locks, alerts, and pending statuses.
- **App Background (`#F6F8F7`)**: Off-white tinted with subtle green-gray coolness to reduce screen glare during outdoor use.
- **Surface / Cards (`#FFFFFF`)**: Pure white elevated modules providing maximum contrast against the app canvas.
- **Text Main (`#1F2937`)**: Slate dark neutral ensuring WCAG AAA accessibility across light surfaces.
- **Text Muted (`#6B7280`)**: Secondary metadata, inactive states, and timestamps.
- **Error / Danger (`#D64545`)**: Immediate red for failed transactions, unavailable slots, and card rejections.
- **Borders / Separators (`#E5E7EB`)**: Structural hairpins maintaining separation without visual clutter.

### Semantic Status Tokens
- **Pendente**: Background `#FEF3C7`, Text `#92400E`, Border `#FCD34D`
- **Confirmada**: Background `#DCFCE7`, Text `#166534`, Border `#86EFAC`
- **Recusada**: Background `#FEE2E2`, Text `#991B1B`, Border `#FCA5A5`
- **Cancelada**: Background `#F3F4F6`, Text `#4B5563`, Border `#D1D5DB`

## Typography

The typography is built entirely on `Inter` to deliver systematic clarity, crisp tabular numbers for scheduling, and instant legibility across dense schedules and booking slips.

- **Headlines**: Semi-bold to bold weight with slightly negative tracking to ensure punchy, commanding labels without consuming excessive vertical space on smaller mobile screens.
- **Numbers & Metrics**: Court fees, time slots, and scores leverage `font-feature-settings: 'tnum' 1` to guarantee alignment across tables and vertical slot pickers.
- **Labels & Chips**: Strong medium-to-semibold weights keep uppercase or micro-copy legible down to 10px on status tags and court attributes.

## Layout & Spacing

A mobile-first fluid layout standard forms the foundation of all screens. 

- **Mobile Viewport (< 640px)**: Uses single-column fluidity, bound by `margin` of `1rem` (16px) and internal element spacing based on an 8pt baseline rhythm (with 4px half-steps for fine alignment). Maximum content constraint for mobile shells is 480px, centered on larger tablet/desktop displays to preserve ergonomic single-hand thumb navigation.
- **Touch Ergonomics**: All interactive zones enforce a strict minimum touch area of 44×44px. Buttons default to a minimum height of 48px (`space-xl` × 2 vertical balance).
- **Horizontal Strips**: Edge-to-edge scrolling patterns (such as date selectors and pitch photo carousels) bleed past the screen margin with an offset padding matching `margin` (1rem), giving visual cues for off-screen scrollability.

## Elevation & Depth

Visual hierarchy uses crisp boundary surfaces rather than dramatic shadows, keeping the interface snappy and preventing a murky feel on low-end screens:

- **Flat / Ground Level**: Canvas background (`#F6F8F7`).
- **Surface Elevation 1 (Cards, Modules, Input Fields)**: `#FFFFFF` paired with a delicate hairline border (`1px solid #E5E7EB`) and a soft ambient drop shadow: `0 1px 3px rgba(31, 41, 55, 0.05), 0 1px 2px rgba(31, 41, 55, 0.03)`.
- **Surface Elevation 2 (Active Modals, Sticky Bottom Sheets, Floating Actions)**: Elevated container with `0 10px 15px -3px rgba(31, 41, 55, 0.08), 0 4px 6px -2px rgba(31, 41, 55, 0.04)`.
- **Selected Elevation**: Interactive elements such as selected time slots and active segment tabs dispense with drop shadows in favor of a solid pitch green fill (`#1B7F4C`) with crisp inner contrast.

## Shapes

The shape system is friendly, athletic, and soft-contoured. 

- Standard cards, sheet containers, time-slot selection blocks, and field detail cards adhere to a base radius of 12px (`0.75rem`), with larger bottom sheets and full-bleed action panels stepping up to `1rem` (`rounded-lg`) or `1.5rem` (`rounded-xl`).
- Micro-elements such as status indicators, filter tags, and quick-add chips utilize full-pill geometry (`rounded-full`) to differentiate metadata tags from structural, actionable cards.
- Icon containers within list items adopt a uniform 8px (`0.5rem`) soft-square finish.

## Components

### Buttons
- **Primary**: Background `#1B7F4C`, text `#FFFFFF`, height `48px` minimum, `border-radius: 12px`, `font-semibold`. Hover/Pressed state: `#14613A`. Active feedback involves an immediate 98% scale transition (`transform: scale(0.98)`).
- **Secondary / Outline**: Background transparent, border `1.5px solid #1B7F4C`, text `#1B7F4C`, min-height `48px`.
- **Ghost**: Text `#1F2937`, transparent background, hover state `#F3F4F6`.

### Status Chips
Always include explicit, human-readable labels:
- **Pendente**: Background `#FEF3C7`, Text `#92400E`, Border `1px solid #FCD34D`.
- **Confirmada**: Background `#DCFCE7`, Text `#166534`, Border `1px solid #86EFAC`.
- **Recusada**: Background `#FEE2E2`, Text `#991B1B`, Border `1px solid #FCA5A5`.
- **Cancelada**: Background `#F3F4F6`, Text `#4B5563`, Border `1px solid #D1D5DB`.
- Layout: Inline flex, horizontal padding 8px, vertical padding 4px, font size 12px, weight bold, border radius 9999px.

### Horizontal Calendar Strip
- A horizontally scrollable row of compact date cards.
- Each item: Min-width 56px, height 72px, flex column centered. Displays weekday (e.g., "TER"), date number (e.g., "14"), and indicator dot if slots are open.
- Unselected: White background, 1px border `#E5E7EB`, text `#1F2937`.
- Selected: Background `#1B7F4C`, text `#FFFFFF`, dot accent `#F5A623`.

### Time Slot Cards
- Grid layout: 2 or 3 columns on mobile devices.
- Dimensions: Minimum height 52px, vertical padding 8px, horizontal padding 12px, border radius 12px.
- States:
  - **Available**: Surface `#FFFFFF`, border `1px solid #E5E7EB`, time label `#1F2937` font-semibold, price text `#6B7280`.
  - **Selected**: Background `#1B7F4C`, border `1px solid #14613A`, text `#FFFFFF`, price text `#DCFCE7`.
  - **Unavailable / Occupied**: Background `#F3F4F6`, border `1px solid transparent`, text `#9CA3AF`, strikethrough or badge indicator.

### Segmented Controls (Society / Futsal / Indoor)
- Container: Background `#E5E7EB`, padding 4px, border radius 12px.
- Active Segment: Background `#FFFFFF`, text `#1F2937`, soft drop shadow, border-radius 8px.
- Inactive Segment: Transparent, text `#6B7280`, font-medium.

### Court Booking Cards
- Surface `#FFFFFF`, border-radius 12px, 1px border `#E5E7EB`, soft shadow.
- Header: Pitch photo with 16:9 ratio, pinned status chip over top-right corner.
- Body: Court name in `headline-sm`, neighborhood/venue metadata in `body-sm`, price badge in `label-lg` using primary green.
- Action: Direct link to reservation flow via full-width secondary button or sticky card tap.

### Inputs & Form Fields
- Height: 48px standard, background `#FFFFFF`, border `1px solid #E5E7EB`, text `#1F2937`, border-radius 12px.
- Focus state: Border `#1B7F4C`, outline ring `2px solid rgba(27, 127, 76, 0.2)`.