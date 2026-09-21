import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { MyLocation, Search } from '@mui/icons-material';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const COLOMBO = { lat: 6.9271, lng: 79.8612 };

const cityFromNominatim = (rev, formatted = '') => {
  const address = rev?.address || {};
  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    formatted.split(',').slice(-3, -2)[0]?.trim() ||
    formatted.split(',').slice(-2, -1)[0]?.trim() ||
    ''
  );
};

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await res.json();
  return data[0] || null;
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  return res.json();
}

export default function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState(value?.formattedAddress || '');
  const position = useMemo(
    () => ({
      lat: value?.latitude ?? COLOMBO.lat,
      lng: value?.longitude ?? COLOMBO.lng,
    }),
    [value]
  );

  const applyLatLng = async (lat, lng, addressOverride) => {
    let formatted = addressOverride;
    try {
      const rev = await reverseGeocode(lat, lng);
      formatted = formatted || rev.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const city = cityFromNominatim(rev, formatted);
      onChange({
        formattedAddress: formatted,
        latitude: lat,
        longitude: lng,
        city,
      });
      setQuery(formatted);
      return;
    } catch {
      formatted = formatted || query || 'Selected location';
    }
    onChange({
      formattedAddress: formatted,
      latitude: lat,
      longitude: lng,
      city: cityFromNominatim({}, formatted),
    });
    setQuery(formatted);
  };

  const search = async () => {
    if (!query.trim()) return;
    const hit = await geocode(query.trim());
    if (hit) {
      await applyLatLng(Number(hit.lat), Number(hit.lon), hit.display_name);
    }
  };

  const useCurrent = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      applyLatLng(pos.coords.latitude, pos.coords.longitude);
    });
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField
          fullWidth
          label="Search address"
          placeholder="ABC Sports Arena Colombo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), search())}
        />
        <Button variant="contained" startIcon={<Search />} onClick={search}>Search</Button>
        <Button variant="outlined" startIcon={<MyLocation />} onClick={useCurrent}>Use current location</Button>
      </Stack>
      <Box sx={{ height: { xs: 280, md: 380 }, borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Recenter lat={position.lat} lng={position.lng} />
          <ClickHandler onPick={(lat, lng) => applyLatLng(lat, lng)} />
          <Marker
            draggable
            position={[position.lat, position.lng]}
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                applyLatLng(p.lat, p.lng);
              },
            }}
          />
        </MapContainer>
      </Box>
      {value?.formattedAddress && (
        <Box className="rounded-xl bg-slate-50 p-3">
          <Typography variant="caption" color="text.secondary">Selected venue</Typography>
          <Typography fontWeight={700}>{value.formattedAddress}</Typography>
        </Box>
      )}
    </Stack>
  );
}
