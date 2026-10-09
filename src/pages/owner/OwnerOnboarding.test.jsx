import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import OwnerOnboardingPage from './OwnerOnboardingPage';
import useAuthStore from '../../stores/authStore';
import { onboardVenue, submitVenue, uploadVenueMedia } from '../../api/ownerVenues';

vi.mock('../../api/ownerVenues', () => ({
  onboardVenue: vi.fn(() => Promise.resolve({ data: { data: { id: 'v-new-1', name: 'New Arena' } } })),
  uploadVenueMedia: vi.fn(() => Promise.resolve({ data: { data: { id: 'v-new-1' } } })),
  submitVenue: vi.fn(() => Promise.resolve({ data: { data: { id: 'v-new-1', status: 'APPROVED' } } })),
}));

vi.mock('../../components/owner/LocationPicker', () => ({
  default: ({ onChange }) => (
    <button
      type="button"
      onClick={() => onChange({
        formattedAddress: '1 Test St, Colombo',
        city: 'Colombo',
        latitude: 6.9,
        longitude: 79.8,
      })}
    >
      Set test location
    </button>
  ),
}));

vi.mock('../../components/owner/BookingPolicyForm', () => ({
  default: () => <div>Booking policy form</div>,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

function renderPage() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OwnerOnboardingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function clickContinue() {
  fireEvent.click(screen.getByRole('button', { name: /^Continue$/i }));
}

async function advanceToPhotos() {
  fireEvent.click(screen.getByText('Badminton'));
  await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await clickContinue();

  fireEvent.click(screen.getByRole('button', { name: /Set test location/i }));
  await clickContinue();

  await clickContinue(); // Hours
  await clickContinue(); // Pricing
  await clickContinue(); // Policy
  await clickContinue(); // Amenities
  await clickContinue(); // Rules

  await waitFor(() => {
    expect(screen.getByText(/Add venue photos/i)).toBeInTheDocument();
  });
}

describe('Phase 4 - Business Onboarding Page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      owner: { businessName: 'Apex Sports Club' },
      role: 'BUSINESS_OWNER',
      isAuthenticated: true,
    });
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:mock-photo');
    URL.revokeObjectURL = vi.fn();
  });

  it('validates sport selection before proceeding to location step', async () => {
    renderPage();

    expect(screen.getByText(/Which sports can customers book\?/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Select at least one sport/i)).toBeInTheDocument();
    });
  });

  it('requires at least one photo on the Photos step', async () => {
    renderPage();
    await advanceToPhotos();
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Add at least one venue photo/i)).toBeInTheDocument();
    });
  });

  it('uploads photos and publishes after onboard', async () => {
    renderPage();
    await advanceToPhotos();

    const file = new File(['venue-photo'], 'venue.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]');
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Venue/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Venue/i }));

    await waitFor(() => {
      expect(onboardVenue).toHaveBeenCalledTimes(1);
      expect(uploadVenueMedia).toHaveBeenCalledWith('v-new-1', expect.arrayContaining([expect.any(File)]));
      expect(submitVenue).toHaveBeenCalledWith('v-new-1');
    });
  });
});
