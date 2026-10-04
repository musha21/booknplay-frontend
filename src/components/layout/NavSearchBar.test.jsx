import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NavSearchBar from './NavSearchBar';

vi.mock('../../hooks/useVenues', () => ({
  useSports: () => ({ data: [{ id: 4, name: 'Badminton' }] }),
}));

describe('NavSearchBar', () => {
  it('supports selecting a Kandy regional town and submits the supported homepage filters', () => {
    const onSubmit = vi.fn();
    render(<NavSearchBar initialFilters={{ sportId: '4' }} onSubmit={onSubmit} />);

    const locationSelect = screen.getByLabelText('Location');
    expect(locationSelect).toBeInTheDocument();
    fireEvent.change(locationSelect, { target: { value: 'Peradeniya' } });

    fireEvent.change(screen.getByLabelText('Booking date'), { target: { value: '2026-10-10' } });
    fireEvent.change(screen.getByLabelText('Booking time'), { target: { value: '18:30' } });
    fireEvent.click(screen.getByRole('button', { name: /Find a venue/i }));

    expect(onSubmit).toHaveBeenCalledWith({ sportId: '4', city: 'Peradeniya', date: '2026-10-10', time: '18:30' });
  });
});

