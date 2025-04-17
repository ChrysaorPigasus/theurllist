# Testing Guide

This document explains how to effectively use the testing infrastructure in this project, including running tests with different levels of integration across various environments.

## Testing Environments

The project supports multiple testing environments with different integration levels:

| Environment | Description | Integration Level |
|-------------|-------------|-------------------|
| **dev** | Development environment | All integrations mocked |
| **tst** | Test environment | DB + API real, Auth + External Services mocked |
| **acc** | Acceptance environment | All integrations real |
| **local** | Local development | Configurable (defaults to development-like) |

## Running Tests by Environment

```bash
# Run tests in development environment (all mocked)
npm run test:dev

# Run tests in test environment (mixed integrations)
npm run test:tst

# Run tests in acceptance environment (all real)
npm run test:acc

# Run tests in local environment (configurable)
npm run test:local
```

## Running Tests by Type

```bash
# Run unit tests
npm run test:unit

# Run API tests with Vitest
npm run test:api

# Run API tests with Playwright
npm run test:api:playwright

# Run end-to-end tests
npm run test:e2e

# Run BDD tests
npm run test:bdd
```

## Running Tests by Environment and Type

```bash
# Run API tests in specific environments
npm run test:api:dev    # API tests in dev environment
npm run test:api:tst    # API tests in test environment
npm run test:api:acc    # API tests in acceptance environment

# Run Playwright API tests in specific environments
npm run test:api:playwright:dev  # Playwright API tests in dev environment
npm run test:api:playwright:tst  # Playwright API tests in test environment
npm run test:api:playwright:acc  # Playwright API tests in acceptance environment

# Similarly for E2E and BDD tests
npm run test:e2e:dev    # E2E tests in dev environment
npm run test:bdd:acc    # BDD tests in acceptance environment
```

## Force Integration Modes

You can override the default integration settings for any environment:

```bash
# Force all services to be mocked, regardless of environment
npm run test:with-mocks

# Force all services to use real integrations, regardless of environment
npm run test:with-integrations

# Or use environment variables directly with any test command
FORCE_MOCKS=true npm run test:tst
FORCE_INTEGRATIONS=true npm run test:dev
```

## Local Testing Configuration

For local development, you can configure specific services by editing the `.env.local` file:

```
# .env.local example
DATABASE_INTEGRATION=mock
API_INTEGRATION=integration
AUTH_INTEGRATION=mock
EXTERNAL_SERVICES_INTEGRATION=mock
```

This allows you to test with a mix of real and mock services locally.

## Mock vs Integration Mode

- **Mock Mode**: Uses in-memory mocks for services (database, API, auth)
  - Faster execution
  - No external dependencies needed
  - Good for rapid development
  - Uses MSW for API mocking
  
- **Integration Mode**: Uses real services
  - Tests actual integrations
  - Catches real-world issues
  - Requires service dependencies to be running
  - More comprehensive testing