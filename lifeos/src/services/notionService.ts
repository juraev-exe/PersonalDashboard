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

/** Notion allows ~3 requests/sec and answers 429 with a Retry-After header. */
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetch() wrapper that retries 429s and 5xx with exponential backoff,
 * honouring Notion's `Retry-After` header when present.
 */
async function notionFetch(path: string, init: RequestInit): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(2 ** (attempt - 1) * 500);
    }

    let response: Response;
    try {
      response = await fetch(`${NOTION_API_BASE}${path}`, init);
    } catch (e) {
      // Network/offline error — worth retrying.
      lastError = e instanceof Error ? e : new Error(String(e));
      continue;
    }

    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      if (Number.isFinite(retryAfter) && retryAfter > 0) {
        await sleep(retryAfter * 1000);
      }
      lastError = new Error(`Notion API error: ${response.status}`);
      continue;
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({} as any));
      throw new Error(errData.message || `Notion API error: ${response.status}`);
    }

    return response.json();
  }

  throw lastError ?? new Error('Notion request failed');
}

/**
 * Query a Notion database, following pagination until every page is collected.
 */
export const queryNotionDatabase = async (
  databaseId: string,
  body: Record<string, unknown> = {}
): Promise<NotionPage[]> => {
  if (!databaseId) throw new Error('Notion database ID not configured');

  const results: NotionPage[] = [];
  let cursor: string | undefined;

  // Bounded so a malformed cursor can never spin forever.
  for (let page = 0; page < 20; page++) {
    const data = await notionFetch(`/databases/${databaseId}/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...body, page_size: 100, start_cursor: cursor }),
    });

    results.push(...((data.results ?? []) as NotionPage[]));
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return results;
};

/** Fetch a single Notion page (used to discover its property schema before updating). */
export const getNotionPage = async (pageId: string): Promise<NotionPage> =>
  notionFetch(`/pages/${pageId}`, { method: 'GET', headers: getHeaders() });

/** Patch properties on an existing Notion page. */
export const updateNotionPage = async (
  pageId: string,
  properties: Record<string, unknown>
): Promise<NotionPage> =>
  notionFetch(`/pages/${pageId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ properties }),
  });

export interface NotionPage {
  id: string;
  url?: string;
  archived?: boolean;
  properties: Record<string, any>;
}

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
