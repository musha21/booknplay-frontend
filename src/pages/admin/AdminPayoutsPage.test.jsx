import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminPayoutsPage from './AdminPayoutsPage';

vi.mock('../../hooks/useAdmin', () => ({
  useAdminPayoutBusinesses: () => ({
    data: [{
      businessId: 'b1',
      businessName: 'Court Co',
      ownerEmail: 'owner@test.com',
      payoutFrequency: 'WEEKLY',
      bankVerificationStatus: 'UNVERIFIED',
      bankAccountNumberMasked: '****1111',
      bankAccountNumber: '12345678901111',
      bankAccountName: 'Court Co Ltd',
      bankBranch: 'Colombo',
      bankName: 'HNB',
      commissionPercent: 10,
      unsettledAccrued: 4500,
      outstandingBalance: 82000,
      latestPayoutId: 'p1',
      latestPayoutStatus: 'PENDING',
      latestNet: 82000,
    }],
  }),
  useAdminPayouts: () => ({
    data: [{
      id: 'p1',
      businessName: 'Court Co',
      periodStart: '2026-09-28',
      periodEnd: '2026-10-04',
      frequency: 'WEEKLY',
      net: 82000,
      status: 'PENDING',
    }],
  }),
  useAdminPayout: () => ({ isLoading: false, data: null }),
  useAdminAction: () => ({ isPending: false, mutate: vi.fn() }),
}));

vi.mock('../../api/admin', () => ({
  generateAdminPayouts: vi.fn(),
  setBusinessBankVerification: vi.fn(),
  settleAdminPayout: vi.fn(),
  updateAdminPayoutStatus: vi.fn(),
}));

describe('AdminPayoutsPage', () => {
  it('renders businesses and settlements with refresh and mark paid', () => {
    render(<AdminPayoutsPage />);
    expect(screen.getAllByText('Court Co').length).toBeGreaterThan(0);
    expect(screen.getByText(/refresh settlements/i)).toBeInTheDocument();
    expect(screen.queryByText(/gateway fee/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /mark paid/i }).length).toBeGreaterThan(0);
    expect(screen.getByText('12345678901111')).toBeInTheDocument();
    expect(screen.getByText(/Court Co Ltd/)).toBeInTheDocument();
    expect(screen.getByText(/Branch: Colombo/)).toBeInTheDocument();
    expect(screen.getByText(/4,500\.00/)).toBeInTheDocument();
    expect(screen.getByText('10.00%')).toBeInTheDocument();
  });
});
