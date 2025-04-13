import { sql, logger } from './db-client';

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
      SELECT id, name, title, description, slug, created_at
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
      INSERT INTO lists (name, title, description, slug)
      VALUES (${name}, ${title}, ${description}, ${slug})
      RETURNING id, name, title, description, slug, created_at
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
    const [list] = await sql`
      UPDATE lists 
      SET 
        name = COALESCE(${name}, name),
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        slug = COALESCE(${slug}, slug)
      WHERE id = ${id}
      RETURNING id, name, title, description, slug, created_at
    `;
    return list;
  } catch (error) {
    logger.error(error, 'Failed to update list');
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
    const [publishedList] = await sql`
      UPDATE lists
      SET is_published = true, published_at = NOW()
      WHERE id = ${listId}
      RETURNING id, name, title, description, slug, created_at, published_at
    `;
    return publishedList;
  } catch (error) {
    logger.error(error, 'Failed to publish list');
    throw error;
  }
}

// Update Custom URL Function
export async function updateCustomUrl(listId, customUrl) {
  ensureServerSide();
  try {
    const [updatedList] = await sql`
      UPDATE lists
      SET slug = ${customUrl}, updated_at = NOW()
      WHERE id = ${listId}
      RETURNING id, name, title, description, slug, created_at
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
      INSERT INTO links (name, title, description, url, image, list_id)
      VALUES (${name}, ${title}, ${description}, ${url}, ${image}, ${list_id})
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
export async function addUrlToList(listId, url) {
  ensureServerSide();
  try {
    const [link] = await sql`
      INSERT INTO links (list_id, url)
      VALUES (${listId}, ${url})
      RETURNING id, name, title, description, url, image, list_id, created_at
    `;
    return link;
  } catch (error) {
    logger.error(error, 'Failed to add URL to list');
    throw error;
  }
}

export async function updateUrl(urlId, newUrl) {
  ensureServerSide();
  try {
    const [link] = await sql`
      UPDATE links 
      SET url = ${newUrl}
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