import { describe, expect, it } from 'vitest';
import { groupVenuesByBusiness } from './business';

describe('groupVenuesByBusiness', () => {
  it('groups multiple venues using a stable business id', () => {
    const result = groupVenuesByBusiness([
      { id: 1, businessId: 9, businessName: 'Play Co', city: 'Colombo' },
      { id: 2, businessId: 9, businessName: 'Play Co', city: 'Kandy' },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].venues).toHaveLength(2);
  });

  it('omits venues with no business identity', () => {
    expect(groupVenuesByBusiness([{ id: 1, name: 'Central Court' }])).toEqual([]);
  });
});
