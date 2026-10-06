# EntryX — Event Entry, Reimagined.

![EntryX Logo](public/logo.svg)

> **EntryX** is a real-time event registration and QR-based entry verification platform designed for seamless gate check-ins, cryptographic ticket authenticity, and live capacity control.

---

## Table of Contents

- [Overview & Purpose](#overview--purpose)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture & Security](#architecture--security)
- [Database Schema (Supabase PostgreSQL)](#database-schema-supabase-postgresql)
- [Environment Variables Setup](#environment-variables-setup)
- [Local Installation & Setup](#local-installation--setup)
- [End-to-End Operational Workflows](#end-to-end-operational-workflows)
  - [1. Creating the Super Admin / Owner Account](#1-creating-the-super-admin--owner-account)
  - [2. Submitting an Event Creation Request](#2-submitting-an-event-creation-request)
  - [3. Owner Review & Organizer Provisioning](#3-owner-review--organizer-provisioning)
  - [4. Organizer Event Creation & Capacity Setting](#4-organizer-event-creation--capacity-setting)
  - [5. Student Event Registration & Atomic Capacity Check](#5-student-event-registration--atomic-capacity-check)
  - [6. Real Transactional Email & QR Pass Issuance](#6-real-transactional-email--qr-pass-issuance)
  - [7. Gate QR Scanner Verification Lifecycle](#7-gate-qr-scanner-verification-lifecycle)
- [Verification States (CHECKED-IN / ALREADY USED / INVALID)](#verification-states)
- [Deployment Guide](#deployment-guide)

---

## Overview & Purpose

EntryX replaces fragile paper-based and unverified digital ticketing systems with a cryptographically enforced, real-time platform.

- **Zero Fake Data**: The application starts completely clean. No fake events, demo attendees, or simulated metrics.
- **Dynamic Calculation**: Every registration count, remaining seat balance, and check-in timestamp is calculated directly from actual database records.
- **Single-Use Cryptographic QR Passes**: Every ticket is signed server-side with HMAC-SHA256 (`TICKET_SECRET`). Tickets cannot be forged or duplicated.
- **Real Transactional Emails**: Tickets with high-res QR codes and notifications are dispatched via Resend.

---

## Technology Stack

- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Visuals & Animation**: WebGL PatternWaves background powered by `ogl` (lightweight, zero interference with UI).
- **Backend & APIs**: Next.js Server Route Handlers with secure HTTP-only cookies and constant-time cryptographic verification.
- **Database & Realtime**: Supabase PostgreSQL with foreign keys, cascading constraints, and Realtime broadcast subscriptions.
- **Authentication**: Role-based access control (Super Admin / Owner vs. Authorized Organizers) using `bcryptjs` password hashing and JWT sessions.
- **Email Delivery**: Resend Transactional Email API (`resend`).
- **QR Engine & Scanner**: `qrcode` for vector/raster QR generation and `html5-qrcode` for multi-camera webcam gate scanning with manual token input fallback.

---

## Architecture & Security

```
                                 ┌──────────────────────────────┐
                                 │   Student / Attendee App     │
                                 │  (/events, /events/:id)      │
                                 └──────────────┬───────────────┘
                                                │ 1. Atomic Register
                                                ▼
┌──────────────────────────────┐ 2. HMAC-SHA256 ┌──────────────────────────────┐
│  Gate Scanner (Webcam/Input) │◄───────────────┤   Next.js API Gateway        │
│  (/organizer/events/:id/scan)│  Signed Token  │   (/api/register, /verify)   │
└──────────────┬───────────────┘                └──────┬───────────────┬───────┘
               │ 3. Instant Verify                     │               │
               ▼                                       ▼               ▼
┌──────────────────────────────┐        ┌──────────────┴──────┐ ┌──────┴───────┐
│ Supabase PostgreSQL Database │        │ Supabase Realtime   │ │ Resend Email │
│ (Events, Tickets, Check-Ins) │        │ (Live Dashboard)    │ │ (HTML Ticket)│
└──────────────────────────────┘        └─────────────────────┘ └──────────────┘
```

### Security Measures:
1. **Cryptographic Token Signing**: Ticket payloads (`ticketId`, `eventId`, `attendeeEmail`, `studentId`, `issuedAt`) are signed with HMAC-SHA256. Secret keys exist solely in server environment variables.
2. **Timing-Safe Equality**: Signatures are verified using `crypto.timingSafeEqual` to prevent timing analysis attacks.
3. **Role-Based Isolation**: Organizers can only view and scan tickets for events they are explicitly assigned to.
4. **Idempotent Single-Use Guard**: When a ticket is scanned:
   - First scan -> Marked `CHECKED-IN`, server records `checked_in_at` timestamp.
   - Second scan -> Returns `ALREADY USED` and reports the exact original check-in timestamp without overwriting it.

---

## Database Schema (Supabase PostgreSQL)

Execute the full schema located at [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor:

- `profiles` (`id`, `email`, `role`, `name`, `password_hash`, `phone`, `created_at`)
- `event_creation_requests` (`id`, `full_name`, `email`, `phone`, `organization_name`, `message`, `status`, `created_at`)
- `events` (`id`, `name`, `description`, `ticket_price`, `max_capacity`, `event_date`, `start_time`, `venue`, `image_url`, `status`, `created_by`)
- `event_organizers` (`id`, `event_id`, `organizer_id`, `created_at`)
- `registrations` (`id`, `event_id`, `full_name`, `email`, `student_id`, `status`, `created_at`)
- `tickets` (`id`, `registration_id`, `event_id`, `ticket_number`, `signed_token`, `qr_data_url`, `status`, `created_at`)
- `check_ins` (`id`, `ticket_id`, `event_id`, `organizer_id`, `checked_in_at`)

---

## Environment Variables Setup

Create a `.env.local` file by copying [`.env.example`](.env.example):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cryptographic Ticket Secret (HMAC-SHA256)
TICKET_SECRET=entryx_super_secure_cryptographic_ticket_signing_secret_key_2026

# JWT Authentication Secret
JWT_SECRET=entryx_jwt_session_secret_change_in_production_2026

# Resend Transactional Email API Key
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=EntryX Tickets <tickets@yourdomain.com>

# Owner / Super Admin Contact
OWNER_EMAIL=erinbobin@gmail.com
OWNER_PHONE=9446611885

# Base Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Local Installation & Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/entryx.git
cd entryx
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## End-to-End Operational Workflows

### 1. Creating the Super Admin / Owner Account
1. Open [http://localhost:3000/login](http://localhost:3000/login).
2. If no owner exists in the database, EntryX displays the **"Initial Setup Notice"**.
3. Click **"Initialize Owner Account Now"**, provide name, email (`erinbobin@gmail.com`), and a master password (min 8 chars).
4. Log in to access the **Owner Admin Portal** at `/admin`.

### 2. Submitting an Event Creation Request
1. Any prospective host navigates to `/contact` ("Create an Event").
2. Fills out Full Name, Email, Phone Number, Organization Name, and Event proposal.
3. Submits the form. The request is persisted in the database and a real email notification is dispatched to `erinbobin@gmail.com`.

### 3. Owner Review & Organizer Provisioning
1. Owner logs in and navigates to `/admin/requests`.
2. Reviews the proposal.
3. Clicks **"Approve & Authorize Organizer"**. EntryX provisions a secure organizer account and generates temporary login credentials.

### 4. Organizer Event Creation & Capacity Setting
1. The organizer logs in at `/login` and is redirected to `/organizer`.
2. Clicks **"Create Event"**, enters Event Name, Ticket Price, Maximum Capacity (e.g. 100), Date, Time, Venue, and optional Cover Image.
3. The event instantly appears on `/events` and on the homepage carousel.

### 5. Student Event Registration & Atomic Capacity Check
1. A student opens `/events` and selects an active event.
2. Fills out Full Name, Email Address, and Student ID.
3. If maximum capacity is reached, the backend rejects with `"Registration Closed — Capacity Reached"`.
4. If capacity is available, a registration record and unique ticket (`ETX-XXXX-XXXX`) are created atomically.

### 6. Real Transactional Email & QR Pass Issuance
1. The server generates a high-res QR code containing the HMAC-SHA256 signed token.
2. A branded HTML confirmation email is sent via Resend to the student's email address.
3. The student is redirected to `/registration/success/:ticketId` where they can view, print, or download their digital pass.

### 7. Gate QR Scanner Verification Lifecycle
1. The organizer opens `/organizer/events/:id/scan` on any phone, tablet, or laptop.
2. Clicks **"Activate Camera"** to start the webcam QR reader (or uses the manual token input fallback).
3. Holds the student's QR code up to the camera.
4. The token is sent to `/api/verify-ticket`.

---

## Verification States

| Outcome | Screen Feedback | Audio Chime | Database Action |
| :--- | :--- | :--- | :--- |
| **`CHECKED_IN`** | Green banner with attendee name and entry time | Success Chime (D5 $\rightarrow$ A5) | Status set to `checked_in`, timestamp recorded in `check_ins`. |
| **`ALREADY_USED`** | Amber banner displaying original check-in timestamp | Warning Chime (A4 $\rightarrow$ F#4) | **Preserves original timestamp**. Rejects duplicate entry. |
| **`INVALID_TICKET`** | Red banner with cryptographic error | Error Buzz (A3 $\rightarrow$ D#3) | Rejects entry. Unrecognized or forged token. |
| **`UNAUTHORIZED`** | Red banner "Unauthorized Organizer" | Error Buzz | Rejects entry if organizer does not own this event. |

---

## Deployment Guide

### Deploying to Vercel
1. Push this repository to GitHub.
2. Import project on [Vercel](https://vercel.com).
3. Set the Environment Variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TICKET_SECRET`, `RESEND_API_KEY`, etc.).
4. Click **Deploy**.

---

## Contact & Direct Support

- **Email**: [erinbobin@gmail.com](mailto:erinbobin@gmail.com)
- **Phone**: `9446611885`
- **Platform**: EntryX — *Event Entry, Reimagined.*
