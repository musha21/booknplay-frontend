import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NavSearchBar from './NavSearchBar';

vi.mock('../../hooks/useVenues', () => ({
  useSports: () => ({ data: [{ id: 4, name: 'Badminton' }] }),
}));

vi.mock('../maps/PlacesAutocompleteInput', () => ({
  default: ({ value, onChange, placeholder }) => (
    <input aria-label="Location" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));

describe('NavSearchBar', () => {
  it('submits location, sport, date and time to search', () => {
    const onSubmit = vi.fn();
    render(<NavSearchBar initialFilters={{ sportId: '4' }} onSubmit={onSubmit} />);

    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'Peradeniya' } });

    fireEvent.change(screen.getByLabelText('Booking date'), { target: { value: '2026-10-10' } });
    fireEvent.change(screen.getByLabelText('Booking time'), { target: { value: '18:30' } });
    fireEvent.click(screen.getByRole('button', { name: /Find a court/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      sportId: '4',
      city: 'Peradeniya',
      location: 'Peradeniya',
      date: '2026-10-10',
      time: '18:30',
      lat: '',
      lng: '',
      radiusKm: '',
    });
  });
});
