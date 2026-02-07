-- Concert Ticket System - Production Seed Data
-- This file contains sample data for production setup

BEGIN;

-- Insert initial concert data
INSERT INTO concerts (name, artist, date, venue, total_tickets, available_tickets, price, image_url, status, description)
VALUES
  (
    'LAMPANG MUSIC FESTIVAL 2026',
    'Various Artists',
    '2026-03-15',
    'ลานกาดกองต้า ลำปาง',
    1000,
    1000,
    1500.00,
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    'open',
    'Join us for the biggest music festival in Lampang featuring local and international artists'
  ),
  (
    'CHIANG MAI JAZZ NIGHT',
    'Jazz Ensemble',
    '2026-04-20',
    'Maya Lifestyle Shopping Center',
    500,
    500,
    2000.00,
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    'open',
    'An evening of smooth jazz performances in the heart of Chiang Mai'
  ),
  (
    'ROCK CONCERT BANGKOK',
    'The Rockers',
    '2026-05-10',
    'Impact Arena, Bangkok',
    5000,
    5000,
    2500.00,
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    'open',
    'High-energy rock concert featuring Thailand''s hottest bands'
  )
ON CONFLICT DO NOTHING;

-- Insert admin user with hashed password (use bcrypt in production)
INSERT INTO admin_users (username, email, password, role, is_active)
VALUES ('admin', 'admin@concertticket.com', '$2b$10$WQviiV4/Fc7E8exS2nPS6OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'admin', TRUE)
ON CONFLICT (username) DO NOTHING;

COMMIT;
