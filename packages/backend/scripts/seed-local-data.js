/**
 * seed-local-data.js
 *
 * Populates the local DynamoDB instance with realistic dummy data for
 * development and testing. Safe to run multiple times — skips resources
 * that already exist.
 *
 * Prerequisites:
 *   1. docker run -p 8000:8000 amazon/dynamodb-local
 *   2. node --env-file=.env.local ... scripts/create-local-tables.js
 *   3. Backend running on port 8008 (node --env-file=.env.local centralSequence.js)
 *
 * Run:
 *   node --env-file=packages/backend/.env.local \
 *     --experimental-vm-modules \
 *     packages/backend/scripts/seed-local-data.js
 */

const BASE = 'http://localhost:8008/api'

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return res.json()
}

// ── Users ──────────────────────────────────────────────────────────────────

const USERS = [
  {
    username: 'arjun_sharma',
    password: 'Chinmaya@1',
    onboarding: {
      firstName: 'Arjun',
      lastName: 'Sharma',
      dateOfBirth: '1988-04-12',
      phoneNumber: '408-555-1001',
      interests: ['Bhagavad Gita', 'Meditation', 'Vedanta'],
      bio: 'Software engineer by day, Gita student by night.',
      profileImage: 'https://i.pravatar.cc/150?u=arjun',
    },
  },
  {
    username: 'priya_nair',
    password: 'Chinmaya@1',
    onboarding: {
      firstName: 'Priya',
      lastName: 'Nair',
      dateOfBirth: '1993-08-22',
      phoneNumber: '415-555-2002',
      interests: ['Bhajans', 'Seva', 'Bala Vihar'],
      bio: "Devoted to Swamiji's teachings. Bala Vihar teacher.",
      profileImage: 'https://i.pravatar.cc/150?u=priya',
    },
  },
  {
    username: 'ravi_krishna',
    password: 'Chinmaya@1',
    onboarding: {
      firstName: 'Ravi',
      lastName: 'Krishnaswamy',
      dateOfBirth: '1975-02-14',
      phoneNumber: '619-555-3003',
      interests: ['Upanishads', 'Yoga', 'Bhagavatam'],
      bio: 'Retired teacher. Volunteer at Chinmaya Mission San Diego.',
      profileImage: 'https://i.pravatar.cc/150?u=ravi',
    },
  },
  {
    username: 'meera_patel',
    password: 'Chinmaya@1',
    onboarding: {
      firstName: 'Meera',
      lastName: 'Patel',
      dateOfBirth: '2000-11-05',
      phoneNumber: '212-555-4004',
      interests: ['Devotional Music', 'Vedic Chanting', 'CHYK'],
      bio: 'CHYK member exploring Vedanta. Love kirtan.',
      profileImage: 'https://i.pravatar.cc/150?u=meera',
    },
  },
  {
    username: 'dev_kapoor',
    password: 'Chinmaya@1',
    onboarding: {
      firstName: 'Dev',
      lastName: 'Kapoor',
      dateOfBirth: '1965-07-30',
      phoneNumber: '512-555-5005',
      interests: ['Karma Yoga', 'Community Service', 'Discourse'],
      bio: 'Long-time devotee. Center coordinator at Austin.',
      profileImage: 'https://i.pravatar.cc/150?u=dev',
    },
  },
]

// ── Centers ────────────────────────────────────────────────────────────────

