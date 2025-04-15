import pg from 'pg';

const { Client } = pg;

async function addMissingColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:secret@localhost:5432/theurllist'
  });

  try {
    console.log('Starting database migration...');
    await client.connect();
    console.log('Connected to database');

    // Check if published_at column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='lists' AND column_name='published_at'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('Adding published_at column to lists table...');
      
      // Add published_at column if it doesn't exist
      await client.query(`
        ALTER TABLE lists 
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITHOUT TIME ZONE
      `);
      
      console.log('published_at column added successfully');
    } else {
      console.log('published_at column already exists');
    }

    // Check if published column exists
    const checkPublishedColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='lists' AND column_name='published'
    `);

    if (checkPublishedColumn.rows.length === 0) {
      console.log('Adding published column to lists table...');
      
      // Add published column if it doesn't exist
      await client.query(`
        ALTER TABLE lists 
        ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT FALSE
      `);
      
      console.log('published column added successfully');
    } else {
      console.log('published column already exists');
    }

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    console.log('Closing database connection...');
    await client.end();
  }
}

// Run the migration
console.log('Starting migration script...');
addMissingColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });