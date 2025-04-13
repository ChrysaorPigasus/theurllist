-- Initialize database schema for The Urlist

-- Drop tables if they exist (in correct order)
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS lists CASCADE;

-- Create lists table
CREATE TABLE lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    slug TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create links table
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    url VARCHAR(255),
    image VARCHAR(255),
    list_id INTEGER NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_links_list_id ON links(list_id);
CREATE INDEX idx_lists_slug ON lists(slug);