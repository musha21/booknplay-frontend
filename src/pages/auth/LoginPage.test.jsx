import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';
import { ThemeModeProvider } from '../../theme/ThemeModeContext';

vi.mock('../../hooks/useAuth', async () => {
  const actual = await vi.importActual('../../hooks/useAuth');
  return {
    ...actual,
    useLogin: () => ({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    }),
  };
});

function renderLogin() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeModeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

describe('LoginPage phone + password', () => {
  it('defaults to phone+password and can switch to email', () => {
    renderLogin();

    expect(screen.getByRole('tab', { name: 'Phone' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/Mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Email' }));

    expect(screen.getByRole('tab', { name: 'Email' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
  });
});
