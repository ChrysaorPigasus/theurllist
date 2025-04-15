import { getLists, createList, deleteList, updateList } from '../../utils/database';
import { logger, initialize } from '../../utils/db-client';

export const prerender = false;

export async function GET() {
  try {
    await initialize();
    const lists = await getLists();
    return new Response(JSON.stringify(lists), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'API Error: Failed to get lists');
    return new Response(JSON.stringify({ error: 'Failed to fetch lists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    await initialize();
    const { name, title, description, slug } = await request.json();

    const resolvedTitle = title || null;
    const resolvedDescription = description || null;
    const resolvedSlug = slug || null;

    if (!name) {
      return new Response(JSON.stringify({ 
        error: 'List name is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const list = await createList({ name, title: resolvedTitle, description: resolvedDescription, slug: resolvedSlug });
    return new Response(JSON.stringify(list), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'API Error: Failed to create list');
    return new Response(JSON.stringify({ error: 'Failed to create list' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request }) {
  try {
    await initialize();
    const { id, name, title, description, slug } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'List ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedList = await updateList(id, { name, title, description, slug });
    return new Response(JSON.stringify(updatedList), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'Error updating list');
    return new Response(JSON.stringify({ 
      error: 'Failed to update list. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ params, request }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Extract only the allowed fields
    const { name, title, description } = body;
    
    const updatedList = await updateList(id, { name, title, description });
    
    if (!updatedList) {
      return new Response(JSON.stringify({ error: 'List not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(JSON.stringify(updatedList), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating list:', error);
    return new Response(JSON.stringify({ error: 'Failed to update list' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
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
        error: 'List ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await deleteList(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error(error, 'Error deleting list');
    return new Response(JSON.stringify({ 
      error: 'Failed to delete list. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}