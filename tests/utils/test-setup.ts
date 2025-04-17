// Voeg een veilige manier toe om 'vi' te importeren alleen als het nodig is
let viMock;
try {
  // Dynamische import van vitest voor betere framework-scheiding
  const vitestModule = await import('vitest');
  viMock = vitestModule.vi;
} catch (err) {
  // Als we in Playwright context zijn, maak een eenvoudige mock functie 
  viMock = {
    fn: () => {
      const mockFn = (...args) => { 
        mockFn.calls.push(args);
        return mockFn.implementation ? mockFn.implementation(...args) : undefined;
      };
      mockFn.mockImplementation = (impl) => { mockFn.implementation = impl; return mockFn; };
      mockFn.mockReturnValue = (val) => { mockFn.implementation = () => val; return mockFn; };
      mockFn.mockResolvedValue = (val) => { mockFn.implementation = async () => val; return mockFn; };
      mockFn.mockRejectedValue = (err) => { mockFn.implementation = async () => { throw err; }; return mockFn; };
      mockFn.calls = [];
      return mockFn;
    }
  };
}

import { env, integrations, logIntegrationConfig } from './environment';
import pg from 'pg';
import { spawn, ChildProcess } from 'child_process';
import { startMockServer, stopMockServer } from '../mocks/api-mocks';

// Keep track of services we start
const services: {
  dbConnection?: pg.Client,
  apiServer?: ChildProcess,
  mockServices: Map<string, any>
} = {
  mockServices: new Map()
};

/**
 * Setup database connection
 * @param mockData Optional mock data to use if in mock mode
 */
export async function setupDatabase(mockData?: any): Promise<pg.Client | null> {
  if (integrations.database === 'mock') {
    console.log('🔶 Using MOCK database');
    
    // Set up mock database
    const mockDb = mockData || { 
      tables: {
        lists: [],
        links: []
      },
      query: viMock.fn().mockImplementation((text, params) => {
        // Basic mock implementation
        if (text.includes('SELECT') && text.includes('FROM lists')) {
          return { rows: services.mockServices.get('mockDb')?.tables.lists || [] };
        }
        if (text.includes('SELECT') && text.includes('FROM links')) {
          return { rows: services.mockServices.get('mockDb')?.tables.links || [] };
        }
        return { rows: [] };
      })
    };
    
    services.mockServices.set('mockDb', mockDb);
    return null;
  } else {
    console.log('🔷 Using REAL database connection');
    
    // Connect to real database
    try {
      const client = new pg.Client({
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/theurllist'
      });
      
      await client.connect();
      services.dbConnection = client;
      return client;
    } catch (err) {
      console.error('Failed to connect to database:', err);
      throw err;
    }
  }
}

/**
 * Setup API server
 * @param mockServer Optional mock server implementation
 */
export async function setupApiServer(mockServer?: any): Promise<ChildProcess | null> {
  if (integrations.api === 'mock') {
    console.log('🔶 Using MOCK API server (MSW)');
    
    // Start MSW mock server
    startMockServer();
    console.log('MSW Mock API server started');
    
    return null;
  } else {
    console.log('🔷 Starting REAL API server');
    
    // Start the actual API server
    const apiServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    // Wait for server to start (adjust time as needed)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    services.apiServer = apiServer;
    return apiServer;
  }
}

/**
 * Setup authentication service
 */
export async function setupAuth(): Promise<any> {
  if (integrations.auth === 'mock') {
    console.log('🔶 Using MOCK auth service');
    
    // Set up mock auth
    const mockAuth = {
      getToken: () => 'mock-token-12345',
      login: (username: string, password: string) => ({ 
        success: true, 
        token: 'mock-token-12345' 
      })
    };
    
    services.mockServices.set('mockAuth', mockAuth);
    return mockAuth;
  } else {
    console.log('🔷 Using REAL auth service');
    
    // Connect to real auth service
    // Implement actual auth service connection here
    return null;
  }
}

/**
 * Tear down all services
 */
export async function teardownAll(): Promise<void> {
  // Teardown database
  if (services.dbConnection) {
    console.log('Closing database connection...');
    await services.dbConnection.end();
  }
  
  // Teardown API server
  if (services.apiServer) {
    console.log('Shutting down API server...');
    if (process.platform === 'win32') {
      // Windows
      const { exec } = require('child_process');
      exec(`taskkill /pid ${services.apiServer.pid} /T /F`, (error) => {
        if (error) {
          console.error(`Error killing API server: ${error}`);
        }
      });
    } else {
      // Unix-like
      services.apiServer.kill('SIGTERM');
    }
  } else if (integrations.api === 'mock') {
    // Stop MSW mock server if it was started
    console.log('Stopping MSW Mock API server...');
    stopMockServer();
  }
  
  // Teardown mock services
  for (const [name, service] of services.mockServices.entries()) {
    if (service && typeof service.stop === 'function') {
      console.log(`Stopping mock service: ${name}`);
      await service.stop();
    }
  }
  
  services.mockServices.clear();
}

/**
 * Initialize test environment based on current configuration
 */
export async function initTestEnvironment(): Promise<void> {
  // Log current configuration
  logIntegrationConfig();
  
  // Initialize services based on the environment configuration
  await setupDatabase();
  await setupApiServer();
  await setupAuth();
  
  console.log('Test environment initialized successfully!');
}