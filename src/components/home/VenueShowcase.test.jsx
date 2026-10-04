import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VenueShowcase from './VenueShowcase';

vi.mock('motion/react', () => ({
  useReducedMotion: () => true,
  motion: { div: ({ children }) => <div>{children}</div> },
}));

vi.mock('../ui/VenueCard', () => ({
  default: ({ venue }) => <article>{venue.name}</article>,
}));

describe('VenueShowcase', () => {
  it('renders every supplied Kandy venue instead of limiting the list to three', () => {
    const venues = Array.from({ length: 5 }, (_, index) => ({ id: index + 1, name: `Kandy venue ${index + 1}` }));

    render(<VenueShowcase venues={venues} loading={false} error={false} onRetry={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByText('5 venues')).toBeInTheDocument();
    venues.forEach((venue) => expect(screen.getByText(venue.name)).toBeInTheDocument());
    expect(screen.queryByText('Explore all venues')).not.toBeInTheDocument();
  });

  it('renders dynamic city in heading and empty state when no venues match', async () => {
    const onClear = vi.fn();
    render(<VenueShowcase venues={[]} loading={false} error={false} city="Katugastota" onRetry={vi.fn()} onClear={onClear} />);

    expect(screen.getByText(/Play today in Katugastota\./i)).toBeInTheDocument();
    expect(screen.getByText(/No matching venues/i)).toBeInTheDocument();
    expect(screen.getByText(/No venues matched in Katugastota\./i)).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear filters/i });
    await userEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledOnce();
  });
});
