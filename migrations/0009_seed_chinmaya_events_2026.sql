-- 0009_seed_chinmaya_events_2026.sql
-- Seeds 41 Chinmaya Mission events spanning 2026-03-30 to 2026-07-30
-- (past month + next 3 months from the 2026-04-30 scrape date).
--
-- Sources: official Chinmaya chapter websites and chinmaya75.org (Amrit Yatra
-- 75th-anniversary tour). See scripts/scraped-events/2026-04-30_chinmaya-events.json
-- for the source-of-truth inventory with provenance per event.
--
-- DEPENDENCY: this migration FK-references centers 098–101 (15 of 41 events).
-- Migration 0008 (PR #137 — Chinmaya Mission New York / CCMT / Sidhbari /
-- Mangalam) MUST be applied first or those inserts will violate the events.center_id
-- → centers.id FK and the entire batch will roll back.
--
-- CATEGORY NOTE: the events.category enum only defines 91 = SATSANG and
-- 92 = BHIKSHA (packages/backend/src/constants.ts). All 41 events use 91 to
-- match the convention seen in existing prod events; expanding the enum to
-- represent CAMP / RETREAT / YAJNA / FUNDRAISER / OTHER is a separate effort.
--
-- AMRIT YATRA: per the "one anchor for tour-style events" decision, the umbrella
-- entry plus all 7 city-stop sub-events anchor to Central Chinmaya Mission Trust
-- (id …-099) and reuse the official Amrit Yatra banner image.

INSERT INTO events (
  id, title, description, date,
  latitude, longitude, address,
  center_id, tier, people_attending,
  point_of_contact, image, category,
  created_at, updated_at
) VALUES

