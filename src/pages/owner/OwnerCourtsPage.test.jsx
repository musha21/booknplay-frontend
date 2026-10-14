import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import OwnerCourtsPage from './OwnerCourtsPage';
import ownerVenuesApi from '../../api/ownerVenues';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Keep the owner plan gating out of the way so the "Add space" control is always available.
vi.mock('../../utils/subscription', () => ({
  isOwnerSubscriptionsEnabled: () => false,
  canCreateCourt: () => true,
  resolvePlanLimits: () => ({}),
  formatLimitCount: () => '10',
  planLimitMessage: (_err, fallback) => fallback,
}));

vi.mock('../../hooks/useOwner', () => ({
  useOwnerCourts: () => ({
    data: [
      {
        id: 'court-1',
        name: 'Indoor Cricket Arena',
        sportId: 'cricket',
        sportName: 'Cricket',
        facilityType: 'INDOOR',
        hourlyRate: 3000,
        status: 'ACTIVE',
      },
    ],
    refetch: vi.fn(),
  }),
  useOwnerSubscription: () => ({ data: undefined }),
}));

vi.mock('../../api/public', () => ({
  getAllSports: vi.fn(() => Promise.resolve([{ id: 'cricket', name: 'Cricket' }])),
}));

vi.mock('../../api/ownerVenues', () => ({
  default: {
    createCourt: vi.fn(() => Promise.resolve({})),
    updateCourt: vi.fn(() => Promise.resolve({})),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/owner/venues/venue-1/courts']}>
        <Routes>
          <Route path="/owner/venues/:venueId/courts" element={<OwnerCourtsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OwnerCourtsPage facility handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks creating a court without a facility and prompts the owner', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Add space/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));

    expect(toast.error).toHaveBeenCalledWith('Please select Indoor or Outdoor.');
    expect(screen.getByText('Please select Indoor or Outdoor.')).toBeInTheDocument();
    expect(ownerVenuesApi.createCourt).not.toHaveBeenCalled();
  });

  it('creates a court with the selected facility in the payload', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Add space/i }));
    // MUI renders the Facility control as a combobox that opens on mouseDown
    // (not a native <select>), so open the menu and choose an option.
    fireEvent.mouseDown(screen.getByLabelText('Facility'));
    fireEvent.click(await screen.findByRole('option', { name: 'Indoor' }));
    fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));

    await waitFor(() => {
      expect(ownerVenuesApi.createCourt).toHaveBeenCalledWith(
        'venue-1',
        expect.objectContaining({ facilityType: 'INDOOR' }),
      );
    });
  });

  it('prefills the facility type when editing an existing court', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));

    // The Facility combobox displays the persisted court facility ("Indoor").
    await waitFor(() => {
      expect(screen.getByLabelText('Facility')).toHaveTextContent('Indoor');
    });
  });
});
