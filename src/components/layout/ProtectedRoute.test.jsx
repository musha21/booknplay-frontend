import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '../../stores/authStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      customer: null,
      owner: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('lets a customer into checkout', () => {
    useAuthStore.setState({ role: 'CUSTOMER', isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<div>Checkout</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Customer login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it.each(['BUSINESS_OWNER', 'SUPER_ADMIN'])('sends %s to customer login instead of checkout', (role) => {
    useAuthStore.setState({ role, isAuthenticated: true });

    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<div>Checkout</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Customer login</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Customer login')).toBeInTheDocument();
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
  });
});
