import React, { useEffect, useState } from 'react';
import { spawn, ChildProcess } from 'child_process';
import pg from 'pg';
import { startMockServer, stopMockServer } from '../mocks/api-mocks';
import { env, integrations, logIntegrationConfig } from './environment';

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

const services = {
  dbConnection: null,
  apiServer: null,
  mockServices: new Map()
};

const setupDatabase = async (mockData) => {
  if (integrations?.database === 'mock') {
    console.log('🔶 Using MOCK database');
    
    const mockDb = mockData || { 
      tables: {
        lists: [],
        links: []
      },
      query: viMock.fn().mockImplementation((text, params) => {
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
};

const setupApiServer = async (mockServer) => {
  if (integrations.api === 'mock') {
    console.log('🔶 Using MOCK API server (MSW)');
    
    startMockServer();
    console.log('MSW Mock API server started');
    
    return null;
  } else {
    console.log('🔷 Starting REAL API server');
    
    const apiServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    services.apiServer = apiServer;
    return apiServer;
  }
};

const setupAuth = async () => {
  if (integrations.auth === 'mock') {
    console.log('🔶 Using MOCK auth service');
    
    const mockAuth = {
      getToken: () => 'mock-token-12345',
      login: (username, password) => ({ 
        success: true, 
        token: 'mock-token-12345' 
      })
    };
    
    services.mockServices.set('mockAuth', mockAuth);
    return mockAuth;
  } else {
    console.log('🔷 Using REAL auth service');
    
    return null;
  }
};

const teardownAll = async () => {
  if (services.dbConnection) {
    console.log('Closing database connection...');
    await services.dbConnection.end();
  }
  
  if (services.apiServer) {
    console.log('Shutting down API server...');
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      exec(`taskkill /pid ${services.apiServer.pid} /T /F`, (error) => {
        if (error) {
          console.error(`Error killing API server: ${error}`);
        }
      });
    } else {
      services.apiServer.kill('SIGTERM');
    }
  } else if (integrations && integrations.api === 'mock') {
    console.log('Stopping MSW Mock API server...');
    try {
      stopMockServer();
    } catch (error) {
      console.warn('Error stopping MSW Mock API server:', error.message);
    }
  }
  
  for (const [name, service] of services.mockServices.entries()) {
    if (service && typeof service.stop === 'function') {
      console.log(`Stopping mock service: ${name}`);
      await service.stop();
    }
  }
  
  services.mockServices.clear();
};

const initTestEnvironment = async () => {
  logIntegrationConfig();
  
  await setupDatabase();
  await setupApiServer();
  await setupAuth();
  
  console.log('Test environment initialized successfully!');
};

export {
  setupDatabase,
  setupApiServer,
  setupAuth,
  teardownAll,
  initTestEnvironment
};
