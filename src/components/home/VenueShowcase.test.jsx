import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VenueShowcase from './VenueShowcase';

vi.mock('motion/react', () => ({
  useReducedMotion: () => true,
  motion: { div: ({ children }) => <div>{children}</div> },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
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

    const clearBtn = screen.getByRole('button', { name: /Reset filters/i });
    await userEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('renders a prominent location control that triggers the handler and reflects state', async () => {
    const onUseLocation = vi.fn();
    const venues = [{ id: 1, name: 'Kandy venue 1' }];

    const { rerender } = render(
      <VenueShowcase venues={venues} loading={false} error={false} onRetry={vi.fn()} onClear={vi.fn()} onUseLocation={onUseLocation} />,
    );

    const locationBtn = screen.getByRole('button', { name: /use my location/i });
    expect(locationBtn).toBeEnabled();
    await userEvent.click(locationBtn);
    expect(onUseLocation).toHaveBeenCalledOnce();

    rerender(
      <VenueShowcase venues={venues} loading={false} error={false} onRetry={vi.fn()} onClear={vi.fn()} onUseLocation={onUseLocation} locationStatus="loading" />,
    );
    expect(screen.getByRole('button', { name: /use my location/i })).toBeDisabled();
    expect(screen.getByText('Locating…')).toBeInTheDocument();

    rerender(
      <VenueShowcase venues={venues} loading={false} error={false} onRetry={vi.fn()} onClear={vi.fn()} onUseLocation={onUseLocation} hasLocation />,
    );
    expect(screen.getByText('Location Active')).toBeInTheDocument();
  });

  it('does not render the location control when no handler is provided', () => {
    render(<VenueShowcase venues={[{ id: 1, name: 'Kandy venue 1' }]} loading={false} error={false} onRetry={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /use my location/i })).not.toBeInTheDocument();
  });
});
