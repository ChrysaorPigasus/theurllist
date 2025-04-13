import { createLink, getLinksForList, updateLink, deleteLink } from '../../utils/database';
import { logger, initialize } from '../../utils/db-client';

export const prerender = false;

export async function GET({ request }) {
  try {
    await initialize();
    const url = new URL(request.url);
    const listId = url.searchParams.get('listId');

    if (!listId) {
      return new Response(JSON.stringify({ 
        error: 'List ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const links = await getLinksForList(listId);
    return new Response(JSON.stringify(links), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'API Error: Failed to get links');
    return new Response(JSON.stringify({ error: 'Failed to fetch links' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    await initialize();
    const { name, title, description, url, image, list_id } = await request.json();

    if (!url || !list_id) {
      return new Response(JSON.stringify({ 
        error: 'URL and List ID are required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const link = await createLink({ name, title, description, url, image, list_id });
    return new Response(JSON.stringify(link), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'API Error: Failed to create link');
    return new Response(JSON.stringify({ error: 'Failed to create link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}