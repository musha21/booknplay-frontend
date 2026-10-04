import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useAuthStore from '../../stores/authStore';
import { OWNER_SIDEBAR_COLLAPSED_KEY } from '../../utils/ownerOverview';
import OwnerLayout from './OwnerLayout';

const ownerLayoutMocks = vi.hoisted(() => ({
  venues: [
    { id: 'venue-1', name: 'Indoor Cricket' },
    { id: 'venue-2', name: 'City Futsal' },
  ],
  desktop: false,
}));

vi.mock('../../hooks/useOwner', () => ({
  useOwnerVenues: () => ({ data: ownerLayoutMocks.venues }),
  useOwnerProfile: () => ({ data: null }),
  useOwnerSubscription: () => ({ data: null }),
}));

vi.mock('../ui/ThemeToggle', () => ({
  default: () => <button type="button" aria-label="Toggle theme">Theme</button>,
}));

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => ownerLayoutMocks.desktop,
  };
});

const renderOwnerLayout = (path = '/owner') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/owner" element={<OwnerLayout />}>
        <Route index element={<div>Overview content</div>} />
        <Route path="venues/:venueId/calendar" element={<div>Calendar content</div>} />
        <Route path="venues/:venueId/courts" element={<div>Spaces content</div>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

describe('OwnerLayout responsive shell', () => {
  beforeEach(() => {
    localStorage.clear();
    ownerLayoutMocks.desktop = false;
    useAuthStore.setState({
      owner: { ownerName: 'Ameen', businessName: 'Seven15 Sports' },
      role: 'BUSINESS_OWNER',
      isAuthenticated: true,
    });
  });

  it('shows the current section and exposes venue selection inside the mobile drawer', async () => {
    renderOwnerLayout('/owner/venues/venue-1/calendar');

    const banner = screen.getByRole('banner');
    expect(within(banner).getByText('Calendar')).toBeInTheDocument();
    expect(within(banner).getByLabelText('Open owner navigation')).toBeInTheDocument();
    expect(within(banner).queryByLabelText('Select venue')).not.toBeInTheDocument();

    fireEvent.click(within(banner).getByLabelText('Open owner navigation'));

    const navigation = await screen.findByRole('navigation', { name: 'Owner navigation' });
    expect(navigation).toBeVisible();
    expect(screen.getByLabelText('Select venue')).toHaveTextContent('Indoor Cricket');
    expect(within(navigation).getByText('Bookable spaces')).toBeInTheDocument();
    expect(within(navigation).queryByText('Courts')).not.toBeInTheDocument();
    expect(within(navigation).getByText('Venues')).toBeInTheDocument();
    expect(within(navigation).getByText('Team')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close owner navigation'));
    await waitFor(() => expect(navigation).not.toBeVisible());
  });

  it('offers the business profile from the owner account menu', async () => {
    renderOwnerLayout();

    fireEvent.click(screen.getByLabelText('Open account menu'));
    const menu = await screen.findByRole('menu');

    expect(within(menu).getByText('Ameen')).toBeInTheDocument();
    expect(within(menu).getByText('Business profile')).toBeInTheDocument();
    expect(within(menu).getByText('Sign out')).toBeInTheDocument();
  });

  it('does not expose the owner-only profile action to staff', async () => {
    useAuthStore.setState({ role: 'STAFF' });
    renderOwnerLayout();

    fireEvent.click(screen.getByLabelText('Open account menu'));
    const menu = await screen.findByRole('menu');

    expect(within(menu).queryByText('Business profile')).not.toBeInTheDocument();
    expect(within(menu).getByText('Sign out')).toBeInTheDocument();
  });

  it('collapses the desktop sidebar to an icon rail and persists the preference', async () => {
    ownerLayoutMocks.desktop = true;
    renderOwnerLayout('/owner/venues/venue-1/calendar');

    const minimize = await screen.findByLabelText('Minimize owner navigation');
    fireEvent.click(minimize);

    expect(localStorage.getItem(OWNER_SIDEBAR_COLLAPSED_KEY)).toBe('1');
    expect(screen.getByLabelText('Expand owner navigation')).toBeInTheDocument();
    expect(screen.queryByText('Bookable spaces')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Expand owner navigation'));
    expect(localStorage.getItem(OWNER_SIDEBAR_COLLAPSED_KEY)).toBe('0');
    expect(screen.getByText('Bookable spaces')).toBeInTheDocument();
  });
});
