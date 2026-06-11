PERSONAL DASHBOARD WITH INTEGRATIONS
Mobile-First Implementation Plan

CORE FEATURES

Dashboard displays:
- Tasks and habits from Notion
- Upcoming events from Google Calendar
- Focus time / Pomodoro sessions
- Quick notes and reminders
- Progress tracking on goals

Mobile support required for all features.

STEP 1: SET UP YOUR BACKEND (2-3 days)

Tech Stack
- FastAPI (Python) for backend
- PostgreSQL for local data backup
- Redis for caching
- JWT for authentication

Required API Keys
- Google OAuth (Calendar, Sheets, Drive)
- Notion API key
- Your app's JWT secret

Create .env file with:
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
NOTION_API_KEY=your_key
DATABASE_URL=postgresql://user:pass@localhost/dashboard
JWT_SECRET=random_string_here

Folder structure:
backend/
  app/
    main.py (FastAPI setup)
    auth.py (Google OAuth, JWT)
    integrations/
      notion_service.py
      google_calendar_service.py
      google_sheets_service.py
    models/ (database models)
    routes/
      auth.py
      tasks.py
      events.py
      notes.py
      export.py
  requirements.txt

Setup steps:
1. pip install fastapi uvicorn google-auth-oauthlib google-api-python-client notion-client psycopg2 pydantic python-jose
2. Create PostgreSQL database
3. Run: uvicorn app.main:app --reload

STEP 2: IMPLEMENT NOTION INTEGRATION (1-2 days)

What to sync:
- Tasks database (with status, due date, priority)
- Habits tracker (daily checklist)
- Notes (text content)
- Goals (long-term tracking)

Backend endpoint - GET /api/tasks
- Fetch all tasks from your Notion workspace
- Filter by status (To Do, In Progress, Done)
- Cache results for 5 minutes

Backend endpoint - POST /api/tasks
- Add new task to Notion
- Require: title, due_date, priority
- Return created task object

Backend endpoint - POST /api/tasks/{task_id}
- Update task status in Notion
- Call Notion API to mark complete

Code template:
from notion_client import Client

notion = Client(auth=NOTION_API_KEY)

def get_tasks(database_id):
    response = notion.databases.query(
        database_id=database_id,
        filter={"property": "Status", "select": {"does_not_equal": "Done"}}
    )
    return response['results']

def create_task(database_id, title, due_date):
    response = notion.pages.create(
        parent={"database_id": database_id},
        properties={
            "Title": {"title": [{"text": {"content": title}}]},
            "Due Date": {"date": {"start": due_date}},
            "Status": {"select": {"name": "To Do"}}
        }
    )
    return response

STEP 3: IMPLEMENT GOOGLE CALENDAR (1-2 days)

What to sync:
- Upcoming events (next 30 days)
- Event details (title, time, location, description)
- Create new events from dashboard
- Update event status

Backend endpoint - GET /api/events
- Fetch events from Google Calendar
- Filter: only events in next 30 days
- Sort by date
- Cache for 10 minutes

Backend endpoint - POST /api/events
- Create new event in Google Calendar
- Require: title, start_time, end_time, description
- Optional: location, guests

Code template:
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google.auth.oauthlib.flow import Flow
from googleapiclient.discovery import build

def get_events(user_token):
    service = build('calendar', 'v3', credentials=Credentials(token=user_token))
    events = service.events().list(
        calendarId='primary',
        timeMin=datetime.utcnow().isoformat() + 'Z',
        maxResults=15,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    return events.get('items', [])

def create_event(user_token, title, start_time, end_time):
    service = build('calendar', 'v3', credentials=Credentials(token=user_token))
    event = {
        'summary': title,
        'start': {'dateTime': start_time, 'timeZone': 'Asia/Dushanbe'},
        'end': {'dateTime': end_time, 'timeZone': 'Asia/Dushanbe'}
    }
    created = service.events().insert(calendarId='primary', body=event).execute()
    return created

STEP 4: IMPLEMENT GOOGLE SHEETS (1 day)

What to export:
- Dashboard snapshot (date, counts, status)
- Monthly summary
- Task completion rate
- Habit streaks

Backend endpoint - POST /api/export/sheets
- Create new Google Sheet
- Write dashboard data to sheets (Tasks, Habits, Focus Sessions)
- Return shareable link

Code template:
from googleapiclient.discovery import build

def create_spreadsheet(user_token, title):
    service = build('sheets', 'v4', credentials=Credentials(token=user_token))
    spreadsheet = {
        'properties': {'title': title}
    }
    created = service.spreadsheets().create(body=spreadsheet).execute()
    return created['spreadsheetId']

def append_data(user_token, spreadsheet_id, sheet_name, values):
    service = build('sheets', 'v4', credentials=Credentials(token=user_token))
    service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id,
        range=f'{sheet_name}!A1',
        valueInputOption='RAW',
        body={'values': values}
    ).execute()

STEP 5: BUILD FRONTEND (3-4 days)

Tech Stack
- React 18 + TypeScript
- Vite
- TailwindCSS
- Mobile-first design
- PWA support (works offline)

Folder structure:
frontend/
  src/
    components/
      Dashboard.tsx
      TaskList.tsx
      Calendar.tsx
      NotesEditor.tsx
      Settings.tsx
    pages/
      HomePage.tsx
      TasksPage.tsx
      CalendarPage.tsx
      SettingsPage.tsx
    hooks/
      useNotionTasks.ts
      useGoogleCalendar.ts
      useGoogleSheets.ts
    services/
      api.ts (HTTP client)
    styles/
      tailwind.css

