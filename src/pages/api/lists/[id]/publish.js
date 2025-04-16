import { publishList, getListById } from '@utils/database';
import { logger, initialize } from '@utils/db-client';

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

    // Publish the list
    const publishedList = await publishList(id);
    
    // Build the response with the shareUrl
    const response = {
      ...publishedList,
      shareUrl: `${process.env.SITE_URL || 'http://localhost:3000'}/list/${publishedList.slug || publishedList.id}`
    };

    return new Response(JSON.stringify(response), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    logger.error(error, 'Error publishing list');
    return new Response(JSON.stringify({ 
      error: 'Failed to publish list. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}