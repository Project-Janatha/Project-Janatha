# Marketing Visuals — Session Handoff

> Use this file to pick up where we left off. It has full context on the project, what's been done, and exactly what to build next.

---

## Project Context

**Project Janata** (repo: Project-Janatha) is the official app for **CHYKs** (Chinmaya Youth) of **Chinmaya Mission West**. CHYKs move cities for college and careers and lose touch with their local Chinmaya Mission community. Janata solves this — one app to discover centers, attend events, and stay connected.

- **Tagline:** "Find your center. Grow together."
- **Built by:** Abhiram, Kish, Sahanav, Divita, Pranav (all CHYKs)
- **Status:** Beta, live on web
- **Tech:** Expo (React Native), Cloudflare Workers, Hono, D1, R2

---

## Brand Guidelines

| Property | Value |
|----------|-------|
| Primary Orange | `#C2410C` |
| Orange Press | `#E8862A` |
| Light Orange | `#FED7AA` |
| Orange Tint BG | `#FFF7ED` |
| Background Cream | `#FAFAF7` |
| Background Light | `#F5F0EB` |
| Dark Text | `#1C1917` |
| Secondary Text | `#57534E` |
| Muted Text | `#78716C` |
| Card White | `#FFFFFF` |
| Border | `#E7E5E4` |
| Dark BG | `#292524` |
| Heading Font | Inclusive Sans |
| Body Font | Inter (Regular, Medium, SemiBold, Bold) |
| Logo Files | `packages/frontend/assets/images/landing/logo.png`, `logo_with_text.png` (3.65:1 ratio) |
| Team Photos | `packages/frontend/assets/images/landing/{abhiram,kish,sahanav,divita,pranav}.jpg` |
| Landing Images | `packages/frontend/assets/images/landing/` — includes `Swami Chinmayananda.jpg`, `challenge-yatra.jpg`, `map-preview.jpg`, `youth-group.jpg`, `vedanta-class.jpg`, etc. |
| Voice | Warm, inviting, youthful, spiritually grounded. Speak as a peer, not an institution. |

---

## What's Been Done

Two marketing content docs were created and pushed to branch `claude/marketing-artifacts-Fm8BD`:

### 1. Social Media Content Kit (`docs/marketing/social-media-content.md`)
- **11 posts** across 4 campaigns:
  - Campaign 1: Launch Announcement (3 posts — reveal carousel, problem visual, team spotlight)
  - Campaign 2: Feature Spotlights (3 posts — centers, events, reel script)
  - Campaign 3: Community & Engagement (3 posts — testimonial template, stat card, CTA)
  - Campaign 4: Spiritual Connection (2 posts — Gurudev quote, seva spotlight)
- 4-week posting schedule (Mon/Wed/Fri)
- Platform-specific notes (Instagram, Twitter/X, LinkedIn, WhatsApp)

### 2. Pitch Deck Content (`docs/marketing/pitch-deck.md`)
- **12 slides:** Title, Problem, Opportunity, Introducing Janata, Discover Centers, Attend Events, Community & Profiles, How It Works, Architecture & Tech, The Team, Roadmap, The Ask
- Closing slide + speaker notes + appendix for live stats

---

## What Needs to Be Built Next: Visuals

The user wants **HTML/CSS visual templates** that can be opened in a browser, screenshotted, or exported. Build these in `docs/marketing/visuals/`.

### A. Social Media Post Templates (Instagram-sized: 1080x1080px)

Create individual HTML files for each, styled with brand colors, fonts, and imagery:

| File | Content | Visual Style |
|------|---------|-------------|
| `post-01-reveal.html` | "Introducing Janata" — logo, tagline, "Built by CHYKs, for CHYKs" | Orange gradient or solid orange BG, centered white text, logo |
| `post-02-problem.html` | "New city. Same question." — split layout | Left: dark overlay text, Right: map screenshot placeholder |
| `post-03-team.html` | Team grid with photos and names | Cream BG, 5 circular photos in a row/grid, names below |
| `post-04-centers.html` | "12 centers within 50 miles" stat card | Map screenshot BG with overlay stat, orange accent |
| `post-05-events.html` | Event listing mockup — Geeta Chanting, Youth Retreat, Vedanta Course | Card-style layout with event names, dates, "Attend" buttons |
| `post-06-reel-cover.html` | Reel thumbnail: "Find your center." | Bold text, orange accent bar, dark background |
| `post-07-testimonial.html` | Quote card template with orange left bar | Cream BG, orange left border, quote text, attribution |
| `post-08-stats.html` | Weekly stat card — [X] CHYKs, [X] events, [X] centers | Three stat blocks in brand colors, clean layout |
| `post-09-cta.html` | "Your community is one tap away" with button mockup | Cream BG, app screenshot placeholder, orange CTA button |
| `post-10-gurudev.html` | Swami Chinmayananda quote with photo | Photo background with dark overlay, white quote text |
| `post-11-seva.html` | "Janata is seva in action" | Minimal design, orange text on cream, subtle texture |

### B. Pitch Deck Slides (16:9, 1920x1080px)

Create a single `pitch-deck.html` with all 12 slides as sections (or separate files per slide):

| Slide | Key Elements |
|-------|-------------|
| 1 - Title | Logo, tagline, team attribution |
| 2 - Problem | Three bullet pain points, pull quote |
| 3 - Opportunity | Before/After comparison table |
| 4 - Introducing Janata | Three capabilities with icons, app screenshot placeholder |
| 5 - Discover Centers | Feature bullets, screenshot placeholder, pull quote |
| 6 - Attend Events | Feature bullets, screenshot placeholder, pull quote |
| 7 - Community | Feature bullets, screenshot placeholder |
| 8 - How It Works | 5-step numbered flow |
| 9 - Tech Stack | Table with layer/technology |
| 10 - Team | 5 photos with names |
| 11 - Roadmap | Timeline/table with status badges |
| 12 - The Ask | Two columns (Leadership / Community), commitment list |
| 13 - Closing | Logo, tagline, prayer, contact info |

### C. Implementation Notes

- Use **inline CSS** so each HTML file is self-contained and works standalone in any browser
- Use Google Fonts for **Inter** (fallback to system sans-serif for Inclusive Sans, or use Google Fonts if available)
- Reference images using **relative paths** to `../../packages/frontend/assets/images/landing/` so team photos and logo load when opened locally
- Add a **`<meta>` viewport tag** for proper rendering
- Include **print CSS** (`@media print`) to make pitch deck slides exportable as PDF via browser print
- For pitch deck: use CSS `page-break-after` so each slide prints on its own page
- Make everything look polished enough to use directly — not wireframes, finished visuals

---

## File Structure

```
docs/marketing/
├── social-media-content.md    (DONE - copy/captions)
├── pitch-deck.md              (DONE - slide content)
├── VISUALS-HANDOFF.md         (THIS FILE - context for next session)
└── visuals/                   (TO BUILD)
    ├── post-01-reveal.html
    ├── post-02-problem.html
    ├── post-03-team.html
    ├── post-04-centers.html
    ├── post-05-events.html
    ├── post-06-reel-cover.html
    ├── post-07-testimonial.html
    ├── post-08-stats.html
    ├── post-09-cta.html
    ├── post-10-gurudev.html
    ├── post-11-seva.html
    └── pitch-deck.html
```

---

## How to Continue

In a new session, say:

> "Read `docs/marketing/VISUALS-HANDOFF.md` and build all the HTML visual templates described in it. Start with the social media posts, then the pitch deck."

That's it. Everything needed is in this file.
