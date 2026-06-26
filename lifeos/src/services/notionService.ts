import { useSettingsStore } from '../stores/settingsStore';

/**
 * NOTE: Notion's API does not allow direct CORS requests from client browsers.
 * In a production dashboard setup, these API requests are routed through
 * our Vercel Serverless Function proxy at /api/notion.
 */
const NOTION_API_BASE = '/api/notion';
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
 * Create a new page in a specific database or page
 */
export const createNotionPage = async (parentId: string, parentType: 'database' | 'page', title: string, content: string) => {
  try {
    const parentObj = parentType === 'database' 
      ? { database_id: parentId } 
      : { page_id: parentId };

    // Split paragraphs by newlines and sanitize size to Notion limits
    const paragraphs = content.split('\n');
    const children = paragraphs.map(p => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { type: 'text', text: { content: p.substring(0, 2000) } }
        ]
      }
    }));

    // If empty, add a default empty paragraph block
    if (children.length === 0) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            { type: 'text', text: { content: '' } }
          ]
        }
      });
    }

    const response = await fetch(`${NOTION_API_BASE}/pages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        parent: parentObj,
        properties: {
          title: {
            title: [
              { text: { content: title } }
            ]
          }
        },
        children: children.slice(0, 100)
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Notion API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to create Notion page:', error);
    throw error;
  }
};
