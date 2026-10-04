import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ForgotPasswordPage from './ForgotPasswordPage';
import OwnerForgotPasswordPage from '../owner/OwnerForgotPasswordPage';
import { ThemeModeProvider } from '../../theme/ThemeModeContext';

vi.mock('../../api/auth', () => ({
  requestPasswordReset: vi.fn(() => Promise.resolve({ status: 200 })),
}));

vi.mock('../../api/ownerAuth', () => ({
  requestOwnerPasswordReset: vi.fn(() => Promise.resolve({ status: 200 })),
}));

describe('Phase 3 - Password Reset Flows', () => {
  it('renders Customer ForgotPasswordPage and handles submission', async () => {
    render(
      <ThemeModeProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </ThemeModeProvider>
    );

    expect(screen.getByText(/Reset your password/i)).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send reset link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/If an account exists for/i)).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('renders OwnerForgotPasswordPage and handles submission', async () => {
    render(
      <ThemeModeProvider>
        <MemoryRouter>
          <OwnerForgotPasswordPage />
        </MemoryRouter>
      </ThemeModeProvider>
    );

    expect(screen.getByText(/Reset partner password/i)).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/Work email address/i);
    fireEvent.change(emailInput, { target: { value: 'owner@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Send reset link/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/If a business account exists for/i)).toBeInTheDocument();
      expect(screen.getByText('owner@example.com')).toBeInTheDocument();
    });
  });
});
