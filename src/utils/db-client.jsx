import React from 'react';

// Server-side only imports - these will be excluded from client bundles
const getPostgres = () => import('postgres');
const getPino = () => import('pino');

// Initialize with console logger as fallback
let logger = console;
let sql = null;
let isInitialized = false;
let initPromise = null;

async function initialize() {
  if (isInitialized || typeof window !== 'undefined') {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const [{ default: postgres }, { default: pino }] = await Promise.all([
          getPostgres(),
          getPino()
        ]);

        // Create a basic logger without transport configuration
        logger = pino({
          level: process.env.LOG_LEVEL || 'info',
          transport: undefined // Ensure no transport is used
        });

        sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:secret@localhost:5432/theurllist', {
          onnotice: msg => logger.info(msg),
          onparameter: async (key, value) => {
            logger.debug({ key, value }, 'Database parameter set');
          }
        });
        
        logger.info('Database connection established');
        isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
      }
    })();
  }

  return initPromise;
}

// Initialize on module load for server-side
if (typeof window === 'undefined') {
  initialize();
}

export { sql, logger, initialize };