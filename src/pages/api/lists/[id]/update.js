import { updateList } from '@utils/database';

// Astro API endpoint for handling list updates
export const post = async ({ params, request }) => {
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