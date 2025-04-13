# The Urlist - URL List Management System

A modern web application for creating, managing, and sharing collections of URLs. Built with Astro, React, Tailwind CSS, and PostgreSQL.

## Features

- Create new URL lists with custom names (FR001)
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
- **Database**: PostgreSQL
- **Database Client**: [postgres](https://github.com/porsager/postgres)

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── features/        # Feature-specific components
├── layouts/             # Astro layout components
├── pages/              # Astro pages and API routes
├── stores/             # Nanostores state management
├── utils/              # Utility functions and database
├── styles/             # Global styles
└── assets/             # Static assets
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
   - Update database connection settings in `src/utils/database.js`
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

## Project Organization

### Feature Components
Each feature is contained in its own component file under `src/components/features/`:
- `CreateNewUrlList.jsx` - List creation (FR001)
- `AddUrlsToList.jsx` - URL addition (FR002)
- `ViewUrlsInList.jsx` - URL viewing (FR003)
- `EditUrlsInList.jsx` - URL editing (FR004)
- `DeleteUrlsFromList.jsx` - URL deletion (FR005)
- And more...

### State Management
- Uses Nanostores for reactive state management
- Separate stores for UI state and domain data
- Actions for all CRUD operations
- Error handling and loading states

### API Routes
- RESTful API endpoints under `src/pages/api/`
- List management endpoints in `lists.js`
- Individual list operations in `lists/[id].js`

### Database Schema

#### Lists Table
```sql
CREATE TABLE lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    custom_url VARCHAR(50) UNIQUE,
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
