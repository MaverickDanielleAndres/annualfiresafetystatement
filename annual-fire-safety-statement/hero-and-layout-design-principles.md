# Hero Page & Layout Design Principles

This document analyzes the core design principles, layout structure, typography, spacing, and component usage of the home page (Hero + content sections). It serves as a reference guide for refactoring and building out other pages to ensure a consistent, premium, and dynamic user experience across the site.

## 1. Global Design Aesthetics
- **Theme & Vibe**: High-contrast, premium, modern industrial. The site relies on stark contrasts between deep blacks (`#111111`), clean whites (`#ffffff`), and vibrant brand orange gradients (`#ff5614` to `#ffad05`).
- **Backgrounds**: Uses solid white for standard sections, very dark off-black (`#111111` or `#1a0505`) for high-impact areas (Hero, Header top-bar), and subtle off-whites (`#fff8f5`, `#faf9f7`) for cards or secondary callouts.
- **Micro-interactions**: Uses `RevealOnView` for scroll-triggered fade-ins. Hover effects are subtle but present (e.g., `hover:scale-105` on buttons, `hover:-translate-y-1` on mockups, and `duration-500` smooth transitions).

## 2. Typography & Headings
- **Font Family**: Inter (sans-serif) for all text.
- **Eyebrow (Kicker) Text**: 
  - Placed above main headings to establish context.
  - **Classes**: `text-[#fb5614] text-xs font-bold tracking-[0.15em] uppercase`
- **Main Headings (H1/H2)**:
  - Very bold, tightly spaced, and heavily styled. Often mixes solid black text with gradient text.
  - **Classes**: `text-[clamp(2.5rem,4vw,3.5rem)] font-black tracking-tight leading-[1.05] uppercase`
  - **Gradient Accent**: The last line or key phrase often uses `bg-gradient-to-r from-[#ff5614] to-[#ffad05] bg-clip-text text-transparent`.
- **Body Text**:
  - Readable and slightly muted.
  - **Classes**: `text-lg text-[#4a4a46] leading-relaxed`

## 3. Spacing & Grid Layouts
- **Containers**:
  - The main wrapper uses `.container-inner` (max-width `86rem` / `1376px`), with fluid padding defined in `globals.css`.
- **Section Padding**:
  - Vertical spacing between sections is consistently generous to let content breathe.
  - **Standard Classes**: `py-8 lg:py-12` or `pt-8 pb-8 lg:pt-12 lg:pb-12`.
- **Grid Structures**:
  - Two-column layouts are the standard for content sections (Text on one side, Image/Mockup on the other).
  - **Classes**: `grid lg:grid-cols-[1fr_1fr]` or `lg:grid-cols-[1.2fr_1fr]` with `gap-12 lg:gap-20`.
  - **Alignment**: Items often stretch to match heights (`items-stretch`) or center vertically (`items-center`).

## 4. Components Breakdown

### 4.1 Header (`Header.tsx`)
- **Top Bar**: Dark (`#111111`) with white text. Contains contact info (phone/email) on the left and social icons on the right.
- **Main Navbar**: Clean, sticky behavior.
- **Navigation Links**: Clean text that highlights on hover/active states.
- **CTA**: "BOOK THE BOSS" uses the primary gradient button style with a pulsing animation (`animate-pump`).

### 4.2 Hero Section (`PageHero.tsx`)
- **Background**: Split design. Dark solid color on the left (`#1a0505`), with a photo on the right.
- **Image Treatment**: The photo is blended using gradients and tint overlays (`mix-blend-multiply`, `bg-red-950/20`) so it perfectly meshes with the dark background and doesn't feel disjointed.
- **Watermark Text**: A massive, faint, absolute-positioned text watermark ("Annual Fire Safety Statement") sits behind the content, adding depth (`opacity-20 mix-blend-overlay text-right`).
- **Content**: Left-aligned, high contrast white text with gradient accents for the eyebrow and the final line of the H1.
- **Bottom Fade**: A subtle linear gradient fade at the bottom seamlessly transitions the dark hero background into the white background of the next section.

### 4.3 Content Sections & Mockups
- **Visuals over pure text**: Instead of just using stock photos, the page uses **UI Mockups** (e.g., the Fire Safety Schedule table, the Sample AFSS document, the "12 MONTHS" clock).
- **Mockup Container Styles**:
  - **Classes**: `bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden transform-gpu transition-transform hover:scale-100 duration-500`.
- **Iconography**:
  - Lucide-react icons are heavily used.
  - Icons are often placed in soft-colored square or circular wrappers: `w-12 h-12 rounded-xl bg-[#fff8f5] flex items-center justify-center` with icon color `text-[#fb5614]`.

## 5. Buttons & Links
- **Primary CTA Button (Gradient)**:
  - **Classes**: `btn bg-gradient-to-r from-[#ff5614] to-[#ffad05] !text-white px-7 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full border-none shadow-sm hover:scale-105 transition-transform`
- **Secondary / Outline Buttons**:
  - **Classes**: `border-2 border-[#fb5614] text-[#111111] hover:bg-[#fb5614] hover:text-white px-8 py-3.5 uppercase font-bold tracking-wider text-sm rounded-full transition-colors`
- **Text Links**:
  - **Classes**: `font-bold underline hover:no-underline underline-offset-4 decoration-2 decoration-gray-300 text-[#111111]`

## 6. Summary Checklist for Refactoring Other Pages
When building or refactoring other pages (e.g., Services, AS 1851, About), follow this checklist:
- [ ] Wrap the page content in `<RevealOnView>` and `<section className="container-inner py-8 lg:py-12">`.
- [ ] Use `lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16` for split layouts.
- [ ] Always include a colored `eyebrow` text above `H2` headings.
- [ ] Use `font-black`, `tracking-tight`, and `uppercase` on `H2` headings. Apply the brand gradient to key words using `bg-clip-text text-transparent`.
- [ ] Use soft gray borders (`border-gray-100` or `border-gray-200`) and soft shadows for cards and images.
- [ ] Replace standard images with interactive-looking mockups or well-framed photography where possible.
- [ ] Include ample breathing room (`gap-8` to `gap-12`) between rows of content.
