import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import HomeFilterBar from './HomeFilterBar';

vi.mock('motion/react', () => ({
  useReducedMotion: () => true,
  AnimatePresence: ({ children }) => <div>{children}</div>,
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
}));

const mockSports = [
  { id: 'cricket', name: 'Cricket', displayName: 'Cricket' },
  { id: 'badminton', name: 'Badminton', displayName: 'Badminton' },
];

describe('HomeFilterBar', () => {
  it('renders date, time, sport, area, filter and reset controls', () => {
    const onSelectSport = vi.fn();
    const onSelectArea = vi.fn();
    const onResetFilters = vi.fn();
    const onTogglePanel = vi.fn();

    render(
      <HomeFilterBar
        sports={mockSports}
        selectedSportId="cricket"
        onSelectSport={onSelectSport}
        selectedArea=""
        onSelectArea={onSelectArea}
        onResetFilters={onResetFilters}
        onTogglePanel={onTogglePanel}
        resultCount={5}
      />,
    );

    expect(screen.getByLabelText('Select Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Time')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Find Venue' })).toBeInTheDocument();
    expect(screen.getByLabelText('Select Sport')).toHaveValue('cricket');
    expect(screen.getByLabelText('Select Area')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Advanced filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeInTheDocument();
    expect(screen.getByText('5 venues')).toBeInTheDocument();
  });

  it('triggers onTogglePanel when the advanced filter toggle is clicked', () => {
    const onTogglePanel = vi.fn();

    render(
      <HomeFilterBar
        sports={mockSports}
        selectedSportId="cricket"
        selectedArea="all"
        onTogglePanel={onTogglePanel}
      />,
    );

    const filterBtn = screen.getByRole('button', { name: 'Advanced filters' });
    fireEvent.click(filterBtn);

    expect(onTogglePanel).toHaveBeenCalledTimes(1);
  });

  it('notifies date, time and find venue handlers', () => {
    const onChangeDate = vi.fn();
    const onChangeTime = vi.fn();
    const onFindVenue = vi.fn();

    render(
      <HomeFilterBar
        sports={mockSports}
        filterDate="2026-10-10"
        filterTime="18:30"
        onChangeDate={onChangeDate}
        onChangeTime={onChangeTime}
        onFindVenue={onFindVenue}
      />,
    );

    expect(screen.getByLabelText('Select Date')).toHaveValue('2026-10-10');
    expect(screen.getByLabelText('Select Time')).toHaveValue('18:30');

    fireEvent.change(screen.getByLabelText('Select Date'), { target: { value: '2026-10-11' } });
    expect(onChangeDate).toHaveBeenCalledWith('2026-10-11');

    fireEvent.change(screen.getByLabelText('Select Time'), { target: { value: '19:00' } });
    expect(onChangeTime).toHaveBeenCalledWith('19:00');

    fireEvent.click(screen.getByRole('button', { name: 'Find Venue' }));
    expect(onFindVenue).toHaveBeenCalledTimes(1);

    // Date + time selections show as two active filters on the toggle badge.
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders advanced panel controls when open and shows location message when disabled', () => {
    render(
      <HomeFilterBar
        sports={mockSports}
        selectedSportId="cricket"
        selectedArea="all"
        isPanelOpen={true}
        userLocation={null}
      />,
    );

    expect(screen.getByLabelText('Distance')).toBeDisabled();
    expect(screen.getByText(/Enable location to filter by distance/i)).toBeInTheDocument();
  });
});
