import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ForgotPasswordPage from './ForgotPasswordPage';
import OwnerForgotPasswordPage from '../owner/OwnerForgotPasswordPage';
import { ThemeModeProvider } from '../../theme/ThemeModeContext';

const forgotAsync = vi.fn(() => Promise.resolve({ data: { success: true, message: 'sent' } }));
const resetAsync = vi.fn(() => Promise.resolve({ data: { success: true, message: 'updated' } }));

vi.mock('../../hooks/useAuth', async () => {
  const actual = await vi.importActual('../../hooks/useAuth');
  return {
    ...actual,
    useForgotPasswordByPhone: () => ({
      mutateAsync: forgotAsync,
      isPending: false,
    }),
    useResetPasswordByPhone: () => ({
      mutateAsync: resetAsync,
      isPending: false,
    }),
  };
});

vi.mock('../../api/ownerAuth', () => ({
  requestOwnerPasswordReset: vi.fn(() => Promise.resolve({ status: 200 })),
}));

function renderForgot() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeModeProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}

describe('Customer mobile forgot password', () => {
  it('collects phone then OTP and new password', async () => {
    renderForgot();

    expect(screen.getByText(/Reset your password/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Mobile number/i), { target: { value: '0771234567' } });
    fireEvent.click(screen.getByRole('button', { name: /Send code/i }));

    await waitFor(() => {
      expect(forgotAsync).toHaveBeenCalledWith({ phone: '0771234567' });
      expect(screen.getByLabelText(/Verification code/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Verification code/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/^New password$/i), { target: { value: 'password12' } });
    fireEvent.change(screen.getByLabelText(/Confirm password/i), { target: { value: 'password12' } });
    fireEvent.click(screen.getByRole('button', { name: /Update password/i }));

    await waitFor(() => {
      expect(resetAsync).toHaveBeenCalledWith({
        phone: '0771234567',
        otp: '123456',
        newPassword: 'password12',
      });
      expect(screen.getByText(/Your password was updated/i)).toBeInTheDocument();
    });
  });
});

describe('Owner forgot password', () => {
  it('renders OwnerForgotPasswordPage', async () => {
    render(
      <ThemeModeProvider>
        <MemoryRouter>
          <OwnerForgotPasswordPage />
        </MemoryRouter>
      </ThemeModeProvider>
    );
    expect(screen.getByText(/Reset partner password/i)).toBeInTheDocument();
  });
});
