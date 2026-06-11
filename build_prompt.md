BUILD MY PERSONAL DASHBOARD WITH INTEGRATIONS

GOAL
Create a personal dashboard web app that works on desktop and mobile. It connects to Notion (tasks and habits), Google Calendar (events), and Google Sheets (export backups). Users can manage everything from one place.

REQUIREMENTS

Technology Stack (non-negotiable)
- Backend: FastAPI + Python + PostgreSQL
- Frontend: React 18 + TypeScript + Tailwind CSS + Vite
- Mobile: PWA (works offline, installable on home screen)
- Database: PostgreSQL for local backups
- Caching: Redis
- Auth: Google OAuth + JWT

Features Needed
- Dashboard homepage showing stats, next 5 events, top 3 urgent tasks
- Tasks page (sync from Notion database) with filter, search, mark complete
- Calendar page (display Google Calendar events) with month and day views, create event button
- Notes page with quick editor and Notion export button
- Settings page with Google and Notion connection
- Export dashboard data to Google Sheets
- Works fully on mobile (bottom nav bar, large touch targets, responsive design)
- PWA support (offline access, home screen install)

API Integrations Needed
- Notion API: fetch tasks, habits, create pages, update status
- Google Calendar API: fetch events, create events, update events
- Google Sheets API: create spreadsheet, append data, format cells
- Google OAuth: user authentication with Calendar and Sheets scopes

Project Structure
Create folder "personal-dashboard" with:
- backend/ (FastAPI app)
- frontend/ (React app)
- docker-compose.yml (PostgreSQL, Redis)
- .env.example

Backend Structure
backend/
  app/
    main.py (FastAPI setup, CORS, middleware)
    config.py (env vars, settings)
    auth.py (Google OAuth flow, JWT creation, token refresh)
    integrations/
      notion_service.py (fetch tasks, create pages)
      google_calendar_service.py (fetch events, create event)
      google_sheets_service.py (create sheet, write data)
    models/
      user.py (User model)
      task.py (Task model)
      event.py (Event model)
      settings.py (UserSettings model)
    database.py (SQLAlchemy setup, connection)
    routes/
      auth.py (POST /auth/google, POST /auth/verify, GET /auth/refresh)
      tasks.py (GET /tasks, POST /tasks, PUT /tasks/{id}, DELETE /tasks/{id})
      events.py (GET /events, POST /events, PUT /events/{id})
      notes.py (POST /notes/export)
      export.py (POST /export/sheets)
      settings.py (GET /settings, PUT /settings)
  requirements.txt
  .env
  docker-compose.yml

Frontend Structure
frontend/
  src/
    components/
      Dashboard.tsx (homepage)
      TaskList.tsx (task display)
      TaskForm.tsx (create/edit task)
      Calendar.tsx (calendar display)
      EventForm.tsx (create event)
      NotesEditor.tsx (note editor)
      SettingsPanel.tsx (configuration)
      Navigation.tsx (bottom nav for mobile)
      LoadingSpinner.tsx
      ErrorBoundary.tsx
    pages/
      HomePage.tsx
      TasksPage.tsx
      CalendarPage.tsx
      NotesPage.tsx
      SettingsPage.tsx
    hooks/
      useNotionTasks.ts (fetch and cache tasks)
      useGoogleCalendar.ts (fetch and cache events)
      useAuth.ts (manage tokens)
      useSettings.ts (manage user settings)
    services/
      api.ts (HTTP client with auth)
      notion.ts (Notion API calls)
      google.ts (Google API calls)
    context/
      AuthContext.tsx (auth state)
    styles/
      tailwind.css
    App.tsx (routing, providers)
  public/
    manifest.json (PWA manifest)
    service-worker.ts
    icon-192.png
    icon-512.png
  tailwind.config.js
  vite.config.ts

Key Implementation Details

Backend Auth Flow
1. Frontend sends Google auth code to POST /auth/google
2. Backend exchanges code for access token with Google
3. Backend checks if user exists in database (by Google email)
4. If new user, create user record
5. Store Google access token and refresh token in encrypted format
6. Create JWT token for session
7. Return JWT + user data to frontend
8. Frontend stores JWT in localStorage
9. All subsequent requests include JWT in Authorization header

