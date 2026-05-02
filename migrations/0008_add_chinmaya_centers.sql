-- 0008_add_chinmaya_centers.sql
-- Add 4 Chinmaya centers missing from production, identified while ingesting
-- Chinmaya Mission events (Mar–Jul 2026) for app import:
--
--   098  Chinmaya Mission New York (Chinmaya Upavan)  — Woodbury, NY
--                                                       (inaugurated 2026-07-26)
--   099  Central Chinmaya Mission Trust              — Powai, Mumbai, India
--                                                       (umbrella anchor for the
--                                                        2026 Chinmaya Amrit Yatra
--                                                        national pilgrimage)
--   100  Sandeepany Himalayas (Sidhbari)             — Kangra, HP, India
--                                                       (Chinmaya Jayanti Camp,
--                                                        Vedanta Course conclusion)
--   101  Chinmaya Mangalam                            — Barry, TX
--                                                       (CMDFW 143-acre camp;
--                                                        High School Retreat,
--                                                        GCC State Finals)
--
-- New IDs continue the c0000001-0000-0000-0000-… sequence used in production
-- (max existing = 097). All entries are is_verified = 1, matching the prod
-- convention (all 91 existing centers are verified).

INSERT INTO centers (
  id, name, latitude, longitude, address, member_count, is_verified,
  website, phone, image, acharya, point_of_contact,
  created_at, updated_at
) VALUES
(
  'c0000001-0000-0000-0000-000000000098',
  'Chinmaya Mission New York',
  40.8203, -73.4684,
  '129 Woodbury Rd, Woodbury, NY - 11797, US',
  0, 1,
  'https://chinmayanewyork.org/',
  NULL,
  'https://chinmayanewyork.org/wp-content/uploads/2026/04/Final-CMNY-Upavan-Hanuman-Havan.png',
  NULL,
  'info@chinmayanewyork.org',
  datetime('now'), datetime('now')
),
(
  'c0000001-0000-0000-0000-000000000099',
  'Central Chinmaya Mission Trust',
  19.1197, 72.9053,
  'Saki Vihar Rd, Powai, Mumbai - 400072, IN',
  0, 1,
  'https://www.chinmayamission.com/',
  '+91-22-2803-4900',
  'https://images.chinmayamission.com/uploads/YATRA_BANNER_9320f94db2.jpeg',
  NULL,
  'ccmt@chinmayamission.com',
  datetime('now'), datetime('now')
),
(
  'c0000001-0000-0000-0000-000000000100',
  'Sandeepany Himalayas (Sidhbari)',
  32.1879, 76.3175,
  'Tapovan Rd, Sidhbari, Dharamshala, Distt. Kangra, HP - 176057, IN',
  0, 1,
  'https://www.chinmayamission.com/sidhbari',
  '+91-1892-236199',
  'https://images.chinmayamission.com/uploads/2_d81b0572fb.webp',
  NULL,
  'sidhbari@chinmayamission.com',
  datetime('now'), datetime('now')
),
(
  'c0000001-0000-0000-0000-000000000101',
  'Chinmaya Mangalam',
  31.9938, -96.6394,
  '10470 W FM 744, Barry, TX - 75102, US',
  0, 1,
  'https://chinmayamissionwest.com/chinmaya-mangalam/',
  '(972) 250-2470',
  NULL,
  NULL,
  NULL,
  datetime('now'), datetime('now')
);
