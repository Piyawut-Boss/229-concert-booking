-- PostgreSQL Database Schema for Concert Ticket System
-- Run this script to initialize the database

-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS concerts CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Create concerts table
CREATE TABLE concerts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  venue VARCHAR(255) NOT NULL,
  total_tickets INTEGER NOT NULL,
  available_tickets INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE reservations (
  id VARCHAR(50) PRIMARY KEY,
  concert_id INTEGER NOT NULL REFERENCES concerts(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  google_auth BOOLEAN DEFAULT FALSE,
  reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial concert data
INSERT INTO concerts (name, artist, date, venue, total_tickets, available_tickets, price, image_url, status)
VALUES
  ('LAMPANG MUSIC FESTIVAL 2026', 'Various Artists', '2026-03-15', 'ลานกาดกองต้า ลำปาง', 1000, 1000, 1500, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', 'open'),
  ('CHIANG MAI JAZZ NIGHT', 'Jazz Ensemble', '2026-04-20', 'Maya Lifestyle Shopping Center', 500, 500, 2000, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'open'),
  ('ROCK CONCERT BANGKOK', 'The Rockers', '2026-05-10', 'Impact Arena, Bangkok', 5000, 5000, 2500, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', 'open');

-- Insert admin user
INSERT INTO admin_users (username, password, role)
VALUES ('admin', 'admin123', 'admin');

-- Create indexes for better query performance
CREATE INDEX idx_reservations_email ON reservations(customer_email);
CREATE INDEX idx_reservations_concert ON reservations(concert_id);
CREATE INDEX idx_concerts_status ON concerts(status);

-- Display confirmation
SELECT 'Database initialization complete!' as message;