const CENTERS = [
  {
    centerName: 'Chinmaya Mission San Jose',
    latitude: 37.3382,
    longitude: -121.8863,
    address: '1 Prem Sagar Lane, San Jose, CA 95129',
    website: 'https://chinmayasj.org',
    phone: '408-255-8383',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    pointOfContact: 'Swami Shantananda',
    acharya: 'Swami Shantananda',
  },
  {
    centerName: 'Chinmaya Mission San Diego',
    latitude: 32.7157,
    longitude: -117.1611,
    address: '8820 Mast Blvd, Santee, CA 92071',
    website: 'https://chinmayasd.org',
    phone: '619-448-2465',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    pointOfContact: 'Br. Ramananda',
    acharya: 'Swami Sarveshananda',
  },
  {
    centerName: 'Chinmaya Mission Chicago',
    latitude: 41.8781,
    longitude: -87.6298,
    address: '16W673 Mockingbird Ln, Willowbrook, IL 60527',
    website: 'https://chinmayachicago.org',
    phone: '630-920-0003',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    pointOfContact: 'Swami Ishwarananda',
    acharya: 'Swami Ishwarananda',
  },
  {
    centerName: 'Chinmaya Mission New York',
    latitude: 40.7128,
    longitude: -74.006,
    address: '306 Centerport Rd, Centerport, NY 11721',
    website: 'https://chinmayany.org',
    phone: '631-385-2190',
    image: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=800',
    pointOfContact: 'Swami Sarvananda',
    acharya: 'Swami Sarvananda',
  },
  {
    centerName: 'Chinmaya Mission Austin',
    latitude: 30.2672,
    longitude: -97.7431,
    address: '1234 Vedanta Dr, Austin, TX 78701',
    website: 'https://chinmayaaustin.org',
    phone: '512-555-8800',
    image: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800',
    pointOfContact: 'Dev Kapoor',
    acharya: 'Swami Bodhananda',
  },
]

// ── Events (defined after centers are created, centerID filled in) ──────────