-- ═══════════════════════════════════════════════════════════════════════
-- HOUSTON  (Chinmaya Prabha, …-009)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-hou-lockin-2026', 'Lock-In for Bala Vihar Grades 5-8',
  'Overnight social filled with games and entertainment hosted by the Student Council for Bala Vihar children in grades 5-8.',
  '2026-04-03T19:00:00',
  29.6659766, -95.615816, '10353 Synott Rd, Sugar Land, TX - 77498, US',
  'c0000001-0000-0000-0000-000000000009', 0, 0,
  'Student Council', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-hou-gcc-2026', 'Gita Chanting Competition (GCC)',
  'Children compete reciting Bhagavad Gita Chapter 12 (Bhakti Yoga) honoring Pujya Gurudev''s Janma Jayanti and the 75th anniversary of the Chinmaya Movement.',
  '2026-04-25',
  29.6659766, -95.615816, '10353 Synott Rd, Sugar Land, TX - 77498, US',
  'c0000001-0000-0000-0000-000000000009', 0, 0,
  'gcc@chinmayahouston.org', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-hou-cord-2026', 'CORD USA Summer Service Visit',
  'Two-week service program in rural India for chaperones and students through CORD USA. Registration $1,500. Departure from USA Jul 4; returns Jul 18.',
  '2026-07-04',
  29.6659766, -95.615816, 'CORD Siruvani, India (departure from Houston)',
  'c0000001-0000-0000-0000-000000000009', 0, 0,
  'houston@cordusa.org', NULL, 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- DALLAS-FORT WORTH  (Chinmaya-Saaket …-088, Chinmaya Mangalam …-101)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-mang-hsretreat-2026', 'High School Retreat at Mangalam',
  'High school retreat hosted at Chinmaya Mangalam.',
  '2026-04-04',
  31.9938, -96.6394, 'Chinmaya Mangalam, 10470 W FM 744, Barry, TX - 75102, US',
  'c0000001-0000-0000-0000-000000000101', 0, 0,
  '(972) 250-2470', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-saaket-bhajan-2026apr', 'Bhajan Sandhya',
  'Musical devotional evening program at Chinmaya Saaket.',
  '2026-04-10',
  32.9903214, -96.7942022, '17701 Davenport Rd, Dallas, TX - 75252, US',
  'c0000001-0000-0000-0000-000000000088', 0, 0,
  '(972) 250-2470', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-saaket-collegeessay-2026', 'College Essay Writing Workshop',
  'Workshop helping CHYKs prepare college essays.',
  '2026-04-12',
  32.9903214, -96.7942022, '17701 Davenport Rd, Dallas, TX - 75252, US',
  'c0000001-0000-0000-0000-000000000088', 0, 0,
  '(972) 250-2470', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-saaket-holi-2026', 'Holi / Walkathon',
  'Holi celebration combined with community walkathon.',
  '2026-04-25',
  32.9903214, -96.7942022, '17701 Davenport Rd, Dallas, TX - 75252, US',
  'c0000001-0000-0000-0000-000000000088', 0, 0,
  '(972) 250-2470', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-saaket-gurudev-jayanti-2026', 'Gurudev Jayanti, Annual Music Program & Volunteer Appreciation',
  'Celebration of Gurudev Swami Chinmayananda''s birthday with annual music program and volunteer recognition.',
  '2026-05-08',
  32.9903214, -96.7942022, '17701 Davenport Rd, Dallas, TX - 75252, US',
  'c0000001-0000-0000-0000-000000000088', 0, 0,
  '(972) 250-2470', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-cgs-2026', 'Chinmaya Gita Samarpanam (CGS)',
  'Historic global online chanting of Bhagavad Gita Chapter 15 (Purushottama Yoga) targeting 108,000+ participants and a Guinness World Record, part of the Chinmaya Movement''s 75th anniversary. Hosted by CMDFW.',
  '2026-05-09T09:00:00',
  32.9903214, -96.7942022, 'Online (Webex)',
  'c0000001-0000-0000-0000-000000000088', 0, 0,
  'Ramesh Hegde, (972) 250-2470', 'https://cmdfw.org/wp-content/uploads/2026/04/image-1.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-mang-gccfinals-2026', 'GCC State Finals',
  'Texas state finals of the Gita Chanting Competition.',
  '2026-05-16',
  31.9938, -96.6394, 'Chinmaya Mangalam, 10470 W FM 744, Barry, TX - 75102, US',
  'c0000001-0000-0000-0000-000000000101', 0, 0,
  '(972) 250-2470', NULL, 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- SAN JOSE  (Chinmaya Sandeepany, …-008)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-sj-geeta-yajna-2026', 'Geeta Chanting Yajna 2026',
  'Annual Geeta Chanting competition reciting Bhagavad Gita Chapter 12 (Bhakti Yoga) with categories from toddlers through adults; winners advance to state and national competitions.',
  '2026-04-04',
  37.3593226, -121.8095066, '10160 Clayton Rd, San Jose, CA - 95127, US',
  'c0000001-0000-0000-0000-000000000008', 0, 0,
  'info@cmsj.org', NULL, 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- ORLANDO  (Chinmaya Mission Orlando, …-016)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-orl-geeta-2026', 'Geeta Chanting',
  'Annual Geeta Chanting recitation event.',
  '2026-04-25',
  28.6680904, -81.2926141, 'Casselberry, FL, US',
  'c0000001-0000-0000-0000-000000000016', 0, 0,
  NULL, NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-orl-summercamp-2026', 'Summer Camp 2026 — Give Me Five',
  '34th annual summer camp for children ages 5-13 (Jun 15 – Jun 26), themed on the Gita Panchamrit (5 verses from the Bhagavad Gita). Activities include chanting, yoga, bhajans, dance, sports, and arts & crafts.',
  '2026-06-15T09:00:00',
  28.6680904, -81.2926141, 'Casselberry, FL, US',
  'c0000001-0000-0000-0000-000000000016', 0, 0,
  NULL, 'https://res.cloudinary.com/chinmayaorlando/image/upload/q_auto/cmo/2026/summercamp.jpg', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- CHICAGO  (Chinmaya Mission Chicago, …-015)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-chi-panchamrit-2026', 'Gita Panchamrit — Discourse by Swami Aparajitananda',
  'Five-evening discourse series by Swami Aparajitananda on the five-verse Gita Panchamrit (May 4 – May 8).',
  '2026-05-04T19:00:00',
  41.7143174, -87.9470168, '11S080 Kingery Hwy, Willowbrook, IL - 60527, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  'swamiaparajitananda@gmail.com', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-chi-mysteryoflife-2026', 'Mystery of Life — Decoded',
  'Four-evening discourse by Swami Aparajitananda on the mystery of life (May 11 – May 14). Held at Buffalo Grove Community Art Center.',
  '2026-05-11T18:30:00',
  41.7143174, -87.9470168, 'Buffalo Grove Community Art Center, IL, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  'swamiaparajitananda@gmail.com', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-chi-bhajan-paduka-2026', 'Bhajan Sandhya & Guru Paduka Puja',
  'Devotional bhajan evening and Guru Paduka Puja hosted by the Bellary family.',
  '2026-05-17T18:00:00',
  41.7143174, -87.9470168, 'Chicago area, IL, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  '847-740-1215', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-chyk-memorialday-2026', 'ChYK Memorial Day Camp',
  'West Central Zone retreat for Chinmaya Yuva Kendra (CHYK) members at Abhyudaya Retreat Center (May 23 – May 25).',
  '2026-05-23',
  41.7143174, -87.9470168, 'Abhyudaya Retreat Center, IL, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  '847-740-1215', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-chi-summercamp-2026', 'Summer Camp — Bhagavatam Stories',
  'Two-week youth summer camp featuring Bhagavatam stories, chanting, bhajans, and cultural activities (Jun 8 – Jun 20).',
  '2026-06-08',
  41.7143174, -87.9470168, '11S080 Kingery Hwy, Willowbrook, IL - 60527, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  '847-740-1215', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-chi-vayuputra-2026', 'Vayuputra in Windy City',
  'Festival to invoke Hanuman''s grace as part of the Chinmaya 75th anniversary celebrations.',
  '2026-07-11',
  41.7143174, -87.9470168, 'Chicago, IL, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  '847-740-1215', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-chi-vedicheritage-2026', 'Vedic Heritage Summer Camp 2026',
  'Immersive summer camp for children Pre-K through 8th grade focused on values, Hindu culture, self-confidence, and communication via themed learning, chanting, bhajans, sports, yoga, and arts & crafts (Jul 13 – Jul 19).',
  '2026-07-13T09:00:00',
  41.7143174, -87.9470168, '11S080 Kingery Hwy, Willowbrook, IL - 60527, US',
  'c0000001-0000-0000-0000-000000000015', 0, 0,
  'rashmiraghuvir@gmail.com; 630-654-3370', 'https://dp3wphqn1yqa5.cloudfront.net/chinmaya_website/2026/01/30155246/Summercamp2026_EB_Mar31-791x1024.jpg', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- PORTLAND  (Chinmaya Mission Portland, …-047)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-pdx-gurudev-jayanti-2026', 'Gurudev Jayanti, Graduation & Mother''s Day',
  'Combined celebration of Gurudev Jayanti, year-end graduation, and Mother''s Day.',
  '2026-05-10T09:20:00',
  45.5446737, -122.8807329, 'Chinmaya Haridwar, 3551 NW John Olsen Pl, Hillsboro, OR - 97124, US',
  'c0000001-0000-0000-0000-000000000047', 0, 0,
  'contact@cmportland.org', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-pdx-mukundamala-2026', 'Deepening Devotion through Mukundamala — Talks by Swami Ishwarananda',
  'Multi-day spiritual discourse series on Mukundamala by Swami Ishwarananda (May 13 – May 15).',
  '2026-05-13',
  45.5446737, -122.8807329, 'Chinmaya Haridwar, 3551 NW John Olsen Pl, Hillsboro, OR - 97124, US',
  'c0000001-0000-0000-0000-000000000047', 0, 0,
  'contact@cmportland.org', NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-pdx-hanuman-havan-2026', 'Hanuman Chalisa Havan',
  'Sacred Vedic fire offering opening with Shodasha Upachara Puja followed by chanting verses of the Hanuman Chalisa.',
  '2026-05-16T08:30:00',
  45.5446737, -122.8807329, 'Chinmaya Haridwar, 3551 NW John Olsen Pl, Hillsboro, OR - 97124, US',
  'c0000001-0000-0000-0000-000000000047', 0, 0,
  'contact@cmportland.org', 'https://cmportland.org/images/HanumanChalisaHavan.jpg', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- WASHINGTON DC  (Chinmaya Somnath, …-057)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-somnath-orient1-2026', 'Chinmaya Somnath Summer Immersion Camp — Orientation Session 1',
  'Orientation session for the 2026 Immersion Camp guided by Swami Dheerananda. Activities include Bhagavad Gita chanting, Ramayana stories, shloka chanting, bhajans, games, dance, and sports.',
  '2026-05-17T15:00:00',
  38.903992, -77.478483, '4350 Blue Spring Dr, Chantilly, VA - 20151, US',
  'c0000001-0000-0000-0000-000000000057', 0, 0,
  NULL, NULL, 91,
  datetime('now'), datetime('now')
),
(
  'e-somnath-orient2-2026', 'Chinmaya Somnath Summer Immersion Camp — Orientation Session 2',
  'Second orientation for the 2026 Immersion Camp.',
  '2026-06-06T16:30:00',
  38.903992, -77.478483, '4350 Blue Spring Dr, Chantilly, VA - 20151, US',
  'c0000001-0000-0000-0000-000000000057', 0, 0,
  NULL, NULL, 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- NIAGARA  (Chinmaya Mission Niagara, …-067)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-niagara-peace-2026', 'A Passion for Peace Retreat',
  'Four-day immersive retreat for Exploring & Evolving Adults focused on uncovering and living one''s purpose with clarity and conviction (Jun 25 – Jun 28).',
  '2026-06-25',
  43.0986956, -79.0896157, 'Life Gurukula, Niagara region, ON, CA',
  'c0000001-0000-0000-0000-000000000067', 0, 0,
  'hello@chinmayaniagara.com', 'https://i0.wp.com/www.chinmayaniagara.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-01-at-09.54.29.jpeg', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- ATLANTA  (Chinmaya Niketan — Chinmaya Mission Atlanta, …-065)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-atl-summercamp-2026', 'CMA Niketan Summer Camp 2026',
  'Annual summer camp for children at Chinmaya Niketan Atlanta. Specific dates not posted on the public page; placeholder window Jun 1 – Jul 31 — verify before publishing.',
  '2026-06-01',
  33.9004478, -84.1743202, '5511 Williams Rd, Norcross, GA - 30093, US',
  'c0000001-0000-0000-0000-000000000065', 0, 0,
  '(404) 781-9151; bvcoordinators@chinmaya-atlanta.com', 'https://chinmaya-atlanta.com/wp-content/uploads/2026/02/Summer-Camp-2026.jpeg', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- NEW YORK / CMNY  (Chinmaya Mission New York / Chinmaya Upavan, …-098)  [from 0008]
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-cmny-hanuman-havan-2026', 'Hanuman Chalisa Havan — CMNY',
  'Hanuman Chalisa Havan hosted by Chinmaya Mission New York as part of the global 75th year celebrations of the Chinmaya Movement.',
  '2026-07-25',
  40.8203, -73.4684, '129 Woodbury Rd, Woodbury, NY - 11797, US',
  'c0000001-0000-0000-0000-000000000098', 0, 0,
  'info@chinmayanewyork.org', 'https://chinmayanewyork.org/wp-content/uploads/2026/02/HanmanChalisaHavan.webp', 91,
  datetime('now'), datetime('now')
),
(
  'e-cmny-inauguration-2026', 'Chinmaya Upavan Inauguration',
  'Grand opening of the new Chinmaya Upavan center after years of construction and community support.',
  '2026-07-26',
  40.8203, -73.4684, '129 Woodbury Rd, Woodbury, NY - 11797, US',
  'c0000001-0000-0000-0000-000000000098', 0, 0,
  'info@chinmayanewyork.org', 'https://chinmayanewyork.org/wp-content/uploads/2026/04/Final-CMNY-Upavan-Hanuman-Havan.png', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- MAHASAMADHI CAMP  (third-party hotel venue → center_id = NULL)
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-mahasamadhi-2026', '33rd Chinmaya Mahasamadhi Aradhana Camp 2026',
  'Six-day national residential spiritual retreat honoring Pujya Gurudev Swami Chinmayananda''s 33rd Mahasamadhi (Jul 30 – Aug 4), with discourses, meditation, workshops, and cultural offerings for all ages.',
  '2026-07-30',
  0, 0, 'Sheraton Parsippany Hotel, Parsippany, NJ, US',
  NULL, 0, 0,
  'Central Chinmaya Mission Trust, ccmt@chinmayamission.com, +91-22-2803 4900', 'https://images.chinmayamission.com/uploads/Whats_App_Image_2026_01_07_at_9_56_19_PM_2_a892b6ce85.webp', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- YEP 2026  (Chinmaya Mangalam, …-101)  [from 0008]
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-mang-yep-2026', 'Youth Empowerment Programme (YEP) 2026',
  'Five-week residential program for ages 18-28 (Jun 14 – Jul 19), led by Swamis and Brahmacharins of Chinmaya Mission. Provides foundational understanding of Vedanta and basic Sanskrit through discourses, workshops, team-building activities, and personal reflection. Cost: $2000.',
  '2026-06-14',
  31.9938, -96.6394, 'Chinmaya Mangalam, 10470 W FM 744, Barry, TX - 75102, US',
  'c0000001-0000-0000-0000-000000000101', 0, 0,
  'yepamerica7@gmail.com', 'https://chykwest.org/wp-content/uploads/2024/01/discourse.webp', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- INDIA — AMRIT YATRA  (Central Chinmaya Mission Trust, …-099)  [from 0008]
-- One image reused across umbrella + all 7 city stops per project decision.
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-amrityatra-umbrella-2026', 'Chinmaya Amrit Yatra — National Pilgrimage (Wisdom on Wheels)',
  'A 295-day national pilgrimage celebrating the 75-year legacy of the Chinmaya Movement, traveling 35,000 km across India from Pune to Delhi. During Mar 30 – Jul 30 the Yatra moves through Kerala, Tamil Nadu, Andhra Pradesh, Telangana, Odisha, Jharkhand, West Bengal, Sikkim, Assam, and the Northeast — daily stops feature Digital Yajna presentations of Gurudev''s archived talks, satsangs, and seva.',
  '2026-03-30',
  19.1197, 72.9053, 'Multi-city itinerary; begins Chinmaya Vibhooti, Pune; concludes Bharat Mandapam, New Delhi (23 Oct 2026)',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com, +91-22-2803-4900', 'https://images.chinmayamission.com/uploads/YATRA_BANNER_9320f94db2.jpeg', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-trivandrum-2026', 'Chinmaya Amrit Yatra — Thiruvananthapuram Stop',
  'Three-day Chinmaya Amrit Yatra stop (Apr 9 – Apr 11) in Kerala''s capital with satsangs, bhajans, and Digital Yajna sessions hosted at Chinmaya Vidyalaya.',
  '2026-04-09',
  19.1197, 72.9053, 'Chinmaya Vidyalaya, Thiruvananthapuram, Kerala, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-coimbatore-2026', 'Chinmaya Amrit Yatra — Coimbatore Stop',
  'Chinmaya Amrit Yatra stop at Chinmaya Kripa, Coimbatore — part of the 75th anniversary national pilgrimage with discourses, bhajans, and seva.',
  '2026-04-19',
  19.1197, 72.9053, 'Chinmaya Kripa, Coimbatore, Tamil Nadu, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-chennai-2026', 'Chinmaya Amrit Yatra — Chennai Stop',
  'Chinmaya Amrit Yatra arrives in Chennai with public satsangs, processions, and Digital Yajna at Chinmaya Tarangini.',
  '2026-05-06',
  19.1197, 72.9053, 'Chinmaya Tarangini, Chennai, Tamil Nadu, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'chennaichinmaya@gmail.com, 044-28365046', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-hyderabad-2026', 'Chinmaya Amrit Yatra — Hyderabad Stop',
  'Public Hall event in Begumpet during the Chinmaya Amrit Yatra national pilgrimage.',
  '2026-05-25',
  19.1197, 72.9053, 'Public Hall, Begumpet, Hyderabad, Telangana, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-vizag-2026', 'Chinmaya Amrit Yatra — Visakhapatnam (Vizag Steel Plant) Stop',
  'Four-day Chinmaya Amrit Yatra residential stop (Jun 10 – Jun 13) at Ukkunagaram township, with satsangs and community engagement.',
  '2026-06-10',
  19.1197, 72.9053, 'Ukkunagaram, Vizag Steel Plant, Visakhapatnam, AP, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-kolkata-2026', 'Chinmaya Amrit Yatra — Kolkata Stop',
  'Chinmaya Amrit Yatra arrives at Kolkata Chinmaya Mission for satsangs and Digital Yajna.',
  '2026-07-10',
  19.1197, 72.9053, 'Kolkata Chinmaya Mission, Kolkata, West Bengal, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),
(
  'e-amrityatra-guwahati-2026', 'Chinmaya Amrit Yatra — Guwahati Stop',
  'Chinmaya Amrit Yatra single-day stop in Assam at Guwahati Chinmaya Mission.',
  '2026-07-21',
  19.1197, 72.9053, 'Chinmaya Mission, Guwahati, Assam, IN',
  'c0000001-0000-0000-0000-000000000099', 0, 0,
  'ccmt@chinmayamission.com', 'https://images.chinmayamission.com/uploads/amrit_yatra_691ed27a91.png', 91,
  datetime('now'), datetime('now')
),

-- ═══════════════════════════════════════════════════════════════════════
-- INDIA — SIDHBARI  (Sandeepany Himalayas, …-100)  [from 0008]
-- ═══════════════════════════════════════════════════════════════════════
(
  'e-sidhbari-jayanti-camp-2026', 'Chinmaya Jayanti Camp at Sidhbari — 110th Birth Anniversary Camp',
  'Week-long residential camp (May 1 – May 8) at Sandeepany Himalayas celebrating the 110th birth anniversary of Pujya Gurudev Swami Chinmayananda. Talks in English by Swami Swaroopananda (Global Head) on Gita Panchamrit and Chinmaya Mahima — A Meditation, plus Hindi Vedanta Course conclusion ceremony, guided meditation, group discussions, and Guru Paduka Puja.',
  '2026-05-01',
  32.1879, 76.3175, 'Sandeepany Himalayas, Tapovan Rd, Sidhbari, Dharamshala, Distt. Kangra, HP - 176057, IN',
  'c0000001-0000-0000-0000-000000000100', 0, 0,
  'sidhbari@chinmayamission.com, +91-1892-236199', 'https://images.chinmayamission.com/uploads/631b3eac-7bdb-4d81-a0a3-474d5de9cd12.jpeg', 91,
  datetime('now'), datetime('now')
),
(
  'e-sidhbari-vedanta-conclusion-2026', 'Hindi Vedanta Course Conclusion Ceremony — Sandeepany Himalayas',
  'Closing ceremony (May 1 – May 8) of the residential Hindi Vedanta Course held within the Chinmaya Jayanti Camp week at Sidhbari, in the presence of Swami Swaroopananda.',
  '2026-05-01',
  32.1879, 76.3175, 'Sandeepany Himalayas, Tapovan Rd, Sidhbari, Dharamshala, Distt. Kangra, HP - 176057, IN',
  'c0000001-0000-0000-0000-000000000100', 0, 0,
  'sidhbari@chinmayamission.com, +91-1892-236199', 'https://images.chinmayamission.com/uploads/631b3eac-7bdb-4d81-a0a3-474d5de9cd12.jpeg', 91,
  datetime('now'), datetime('now')
);
