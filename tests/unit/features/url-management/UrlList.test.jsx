import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UrlList } from '@components/features/url-management/AddUrlsToList'; // This is correct - UrlList is a named export from AddUrlsToList

describe('UrlList', () => {
  it('renders a list of URLs', () => {
    const mockUrls = [
      { id: '1', url: 'https://example.com' },
      { id: '2', url: 'https://test.com' }
    ];
    
    render(<UrlList urls={mockUrls} />);
    
    expect(screen.getByText('URLs in List')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://example.com');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });
  
  it('shows empty state when no URLs are provided', () => {
    render(<UrlList urls={[]} />);
    
    expect(screen.getByText('No URLs added yet')).toBeInTheDocument();
    expect(screen.queryByText('URLs in List')).not.toBeInTheDocument();
  });
});