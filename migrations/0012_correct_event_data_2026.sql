-- 0012_correct_event_data_2026.sql
-- Two corrections to the events seeded in 0010:
--
--   1. The 33rd Chinmaya Mahasamadhi Aradhana Camp had a placeholder
--      address (Sheraton Parsippany Hotel, Parsippany, NJ, US) with no
--      street/zip and 0,0 coordinates. Backfilling the canonical hotel
--      address (199 Smith Rd, Parsippany, NJ 07054) and lat/lng.
--
--   2. Each scraped event had a source_url in the inventory JSON
--      (scripts/scraped-events/2026-04-30_chinmaya-events.json) but the
--      original 0010 seed dropped it. 0011 added the external_url column;
--      this migration populates it for every event we have a source for.

-- Mahasamadhi camp address fix
UPDATE events SET address = '199 Smith Rd, Parsippany, NJ - 07054, US', latitude = 40.8617, longitude = -74.4087, updated_at = datetime('now') WHERE id = 'e-mahasamadhi-2026';

-- Backfill external_url for every scraped event with a source URL
UPDATE events SET external_url = 'https://chinmayahouston.org/announcements-for-mar22-2026/', updated_at = datetime('now') WHERE id = 'e-hou-lockin-2026';
UPDATE events SET external_url = 'https://cmdfw.org/upcoming-cmdfw-events/', updated_at = datetime('now') WHERE id = 'e-mang-hsretreat-2026';
UPDATE events SET external_url = 'https://www.cmsj.org/geeta-chanting-yajna-2026/', updated_at = datetime('now') WHERE id = 'e-sj-geeta-yajna-2026';
UPDATE events SET external_url = 'https://cmdfw.org/upcoming-cmdfw-events/', updated_at = datetime('now') WHERE id = 'e-saaket-bhajan-2026apr';
UPDATE events SET external_url = 'https://cmdfw.org/upcoming-cmdfw-events/', updated_at = datetime('now') WHERE id = 'e-saaket-collegeessay-2026';
UPDATE events SET external_url = 'https://chinmayahouston.org/announcements-for-apr5-2026/', updated_at = datetime('now') WHERE id = 'e-hou-gcc-2026';
UPDATE events SET external_url = 'https://cmdfw.org/upcoming-cmdfw-events/', updated_at = datetime('now') WHERE id = 'e-saaket-holi-2026';
UPDATE events SET external_url = 'https://www.chinmayaorlando.org/index.php/61-geeta-chanting', updated_at = datetime('now') WHERE id = 'e-orl-geeta-2026';
UPDATE events SET external_url = 'https://www.chinmaya-yamunotri.com/', updated_at = datetime('now') WHERE id = 'e-chi-panchamrit-2026';
UPDATE events SET external_url = 'https://cmdfw.org/upcoming-cmdfw-events/', updated_at = datetime('now') WHERE id = 'e-saaket-gurudev-jayanti-2026';
UPDATE events SET external_url = 'https://cmdfw.org/chinmaya-gita-samarpanam-cgs-may-9-2026/', updated_at = datetime('now') WHERE id = 'e-cgs-2026';
UPDATE events SET external_url = 'https://cmportland.org/calendar/', updated_at = datetime('now') WHERE id = 'e-pdx-gurudev-jayanti-2026';
UPDATE events SET external_url = 'https://www.chinmaya-yamunotri.com/', updated_at = datetime('now') WHERE id = 'e-chi-mysteryoflife-2026';
UPDATE events SET external_url = 'https://cmportland.org/calendar/', updated_at = datetime('now') WHERE id = 'e-pdx-mukundamala-2026';
UPDATE events SET external_url = 'https://cmdfw.org/upcoming-cmdfw-events/', updated_at = datetime('now') WHERE id = 'e-mang-gccfinals-2026';
UPDATE events SET external_url = 'https://cmportland.org/havan/', updated_at = datetime('now') WHERE id = 'e-pdx-hanuman-havan-2026';
UPDATE events SET external_url = 'https://cmwrc.chinmayadc.org/chinmayasomnath/programs/summercamp/', updated_at = datetime('now') WHERE id = 'e-somnath-orient1-2026';
UPDATE events SET external_url = 'https://www.chinmaya-yamunotri.com/', updated_at = datetime('now') WHERE id = 'e-chi-bhajan-paduka-2026';
UPDATE events SET external_url = 'https://www.chinmaya-yamunotri.com/', updated_at = datetime('now') WHERE id = 'e-chyk-memorialday-2026';
UPDATE events SET external_url = 'https://cmwrc.chinmayadc.org/chinmayasomnath/programs/summercamp/', updated_at = datetime('now') WHERE id = 'e-somnath-orient2-2026';
UPDATE events SET external_url = 'https://www.chinmaya-yamunotri.com/', updated_at = datetime('now') WHERE id = 'e-chi-summercamp-2026';
UPDATE events SET external_url = 'https://www.chinmayaorlando.org/index.php/upcoming-events/476-summer-camp-2026', updated_at = datetime('now') WHERE id = 'e-orl-summercamp-2026';
UPDATE events SET external_url = 'https://www.chinmayaniagara.com/', updated_at = datetime('now') WHERE id = 'e-niagara-peace-2026';
UPDATE events SET external_url = 'https://chinmayahouston.org/announcements-for-apr5-2026/', updated_at = datetime('now') WHERE id = 'e-hou-cord-2026';
UPDATE events SET external_url = 'https://www.chinmaya-yamunotri.com/', updated_at = datetime('now') WHERE id = 'e-chi-vayuputra-2026';
UPDATE events SET external_url = 'https://mychinmaya.org/summercamp/', updated_at = datetime('now') WHERE id = 'e-chi-vedicheritage-2026';
UPDATE events SET external_url = 'https://chinmayanewyork.org/', updated_at = datetime('now') WHERE id = 'e-cmny-hanuman-havan-2026';
UPDATE events SET external_url = 'https://chinmayanewyork.org/', updated_at = datetime('now') WHERE id = 'e-cmny-inauguration-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/mahasamadhi-aradhana-camp-2026', updated_at = datetime('now') WHERE id = 'e-mahasamadhi-2026';
UPDATE events SET external_url = 'https://chinmaya-atlanta.com/summer-camp', updated_at = datetime('now') WHERE id = 'e-atl-summercamp-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-umbrella-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-trivandrum-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-coimbatore-2026';
UPDATE events SET external_url = 'https://chinmayamissionchennai.com/', updated_at = datetime('now') WHERE id = 'e-amrityatra-chennai-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-hyderabad-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-vizag-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-kolkata-2026';
UPDATE events SET external_url = 'https://chinmaya75.org/amrit/amrit-yatra', updated_at = datetime('now') WHERE id = 'e-amrityatra-guwahati-2026';
UPDATE events SET external_url = 'https://www.chinmayamission.com/kolkata/event/chinmaya-jayanti-camp-at-sidhbari', updated_at = datetime('now') WHERE id = 'e-sidhbari-jayanti-camp-2026';
UPDATE events SET external_url = 'https://www.chinmayamission.com/sidhbari/register', updated_at = datetime('now') WHERE id = 'e-sidhbari-vedanta-conclusion-2026';
UPDATE events SET external_url = 'https://chykwest.org/yep/', updated_at = datetime('now') WHERE id = 'e-mang-yep-2026';
