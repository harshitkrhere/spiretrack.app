# Spiretrack: Operational Overview

> [!NOTE]
> This document is intended for potential buyers to understand the day-to-day operations, technical architecture, and running costs of Spiretrack.

## 1. Executive Summary
**Spiretrack** is a comprehensive team productivity and analytics platform. It combines real-time chat, weekly progress reviews, and AI-powered insights into one unified dashboard. It is designed to be low-maintenance, utilizing modern serverless architecture to keep costs low and performance high.

## 2. Technical Architecture & Stack

The application is built on a modern, scalable JavaScript/TypeScript ecosystem.

*   **Frontend Framework:** React 19 + TypeScript + Vite
*   **UI & Styling:** Tailwind CSS, Headless UI, Heroicons, Framer Motion (for animations)
*   **Backend as a Service (BaaS):** Supabase (handles PostgreSQL database, Authentication, and Storage)
*   **Data Visualization:** Chart.js & React Chart.js 2
*   **Mapping:** Leaflet & React Leaflet
*   **Advanced Features:** `@dnd-kit` for drag-and-drop, `jsPDF`/`html2canvas` for reporting.

### Why this stack?
This stack was chosen for **maximum developer velocity and minimum DevOps overhead**. Supabase eliminates the need to manage a custom backend server, meaning the new owner does not need a dedicated DevOps engineer to keep the app running.

## 3. Daily Operations & Maintenance

Spiretrack is essentially a "set it and forget it" application from an infrastructure perspective. 

*   **Server Maintenance:** None required. Vercel (or similar edge network) handles frontend hosting, and Supabase handles database scaling.
*   **Code Updates:** Minor updates to NPM packages (`npm update`) are recommended every 3-6 months for security.
*   **Customer Support:** The primary operational task for the new owner will be handling customer support tickets (password resets, billing inquiries, feature requests).

## 4. Hosting & Infrastructure Costs

> [!TIP]
> Spiretrack is incredibly cheap to run in its current state. The entire stack can be hosted on free tiers until the app reaches hundreds of active daily users.

**Current Monthly Run Rate (Estimated):**
*   **Frontend Hosting (Vercel/Netlify):** $0/mo (Free Tier) - scales to $20/mo on Pro.
*   **Backend & DB (Supabase):** $0/mo (Free Tier) - scales to $25/mo on Pro.
*   **Domain Name:** ~$12/year.
*   **Total Monthly Cost:** ~$0 to $45/mo depending on user volume.

## 5. Development Roadmap (Opportunities for the Buyer)
For a buyer looking to grow the app, the foundation is set to easily add:
1.  **Stripe Integration:** For automated SaaS subscription billing.
2.  **Slack/Discord Webhooks:** To push Spiretrack analytics directly into a team's existing chat tools.
3.  **Mobile App wrapper:** Converting the responsive web app into a mobile app using React Native or Capacitor.

## 6. Handover Process
Upon acquisition, the following assets will be transferred:
1.  GitHub Repository (Source Code).
2.  Domain Name (via Namecheap/GoDaddy transfer).
3.  Supabase Project Ownership (Database, Auth, Storage).
4.  Hosting Account Ownership (Vercel/Netlify).
5.  All branding assets, logos, and UI designs.
