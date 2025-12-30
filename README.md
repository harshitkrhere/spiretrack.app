# SpireTrack

**SpireTrack** is a comprehensive team productivity and analytics platform
designed to help teams track progress, collaborate effectively, and gain
insights into their work patterns.

## Features

### 🎯 Core Features

- **Weekly Reviews** - Track individual and team progress with customizable
  review forms
- **Team Management** - Create and manage teams with role-based permissions
- **Analytics Dashboard** - Visualize productivity trends and patterns
- **AI-Powered Insights** - Get intelligent recommendations based on team data

### 💬 Team Collaboration

- **Real-time Chat** - Channel-based messaging with file sharing
- **@Mentions** - Tag team members and notify everyone with @team
- **File Uploads** - Share photos, videos, PDFs, and documents
- **Role Management** - Assign custom roles with specific permissions

### 🛡️ Advanced Features

- **Whitelist System** - Control team access with username/ID whitelisting
- **Member Management** - Kick/ban capabilities with cooldown periods
- **Custom Forms** - Build tailored weekly review questions
- **PDF Reports** - Export consolidated team reports

### 📊 Analytics

- **Focus Trends** - Track concentration patterns over time
- **Emotional Load** - Monitor team stress and workload
- **Deep Work Analysis** - Measure productive work sessions
- **Team Insights** - Consolidated reports and action plans

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Charts**: Chart.js + React Chart.js 2
- **PDF Export**: jsPDF + html2canvas

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd SpireTrack
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server

```bash
npm run dev
```

5. Build for production

```bash
npm run build
```

## Project Structure

```
SpireTrack/
├── src/
│   ├── components/     # React components
│   │   ├── analytics/  # Analytics charts and dashboards
│   │   ├── team/       # Team management components
│   │   ├── review/     # Weekly review components
│   │   └── ui/         # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Supabase client and utilities
│   └── utils/          # Helper functions
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

## Database Schema

The application uses Supabase PostgreSQL with the following main tables:

- `users` - User profiles and authentication
- `teams` - Team information
- `team_members` - Team membership with roles
- `team_channels` - Chat channels
- `team_messages` - Chat messages
- `team_whitelist` - Access control whitelist
- `weekly_reviews` - Individual review submissions
- `team_consolidated_reports` - Team-wide reports

## Contributing

This is a private project. For questions or issues, please contact the
development team.

## License

Proprietary - All rights reserved

---

**Built with ❤️ by the SpireTrack Team**
