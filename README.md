# The Urlist - URL List Management System

A modern web application for creating, managing, and sharing collections of URLs. Built with Astro, React, Tailwind CSS, and PostgreSQL.

## Features

- Create new URL lists with custom names and descriptions (FR001)
- Add URLs to existing lists (FR002)
- View all URLs in a list (FR003)
- Edit URLs within lists (FR004)
- Delete URLs from lists (FR005)
- Customize list URLs for easy sharing (FR006)
- Automatic URL generation for lists (FR007)
- Publish lists to make them public (FR008)
- Share lists with others (FR009)
- Access shared lists via unique URLs (FR010)
- View all created lists in one place (FR011)
- Delete entire lists (FR012)

## Tech Stack

- **Frontend Framework**: [Astro](https://astro.build) with React components
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores)
- **Database**: PostgreSQL with [postgres](https://github.com/porsager/postgres) client
- **Logging**: Pino for structured logging
- **Testing**: Vitest, Playwright and Cucumber for BDD tests

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── features/        # Feature-specific components
│       ├── list-management/  # List creation and management
│       ├── url-management/   # URL operations within lists
│       └── sharing/          # List publishing and sharing
├── layouts/             # Astro layout components
├── pages/               # Astro pages and API routes
│   ├── api/             # RESTful API endpoints
│   └── list/            # List viewing pages
├── stores/              # Nanostores state management
│   ├── lists/           # List-related stores and actions
│   └── notificationStore.js  # UI notification management
├── utils/               # Utility functions and database
├── styles/              # Global styles
└── assets/              # Static assets
```

## Setup Instructions

1. **Prerequisites**
   - Node.js 16+
   - PostgreSQL 12+
   - pnpm (recommended) or npm

2. **Environment Setup**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd theurllist

   # Install dependencies
   pnpm install
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb theurllist

   # Initialize database schema
   psql -d theurllist -f src/utils/init.sql
   ```

4. **Configuration**
   - Create a `.env` file based on the example provided
   - Update database connection settings in `.env`
   - Ensure PostgreSQL is running on the default port (5432)

5. **Development**
   ```bash
   # Start development server
   pnpm dev
   ```

6. **Production**
   ```bash
   # Build for production
   pnpm build

   # Start production server
   pnpm start
   ```

## Testing

The project includes comprehensive test coverage with different test types:

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit     # Unit tests
npm run test:api      # API tests
npm run test:e2e      # End-to-end tests
npm run test:bdd      # BDD tests with Cucumber

# Run tests in specific environments
npm run test:dev      # Development environment
npm run test:tst      # Test environment 
npm run test:acc      # Acceptance environment
```

## Project Organization

### Feature Components
The application is organized around feature modules:

- **List Management**: Creation, viewing, and deletion of lists
  - `CreateNewList.jsx`, `ViewAllLists.jsx`, `DeleteList.jsx`, etc.

- **URL Management**: Operations on URLs within lists
  - `AddUrlsToList.jsx`, `ViewUrlsInList.jsx`, `EditUrlsInList.jsx`, etc.

- **Sharing**: Publishing and sharing functionality
  - `PublishList.jsx`, `ShareList.jsx`, `CustomizeListUrl.jsx`, etc.

### State Management
- Uses Nanostores for reactive state management
- Separate stores for UI state and domain data
- Actions for all CRUD operations
- Error handling and loading states

### API Routes
- RESTful API endpoints under `src/pages/api/`
- List management endpoints in `lists.js`
- Individual list operations in `lists/[id].js`
- URL management in `links.js`
- Publishing operations in `lists/[id]/publish.js`

### Database Schema

#### Lists Table
```sql
CREATE TABLE lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    custom_url VARCHAR(50) UNIQUE,
    slug VARCHAR(100) UNIQUE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP
);
```

#### URLs Table
```sql
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    list_id INTEGER NOT NULL REFERENCES lists(id),
    url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Contributing

1. Create a feature branch (`git checkout -b feature/my-feature`)
2. Commit your changes (`git commit -am 'Add new feature'`)
3. Push to the branch (`git push origin feature/my-feature`)
4. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
