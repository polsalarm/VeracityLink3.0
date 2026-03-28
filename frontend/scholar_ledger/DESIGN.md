# Design System Document: The Immutable Scholar

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Atheneum"**
This design system moves beyond the cold, utilitarian nature of typical blockchain interfaces. It envisions a "Digital Atheneum"—a space that feels as authoritative as a centuries-old university library but as advanced as a decentralized node. 

To break the "standard template" look, we utilize **Intentional Asymmetry**. Academic transcripts and registries are inherently data-heavy; we balance this by using generous, off-center white space and overlapping "parchment" layers. By stacking surfaces rather than boxing them in, we create a sense of architectural depth. The goal is a high-end editorial feel where data is not just "displayed," but "curated."

---

## 2. Colors & Tonal Depth
The palette transitions from the deep, institutional authority of `primary` (#00113a) to the ethereal, "Stellar" energy of `secondary` (#4b41e1) and `tertiary` (#001815).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. 
Boundaries must be established through background color shifts. For example, a `surface-container-low` (#f2f4f6) side panel should sit flush against a `surface` (#f7f9fb) main content area. Contrast, not lines, creates the structure.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, semi-translucent sheets. 
- **Base Layer:** `surface` (#f7f9fb)
- **Content Blocks:** `surface-container-low` (#f2f4f6)
- **Active Modals/Cards:** `surface-container-lowest` (#ffffff) for maximum "pop."
- **In-Page Insets:** `surface-container-high` (#e6e8ea) for nested data like hash logs or technical metadata.

### The "Glass & Gradient" Rule
To evoke a "tech-forward" spirit, apply **Glassmorphism** to floating navigation bars or credential previews. Use a background blur (8px–12px) with a semi-transparent `surface-container-lowest` (80% opacity). Use subtle linear gradients for primary CTAs, transitioning from `primary` (#00113a) to `on_primary_container` (#758dd5) at a 135-degree angle to provide a "signature" metallic sheen.

---

## 3. Typography
We utilize a dual-font strategy to balance institutional weight with modern readability.

- **Display & Headlines (Manrope):** Chosen for its geometric precision and slightly wider stance. It feels modern, secure, and "engineered." Use `display-lg` (3.5rem) for hero statements and `headline-md` (1.75rem) for section titles.
- **Title & Body (Inter):** The workhorse for reliability. Inter’s tall x-height ensures that complex cryptographic strings and academic titles remain legible at small sizes. 
- **The Hierarchy of Truth:** Use `label-md` (#444650) in uppercase with 0.05em letter spacing for metadata labels (e.g., "ISSUER ID"). This contrasts against the `title-md` (#191c1e) used for the actual data value, creating an immediate visual hierarchy between "Question" and "Answer."

---

## 4. Elevation & Depth
Depth in this system is a measure of "Trust." The more important the information, the closer it "floats" toward the user.

### The Layering Principle
Avoid drop shadows for standard layout elements. Use the Spacing Scale `6` (1.5rem) to separate a `surface-container-lowest` card from its `surface` background. The color shift is sufficient to indicate elevation.

### Ambient Shadows
When an element must float (e.g., a "Verify Credential" modal), use an **Ambient Shadow**:
- `box-shadow: 0 20px 40px rgba(0, 17, 58, 0.06);`
This uses a tinted version of the `primary` color rather than a dead grey, making the shadow feel like a natural lighting effect from a deep blue environment.

### The "Ghost Border" Fallback
If a container holds white content on a white background, use a **Ghost Border**: `outline-variant` (#c5c6d2) at 20% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons: The Academic Seal
- **Primary:** Rounded `md` (0.75rem). Background: Gradient of `primary` to `on_primary_container`. Text: `on_primary` (#ffffff).
- **Secondary:** Surface-tinted. Background: `secondary_fixed_dim` (#c3c0ff). Text: `on_secondary_fixed` (#0f0069).
- **Interactions:** On hover, increase the `surface_tint` intensity.

### Input Fields: Security-First
- Forbid standard boxes. Use a "Soft Inset" style: `surface-container-highest` (#e0e3e5) background with no border. 
- **Focus State:** 2px solid `secondary` (#4b41e1).
- **Status Indicators:** Validated hashes use `tertiary_fixed` (#62fae3) as a subtle underline or glow.

### Cards & Lists: The No-Divider Rule
- **Cards:** Use `rounded-lg` (1rem). Never use a divider line between a card header and body. Instead, use a background shift—header in `surface-container-low` and body in `surface-container-lowest`.
- **Credential Lists:** Use Spacing Scale `4` (1rem) as a vertical gap between items instead of lines. This "breathing room" emphasizes individual record security.

### Signature Component: The "Hash-Anchor"
A custom component for this registry. A small, mono-spaced `label-sm` string (the cryptographic hash) encapsulated in a `tertiary_container` (#002f29) pill with a subtle `backdrop-blur`. It signifies that the data is anchored to the blockchain.

---

## 6. Do's and Don'ts

### Do:
- **Use Intentional Asymmetry:** Align high-level titles to the left but place technical metadata in a right-aligned, elevated card.
- **Embrace White Space:** Use the Spacing Scale `12` (3rem) and `16` (4rem) to separate major sections.
- **Prioritize Data Clarity:** High contrast for status: `error` (#ba1a1a) for revoked status and `tertiary_fixed_dim` (#3cddc7) for valid.

### Don't:
- **Don't use 100% Black:** Use `on_background` (#191c1e) for text to maintain a premium, softened look.
- **Don't use 1px borders:** Even for tables. Use alternating row colors (`surface-container-low` vs `surface`) to guide the eye.
- **Don't use sharp corners:** Maintain the `md` (0.75rem) or `lg` (1rem) radius to keep the "Modern" brand promise; sharp 0px corners feel too "legacy" or "brutalist."