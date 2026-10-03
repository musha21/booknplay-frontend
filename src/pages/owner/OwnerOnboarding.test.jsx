import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import OwnerOnboardingPage from './OwnerOnboardingPage';
import useAuthStore from '../../stores/authStore';
import { ThemeModeProvider } from '../../theme/ThemeModeContext';

vi.mock('../../api/ownerVenues', () => ({
  onboardVenue: vi.fn(() => Promise.resolve({ data: { id: 'v-new-1', name: 'New Arena' } })),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}

describe('Phase 4 - Business Onboarding Page', () => {
  beforeEach(() => {
    useAuthStore.setState({
      owner: { businessName: 'Apex Sports Club' },
      role: 'BUSINESS_OWNER',
      isAuthenticated: true,
    });
  });

  it('validates sport selection before proceeding to location step', async () => {
    const queryClient = createTestQueryClient();
    render(
      <ThemeModeProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <OwnerOnboardingPage />
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeModeProvider>
    );

    expect(screen.getByText(/Which sports can customers book\?/i)).toBeInTheDocument();

    // Clicking continue without picking a sport shows error
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getByText(/Select at least one sport/i)).toBeInTheDocument();
    });
  });
});
