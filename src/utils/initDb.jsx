import React from 'react';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:secret@localhost:5432/theurllist'
  });

  try {
    console.log('Starting database initialization...');
    await client.connect();
    console.log('Connected to database');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    console.log('Reading SQL file:', sqlFilePath);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement in a transaction
    await client.query('BEGIN');
    
    try {
      for (const statement of statements) {
        if (statement) {
          console.log('\nExecuting statement:', statement);
          await client.query(statement);
          console.log('Statement executed successfully');
        }
      }
      
      await client.query('COMMIT');
      console.log('\nDatabase initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('\nFailed to initialize database:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    console.log('Closing database connection...');
    await client.end();
  }
}

// Run the initialization
console.log('Starting script...');
initializeDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Top-level error:', error);
    process.exit(1);
  });