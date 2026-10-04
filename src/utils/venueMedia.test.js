import { describe, expect, it } from 'vitest';
import { businessInitials, venueBusinessLogo, venueMediaList } from './venueMedia';

describe('venueMediaList', () => {
  it('prefers ordered media before cover and business image', () => {
    expect(venueMediaList({
      media: [
        { id: '2', url: 'https://cdn.example/b.jpg', sortOrder: 1 },
        { id: '1', url: 'https://cdn.example/a.jpg', sortOrder: 0 },
      ],
      coverImageUrl: 'https://cdn.example/cover.jpg',
      businessImageUrl: 'https://cdn.example/biz.jpg',
    })).toEqual([
      'https://cdn.example/a.jpg',
      'https://cdn.example/b.jpg',
    ]);
  });

  it('falls back through cover and business image', () => {
    expect(venueMediaList({ coverImageUrl: 'https://cdn.example/cover.jpg' })).toEqual([
      'https://cdn.example/cover.jpg',
    ]);
    expect(venueMediaList({ businessImageUrl: 'https://cdn.example/biz.jpg' })).toEqual([
      'https://cdn.example/biz.jpg',
    ]);
    expect(venueMediaList({})).toEqual([]);
  });

  it('uses imageUrls when media and images are empty', () => {
    expect(venueMediaList({
      imageUrls: ['https://cdn.example/1.jpg', 'https://cdn.example/2.jpg'],
    })).toEqual([
      'https://cdn.example/1.jpg',
      'https://cdn.example/2.jpg',
    ]);
  });
});

describe('venueBusinessLogo', () => {
  it('uses venue logo before owner logo', () => {
    expect(venueBusinessLogo(
      { businessLogoUrl: 'https://cdn.example/venue-logo.png' },
      { logoUrl: 'https://cdn.example/owner-logo.png' },
    )).toBe('https://cdn.example/venue-logo.png');
  });
});

describe('businessInitials', () => {
  it('builds two-letter initials', () => {
    expect(businessInitials('Layout Check')).toBe('LC');
    expect(businessInitials('Arena')).toBe('AR');
  });
});