Notion Service
- Use notion-client Python library
- Method get_tasks(user_id) fetches from Notion database
- Method create_task(user_id, title, due_date, priority) adds to Notion
- Method update_task(user_id, task_id, status) marks complete
- Cache results for 5 minutes in Redis
- Handle Notion API rate limits with exponential backoff

Google Calendar Service
- Use google-auth-oauthlib and googleapiclient
- Method get_events(user_id) fetches next 30 days
- Method create_event(user_id, title, start, end, description)
- Store timezone as Asia/Dushanbe for all users
- Cache for 10 minutes
- Support all-day events

Google Sheets Service
- Create new spreadsheet with title "Dashboard Export - {date}"
- Sheet 1: "Tasks" with columns (Title, Due Date, Priority, Status)
- Sheet 2: "Habits" with columns (Name, Completed Days, Streak)
- Sheet 3: "Focus Sessions" with columns (Date, Duration, Notes)
- Format headers in bold, auto-resize columns
- Return shareable link

Frontend Dashboard Component
- Use React hooks (useState, useEffect, useContext)
- Load tasks and events in parallel (Promise.all)
- Display in responsive grid (1 column mobile, 2-3 columns desktop)
- Show loading spinners while fetching
- Show error messages if API fails
- Refresh data every 10 minutes automatically
- Allow manual refresh button

Mobile Optimization
- Use mobile-first CSS (base styles for mobile, media queries for larger screens)
- Bottom navigation bar fixed at bottom (height 60px)
- All buttons min 48x48 pixels
- Form inputs min 44px height
- No hover effects, use active/tap states instead
- Viewport meta tag in index.html
- Test on iPhone 12, Android Pixel 5

PWA Setup
- manifest.json with app name, icons, start URL
- Service Worker for offline caching
- Cache API for static assets
- Network-first strategy for API calls, fallback to cache
- Show "offline" indicator when no network
- Allow installation to home screen (Add to Home Screen button)

Environment Variables Needed
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
NOTION_API_KEY=your_notion_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/dashboard
REDIS_URL=redis://localhost:6379
JWT_SECRET=random_string_32_chars_minimum
DATABASE_PASSWORD=secure_password
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com

Deployment Instructions
1. Backend: Deploy to Railway, Render, or Fly.io
2. Frontend: Deploy to Vercel or Netlify
3. Database: Use managed PostgreSQL (Railway, Vercel Postgres, Neon)
4. Redis: Use managed Redis (Railway, Upstash, Redis Cloud)
5. Set all environment variables on deployment platform
6. Enable CORS for production domain
7. Update GOOGLE_REDIRECT_URI for production URL

Testing Checklist
- Test Google login (request all required scopes)
- Test Notion connection (API key validation)
- Test task sync (fetch, create, update, delete)
- Test calendar sync (fetch events, create event)
- Test sheets export (create, write, format)
- Test mobile responsiveness (iPhone, Android)
- Test offline mode (disable network, verify cache works)
- Test error handling (timeout, invalid token, network error)
- Test token refresh (wait for expiry, automatic refresh)
- Load test (simulate 100 tasks, 50 events)

Success Criteria
- Page loads in under 2 seconds
- All API calls have loading states
- No 404 errors in console
- All integrations connect without errors
- Mobile view is fully functional
- Offline mode shows cached data
- Export to Sheets creates valid spreadsheet
- No exposed API keys in code
- JWT tokens expire after 24 hours
- Refresh tokens work automatically

AFTER BUILDING
Add these enhancements:
1. Dark mode toggle (save preference to localStorage)
2. Push notifications for upcoming events (Web Push API)
3. Voice input for quick tasks (Web Speech API)
4. Analytics (chart of task completion trends)
5. Recurring tasks (repeat daily/weekly/monthly)
6. Team collaboration (share tasks with others)
7. Sync with other calendar sources (Outlook, Apple Calendar)
8. Mobile app wrapper (React Native or Flutter)