Component: Dashboard (HomePage)
Display:
- Quick stats (total tasks, completed today, upcoming events)
- Next 5 events from Google Calendar
- Top 3 urgent tasks from Notion
- Quick add button for new task
- Settings button

Code:
import React, { useEffect, useState } from 'react';
import { useNotionTasks } from '../hooks/useNotionTasks';
import { useGoogleCalendar } from '../hooks/useGoogleCalendar';

export function Dashboard() {
  const { tasks, loading: tasksLoading } = useNotionTasks();
  const { events, loading: eventsLoading } = useGoogleCalendar();
  
  const urgentTasks = tasks
    .filter(t => t.priority === 'High' && t.status !== 'Done')
    .slice(0, 3);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Tasks" value={tasks.length} />
        <StatCard label="Done Today" value={tasks.filter(t => t.completedToday).length} />
        <StatCard label="Next Events" value={events.length} />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
        {events.length > 0 ? (
          events.slice(0, 5).map(event => (
            <div key={event.id} className="p-3 border rounded mb-2">
              <p className="font-medium">{event.summary}</p>
              <p className="text-sm text-gray-600">{event.start.dateTime}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No upcoming events</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Urgent Tasks</h2>
        {urgentTasks.length > 0 ? (
          urgentTasks.map(task => (
            <div key={task.id} className="p-3 border rounded mb-2">
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-gray-600">Due: {task.dueDate}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No urgent tasks</p>
        )}
      </div>

      <button className="w-full p-3 bg-blue-600 text-white rounded font-semibold">
        + Add Task
      </button>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="p-4 border rounded bg-gray-50">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

Component: Tasks Page
Display:
- List of all tasks from Notion
- Filter by status (To Do, In Progress, Done)
- Filter by priority
- Search box
- Mark complete by tapping
- Quick add new task

Component: Calendar Page
Display:
- Month view of Google Calendar
- Day view with events list
- Add event button
- Event details modal
- Sync indicator (last synced time)

Component: Notes
Display:
- Quick note editor
- Save to Notion button
- List of recent notes
- Search notes

Component: Settings
Display:
- Connect Google (shows login button)
- Connect Notion (shows API key input)
- Export to Google Sheets button
- Data refresh interval settings
- Clear cache button
- Logout

Mobile Optimization
- Use viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">
- Bottom navigation bar (5 icons: Home, Tasks, Calendar, Notes, Settings)
- Large touch targets (min 48px)
- Avoid hover states, use tap states
- Responsive grid (1 column on mobile, 2 on tablet)
- PWA manifest for home screen install

tailwind.config.js additions:
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
      }
    }
  }
}

STEP 6: AUTHENTICATION SETUP (1 day)

Google OAuth Flow
1. User clicks "Connect Google"
2. Redirects to Google consent screen
3. User grants permissions (Calendar, Sheets, Drive)
4. Redirect back to dashboard with authorization code
5. Backend exchanges code for access token
6. Token stored in localStorage (frontend) and database (backend)
7. Token refreshed automatically before expiry

Notion API Key
1. User goes to Notion settings
2. Creates new internal integration
3. Copies API key
4. Pastes in Settings page
5. Test connection by fetching databases
6. Save key to backend

JWT Token Flow
1. User logs in with Google or Notion
2. Backend creates JWT token
3. Frontend stores JWT in localStorage
4. Send JWT in Authorization header for all API calls
5. Backend validates JWT on protected routes

Code:
# Backend
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthenticationCredentials
import jwt

security = HTTPBearer()

def verify_token(credentials: HTTPAuthenticationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Frontend
async function login(googleCode) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ code: googleCode })
  });
  const { token, user } = await response.json();
  localStorage.setItem('token', token);
  return user;
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  };
}

STEP 7: DEPLOYMENT (1 day)

Backend
- Deploy to Railway, Render, or Heroku
- Set environment variables
- Run database migrations
- Enable CORS for your frontend domain

Frontend
- Build: npm run build
- Deploy to Vercel, Netlify, or Firebase Hosting
- Enable PWA (add manifest.json and service worker)
- Set API base URL to production backend

PWA Configuration
manifest.json:
{
  "name": "Personal Dashboard",
  "short_name": "Dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

service-worker.ts:
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});

STEP 8: TESTING CHECKLIST

Before launch:
1. Test Google OAuth login on mobile
2. Test loading tasks from Notion
3. Test creating new task from dashboard
4. Test loading Google Calendar events
5. Test adding event from calendar page
6. Test export to Google Sheets
7. Test offline functionality (PWA)
8. Test on mobile browsers (Chrome, Safari)
9. Test on tablets
10. Test performance (page load time under 2s)
11. Test all API endpoints with curl
12. Test error handling (network down, auth failure)

TIMELINE SUMMARY

Week 1: Backend setup + Notion integration (3-4 days)
Week 2: Google Calendar + Sheets (2-3 days)
Week 3: Frontend build (3-4 days)
Week 4: Auth setup + deployment + testing (2-3 days)

Total: 4 weeks for full implementation

MINIMUM VIABLE PRODUCT (if rushed)
- Backend with Notion sync only
- Simple dashboard showing tasks
- Mobile-responsive design
- No Google integrations yet
- Manual data input

Can be done in 1 week.

FUTURE ENHANCEMENTS
- Dark mode toggle
- Widgets on home screen
- Push notifications for deadlines
- Recurring tasks automation
- Team collaboration features
- Analytics dashboard
- Custom widgets
- Voice input for quick tasks
