import { sql, logger } from '@utils/db-client';

// Ensure functions gracefully handle client-side environment
function ensureServerSide() {
  if (typeof window !== 'undefined') {
    throw new Error('Database operations can only be performed server-side');
  }
}

export async function getLists() {
  ensureServerSide();
  try {
    const lists = await sql`
      SELECT id, name, title, description, slug, created_at, published, published_at
      FROM lists 
      ORDER BY created_at DESC
    `;
    return lists;
  } catch (error) {
    logger.error(error, 'Failed to retrieve lists');
    throw error;
  }
}

export async function createList({ name, title, description, slug }) {
  ensureServerSide();
  try {
    const [list] = await sql`
      INSERT INTO lists (name, title, description, slug, created_at, published, published_at)
      VALUES (${name}, ${title}, ${description}, ${slug}, NOW(), false, NULL)
      RETURNING id, name, title, description, slug, created_at, published, published_at
    `;
    return list;
  } catch (error) {
    logger.error(error, 'Failed to create list');
    throw error;
  }
}

export async function updateList(id, { name, title, description, slug }) {
  ensureServerSide();
  try {
    // Validate id is a number
    const numericId = Number(id);
    if (isNaN(numericId)) {
      logger.error(`Invalid list ID: ${id}`);
      return null;
    }
    
    // Build the update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    
    if (name !== undefined) {
      updateFields.push('name = $1');
      updateValues.push(name);
    }
    
    if (title !== undefined) {
      updateFields.push(`title = $${updateValues.length + 1}`);
      updateValues.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${updateValues.length + 1}`);
      updateValues.push(description);
    }
    
    if (slug !== undefined) {
      updateFields.push(`slug = $${updateValues.length + 1}`);
      updateValues.push(slug);
    }
    
    // If no fields to update, return the existing list
    if (updateFields.length === 0) {
      return await getListById(numericId);
    }
    
    updateValues.push(numericId); // Add ID as the last parameter
    
    const query = `
      UPDATE lists
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length}
      RETURNING id, name, title, description, slug, created_at, published, published_at
    `;
    
    const [updatedList] = await sql.unsafe(query, updateValues);
    
    return updatedList;
  } catch (error) {
    logger.error(error, `Failed to update list with ID ${id}`);
    throw error;
  }
}

export async function deleteList(id) {
  ensureServerSide();
  try {
    await sql`DELETE FROM lists WHERE id = ${id}`;
  } catch (error) {
    logger.error(error, 'Failed to delete list');
    throw error;
  }
}

// Publish List Function
export async function publishList(listId) {
  ensureServerSide();
  try {
    // Update the published column and set published_at timestamp
    const [publishedList] = await sql`
      UPDATE lists
      SET published = true, published_at = NOW()
      WHERE id = ${listId}
      RETURNING id, name, title, description, slug, created_at, published, published_at
    `;
    return publishedList;
  } catch (error) {
    logger.error(error, 'Failed to publish list');
    throw error;
  }
}

// Unpublish List Function - new function to make a list private again
export async function unpublishList(listId) {
  ensureServerSide();
  try {
    const [unpublishedList] = await sql`
      UPDATE lists
      SET published = false, published_at = NULL
      WHERE id = ${listId}
      RETURNING id, name, title, description, slug, created_at, published, published_at
    `;
    return unpublishedList;
  } catch (error) {
    logger.error(error, 'Failed to unpublish list');
    throw error;
  }
}

// Update Custom URL Function
export async function updateCustomUrl(listId, customUrl) {
  ensureServerSide();
  try {
    const [updatedList] = await sql`
      UPDATE lists
      SET slug = ${customUrl}
      WHERE id = ${listId}
      RETURNING id, name, title, description, slug, created_at, published, published_at
    `;
    return updatedList;
  } catch (error) {
    logger.error(error, 'Failed to update custom URL');
    throw error;
  }
}

// Links CRUD operations
export async function createLink({ name, title, description, url, image, list_id }) {
  ensureServerSide();
  try {
    const [link] = await sql`
      INSERT INTO links (name, title, description, url, image, list_id, created_at)
      VALUES (${name}, ${title}, ${description}, ${url}, ${image}, ${list_id}, NOW())
      RETURNING id, name, title, description, url, image, list_id, created_at
    `;
    return link;
  } catch (error) {
    logger.error(error, 'Failed to create link');
    throw error;
  }
}

export async function getLinksForList(listId) {
  ensureServerSide();
  try {
    const links = await sql`
      SELECT id, name, title, description, url, image, list_id, created_at
      FROM links 
      WHERE list_id = ${listId}
      ORDER BY created_at DESC
    `;
    return links;
  } catch (error) {
    logger.error(error, 'Failed to retrieve links');
    throw error;
  }
}

// URL/Link Management Functions
export async function addUrlToList(listId, urlData) {
  ensureServerSide();
  try {
    // If urlData is just a string, convert it to an object
    const data = typeof urlData === 'string' 
      ? { url: urlData } 
      : urlData;
    
    const [link] = await sql`
      INSERT INTO links (
        list_id, 
        url, 
        name, 
        title, 
        description, 
        image
      )
      VALUES (
        ${listId}, 
        ${data.url}, 
        ${data.name || null}, 
        ${data.title || null}, 
        ${data.description || null}, 
        ${data.image || null}
      )
      RETURNING id, name, title, description, url, image, list_id, created_at
    `;
    return link;
  } catch (error) {
    logger.error(error, 'Failed to add URL to list');
    throw error;
  }
}

export async function updateUrl(urlId, urlData) {
  ensureServerSide();
  try {
    // If urlData is just a string, convert it to an object
    const data = typeof urlData === 'string' 
      ? { url: urlData } 
      : urlData;
    
    const [link] = await sql`
      UPDATE links 
      SET 
        url = ${data.url},
        name = ${data.name || null},
        title = ${data.title || null},
        description = ${data.description || null},
        image = ${data.image || null}
      WHERE id = ${urlId}
      RETURNING id, name, title, description, url, image, list_id, created_at
    `;
    return link;
  } catch (error) {
    logger.error(error, 'Failed to update URL');
    throw error;
  }
}

export async function deleteUrl(urlId) {
  ensureServerSide();
  try {
    await sql`
      DELETE FROM links 
      WHERE id = ${urlId}
    `;
  } catch (error) {
    logger.error(error, 'Failed to delete URL');
    throw error;
  }
}

export async function getListById(id) {
  ensureServerSide();
  try {
    // Validate id is a number
    const numericId = Number(id);
    if (isNaN(numericId)) {
      logger.error(`Invalid list ID: ${id}`);
      return null;
    }


    const [list] = await sql`
      SELECT l.id, l.name, l.title, l.description, l.slug, l.created_at, l.published, l.published_at
      FROM lists l
      WHERE l.id = ${numericId}
    `;
    
    if (!list) {
      return null;
    }
    
    // Get the associated URLs/links for this list
    const links = await sql`
      SELECT id, name, title, description, url, image, list_id, created_at
      FROM links 
      WHERE list_id = ${numericId}
      ORDER BY created_at DESC
    `;
    
    // Return the list with its links included
    return {
      ...list,
      urls: links || []
    };
  } catch (error) {
    logger.error(error, `Failed to retrieve list with ID ${id}`);
    throw error;
  }
}

export async function getListBySlug(slug) {
  ensureServerSide();
  try {
    const [list] = await sql`
      SELECT l.id, l.name, l.title, l.description, l.slug, l.created_at, l.published, l.published_at
      FROM lists l
      WHERE l.slug = ${slug} AND l.published = true
    `;
    
    if (!list) {
      return null;
    }
    
    // Get the associated URLs/links for this list
    const links = await sql`
      SELECT id, name, title, description, url, image, list_id, created_at
      FROM links 
      WHERE list_id = ${list.id}
      ORDER BY created_at DESC
    `;
    
    // Return the list with its links included
    return {
      ...list,
      urls: links || []
    };
  } catch (error) {
    logger.error(error, `Failed to retrieve list with slug ${slug}`);
    throw error;
  }
}