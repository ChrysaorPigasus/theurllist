import { getListById } from '../../../../utils/database.js';

export async function get({ params }) {
  try {
    const { id } = params;
    const list = await getListById(id);
    
    if (!list) {
      return new Response(JSON.stringify({ error: 'List not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(JSON.stringify(list), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch list' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}