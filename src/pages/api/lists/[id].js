import { getListById, addUrlToList, updateUrl, deleteUrl, deleteList } from '@utils/database';

export const prerender = false;

export async function GET({ params }) {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ 
        error: 'List ID is required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const list = await getListById(id);
    if (!list) {
      return new Response(JSON.stringify({ 
        error: 'List not found.' 
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(list), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch list. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ params, request }) {
  try {
    const { id } = params;
    const { url } = await request.json();

    if (!id || !url) {
      return new Response(JSON.stringify({ 
        error: 'List ID and URL are required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newUrl = await addUrlToList(id, url);
    return new Response(JSON.stringify(newUrl), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error adding URL to list:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to add URL to list. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ params, request }) {
  try {
    const { id } = params;
    const { urlId, newUrl } = await request.json();

    if (!id || !urlId || !newUrl) {
      return new Response(JSON.stringify({ 
        error: 'List ID, URL ID, and new URL are required.' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updatedUrl = await updateUrl(urlId, newUrl);
    return new Response(JSON.stringify(updatedUrl), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating URL:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update URL. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ params, request }) {
  try {
    const { id } = params;
    
    // If the request has a body, it's trying to delete a URL from the list
    let bodyText;
    try {
      bodyText = await request?.text();
    } catch (e) {
      // No body or cannot read body
      bodyText = '';
    }
    
    // If we have a body with a urlId, delete the URL from the list
    if (bodyText && bodyText.includes('urlId')) {
      try {
        const { urlId } = JSON.parse(bodyText);
        
        if (!id || !urlId) {
          return new Response(JSON.stringify({ 
            error: 'List ID and URL ID are required.' 
          }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        await deleteUrl(urlId);
        return new Response(null, { status: 204 });
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }
    
    // Otherwise, delete the entire list
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
    console.error('Error deleting list or URL:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete. Please try again later.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}