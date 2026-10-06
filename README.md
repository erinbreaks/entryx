<div align="center">

# 🎫 EntryX
### Event Entry, Reimagined.

[![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Real-time event registration, tamper-proof QR passes, and live gate scanning.**



</div>

---

## ✨ Highlights

- 🔒 **Cryptographic QR Passes** — Server-signed with HMAC-SHA256. Zero forgery, zero ticket duplication.
- 📷 **In-Browser Gate Scanner** — Instant webcam QR scanning with audio feedback and duplicate detection.
- 🛡️ **Atomic Capacity Control** — Enforces strict seat limits directly at the database layer.
- 📧 **Transactional Emails** — Automated branded HTML passes dispatched instantly via Resend.
- 🎨 **Sleek Aesthetic** — Smooth WebGL animations and an Obsidian & Gold dark theme.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Graphics** | WebGL PatternWaves (`ogl`), React Bits WarpText |
| **Backend & DB** | Next.js Server Actions / Route Handlers, Supabase PostgreSQL, Realtime |
| **Security** | HMAC-SHA256 Signatures, `crypto.timingSafeEqual`, JWT, bcryptjs |
| **Hardware / Scanner** | `html5-qrcode` Multi-Camera Webcam Engine |
| **Email** | Resend Transactional Email API |

---



## 🔍 Verification Lifecycle

| Outcome | Visual Indicator | Audio Feedback | Guard Action |
|---|---|---|---|
| **`CHECKED_IN`** | 🟢 Green banner with attendee info | Success Chime (D5 $\rightarrow$ A5) | Validates ticket & logs entry timestamp |
| **`ALREADY_USED`** | 🟡 Amber banner with previous check-in time | Warning Chime (A4 $\rightarrow$ F#4) | **Preserves original timestamp** & blocks entry |
| **`INVALID`** | 🔴 Red banner | Error Buzz (A3 $\rightarrow$ D#3) | Rejects forged or corrupted tokens |

---

<details>
<summary><b>📖 Click to Expand: Complete Architecture & Workflows</b></summary>

### System Architecture
```
Attendee App ──(Register)──► Next.js API ──(HMAC Sign)──► Supabase DB
                                  │
                                  ├────► Resend (Email QR Pass)
                                  │
Gate Scanner ◄──(Scan QR)─────────┴────► Verify & Atomic Check-In
```

### Operational Workflows
1. **Admin Setup**: Visit `/login` to initialize the Owner account.
2. **Event Requests**: Users submit proposals via `/contact`.
3. **Organizer Provisioning**: Owner reviews requests and issues organizer access.
4. **Capacity Control**: Organizers create events with real-time seat limits.
5. **Gate Verification**: Organizers scan passes at `/organizer/events/:id/scan`.

### Database Schema
Full PostgreSQL DDL script located at [`supabase/schema.sql`](supabase/schema.sql).

</details>

---


