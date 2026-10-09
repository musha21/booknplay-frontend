import { useEffect, useRef } from 'react';
import { loadGoogleMaps, placeToLocation, KANDY_CENTER } from '../../lib/googleMaps';

export default function PlacesAutocompleteInput({
  value = '',
  onChange,
  onPlace,
  placeholder = 'Kandy, Peradeniya…',
  className = '',
  id,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !inputRef.current || autocompleteRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['formatted_address', 'geometry', 'name', 'address_components'],
          componentRestrictions: { country: 'lk' },
          bounds: new google.maps.LatLngBounds(
            { lat: KANDY_CENTER.lat - 0.45, lng: KANDY_CENTER.lng - 0.45 },
            { lat: KANDY_CENTER.lat + 0.45, lng: KANDY_CENTER.lng + 0.45 },
          ),
          strictBounds: false,
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          const location = placeToLocation(place);
          if (location) onPlaceRef.current?.(location);
        });
        autocompleteRef.current = autocomplete;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      autoComplete="off"
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
