import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the hooks if they cause issues, for now assuming they are safe or we mock them.
// We generally want to mock these to isolate the App component logic vs hooks logic.
vi.mock('../hooks/useIdleTimer', () => ({
  useIdleTimer: () => ({
    isIdle: false,
    triggerIdle: vi.fn(),
    wake: vi.fn(),
  }),
}));

vi.mock('../hooks/useMenuData', () => ({
  useMenuData: () => ({
    concepts: [{ id: 'codebs_concept', name: 'Code BS', categories: [] }],
    categories: [],
    products: [],
    loading: false,
    error: null,
    getCategoriesByConcept: () => [],
    getProductsByCategory: () => [],
    getProductsByConcept: () => [],
    saveProduct: vi.fn(),
    saveBatchProducts: vi.fn(),
    fetchMenuData: vi.fn(),
  }),
}));

vi.mock('../hooks/useLoyalty', () => ({
  useLoyalty: () => ({
    profiles: [],
    cards: [],
    transactions: [],
    loading: false,
    getProfileByCard: vi.fn(),
  }),
}));

// Mock Lucide icons to avoid SVGSVGElement issues if any, though JSDOM usually handles them.
// But mostly to speed up tests.

describe('App', () => {
  it('renders the application title', () => {
    render(<App />);
    const titleElements = screen.getAllByText(/HYPHAE/i);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
