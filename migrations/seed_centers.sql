-- Sample centers for testing
-- Run with: wrangler d1 execute chinmaya-janata-db --local --file=seed_centers.sql

DELETE FROM centers;

INSERT OR REPLACE INTO centers (id, name, latitude, longitude, address, member_count, is_verified, created_at, updated_at) VALUES
('c1000001-0000-0000-0000-000000000001', 'Chinmaya Mission Boston', 42.3601, -71.0589, '90 Lincoln St, Boston, MA 02111', 245, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000002', 'Chinmaya Mission New Jersey', 40.7357, -74.1724, '125 C Charlotte Ave, South River, NJ 08882', 312, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000003', 'Chinmaya Mission San Francisco', 37.7749, -122.4194, '675 Templeton Dr, Grover Beach, CA 93433', 189, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000004', 'Chinmaya Mission Los Angeles', 34.0522, -118.2437, '722 Jefferson Ave, Glendale, CA 91203', 428, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000005', 'Chinmaya Mission Chicago', 41.8781, -87.6298, '1921 E Oakton St, Arlington Heights, IL 60004', 156, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000006', 'Chinmaya Mission Houston', 29.7604, -95.3698, '10370 Bissonnet St, Houston, TX 77099', 267, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000007', 'Chinmaya Mission Dallas', 32.7767, -96.7970, '1000 E Plano Pkwy, Plano, TX 75074', 198, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000008', 'Chinmaya Mission Seattle', 47.6062, -122.3321, '11422 Eldorado Pkwy, Frisco, TX 75035', 134, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000009', 'Chinmaya Mission Washington DC', 38.9072, -77.0369, '12100 Eldorado Pkwy, Frisco, TX 75035', 223, 1, datetime('now'), datetime('now')),
('c1000001-0000-0000-0000-000000000010', 'Chinmaya Mission Tampa', 27.9506, -82.4572, '5490 Crane Ridge Dr, Jacksonville, FL 32216', 145, 1, datetime('now'), datetime('now'));
