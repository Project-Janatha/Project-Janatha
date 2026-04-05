# Janata - Pitch Deck

> Presentation guide for Chinmaya Mission leadership, potential partners, and community stakeholders.
> Estimated duration: 10-12 minutes | 12 slides

---

## Slide 1: Title

**Janata**
*Find your center. Grow together.*

The official app to connect the CHYKs of Chinmaya Mission West.

[Janata logo]

*A project built by CHYKs, for CHYKs.*

---

## Slide 2: The Problem

**Staying connected shouldn't be this hard.**

As CHYKs, we move cities for college and careers, often losing touch with our local Chinmaya Mission community.

- **Finding a new center** feels like guesswork
- **Discovering events** requires word of mouth or scattered websites
- **Meeting fellow CHYKs** in a new city means starting from zero

> "I moved to Houston for work and it took me 3 months to find out there was a Chinmaya Mission center 15 minutes from my apartment."

**The result:** CHYKs drift away from their community at the exact moment they need it most — during major life transitions.

---

## Slide 3: The Opportunity

**There are thousands of CHYKs across North America.**

They're in college towns, tech hubs, and cities coast to coast. They grew up in Bala Vihar. They were shaped by Chinmaya Mission. They *want* to stay connected.

They just need a bridge.

| The Gap | Today | With Janata |
|---------|-------|-------------|
| Finding a center | Google search, ask parents | Interactive map, instant |
| Discovering events | Facebook groups, word of mouth | Centralized event feed |
| Connecting with CHYKs | Hope you bump into someone | See community, join with a tap |

---

## Slide 4: Introducing Janata

**One app. Every center. Every event. Every connection.**

Janata is a mobile and web platform that gives every CHYK instant access to the Chinmaya Mission community — wherever they are.

**Core capabilities:**
1. **Discover** — Find Chinmaya Mission centers on an interactive map
2. **Attend** — Browse and register for events with one tap
3. **Connect** — Join centers, see who's attending, build community

[App screenshot: map view with center pins]

---

## Slide 5: Feature Deep-Dive — Discover Centers

**Find your nearest Chinmaya Mission center in seconds.**

- Interactive map showing all centers
- Detailed center profiles: address, contact info, upcoming events, member count
- Filter by location and distance
- Get directions with one tap

[App screenshot: center detail page]

> "12 centers within 50 miles — and you didn't even know they existed."

---

## Slide 6: Feature Deep-Dive — Attend Events

**Never miss a study group or celebration again.**

- Browse events across all centers in one feed
- Weekly calendar view of what's coming up
- One-tap registration
- See who else is attending
- Filter by "All", "Going", or by center

[App screenshot: events page with calendar]

> From Geeta Chanting to Youth Retreats — everything is one tap away.

---

## Slide 7: Feature Deep-Dive — Community & Profiles

**Your spiritual community, wherever life takes you.**

- Personal profiles with interests and bio
- Join and follow multiple centers
- Track your event attendance
- Connect with CHYKs in your area

[App screenshot: profile page]

---

## Slide 8: How It Works

**Simple by design.**

```
Step 1: Sign up (free, takes 30 seconds)
Step 2: Complete your profile
Step 3: Discover centers near you on the map
Step 4: Browse events and tap "Attend"
Step 5: Show up. Grow. Repeat.
```

**No friction. No cost. Just community.**

---

## Slide 9: Architecture & Tech

**Built for scale, speed, and reliability.**

| Layer | Technology |
|-------|-----------|
| Frontend | Expo (React Native) — iOS, Android, and Web from one codebase |
| Backend | Cloudflare Workers + Hono — serverless, globally distributed |
| Database | Cloudflare D1 — SQLite at the edge, fast everywhere |
| Storage | Cloudflare R2 — profile images and media |
| Auth | JWT + PBKDF2 — secure, industry-standard |
| Analytics | PostHog — privacy-respecting event tracking |

**Why this matters:**
- Runs on the edge — fast for CHYKs anywhere in North America
- Serverless — no infrastructure to maintain, scales automatically
- Cross-platform — one team maintains web, iOS, and Android
- Cost-efficient — built on Cloudflare's generous free/low-cost tiers

---

## Slide 10: The Team

**Built by CHYKs, for CHYKs.**

| Name | Role |
|------|------|
| **Abhiram** | Core Team |
| **Kish** | Core Team |
| **Sahanav** | Core Team |
| **Divita** | Core Team |
| **Pranav** | Core Team |

This isn't a contractor project or a corporate initiative. It's seva — volunteer service by CHYKs who lived the problem and decided to solve it.

---

## Slide 11: Roadmap

**Where we are and where we're going.**

| Phase | Status | Details |
|-------|--------|---------|
| **Web App (Beta)** | Live | Core features: centers, events, profiles, map |
| **iOS App** | Planned | Native experience via Expo |
| **Android App** | Planned | Native experience via Expo |
| **Invite System** | In Progress | Grow the community through trusted referrals |
| **Enhanced Roles** | Planned | More granular permissions for center organizers |
| **Notifications** | Planned | Event reminders, community updates |
| **Messaging** | Future | Direct connections between CHYKs |
| **National Events** | Future | Cross-center retreats and yatras |

---

## Slide 12: The Ask

**What we need to grow Janata.**

### From Chinmaya Mission Leadership:
- **Endorsement** — Official recognition as the CHYK connectivity platform
- **Center data** — Accurate, up-to-date center information for the directory
- **Promotion** — Share Janata through existing Mission channels and events
- **Feedback** — Ongoing input from center leaders and acharyas

### From the CHYK Community:
- **Beta testers** — Use the app, find bugs, suggest features
- **Word of mouth** — Share with your CHYK network
- **Content** — Photos from events, testimonials, community stories
- **Contributors** — Developers, designers, and community managers welcome

### Our Commitment:
- Free for all users, always
- Open development with community input
- Privacy-first: we collect only what's needed
- Built as seva, maintained as seva

---

## Closing Slide

**Janata**
*Find your center. Grow together.*

Om Sri Chinmaya Sadgurave Namaha.

[Janata logo]

**Try it now:** [web app URL]
**Contact the team:** [team email]

---

## Speaker Notes & Talking Points

### Opening (Slides 1-2)
- Start with a personal story: "When I moved to [city] for [college/work], I didn't know a single CHYK there..."
- Make the audience feel the problem before presenting the solution
- If presenting to leadership, emphasize the retention risk: CHYKs who lose connection often don't come back

### Demo (Slides 4-7)
- If possible, do a live demo instead of screenshots
- Show the map zoomed into the audience's local area for relevance
- Register for a real event during the demo to show how easy it is

### Tech Slide (Slide 9)
- For non-technical audiences: "It's fast, it's free to run, and it works on every device"
- For technical audiences: dive into the edge computing and serverless architecture
- Emphasize cost efficiency — this can scale without burning through donations

### The Ask (Slide 12)
- Be specific about what endorsement looks like (a post, an email, a mention at events)
- Have a QR code ready for people to sign up immediately
- End with the spiritual grounding — this is seva, not a startup pitch

---

## Appendix: Key Stats (Update Before Presenting)

| Metric | Value |
|--------|-------|
| Centers on platform | [X] |
| Registered users | [X] |
| Events hosted | [X] |
| Monthly active users | [X] |
| Cities represented | [X] |

> Update these numbers from PostHog analytics before each presentation.