function buildEvents(centers) {
  const sj = centers['Chinmaya Mission San Jose']
  const sd = centers['Chinmaya Mission San Diego']
  const chi = centers['Chinmaya Mission Chicago']
  const ny = centers['Chinmaya Mission New York']
  const aus = centers['Chinmaya Mission Austin']

  const now = new Date()
  const d = (offsetDays, h = 9) => {
    const dt = new Date(now)
    dt.setDate(dt.getDate() + offsetDays)
    dt.setHours(h, 0, 0, 0)
    return dt.toISOString()
  }

  return [
    // San Jose
    {
      centerID: sj,
      title: 'Bhagavad Gita Study Circle',
      description:
        "Weekly verse-by-verse study of the Bhagavad Gita with commentary based on Swami Chinmayananda's teachings. All levels welcome.",
      date: d(3, 19),
      endDate: d(3, 21),
      latitude: 37.3382, longitude: -121.8863,
      address: '1 Prem Sagar Lane, San Jose, CA 95129',
      pointOfContact: 'Arjun Sharma',
      image: 'https://images.unsplash.com/photo-1548610435-4b73a7a07bde?w=800',
    },
    {
      centerID: sj,
      title: 'Weekend Silent Retreat',
      description:
        'A two-day retreat focusing on meditation, yoga, and Vedantic inquiry. Meals and accommodation included. Limited spots.',
      date: d(14, 8),
      endDate: d(16, 17),
      latitude: 37.4, longitude: -122.1,
      address: '450 Retreat Way, Los Altos Hills, CA 94022',
      pointOfContact: 'Swami Shantananda',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    {
      centerID: sj,
      title: 'Bala Vihar — Spring Semester',
      description:
        'Monthly Bala Vihar class for children ages 5–12. Students learn slokas, stories from the Mahabharata, and values-based activities.',
      date: d(7, 10),
      endDate: d(7, 12),
      latitude: 37.3382, longitude: -121.8863,
      address: '1 Prem Sagar Lane, San Jose, CA 95129',
      pointOfContact: 'Priya Nair',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    },
    // San Diego
    {
      centerID: sd,
      title: 'Srimad Bhagavatam Discourse',
      description:
        "Evening discourse on the Srimad Bhagavatam — stories of Lord Vishnu's avatars and their deeper significance for spiritual seekers.",
      date: d(5, 18),
      endDate: d(5, 20),
      latitude: 32.7157, longitude: -117.1611,
      address: '8820 Mast Blvd, Santee, CA 92071',
      pointOfContact: 'Ravi Krishnaswamy',
      image: 'https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?w=800',
    },
    {
      centerID: sd,
      title: 'Yoga & Pranayama Workshop',
      description:
        'Half-day workshop on classical yoga asanas and pranayama breathing techniques, rooted in the Hatha Yoga Pradipika.',
      date: d(10, 7),
      endDate: d(10, 12),
      latitude: 32.7157, longitude: -117.1611,
      address: '8820 Mast Blvd, Santee, CA 92071',
      pointOfContact: 'Ravi Krishnaswamy',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    },
    // Chicago
    {
      centerID: chi,
      title: 'Annual Vedanta Camp',
      description:
        'Five-day residential camp with morning discourses, workshops, and evening bhajans. Theme: "Karma Yoga — The Path of Action".',
      date: d(21, 7),
      endDate: d(26, 21),
      latitude: 42.1, longitude: -88.0,
      address: '450 Camp Vedanta Rd, Lake Geneva, WI 53147',
      pointOfContact: 'Swami Ishwarananda',
      image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
    },
    {
      centerID: chi,
      title: 'Thursday Satsang & Bhajans',
      description:
        'Weekly satsang: 30 minutes of communal bhajans followed by a short Vedanta talk and Q&A. Prasad served afterward.',
      date: d(2, 19),
      endDate: d(2, 21),
      latitude: 41.8781, longitude: -87.6298,
      address: '16W673 Mockingbird Ln, Willowbrook, IL 60527',
      pointOfContact: 'Swami Ishwarananda',
      image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800',
    },
    // New York
    {
      centerID: ny,
      title: 'Diwali Celebration & Lakshmi Puja',
      description:
        'Grand Diwali celebration with Lakshmi Puja, cultural performances, and community dinner. All are welcome.',
      date: d(30, 17),
      endDate: d(30, 22),
      latitude: 40.7128, longitude: -74.006,
      address: '306 Centerport Rd, Centerport, NY 11721',
      pointOfContact: 'Meera Patel',
      image: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?w=800',
    },
    {
      centerID: ny,
      title: 'CHYK Youth Retreat',
      description:
        'Chinmaya Yuva Kendra retreat for young adults 18–35. Focus on Vedanta for modern life — career, relationships, purpose.',
      date: d(18, 8),
      endDate: d(19, 18),
      latitude: 41.0, longitude: -74.3,
      address: '789 Retreat Lane, Mahwah, NJ 07430',
      pointOfContact: 'Meera Patel',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    },
    // Austin
    {
      centerID: aus,
      title: 'Upanishad Study Group',
      description:
        'Bi-weekly study of the Mandukya Upanishad with Gaudapada Karika. Text and commentary provided.',
      date: d(4, 18),
      endDate: d(4, 20),
      latitude: 30.2672, longitude: -97.7431,
      address: '1234 Vedanta Dr, Austin, TX 78701',
      pointOfContact: 'Dev Kapoor',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    },
  ]
}

// ── Messages (eventTitle → array of {author, text}) ─────────────────────────

const MESSAGES = {
  'Bhagavad Gita Study Circle': [
    { author: 'priya_nair', text: 'Looking forward to Chapter 3 this week. Karma Yoga is so relevant to daily life.' },
    { author: 'ravi_krishna', text: 'Does anyone have the Swami Chinmayananda commentary PDF? Happy to share mine.' },
    { author: 'arjun_sharma', text: "I'll bring printed copies for everyone. See you Thursday!" },
  ],
  'Weekend Silent Retreat': [
    { author: 'meera_patel', text: "Is there a carpool being organized from San Jose? I don't have a car." },
    { author: 'arjun_sharma', text: "Yes! I have 2 seats. DM me your location and I'll pick you up." },
    { author: 'priya_nair', text: 'Please bring warm layers — the hills get cold at night.' },
  ],
  'Srimad Bhagavatam Discourse': [
    { author: 'ravi_krishna', text: 'Tonight we cover the story of Prahlad. One of my favorites in the Bhagavatam.' },
    { author: 'dev_kapoor', text: "Swamiji's explanation of Narasimha avatara last week was incredible. Looking forward to this." },
  ],
  'Thursday Satsang & Bhajans': [
    { author: 'meera_patel', text: "Can we sing Hare Rama tonight? It's been a while." },
    { author: 'priya_nair', text: "Yes please! I'll bring my tabla." },
    { author: 'dev_kapoor', text: 'Prasad is sponsored by the Kapoor family this week. 🙏' },
  ],
  'Diwali Celebration & Lakshmi Puja': [
    { author: 'meera_patel', text: 'So excited for this. NYC Diwali is always magical.' },
    { author: 'arjun_sharma', text: "We're driving up from NJ. Can't wait." },
    { author: 'ravi_krishna', text: 'Will there be a fireworks display this year?' },
    { author: 'priya_nair', text: 'Please sign up for prasad prep on the shared doc!' },
  ],
  'CHYK Youth Retreat': [
    { author: 'meera_patel', text: "The theme this year sounds perfect. I've been wrestling with career decisions." },
    { author: 'dev_kapoor', text: "Swamiji's talk on Karma Yoga and work-life balance changed my perspective. Highly recommend." },
  ],
}

// ── Membership (username → centerNames to join) ─────────────────────────────

const MEMBERSHIPS = {
  arjun_sharma: ['Chinmaya Mission San Jose'],
  priya_nair:   ['Chinmaya Mission San Jose', 'Chinmaya Mission Chicago'],
  ravi_krishna: ['Chinmaya Mission San Diego'],
  meera_patel:  ['Chinmaya Mission New York', 'Chinmaya Mission Chicago'],
  dev_kapoor:   ['Chinmaya Mission Austin'],
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌸  Seeding local database...\n')

  // 1. Register + onboard users
  const tokens = {}
  console.log('── Users ─────────────────────────────')
  for (const u of USERS) {
    // Try register (may already exist)
    await post('/auth/register', { username: u.username, password: u.password })
    const authResp = await post('/auth/authenticate', { username: u.username, password: u.password })
    if (!authResp.token) {
      console.error(`  ✗ Could not authenticate ${u.username}`)
      continue
    }
    tokens[u.username] = authResp.token

    // Complete onboarding
    await post('/auth/complete-onboarding', { ...u.onboarding, profileComplete: true }, authResp.token)
    console.log(`  ✓ ${u.username} (${u.onboarding.firstName} ${u.onboarding.lastName})`)
  }

  // 2. Create centers
  const centerIDs = {}  // name → UUID
  console.log('\n── Centers ───────────────────────────')
  for (const c of CENTERS) {
    const r = await post('/addCenter', c)
    if (r.id) {
      centerIDs[c.centerName] = r.id
      console.log(`  ✓ ${c.centerName} → ${r.id}`)
    } else {
      console.error(`  ✗ Failed to create ${c.centerName}:`, JSON.stringify(r))
    }
  }

  // 3. Join centers
  console.log('\n── Memberships ───────────────────────')
  for (const [uname, centerNames] of Object.entries(MEMBERSHIPS)) {
    const token = tokens[uname]
    if (!token) continue
    for (const cname of centerNames) {
      const cid = centerIDs[cname]
      if (!cid) continue
      const r = await post('/joinCenter', { centerID: cid }, token)
      console.log(`  ✓ ${uname} joined ${cname}`)
    }
  }

  // 4. Create events
  const eventIDs = {}  // title → id
  const events = buildEvents(centerIDs)
  console.log('\n── Events ────────────────────────────')
  for (const ev of events) {
    if (!ev.centerID) {
      console.log(`  ✗ Skipping "${ev.title}" — center not found`)
      continue
    }
    const r = await post('/addevent', ev)
    if (r.id) {
      eventIDs[ev.title] = r.id
      console.log(`  ✓ ${ev.title}`)
    } else {
      console.error(`  ✗ Failed "${ev.title}":`, JSON.stringify(r))
    }
  }

  // 5. Add messages
  console.log('\n── Messages ──────────────────────────')
  for (const [eventTitle, msgs] of Object.entries(MESSAGES)) {
    const eid = eventIDs[eventTitle]
    if (!eid) {
      console.log(`  ✗ No event ID for "${eventTitle}" — skipping messages`)
      continue
    }
    for (const msg of msgs) {
      const token = tokens[msg.author]
      if (!token) continue
      await post('/addMessage', { eventID: String(eid), text: msg.text }, token)
    }
    console.log(`  ✓ ${msgs.length} messages → ${eventTitle}`)
  }

  console.log('\n✅  Seed complete.\n')
  console.log(`   ${USERS.length} users | ${CENTERS.length} centers | ${events.length} events`)
  console.log(`   All users: password is "Chinmaya@1"`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
