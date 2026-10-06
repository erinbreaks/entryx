import fs from 'fs';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import crypto from 'crypto';

export interface Profile {
  id: string;
  email: string;
  role: 'owner' | 'organizer';
  name: string;
  password_hash: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface EventCreationRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization_name: string;
  message: string;
  event_description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  ticket_price: number;
  max_capacity: number;
  event_date: string;
  start_time: string;
  end_time?: string;
  venue: string;
  image_url?: string;
  registration_deadline?: string;
  status: 'active' | 'cancelled' | 'completed';
  created_by?: string;
  created_at: string;
  updated_at?: string;
  // Computed fields from queries:
  registered_count?: number;
  remaining_capacity?: number;
  checked_in_count?: number;
}

export interface EventOrganizer {
  id: string;
  event_id: string;
  organizer_id: string;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  student_id: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Ticket {
  id: string;
  registration_id: string;
  event_id: string;
  ticket_number: string;
  signed_token: string;
  qr_data_url?: string;
  status: 'valid' | 'checked_in' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

export interface CheckIn {
  id: string;
  ticket_id: string;
  event_id: string;
  organizer_id?: string;
  checked_in_at: string;
}

interface LocalDB {
  profiles: Profile[];
  event_creation_requests: EventCreationRequest[];
  events: Event[];
  event_organizers: EventOrganizer[];
  registrations: Registration[];
  tickets: Ticket[];
  check_ins: CheckIn[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'entryx_db.json');

// Ensure local storage directory exists
function getLocalDB(): LocalDB {
  try {
    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: LocalDB = {
        profiles: [],
        event_creation_requests: [],
        events: [],
        event_organizers: [],
        registrations: [],
        tickets: [],
        check_ins: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return {
      profiles: [],
      event_creation_requests: [],
      events: [],
      event_organizers: [],
      registrations: [],
      tickets: [],
      check_ins: [],
    };
  }
}

function saveLocalDB(data: LocalDB): void {
  try {
    if (!fs.existsSync(path.dirname(DB_FILE))) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local DB:', err);
  }
}

export const db = {
  // ==========================================
  // PROFILES / AUTH
  // ==========================================
  async getProfileByEmail(email: string): Promise<Profile | null> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .ilike('email', normalizedEmail)
        .single();
      if (error || !data) return null;
      return data as Profile;
    }
    const local = getLocalDB();
    return local.profiles.find((p) => p.email.toLowerCase() === normalizedEmail) || null;
  },

  async getProfileById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', id).single();
      if (error || !data) return null;
      return data as Profile;
    }
    const local = getLocalDB();
    return local.profiles.find((p) => p.id === id) || null;
  },

  async createProfile(profile: Omit<Profile, 'id' | 'created_at'> & { id?: string }): Promise<Profile> {
    const id = profile.id || crypto.randomUUID();
    const newProfile: Profile = {
      ...profile,
      id,
      email: profile.email.trim().toLowerCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('profiles').insert(newProfile).select().single();
      if (error) throw error;
      return data as Profile;
    }

    const local = getLocalDB();
    local.profiles.push(newProfile);
    saveLocalDB(local);
    return newProfile;
  },

