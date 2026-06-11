import { useSettingsStore } from '../stores/settingsStore';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

/**
 * Helper to get the headers for Notion API requests.
 */
const getHeaders = () => {
  const token = useSettingsStore.getState().notionApiKey;
  if (!token) throw new Error('Notion API key not configured');
  
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
};

/**
 * Search across all Notion pages and databases
 */
export const searchNotion = async (query: string) => {
  try {
    const response = await fetch(`${NOTION_API_BASE}/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        query,
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time'
        }
      })
    });
    
    if (!response.ok) throw new Error(`Notion API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to search Notion:', error);
    throw error;
  }
};

/**
 * Create a new page in a specific database
 */
export const createNotionPage = async (databaseId: string, title: string, content: string) => {
  try {
    const response = await fetch(`${NOTION_API_BASE}/pages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          title: {
            title: [
              { text: { content: title } }
            ]
          }
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                { type: 'text', text: { content } }
              ]
            }
          }
        ]
      })
    });
    
    if (!response.ok) throw new Error(`Notion API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to create Notion page:', error);
    throw error;
  }
};
