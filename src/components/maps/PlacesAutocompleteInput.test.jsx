import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PlacesAutocompleteInput from './PlacesAutocompleteInput';

const {
  createPlacesSessionToken,
  fetchPlaceSuggestions,
  resolvePlacePrediction,
  isPlacesPermissionError,
  PLACES_PERMISSION_HINT,
} = vi.hoisted(() => ({
  createPlacesSessionToken: vi.fn(),
  fetchPlaceSuggestions: vi.fn(),
  resolvePlacePrediction: vi.fn(),
  isPlacesPermissionError: vi.fn((error) => String(error?.message || '').includes('403')),
  PLACES_PERMISSION_HINT:
    'Places search blocked — enable Places API (New) and allow it on your browser key (HTTP referrers must include this site).',
}));

vi.mock('../../lib/googleMaps', () => ({
  createPlacesSessionToken,
  fetchPlaceSuggestions,
  resolvePlacePrediction,
  isPlacesPermissionError,
  PLACES_PERMISSION_HINT,
}));

describe('PlacesAutocompleteInput', () => {
  beforeEach(() => {
    createPlacesSessionToken.mockResolvedValue({ token: 'session' });
    fetchPlaceSuggestions.mockResolvedValue([
      { id: 'p1', label: 'Peradeniya, Kandy', prediction: { placeId: 'p1' } },
    ]);
    resolvePlacePrediction.mockResolvedValue({
      formattedAddress: 'Peradeniya, Kandy',
      latitude: 7.25,
      longitude: 80.6,
      city: 'Kandy',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not call the legacy Autocomplete API and fetches Places (New) suggestions', async () => {
    expect(window.google?.maps?.places?.Autocomplete).toBeUndefined();

    render(<PlacesAutocompleteInput value="Perad" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(createPlacesSessionToken).toHaveBeenCalled();
      expect(fetchPlaceSuggestions).toHaveBeenCalledWith('Perad', {
        sessionToken: { token: 'session' },
      });
    });

    expect(await screen.findByRole('option', { name: 'Peradeniya, Kandy' })).toBeInTheDocument();
  });

  it('resolves a selected suggestion through onPlace', async () => {
    const onChange = vi.fn();
    const onPlace = vi.fn();

    render(
      <PlacesAutocompleteInput value="Perad" onChange={onChange} onPlace={onPlace} />,
    );

    const option = await screen.findByRole('option', { name: 'Peradeniya, Kandy' });
    fireEvent.mouseDown(option);

    await waitFor(() => {
      expect(resolvePlacePrediction).toHaveBeenCalledWith({ placeId: 'p1' });
      expect(onPlace).toHaveBeenCalledWith({
        formattedAddress: 'Peradeniya, Kandy',
        latitude: 7.25,
        longitude: 80.6,
        city: 'Kandy',
      });
    });
  });

  it('clears suggestions quietly when the Places API errors', async () => {
    fetchPlaceSuggestions.mockRejectedValueOnce(new Error('Places unavailable'));
    isPlacesPermissionError.mockReturnValueOnce(false);

    render(<PlacesAutocompleteInput value="Kandy" onChange={vi.fn()} />);

    await waitFor(() => {
      expect(fetchPlaceSuggestions).toHaveBeenCalled();
    });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a permission hint for Places API 403 errors without exposing keys', async () => {
    fetchPlaceSuggestions.mockRejectedValueOnce(new Error('403 Forbidden'));
    isPlacesPermissionError.mockReturnValueOnce(true);

    render(<PlacesAutocompleteInput value="Kandy" onChange={vi.fn()} />);

    expect(await screen.findByRole('status')).toHaveTextContent(/Places search blocked/i);
    expect(screen.queryByText(/AIza/i)).not.toBeInTheDocument();
  });
});
