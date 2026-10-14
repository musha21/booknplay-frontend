import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VenueCard from './VenueCard';

vi.mock('motion/react', () => ({
  useReducedMotion: () => true,
  motion: {
    article: ({ children, ...props }) => <article {...props}>{children}</article>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('./VenueCarousel', () => ({
  default: () => <div data-testid="carousel" />,
}));

const multiSportVenue = {
  id: 'v-1',
  name: 'Kandy Sports Hub',
  city: 'Kandy',
  startingPrice: 1200,
  currency: 'LKR',
  courts: [
    { sportId: 'cricket', sportName: 'Cricket', facilityType: 'INDOOR', hourlyRate: 3000, status: 'ACTIVE' },
    { sportId: 'cricket', sportName: 'Cricket', facilityType: 'OUTDOOR', hourlyRate: 2200, status: 'ACTIVE' },
    { sportId: 'badminton', sportName: 'Badminton', facilityType: 'INDOOR', hourlyRate: 900, status: 'ACTIVE' },
  ],
};

describe('VenueCard (home variant)', () => {
  it('shows only the selected sport with its facility, once', () => {
    render(
      <VenueCard
        venue={multiSportVenue}
        variant="home"
        selectedSportId="cricket"
        selectedSportLabel="Cricket"
        facility="INDOOR"
      />,
    );

    // The card surfaces a single combined "Cricket • Indoor" chip, not every court sport.
    expect(screen.getAllByText('Cricket • Indoor')).toHaveLength(1);
    expect(screen.queryByText('Badminton')).not.toBeInTheDocument();
  });

  it('prices the matching court rather than an unrelated cheaper court', () => {
    render(
      <VenueCard
        venue={multiSportVenue}
        variant="home"
        selectedSportId="cricket"
        selectedSportLabel="Cricket"
        facility="INDOOR"
      />,
    );

    // Cricket + Indoor court is 3000; the badminton 900 and venue 1200 must not leak in.
    expect(screen.getByText('LKR 3,000.00')).toBeInTheDocument();
    expect(screen.queryByText('LKR 900.00')).not.toBeInTheDocument();
  });

  it('falls back to the venue starting price when no filter is active', () => {
    render(<VenueCard venue={multiSportVenue} variant="home" />);

    expect(screen.getByText('LKR 1,200.00')).toBeInTheDocument();
    // Without a selection the card lists the distinct sports instead of a single combined chip.
    expect(screen.getByText('Cricket')).toBeInTheDocument();
    expect(screen.getByText('Badminton')).toBeInTheDocument();
  });

  it('shows the new custom sport for a venue without duplicate chips', () => {
    const carromVenue = {
      id: 'v-2',
      name: 'Carrom Corner',
      city: 'Kandy',
      startingPrice: 800,
      courts: [
        { sportId: 'carrom', sportName: 'Carrom', facilityType: 'INDOOR', hourlyRate: 800, status: 'ACTIVE' },
        { sportId: 'carrom', sportName: 'Carrom', facilityType: 'INDOOR', hourlyRate: 1000, status: 'ACTIVE' },
      ],
    };

    render(
      <VenueCard
        venue={carromVenue}
        variant="home"
        selectedSportId="carrom"
        selectedSportLabel="Carrom"
        facility=""
      />,
    );

    expect(screen.getAllByText('Carrom')).toHaveLength(1);
    // Cheapest matching carrom court (800) drives the price.
    expect(screen.getByText('LKR 800.00')).toBeInTheDocument();
  });
});
