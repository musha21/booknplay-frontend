import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminVenuesPage } from './AdminResourcePages';

const adminMocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

vi.mock('../../api/admin', () => ({
  setAdminVenueStatus: vi.fn(),
  setBusinessAccess: vi.fn(),
  setBusinessSubscription: vi.fn(),
}));

vi.mock('../../hooks/useAdmin', () => ({
  useAdminAction: () => ({ mutate: adminMocks.mutate }),
  useAdminAudit: () => ({ data: [] }),
  useAdminBusinesses: () => ({ data: [] }),
  useAdminCustomers: () => ({ data: [] }),
  useAdminVenues: () => ({
    data: [{
      id: 'venue-1',
      name: 'Kandy Sports Hub',
      businessName: 'Play Lanka',
      city: 'Kandy',
      venueType: 'Multi-sport',
      status: 'ACTIVE',
    }],
  }),
}));

describe('AdminVenuesPage', () => {
  beforeEach(() => {
    adminMocks.mutate.mockClear();
  });

  it('offers every backend status and submits the selected value', async () => {
    const user = userEvent.setup();
    render(<AdminVenuesPage />);

    await user.click(screen.getByRole('combobox'));
    const options = within(screen.getByRole('listbox'));
    [
      'Draft',
      'Pending Approval',
      'Approved',
      'Active',
      'Rejected',
      'Suspended',
      'Inactive',
      'Deleted',
    ].forEach((label) => {
      expect(options.getByRole('option', { name: label })).toBeInTheDocument();
    });

    await user.click(options.getByRole('option', { name: 'Deleted' }));
    expect(adminMocks.mutate).toHaveBeenCalledWith({
      id: 'venue-1',
      status: 'DELETED',
    });
  });
});
