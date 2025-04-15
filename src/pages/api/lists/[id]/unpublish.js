import { unpublishList, getListById } from '../../../../utils/database';
import { logger, initialize } from '../../../../utils/db-client';

export const prerender = false;

export async function POST({ params }) {
  try {
    await initialize();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'List ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First check if the list exists
    const listExists = await getListById(id);
    if (!listExists) {
      return new Response(JSON.stringify({ 
        error: 'List not found.' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unpublish the list
    const unpublishedList = await unpublishList(id);
    
    return new Response(JSON.stringify(unpublishedList), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'Error unpublishing list');
    return new Response(JSON.stringify({ 
      error: 'Failed to unpublish list. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}