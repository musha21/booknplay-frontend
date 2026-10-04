import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import OwnerProtectedRoute from './OwnerProtectedRoute';
import useAuthStore from '../../stores/authStore';

describe('Staff Permissions - OwnerProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      owner: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('redirects unauthenticated user to /owner/login', () => {
    render(
      <MemoryRouter initialEntries={['/owner']}>
        <Routes>
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner" element={<div>Owner Dashboard</div>} />
          </Route>
          <Route path="/owner/login" element={<div>Owner Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Owner Login Page')).toBeInTheDocument();
  });

  it('allows BUSINESS_OWNER into earnings route', () => {
    useAuthStore.setState({
      role: 'BUSINESS_OWNER',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/owner/earnings']}>
        <Routes>
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner/earnings" element={<div>Owner Earnings Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Owner Earnings Page')).toBeInTheDocument();
  });

  it('redirects STAFF away from restricted /owner/earnings to /owner', () => {
    useAuthStore.setState({
      role: 'STAFF',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/owner/earnings']}>
        <Routes>
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner" element={<div>Owner Overview Page</div>} />
            <Route path="/owner/earnings" element={<div>Owner Earnings Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Owner Overview Page')).toBeInTheDocument();
    expect(screen.queryByText('Owner Earnings Page')).not.toBeInTheDocument();
  });

  it('redirects STAFF away from /owner/reports to /owner', () => {
    useAuthStore.setState({
      role: 'STAFF',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/owner/reports']}>
        <Routes>
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner" element={<div>Owner Overview Page</div>} />
            <Route path="/owner/reports" element={<div>Owner Reports Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Owner Overview Page')).toBeInTheDocument();
    expect(screen.queryByText('Owner Reports Page')).not.toBeInTheDocument();
  });

  it('redirects STAFF away from /owner/billing to /owner', () => {
    useAuthStore.setState({
      role: 'STAFF',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/owner/billing']}>
        <Routes>
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner" element={<div>Owner Overview Page</div>} />
            <Route path="/owner/billing" element={<div>Owner Billing Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Owner Overview Page')).toBeInTheDocument();
    expect(screen.queryByText('Owner Billing Page')).not.toBeInTheDocument();
  });

  it('redirects STAFF away from /owner/team to /owner', () => {
    useAuthStore.setState({
      role: 'STAFF',
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/owner/team']}>
        <Routes>
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner" element={<div>Owner Overview Page</div>} />
            <Route path="/owner/team" element={<div>Owner Team Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Owner Overview Page')).toBeInTheDocument();
    expect(screen.queryByText('Owner Team Page')).not.toBeInTheDocument();
  });
});
