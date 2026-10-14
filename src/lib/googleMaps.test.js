import { describe, expect, it } from 'vitest';
import { isPlacesPermissionError, placeToLocation } from './googleMaps';

describe('placeToLocation', () => {
  it('maps a legacy PlaceResult shape', () => {
    const location = placeToLocation({
      formatted_address: 'Peradeniya, Kandy',
      name: 'Peradeniya',
      geometry: { location: { lat: () => 7.25, lng: () => 80.6 } },
      address_components: [
        { long_name: 'Kandy', types: ['locality', 'political'] },
      ],
    });

    expect(location).toEqual({
      formattedAddress: 'Peradeniya, Kandy',
      latitude: 7.25,
      longitude: 80.6,
      city: 'Kandy',
    });
  });

  it('maps a Places API (New) Place shape', () => {
    const location = placeToLocation({
      formattedAddress: 'Bogambara Stadium, Kandy',
      displayName: 'Bogambara Stadium',
      location: { lat: 7.29, lng: 80.63 },
      addressComponents: [
        { longText: 'Kandy', types: ['locality', 'political'] },
      ],
    });

    expect(location).toEqual({
      formattedAddress: 'Bogambara Stadium, Kandy',
      latitude: 7.29,
      longitude: 80.63,
      city: 'Kandy',
    });
  });

  it('returns null when coordinates are missing', () => {
    expect(placeToLocation({ formattedAddress: 'Somewhere' })).toBeNull();
    expect(placeToLocation(null)).toBeNull();
  });
});

describe('isPlacesPermissionError', () => {
  it('detects 403 and permission-style failures', () => {
    expect(isPlacesPermissionError(new Error('403 Forbidden'))).toBe(true);
    expect(isPlacesPermissionError({ code: 'PERMISSION_DENIED' })).toBe(true);
    expect(isPlacesPermissionError(new Error('REQUEST_DENIED'))).toBe(true);
    expect(isPlacesPermissionError(new Error('Network timeout'))).toBe(false);
  });
});