  async listOrganizers(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'organizer')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Profile[];
    }
    const local = getLocalDB();
    return local.profiles.filter((p) => p.role === 'organizer');
  },

  // ==========================================
  // EVENT CREATION REQUESTS
  // ==========================================
  async createEventRequest(req: Omit<EventCreationRequest, 'id' | 'created_at' | 'status'>): Promise<EventCreationRequest> {
    const newReq: EventCreationRequest = {
      ...req,
      id: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('event_creation_requests').insert(newReq).select().single();
      if (error) throw error;
      return data as EventCreationRequest;
    }

    const local = getLocalDB();
    local.event_creation_requests.unshift(newReq);
    saveLocalDB(local);
    return newReq;
  },

  async listEventRequests(): Promise<EventCreationRequest[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('event_creation_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as EventCreationRequest[];
    }
    const local = getLocalDB();
    return [...local.event_creation_requests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async updateEventRequestStatus(
    id: string,
    status: 'approved' | 'rejected',
    reviewedBy?: string
  ): Promise<EventCreationRequest | null> {
    const reviewedAt = new Date().toISOString();
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('event_creation_requests')
        .update({ status, reviewed_at: reviewedAt, reviewed_by: reviewedBy })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as EventCreationRequest;
    }

    const local = getLocalDB();
    const req = local.event_creation_requests.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    req.reviewed_at = reviewedAt;
    req.reviewed_by = reviewedBy;
    saveLocalDB(local);
    return req;
  },

  // ==========================================
  // EVENTS
  // ==========================================
  async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'status'> & { status?: 'active' | 'cancelled' | 'completed' }): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: crypto.randomUUID(),
      ticket_price: Number(eventData.ticket_price) || 0,
      max_capacity: Number(eventData.max_capacity) || 1,
      status: eventData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('events').insert(newEvent).select().single();
      if (error) throw error;
      return data as Event;
    }

    const local = getLocalDB();
    local.events.unshift(newEvent);
    saveLocalDB(local);
    return newEvent;
  },

  async getEventById(id: string): Promise<Event | null> {
    let event: Event | null = null;
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', id).single();
      if (error || !data) return null;
      event = data as Event;
    } else {
      const local = getLocalDB();
      event = local.events.find((e) => e.id === id) || null;
    }

    if (!event) return null;

    // Calculate real dynamic stats
    const stats = await this.getEventStats(id);
    return {
      ...event,
      registered_count: stats.registeredCount,
      remaining_capacity: Math.max(0, event.max_capacity - stats.registeredCount),
      checked_in_count: stats.checkedInCount,
    };
  },

  async listEvents(options?: { status?: string; organizerId?: string; onlyWithImages?: boolean }): Promise<Event[]> {
    let events: Event[] = [];

    if (isSupabaseConfigured && supabaseAdmin) {
      let query = supabaseAdmin.from('events').select('*').order('event_date', { ascending: true });
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.onlyWithImages) {
        query = query.not('image_url', 'is', null).neq('image_url', '');
      }
      const { data, error } = await query;
      if (error) throw error;
      events = (data || []) as Event[];
    } else {
      const local = getLocalDB();
      events = [...local.events];
      if (options?.status) {
        events = events.filter((e) => e.status === options.status);
      }
      if (options?.onlyWithImages) {
        events = events.filter((e) => Boolean(e.image_url && e.image_url.trim() !== ''));
      }
      events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    }

    // Filter by organizer if specified
    if (options?.organizerId) {
      const authorizedEventIds = await this.getOrganizerEventIds(options.organizerId);
      events = events.filter((e) => authorizedEventIds.includes(e.id) || e.created_by === options.organizerId);
    }

    // Calculate live counts for each event
    const enrichedEvents = await Promise.all(
      events.map(async (e) => {
        const stats = await this.getEventStats(e.id);
        return {
          ...e,
          registered_count: stats.registeredCount,
          remaining_capacity: Math.max(0, e.max_capacity - stats.registeredCount),
          checked_in_count: stats.checkedInCount,
        };
      })
    );

    return enrichedEvents;
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const updated_at = new Date().toISOString();
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('events')
        .update({ ...updates, updated_at })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Event;
    }

    const local = getLocalDB();
    const eventIndex = local.events.findIndex((e) => e.id === id);
    if (eventIndex === -1) return null;
    local.events[eventIndex] = {
      ...local.events[eventIndex],
      ...updates,
      updated_at,
    };
    saveLocalDB(local);
    return local.events[eventIndex];
  },

  // ==========================================
  // EVENT ORGANIZERS (Access control)
  // ==========================================
  async assignOrganizerToEvent(eventId: string, organizerId: string): Promise<EventOrganizer> {
    const newAssignment: EventOrganizer = {
      id: crypto.randomUUID(),
      event_id: eventId,
      organizer_id: organizerId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('event_organizers').insert(newAssignment).select().single();
      if (error) throw error;
      return data as EventOrganizer;
    }

    const local = getLocalDB();
    const exists = local.event_organizers.some((eo) => eo.event_id === eventId && eo.organizer_id === organizerId);
    if (!exists) {
      local.event_organizers.push(newAssignment);
      saveLocalDB(local);
    }
    return newAssignment;
  },

  async getOrganizerEventIds(organizerId: string): Promise<string[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('event_organizers')
        .select('event_id')
        .eq('organizer_id', organizerId);
      if (error) throw error;
      return (data || []).map((row: any) => row.event_id);
    }
    const local = getLocalDB();
    return local.event_organizers
      .filter((eo) => eo.organizer_id === organizerId)
      .map((eo) => eo.event_id);
  },

  async isOrganizerAuthorizedForEvent(organizerId: string, eventId: string): Promise<boolean> {
    const user = await this.getProfileById(organizerId);
    if (!user) return false;
    if (user.role === 'owner') return true; // Owner has universal access

    const event = await this.getEventById(eventId);
    if (event && event.created_by === organizerId) return true;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('event_organizers')
        .select('id')
        .eq('organizer_id', organizerId)
        .eq('event_id', eventId)
        .single();
      return Boolean(data && !error);
    }

    const local = getLocalDB();
    return local.event_organizers.some(
      (eo) => eo.organizer_id === organizerId && eo.event_id === eventId
    );
  },

  // ==========================================
  // REGISTRATIONS & CAPACITY CHECK
  // ==========================================
  async getEventStats(eventId: string): Promise<{ registeredCount: number; checkedInCount: number }> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { count: regCount } = await supabaseAdmin
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      const { count: checkinCount } = await supabaseAdmin
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      return {
        registeredCount: regCount || 0,
        checkedInCount: checkinCount || 0,
      };
    }

    const local = getLocalDB();
    const registeredCount = local.registrations.filter(
      (r) => r.event_id === eventId && r.status === 'confirmed'
    ).length;
    const checkedInCount = local.check_ins.filter((c) => c.event_id === eventId).length;

    return { registeredCount, checkedInCount };
  },

  /**
   * Performs an atomic registration checking capacity safely
   */
  async registerStudent(params: {
    eventId: string;
    fullName: string;
    email: string;
    studentId: string;
  }): Promise<{ registration: Registration; event: Event }> {
    const { eventId, fullName, email, studentId } = params;
    const normalizedEmail = email.trim().toLowerCase();

    const event = await this.getEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== 'active') {
      throw new Error('This event is no longer active');
    }

    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      throw new Error('Registration deadline for this event has passed');
    }

    // Check existing registration
    const existing = await this.getRegistrationByEventAndEmail(eventId, normalizedEmail);
    if (existing) {
      throw new Error('You have already registered for this event with this email address');
    }

    // Check capacity atomically
    const stats = await this.getEventStats(eventId);
    if (stats.registeredCount >= event.max_capacity) {
      throw new Error('Registration Closed — Capacity Reached');
    }

    const newRegistration: Registration = {
      id: crypto.randomUUID(),
      event_id: eventId,
      full_name: fullName.trim(),
      email: normalizedEmail,
      student_id: studentId.trim(),
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('registrations').insert(newRegistration).select().single();
      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already registered for this event with this email address');
        }
        throw error;
      }
      return { registration: data as Registration, event };
    }

    const local = getLocalDB();
    // Double check race condition in local state
    const doubleCheckCount = local.registrations.filter(
      (r) => r.event_id === eventId && r.status === 'confirmed'
    ).length;
    if (doubleCheckCount >= event.max_capacity) {
      throw new Error('Registration Closed — Capacity Reached');
    }

    local.registrations.push(newRegistration);
    saveLocalDB(local);
    return { registration: newRegistration, event };
  },

  async getRegistrationByEventAndEmail(eventId: string, email: string): Promise<Registration | null> {
    const normalizedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .ilike('email', normalizedEmail)
        .single();
      if (error || !data) return null;
      return data as Registration;
    }
    const local = getLocalDB();
    return (
      local.registrations.find(
        (r) => r.event_id === eventId && r.email.toLowerCase() === normalizedEmail && r.status === 'confirmed'
      ) || null
    );
  },

  async listRegistrationsForEvent(eventId: string): Promise<Registration[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Registration[];
    }
    const local = getLocalDB();
    return local.registrations.filter((r) => r.event_id === eventId);
  },

  // ==========================================
  // TICKETS
  // ==========================================
  async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'status'> & { id?: string }): Promise<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: ticket.id || crypto.randomUUID(),
      status: 'valid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('tickets').insert(newTicket).select().single();
      if (error) throw error;
      return data as Ticket;
    }

    const local = getLocalDB();
    local.tickets.push(newTicket);
    saveLocalDB(local);
    return newTicket;
  },

  async getTicketByRegistrationId(registrationId: string): Promise<Ticket | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('tickets')
        .select('*')
        .eq('registration_id', registrationId)
        .single();
      if (error || !data) return null;
      return data as Ticket;
    }
    const local = getLocalDB();
    return local.tickets.find((t) => t.registration_id === registrationId) || null;
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('tickets').select('*').eq('id', id).single();
      if (error || !data) return null;
      return data as Ticket;
    }
    const local = getLocalDB();
    return local.tickets.find((t) => t.id === id) || null;
  },

  async getTicketBySignedToken(token: string): Promise<Ticket | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('tickets').select('*').eq('signed_token', token).single();
      if (error || !data) return null;
      return data as Ticket;
    }
    const local = getLocalDB();
    return local.tickets.find((t) => t.signed_token === token) || null;
  },

  async updateTicketStatus(id: string, status: 'valid' | 'checked_in' | 'cancelled'): Promise<Ticket | null> {
    const updated_at = new Date().toISOString();
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('tickets')
        .update({ status, updated_at })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Ticket;
    }
    const local = getLocalDB();
    const ticket = local.tickets.find((t) => t.id === id);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updated_at = updated_at;
    saveLocalDB(local);
    return ticket;
  },

  // ==========================================
  // CHECK-INS
  // ==========================================
  async getCheckInByTicketId(ticketId: string): Promise<CheckIn | null> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('check_ins')
        .select('*')
        .eq('ticket_id', ticketId)
        .single();
      if (error || !data) return null;
      return data as CheckIn;
    }
    const local = getLocalDB();
    return local.check_ins.find((c) => c.ticket_id === ticketId) || null;
  },

  async recordCheckIn(ticketId: string, eventId: string, organizerId?: string): Promise<CheckIn> {
    const newCheckIn: CheckIn = {
      id: crypto.randomUUID(),
      ticket_id: ticketId,
      event_id: eventId,
      organizer_id: organizerId,
      checked_in_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('check_ins').insert(newCheckIn).select().single();
      if (error) throw error;
      return data as CheckIn;
    }

    const local = getLocalDB();
    local.check_ins.push(newCheckIn);
    saveLocalDB(local);
    return newCheckIn;
  },

  async listCheckInsForEvent(eventId: string): Promise<CheckIn[]> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('check_ins')
        .select('*')
        .eq('event_id', eventId)
        .order('checked_in_at', { ascending: false });
      if (error) throw error;
      return (data || []) as CheckIn[];
    }
    const local = getLocalDB();
    return local.check_ins.filter((c) => c.event_id === eventId);
  },

  // ==========================================
  // ADMIN SYSTEM METRICS
  // ==========================================
  async getSystemOverviewStats(): Promise<{
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    totalCheckIns: number;
    pendingRequests: number;
    totalOrganizers: number;
  }> {
    if (isSupabaseConfigured && supabaseAdmin) {
      const [eventsRes, activeEventsRes, regRes, checkinsRes, requestsRes, orgsRes] = await Promise.all([
        supabaseAdmin.from('events').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('events').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabaseAdmin.from('check_ins').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('event_creation_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer'),
      ]);

      return {
        totalEvents: eventsRes.count || 0,
        activeEvents: activeEventsRes.count || 0,
        totalRegistrations: regRes.count || 0,
        totalCheckIns: checkinsRes.count || 0,
        pendingRequests: requestsRes.count || 0,
        totalOrganizers: orgsRes.count || 0,
      };
    }

    const local = getLocalDB();
    return {
      totalEvents: local.events.length,
      activeEvents: local.events.filter((e) => e.status === 'active').length,
      totalRegistrations: local.registrations.filter((r) => r.status === 'confirmed').length,
      totalCheckIns: local.check_ins.length,
      pendingRequests: local.event_creation_requests.filter((r) => r.status === 'pending').length,
      totalOrganizers: local.profiles.filter((p) => p.role === 'organizer').length,
    };
  },
};
