// ============================================
// LifeOS — Google Sheets Export Service
// ============================================

const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

interface ExportData {
  tasks: any[];
  habits: any[];
  pomodoros: any[];
}

export const exportToGoogleSheets = async (token: string, data: ExportData) => {
  if (!token) throw new Error('Google access token not found');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Create Spreadsheet with separate sheets
    const createResponse = await fetch(GOOGLE_SHEETS_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          title: `LifeOS Dashboard Export — ${todayStr}`,
        },
        sheets: [
          { properties: { title: 'Tasks' } },
          { properties: { title: 'Habits' } },
          { properties: { title: 'Focus Sessions' } },
        ],
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create spreadsheet: ${createResponse.statusText}`);
    }

    const spreadsheet = await createResponse.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = spreadsheet.spreadsheetUrl;

    // 2. Prepare spreadsheet data mapping
    const taskHeaders = ['Title', 'Description', 'Status', 'Priority', 'Category', 'Due Date', 'Created At', 'Completed At'];
    const taskRows = data.tasks.map(t => [
      t.title || '',
      t.description || '',
      t.status || '',
      t.priority || '',
      t.category || '',
      t.dueDate || '',
      t.createdAt || '',
      t.completedAt || '',
    ]);

    const habitHeaders = ['Name', 'Frequency', 'Daily Target', 'Archived', 'Created At'];
    const habitRows = data.habits.map(h => [
      h.name || '',
      h.frequency || '',
      h.dailyTarget ? String(h.dailyTarget) : '1',
      h.archived ? 'Yes' : 'No',
      h.createdAt || '',
    ]);

    const pomodoroHeaders = ['Date', 'Start Time', 'End Time', 'Duration (min)', 'Category', 'Notes', 'Completed'];
    const pomodoroRows = data.pomodoros.map(p => [
      p.date || '',
      p.startTime || '',
      p.endTime || '',
      p.duration ? String(p.duration) : '0',
      p.category || '',
      p.notes || '',
      p.completed ? 'Yes' : 'No',
    ]);

    // 3. Batch Update spreadsheet values
    const updateResponse = await fetch(`${GOOGLE_SHEETS_API}/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Tasks!A1',
            values: [taskHeaders, ...taskRows],
          },
          {
            range: 'Habits!A1',
            values: [habitHeaders, ...habitRows],
          },
          {
            range: 'Focus Sessions!A1',
            values: [pomodoroHeaders, ...pomodoroRows],
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Failed to populate spreadsheet: ${updateResponse.statusText}`);
    }

    return { spreadsheetId, spreadsheetUrl };
  } catch (error) {
    console.error('Google Sheets Export Error:', error);
    throw error;
  }
};
