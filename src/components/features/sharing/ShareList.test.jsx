import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareList from './ShareList';

// Mock the nanostores/react package
vi.mock('@nanostores/react', () => ({
  useStore: (store) => store.value
}));

// Mock the UI components
vi.mock('../../../components/ui/Button', () => ({
  default: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  )
}));

vi.mock('../../../components/ui/Input', () => ({
  default: ({ label, value, readOnly }) => (
    <>
      <label>{label}</label>
      <input value={value} readOnly={readOnly} aria-label={label} />
    </>
  )
}));

vi.mock('../../../components/ui/Card', () => ({
  default: ({ title, description, children }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  )
}));

// Mock the stores module with the correct path
vi.mock('../../../stores/lists', () => {
  // Define mock data inside the factory function to avoid hoisting issues
  const mockList = {
    id: '123',
    name: 'Test List',
    slug: 'test-list'
  };

  return {
    listStore: {
      value: {
        lists: [mockList],
        activeListId: '123'
      },
      listen: vi.fn(),
      subscribe: vi.fn()
    },
    listUIState: {
      value: {
        isLoading: false,
        error: null
      },
      listen: vi.fn(),
      subscribe: vi.fn()
    },
    shareList: vi.fn().mockImplementation(() => Promise.resolve())
  };
});

describe('ShareList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the clipboard API
    Object.defineProperty(global.navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      },
      configurable: true
    });

    // Mock window.open for social sharing
    global.window.open = vi.fn();
    
    // Mock window.location with proper origin
    Object.defineProperty(global.window, 'location', {
      value: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000'
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('displays share URL', () => {
    render(<ShareList />);
    
    expect(screen.getByLabelText('Shareable URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy URL' })).toBeInTheDocument();
  });

  it('shows social sharing options', () => {
    render(<ShareList />);
    
    expect(screen.getByText('Share via:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Twitter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email' })).toBeInTheDocument();
  });

  it('copies share link to clipboard when button is clicked', async () => {
    render(<ShareList />);
    
    const copyButton = screen.getByRole('button', { name: 'Copy URL' });
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3000/list/test-list');
  });

  it('shares to Twitter when Twitter button is clicked', () => {
    render(<ShareList />);
    
    const twitterButton = screen.getByRole('button', { name: 'Twitter' });
    fireEvent.click(twitterButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('twitter.com/intent/tweet'));
  });

  it('shares to LinkedIn when LinkedIn button is clicked', () => {
    render(<ShareList />);
    
    const linkedinButton = screen.getByRole('button', { name: 'LinkedIn' });
    fireEvent.click(linkedinButton);
    
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('linkedin.com/sharing/share-offsite'));
  });

  it('shares via email when Email button is clicked', () => {
    // Save the original window.location.href
    const originalHref = window.location.href;
    
    render(<ShareList />);
    
    const emailButton = screen.getByRole('button', { name: 'Email' });
    fireEvent.click(emailButton);
    
    // In the implementation, it sets window.location.href directly
    expect(window.location.href).toMatch(/^mailto:/);
    
    // Restore original href for other tests
    window.location.href = originalHref;
  });

  it('renders null when no active list is found', () => {
    // Override the mock for this test only
    const { listStore } = require('../../../stores/lists');
    const originalValue = { ...listStore.value };
    
    // Set to an empty list to simulate no active list
    listStore.value = {
      ...listStore.value,
      lists: []
    };
    
    const { container } = render(<ShareList />);
    
    expect(container.firstChild).toBeNull();
    
    // Restore the original value for subsequent tests
    listStore.value = originalValue;
  });
});