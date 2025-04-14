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
    const requestData = await request.json();
    const { name, title, description, url, image, list_id } = requestData;

    console.log('Received link creation request:', requestData);

    if (!url) {
      console.error('Missing URL in request');
      return new Response(JSON.stringify({ 
        error: 'URL is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!list_id) {
      console.error('Missing list_id in request');
      return new Response(JSON.stringify({ 
        error: 'List ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert list_id to number if it's a string
    const numericListId = typeof list_id === 'string' ? parseInt(list_id, 10) : list_id;
    
    if (isNaN(numericListId)) {
      console.error('Invalid list_id format:', list_id);
      return new Response(JSON.stringify({ 
        error: 'Invalid list ID format.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating link with data:', { 
      name, 
      title, 
      description, 
      url, 
      image, 
      list_id: numericListId 
    });

    const link = await createLink({ 
      name, 
      title, 
      description, 
      url, 
      image, 
      list_id: numericListId 
    });
    
    console.log('Successfully created link:', link);
    
    return new Response(JSON.stringify(link), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('API Error details:', error);
    logger.error(error, 'API Error: Failed to create link');
    return new Response(JSON.stringify({ 
      error: 'Failed to create link',
      details: error.message 
    }), {
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