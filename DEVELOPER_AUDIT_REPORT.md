# SpireTrack - Comprehensive Developer Audit Report

**Version:** 1.0.0\
**Date:** January 1, 2026\
**Purpose:** Complete technical documentation for developer handoff, investor
review, or team onboarding

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Database Schema](#database-schema)
6. [Frontend Structure](#frontend-structure)
7. [Backend Services](#backend-services)
8. [Feature Documentation](#feature-documentation)
9. [Third-Party Integrations](#third-party-integrations)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Security Considerations](#security-considerations)
12. [Development Guide](#development-guide)
13. [File Reference](#file-reference)
14. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**SpireTrack** is a comprehensive team productivity and analytics platform
designed to replace status meetings with 5-minute weekly check-ins. The
application enables team leaders and members to track progress, collaborate
effectively, and gain AI-powered insights into work patterns.

### Key Metrics

- **Pages:** 28 React pages
- **Components:** 106+ reusable components
- **Edge Functions:** 13 Supabase serverless functions
- **Database Tables:** 15+ PostgreSQL tables
- **Codebase Size:** ~500KB source code
- **Dependencies:** 24 production + 16 development

### Core Value Proposition

1. **Weekly Reviews** - Structured check-ins that take 5 minutes, not 50-minute
   meetings
2. **Team Analytics** - AI-powered insights into team health, productivity, and
   alignment
3. **Real-time Collaboration** - Channel-based chat with @mentions and file
   sharing
4. **Custom Forms** - Tailored review questions per team
5. **Executive Reports** - One-click PDF/Excel exports for stakeholders

---

## Product Overview

### Target Users

1. **Team Leaders/Managers** - Need visibility into team progress without
   micromanaging
2. **Team Members** - Submit weekly reviews, collaborate in chat
3. **Founders/Executives** - High-level dashboards and consolidated reports
4. **HR/People Ops** - Team health monitoring and morale tracking

### User Journeys

#### New User Flow

```
Landing Page → Register → Onboarding Modal → Create/Join Team → First Review → Dashboard
```

#### Weekly Flow (Team Member)

```
Email Reminder → Submit Review (5-10 mins) → View Team Dashboard → Collaborate in Chat
```

#### Weekly Flow (Team Leader)

```
View Submission Status → Generate AI Report → Review Insights → Export PDF → Action Planning
```

### Pricing Model (Current)

- **Free Tier:** Up to 15 team members, all features included
- **AI Tokens:** 3,000 renew in 2hours (Spire AI: 1,000 + AI Insights: 1,000 + Weekly
  Report AI: 1,000)

---

## Technology Stack

### Frontend

| Technology       | Version  | Purpose                 |
| ---------------- | -------- | ----------------------- |
| React            | 19.2.0   | UI framework            |
| TypeScript       | 5.9.3    | Type safety             |
| Vite             | 7.2.4    | Build tool & dev server |
| Tailwind CSS     | 3.4.18   | Utility-first styling   |
| Framer Motion    | 12.23.25 | Animations              |
| React Router DOM | 7.9.6    | Client-side routing     |
| Chart.js         | 4.5.1    | Data visualization      |
| Heroicons        | 2.2.0    | Icon library            |

### Backend

| Technology          | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| Supabase            | Backend-as-a-Service (PostgreSQL + Auth + Storage + Edge Functions) |
| PostgreSQL          | Relational database with RLS (Row Level Security)                   |
| Deno Edge Functions | Serverless API endpoints                                            |

### Utilities

| Package                 | Purpose                     |
| ----------------------- | --------------------------- |
| date-fns                | Date manipulation           |
| exceljs                 | Excel file generation       |
| jspdf + html2canvas     | PDF report generation       |
| web-push                | Push notifications          |
| @dnd-kit                | Drag-and-drop functionality |
| @tanstack/react-virtual | Virtualized lists           |
| leaflet                 | Map visualization           |

### DevOps

| Service  | Purpose                 |
| -------- | ----------------------- |
| Vercel   | Hosting & CD            |
| Supabase | Database & Auth hosting |
| GitHub   | Version control         |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 19 + TypeScript + Vite + Tailwind                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages (28)  │ Components (106) │ Hooks (4) │ Lib (8) │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth         │  │ PostgreSQL   │  │ Edge Functions   │   │
│  │ (Email/OAuth)│  │ (RLS enabled)│  │ (13 functions)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Realtime     │  │ Storage      │  │ Database Triggers│   │
│  │ (WebSockets) │  │ (Files)      │  │ (Auto-processes) │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User authenticates via Supabase Auth
2. React app fetches data via Supabase JS client
3. RLS policies ensure users only see authorized data
4. Edge Functions handle complex operations (AI, notifications)
5. Database triggers automate workflows (new message → notification)
6. Realtime subscriptions push updates to connected clients
```

### Route Structure

```
/ ..................... Landing page (public)
/login ................ Login/Register page
/register ............. Same as login (dual mode)
/product .............. Product features page
/features ............. Alias for /product
/pricing .............. Pricing page
/how-it-works ......... How it works page
/for-teams ............ Use case: Teams
/for-founders ......... Use case: Founders
/for-small-business ... Use case: Small Business
/about ................ About page
/privacy .............. Privacy policy
/terms ................ Terms of service
/splash ............... Animated splash screen

/app .................. Protected app routes (requires auth)
  /app ................ User dashboard
  /app/review ......... Submit weekly review
  /app/calendar ....... Calendar view
  /app/report/:id ..... Individual report view
  /app/history ........ Review history
  /app/analytics ...... Personal analytics
  /app/docs ........... Documentation
  /app/team ........... Team list
  /app/team/:id ....... Team dashboard
  /app/team/:id/members ... Team members
  /app/team/:id/chat ..... Team chat
  /app/team/:id/form-builder ... Custom form builder
  /app/team/:id/review ... Team review page
  /app/profile ........ User profile
  /app/settings ....... User settings

/admin ................ Admin routes (protected)
  /admin .............. Admin dashboard
  /admin/users ........ User management
```

---

## Database Schema

### Core Tables

#### `users`

Stores user profile data.

```sql
id: uuid PRIMARY KEY (references auth.users)
email: text NOT NULL
full_name: text
timezone: text DEFAULT 'UTC'
language: text DEFAULT 'en' CHECK ('en', 'hin')
reminder_day: text DEFAULT 'sun'
reminder_time: time DEFAULT '20:00'
plan: text DEFAULT 'free'
created_at: timestamptz
updated_at: timestamptz
```

#### `weekly_reviews`

Individual weekly review submissions.

```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users(id)
week_start_date: date NOT NULL
status: text CHECK ('draft', 'completed')
answers: jsonb DEFAULT '{}'
ai_output: jsonb
scores: jsonb
created_at, updated_at: timestamptz
```

#### `teams`

Team information.

```sql
id: uuid PRIMARY KEY
name: text NOT NULL
description: text
created_by: uuid REFERENCES users(id)
invite_code: text UNIQUE
settings: jsonb
created_at: timestamptz
```

#### `team_members`

Team membership with roles.

```sql
id: uuid PRIMARY KEY
team_id: uuid REFERENCES teams(id)
user_id: uuid REFERENCES users(id)
role: text DEFAULT 'member'
joined_at: timestamptz
UNIQUE(team_id, user_id)
```

#### `team_channels`

Chat channels per team.

```sql
id: uuid PRIMARY KEY
team_id: uuid REFERENCES teams(id)
name: text NOT NULL
type: text CHECK ('general', 'announcements', 'custom')
created_by: uuid REFERENCES users(id)
created_at: timestamptz
```

#### `team_messages`

Chat messages.

```sql
id: uuid PRIMARY KEY
channel_id: uuid REFERENCES team_channels(id)
user_id: uuid REFERENCES users(id)
content: text NOT NULL
is_pinned: boolean DEFAULT false
thread_id: uuid (for replies)
attachments: jsonb
reactions: jsonb
created_at, updated_at: timestamptz
```

#### `team_consolidated_reports`

AI-generated team reports.

```sql
id: uuid PRIMARY KEY
team_id: uuid REFERENCES teams(id)
week_start: date
report: jsonb
created_at: timestamptz
```

#### `team_whitelist`

Access control whitelist.

```sql
id: uuid PRIMARY KEY
team_id: uuid REFERENCES teams(id)
identifier: text (username or user_id)
identifier_type: text CHECK ('username', 'user_id')
added_by: uuid REFERENCES users(id)
created_at: timestamptz
```

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:

- Users can only read/write their own data
- Team members can access team resources based on membership
- Admin functions use service role for elevated access

---

## Frontend Structure

### Directory Layout

```
src/
├── App.tsx                 # Main app component with routing
├── main.tsx                # React entry point
├── index.css               # Global styles + Tailwind
├── components/             # Reusable components (106 files)
│   ├── SEOHead.tsx         # Dynamic meta tags
│   ├── admin/              # Admin-specific components
│   ├── ai/                 # AI chat interface
│   ├── analytics/          # Charts and analytics
│   ├── auth/               # Authentication components
│   ├── calendar/           # Calendar views
│   ├── charts/             # Chart.js wrappers
│   ├── compliance/         # Compliance tracking
│   ├── layout/             # App layouts (Public, App, Admin)
│   ├── notifications/      # Push notification UI
│   ├── onboarding/         # User onboarding
│   ├── report/             # Report rendering
│   ├── review/             # Review wizard
│   ├── settings/           # Settings panels
│   ├── team/               # Team management (52 files)
│   │   ├── chat/           # Real-time chat (23 files)
│   │   ├── settings/       # Team settings
│   │   └── tasks/          # Task management
│   └── ui/                 # Shared UI components
├── context/                # React context providers
│   └── AuthContext.tsx     # Authentication state
├── hooks/                  # Custom React hooks
│   ├── useCalendar.ts      # Calendar logic
│   ├── useCalendarReminders.ts
│   ├── useNotificationListener.ts
│   └── usePushNotifications.ts
├── lib/                    # Utility libraries
│   ├── supabase.ts         # Supabase client
│   ├── excelExport.ts      # Excel generation
│   ├── executivePdfExport.ts # PDF generation
│   ├── exportUtils.ts      # Export helpers
│   ├── logger.ts           # Logging utility
│   └── utils.ts            # General utilities
├── pages/                  # Page components (28 files)
│   ├── Landing.tsx         # Public landing page
│   ├── Login.tsx           # Auth page
│   ├── Dashboard.tsx       # Personal dashboard
│   ├── TeamDashboard.tsx   # Team dashboard (largest: 1000 lines)
│   ├── Analytics.tsx       # Analytics page
│   └── ...                 # Other pages
└── types/                  # TypeScript definitions
    ├── supabase.ts         # Database types
    └── calendar.ts         # Calendar types
```

### Key Components

#### Layouts

- `PublicLayout` - Header with nav for public pages
- `AppLayout` - Sidebar navigation for authenticated users
- `AdminLayout` - Admin panel layout

#### Team Chat System (`components/team/chat/`)

```
ChatLayout.tsx ............ Main chat container
ChatWindow.tsx ............ Message feed (33KB - largest component)
ChannelList.tsx ........... Channel sidebar
MessageInput.tsx .......... Rich message composer
MessageItem.tsx ........... Individual message with reactions
ThreadPanel.tsx ........... Thread/reply view
PinnedMessagesPanel.tsx ... Pinned messages
SearchPanel.tsx ........... Message search
ReactionBar.tsx ........... Emoji reactions
SystemMessage.tsx ......... System/bot messages

tabs/ ..................... Chat tabs (10 components)
  - AnalyticsTab.tsx
  - AskAITab.tsx
  - DocumentsTab.tsx
  - ImagesTab.tsx
  - InsightsTab.tsx
  - LinksTab.tsx
  - MentionsTab.tsx
  - ThreadsTab.tsx
  - VideosTab.tsx
types.ts .................. Chat type definitions
```

#### Team Management (`components/team/`)

```
TeamCreateJoin.tsx ........ Create/join team modal
MemberCard.tsx ............ Member display card
MembersSidebar.tsx ........ Members list sidebar
RoleManagementModal.tsx ... Role assignment
RoleBadge.tsx ............. Role indicator
WeeklyReviewModal.tsx ..... Review submission modal
SubmissionsViewer.tsx ..... View team submissions
FormQuestionCard.tsx ...... Form builder question
CustomFormRenderer.tsx .... Render custom forms
KPIDashboard.tsx .......... KPI metrics display
ExecutiveReportLayout.tsx . PDF report layout
ActionPlanModal.tsx ....... Create action plans
TaskAssignmentModal.tsx ... Assign tasks
```

---

## Backend Services

### Supabase Edge Functions

Located in `supabase/functions/`:

| Function                  | Purpose                             |
| ------------------------- | ----------------------------------- |
| `analyze-patterns`        | AI analysis of user review patterns |
| `chat-operations`         | CRUD for chat messages              |
| `contextual-chat`         | AI assistant with context awareness |
| `generate-analytics`      | Generate user analytics data        |
| `generate-pdf`            | Server-side PDF generation          |
| `generate-team-insights`  | AI-powered team insights            |
| `process-notifications`   | Handle push notification delivery   |
| `send-mention-email`      | Email notifications for @mentions   |
| `send-reminders`          | Scheduled review reminders          |
| `submit-review`           | Process review submissions          |
| `team-operations`         | Team CRUD and member management     |
| `user-profile-operations` | Profile updates                     |

### Shared Utilities (`supabase/functions/_shared/`)

- `cors.ts` - CORS headers
- `supabase.ts` - Server-side Supabase client

### Database Triggers

- `on_auth_user_created` - Creates user profile and settings on signup
- Message notifications - Trigger on new messages for push notifications
- Review submission tracking - Updates team submission counts

---

## Feature Documentation

### 1. Weekly Reviews

**User Flow:**

1. User receives reminder (email/push) on configured day
2. Opens review wizard with structured questions
3. Answers focus, wins, blockers, goals for next week
4. AI generates insights and scores
5. Review saved with status "completed"

**Implementation:**

- `pages/Review.tsx` - Review page wrapper
- `components/review/ReviewWizard.tsx` - Multi-step form
- `supabase/functions/submit-review` - Server processing

**Scoring System:**

```typescript
scores: {
  focus: number (1-10),    // Concentration level
  mood: number (1-10),     // Emotional state
  stress: number (1-10),   // Stress level
  sleep: number (1-10),    // Rest quality
}
```

### 2. Team Management

**Roles:**

- `owner` - Full control, can delete team
- `admin` - Can manage members, settings
- `member` - Submit reviews, chat access
- Custom roles can be created

**Whitelist System:**

- Teams can require whitelist for joining
- Whitelist by username or user ID
- Non-whitelisted users cannot join even with invite code

**Member Actions:**

- Invite via code
- Assign roles
- Kick (with cooldown)
- Ban (permanent)

### 3. Real-time Chat

**Features:**

- Channel-based messaging
- @mentions (@user, @team, @admin)
- Thread replies
- Reactions (emoji)
- File attachments (images, videos, PDFs)
- Message pinning
- Search with filters

**Implementation:**

- Supabase Realtime for WebSocket updates
- Optimistic UI updates
- Message virtualization for performance

### 4. AI Integration

**AI Capabilities:**

- Weekly review analysis
- Team insight generation
- Contextual chat assistant (Spire AI)
- Pattern recognition across weeks
- Automated recommendations

**Token System:**

- Spire AI: 1,000 tokens
- AI Insights: 1,000 tokens
- Weekly Report AI: 1,000 tokens

### 5. Analytics Dashboard

**Personal Analytics:**

- Focus trends over time
- Mood patterns
- Stress correlation
- Sleep impact analysis
- Week-over-week comparison

**Team Analytics:**

- Aggregate morale score
- Productivity index
- Risk indicators
- Alignment score
- Submission compliance

**Charts Used:**

- Line charts (trends)
- Bar charts (comparisons)
- Radar charts (multi-dimensional scores)
- Doughnut charts (distribution)

### 6. Calendar System

**Features:**

- Monthly/weekly views
- Review submission markers
- Reminder scheduling
- Event creation (future)

**Hooks:**

- `useCalendar.ts` - Core calendar logic (14KB)
- `useCalendarReminders.ts` - Reminder management

### 7. Export Capabilities

**PDF Reports:**

- Executive summary
- Team health metrics
- Individual contributions
- Action items
- Professional formatting

**Excel Reports:**

- Full data export
- Multiple sheets (raw data, analytics, members)
- Styled headers and formatting

---

## Third-Party Integrations

### Supabase

- **Auth:** Email/password, Magic link
- **Database:** PostgreSQL with RLS
- **Storage:** File uploads for chat attachments
- **Realtime:** WebSocket subscriptions for chat
- **Edge Functions:** Serverless API

### Vercel

- **Hosting:** Static site deployment
- **Analytics:** User behavior tracking
- **Speed Insights:** Real user metrics (RUM)
- **CI/CD:** Automatic deployment on push

### Google Analytics

- Event tracking
- User journeys
- Conversion funnels

### Iubenda

- Cookie consent management
- Privacy policy compliance
- GDPR compliance

### Push Notifications

- Web Push (VAPID keys)
- Service worker integration
- Notification preferences

---

## Deployment & Infrastructure

### Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Vercel Configuration

```json
{
    "trailingSlash": false,
    "headers": [
        {
            "source": "/(.*)",
            "headers": [
                { "key": "X-Content-Type-Options", "value": "nosniff" },
                { "key": "X-Frame-Options", "value": "DENY" },
                {
                    "key": "Referrer-Policy",
                    "value": "strict-origin-when-cross-origin"
                }
            ]
        }
    ],
    "rewrites": [
        { "source": "/((?!api/).*)", "destination": "/index.html" }
    ]
}
```

### Build Process

```bash
npm run build
# 1. TypeScript compilation (tsc -b)
# 2. Vite production build
# 3. Code splitting via React.lazy()
# 4. Chunk optimization
```

### Performance Optimizations

1. **Code Splitting:** React.lazy() for all routes
2. **Font Preloading:** Non-blocking Google Fonts
3. **Script Deferring:** Third-party scripts at end of body
4. **Image Optimization:** Lazy loading for below-fold images
5. **CSS Optimization:** Tailwind purging unused styles

---

## Security Considerations

### Authentication

- Supabase Auth handles password hashing
- JWT tokens for session management
- Automatic token refresh

### Database Security

- Row Level Security (RLS) on all tables
- Service role keys never exposed to client
- Parameterized queries (via Supabase SDK)

### API Security

- CORS configured on Edge Functions
- Rate limiting via Supabase
- Input validation on all endpoints

### Frontend Security

- No sensitive keys in client code
- XSS prevention via React's JSX escaping
- CSRF protection via Supabase cookies

### Best Practices

- Environment variables for secrets
- Separate dev/prod Supabase projects recommended
- Regular dependency updates

---

## Development Guide

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd SpireTrack

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Add your Supabase credentials

# 4. Start development server
npm run dev
# App runs on http://localhost:5173

# 5. Build for production
npm run build

# 6. Preview production build
npm run preview
```

### Supabase Local Development

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <project-id>

# Run migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy <function-name>
```

### Code Style

- TypeScript strict mode
- ESLint with React hooks plugin
- Tailwind CSS for styling
- Functional components with hooks

### Testing

```bash
# Run tests
npm test

# Test files:
# - src/App.test.tsx
# - src/components/review/ReviewWizard.test.tsx
# - src/lib/utils.test.ts
```

---

## File Reference

### Root Files

| File                 | Purpose                     |
| -------------------- | --------------------------- |
| `package.json`       | Dependencies and scripts    |
| `vite.config.ts`     | Vite build configuration    |
| `tailwind.config.js` | Tailwind CSS customization  |
| `tsconfig.json`      | TypeScript configuration    |
| `vitest.config.ts`   | Test configuration          |
| `index.html`         | HTML template with SEO tags |
| `vercel.json`        | Deployment configuration    |

### Key Source Files

| File                | Lines | Purpose                    |
| ------------------- | ----- | -------------------------- |
| `App.tsx`           | 165   | Root component with routes |
| `Landing.tsx`       | 745   | Marketing landing page     |
| `Dashboard.tsx`     | 464   | Personal dashboard         |
| `TeamDashboard.tsx` | 1000  | Team management hub        |
| `ChatWindow.tsx`    | ~800  | Real-time chat UI          |
| `excelExport.ts`    | 500+  | Excel report generation    |

### Supabase Files

| File                   | Purpose                |
| ---------------------- | ---------------------- |
| `supabase/schema.sql`  | Initial schema         |
| `supabase/migrations/` | 38 migration files     |
| `supabase/functions/`  | 13 Edge Functions      |
| `supabase/config.toml` | Supabase configuration |

---

## Future Roadmap

### Planned Features

1. **Mobile App** - React Native version
2. **Integrations** - Slack, GitHub, Jira webhooks
3. **Custom Workflows** - Automated actions on triggers
4. **Advanced Analytics** - Predictive insights
5. **Multi-language** - Full i18n support
6. **Offline Mode** - PWA with sync

### Technical Debt

1. Consolidate chat message types
2. Add comprehensive test coverage
3. Implement error boundary for all routes
4. Add Storybook for component documentation
5. Migrate to Supabase v2 client patterns

### Performance Targets

- FCP < 1.5s
- LCP < 2.0s
- INP < 200ms
- Bundle size < 500KB gzipped

---

## Support & Contact

For technical questions during handoff:

- Review this document thoroughly
- Check existing README.md
- Examine code comments
- Reference Supabase dashboard for database details

---

**Document Version:** 1.0.0\
**Last Updated:** January 1, 2026\
**Prepared By:** Automated Audit System\
**Total Documentation Lines:** ~1,500
