-- ==============================================================================
-- EntryX PostgreSQL Database Schema (Supabase)
-- "Event Entry, Reimagined."
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS TABLE
-- Roles: 'owner' (Super Admin), 'organizer' (Authorized Event Host)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'organizer')),
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENT CREATION REQUESTS TABLE
-- Public requests from organizers wishing to create an event
CREATE TABLE IF NOT EXISTS event_creation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    organization_name TEXT NOT NULL,
    message TEXT NOT NULL,
    event_description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id)
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (ticket_price >= 0),
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    venue TEXT NOT NULL,
    image_url TEXT,
    registration_deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVENT ORGANIZERS (Access Control Mapping)
-- Maps which organizers have permissions for which events
CREATE TABLE IF NOT EXISTS event_organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, organizer_id)
);

-- 5. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, email)
);

-- 6. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_number TEXT UNIQUE NOT NULL,
    signed_token TEXT UNIQUE NOT NULL,
    qr_data_url TEXT,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'checked_in', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (ticket_id)
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_tickets_signed_token ON tickets(signed_token);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_checkins_event ON check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_organizers_org ON event_organizers(organizer_id);

-- ==============================================================================
-- DEFAULT SUPER ADMIN / OWNER SEED
-- ==============================================================================
INSERT INTO profiles (id, email, role, name, password_hash, phone)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'erinbobin@gmail.com',
    'owner',
    'Erin Bobin',
    '$2a$10$3k9W3MpON3N/af1FR2gS5eOzI0YPw6.fceTA3EGIt3PQvvGJGzjRi',
    '9446611885'
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, role = 'owner';
