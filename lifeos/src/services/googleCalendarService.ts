import { useSettingsStore } from '../stores/settingsStore';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

/**
 * Helper to get the headers for Google API requests.
 */
const getHeaders = () => {
  const token = useSettingsStore.getState().googleCalendarToken;
  if (!token) throw new Error('Google Calendar token not configured');
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Fetch upcoming events from primary calendar
 */
export const getUpcomingEvents = async (timeMin = new Date().toISOString(), maxResults = 10) => {
  try {
    const url = new URL(`${GOOGLE_CALENDAR_API}/calendars/primary/events`);
    url.searchParams.append('timeMin', timeMin);
    url.searchParams.append('maxResults', maxResults.toString());
    url.searchParams.append('singleEvents', 'true');
    url.searchParams.append('orderBy', 'startTime');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) throw new Error(`Google Calendar API error: ${response.status}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    throw error;
  }
};

/**
 * Create a new event
 */
export const createEvent = async (summary: string, description: string, startTime: string, endTime: string) => {
  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startTime },
        end: { dateTime: endTime },
      })
    });
    
    if (!response.ok) throw new Error(`Google Calendar API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error);
    throw error;
  }
};
