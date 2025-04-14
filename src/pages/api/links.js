import { createLink, getLinksForList, updateUrl, deleteUrl } from '../../utils/database';
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

export async function PUT({ request }) {
  try {
    await initialize();
    const { id, url, name, title, description, image } = await request.json();

    if (!id || !url) {
      return new Response(JSON.stringify({ 
        error: 'Link ID and URL are required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedLink = await updateUrl(id, { url, name, title, description, image });
    return new Response(JSON.stringify(updatedLink), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'API Error: Failed to update link');
    return new Response(JSON.stringify({ error: 'Failed to update link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    await initialize();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'Link ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await deleteUrl(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'API Error: Failed to delete link');
    return new Response(JSON.stringify({ error: 'Failed to delete link' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}