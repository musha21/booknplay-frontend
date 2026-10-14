import { useMemo, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import PlacesAutocompleteInput from '../maps/PlacesAutocompleteInput';
import PinMap from '../maps/PinMap';
import { geocodeAddress, reverseGeocode, KANDY_CENTER, hasMapsJsKey } from '../../lib/googleMaps';

const ADDRESS_INPUT_CLASS = [
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900',
  'placeholder:text-slate-500',
  'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400',
  'focus:outline-none focus:ring-2 focus:ring-lime-400',
].join(' ');

export default function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(value?.formattedAddress || '');
  const position = useMemo(
    () => ({
      lat: value?.latitude ?? KANDY_CENTER.lat,
      lng: value?.longitude ?? KANDY_CENTER.lng,
    }),
    [value],
  );

  const applyLatLng = async (lat, lng, addressOverride) => {
    let formatted = addressOverride;
    let city = '';
    try {
      const rev = await reverseGeocode(lat, lng);
      formatted = formatted || rev?.formattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      city = rev?.city || '';
    } catch {
      formatted = formatted || query || 'Selected location';
    }
    onChange({
      formattedAddress: formatted,
      latitude: lat,
      longitude: lng,
      city,
    });
    setQuery(formatted);
  };

  const useCurrent = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      applyLatLng(pos.coords.latitude, pos.coords.longitude);
    });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <PlacesAutocompleteInput
          className={ADDRESS_INPUT_CLASS}
          value={query}
          placeholder="Search address"
          onChange={setQuery}
          onPlace={async (place) => {
            setQuery(place.formattedAddress || place.city);
            if (place.latitude != null) {
              onChange({
                formattedAddress: place.formattedAddress,
                latitude: place.latitude,
                longitude: place.longitude,
                city: place.city,
              });
              return;
            }
            const geo = await geocodeAddress(place.formattedAddress || query);
            if (geo) {
              onChange(geo);
              setQuery(geo.formattedAddress);
            }
          }}
        />
        <Button variant="outlined" startIcon={<MyLocation />} onClick={useCurrent}>Use current location</Button>
      </Stack>
      <Box
        className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
        sx={{ height: { xs: 280, md: 380 }, position: 'relative' }}
      >
        {hasMapsJsKey() ? (
          <PinMap
            className="h-full min-h-[280px] w-full"
            lat={position.lat}
            lng={position.lng}
            onPick={(lat, lng) => applyLatLng(lat, lng)}
          />
        ) : (
          <Box className="flex h-full min-h-[280px] items-center justify-center bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Add Google Maps keys to drop a pin here. You can still type an address.
          </Box>
        )}
      </Box>
      {value?.formattedAddress && (
        <Box className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60 dark:ring-1 dark:ring-slate-700">
          <Typography variant="caption" color="text.secondary">Selected venue</Typography>
          <Typography fontWeight={700}>{value.formattedAddress}</Typography>
        </Box>
      )}
    </Stack>
  );
}
