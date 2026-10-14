import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, KANDY_CENTER, hasMapsJsKey } from '../../lib/googleMaps';

export default function VenueMap({
  venues = [],
  center,
  userLocation,
  selectedId,
  onSelect,
  className = '',
  zoom = 12,
}) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasMapsJsKey() || !hostRef.current) return undefined;
    let cancelled = false;
    loadGoogleMaps().then((google) => {
      if (cancelled || !hostRef.current) return;
      const start = center?.lat != null
        ? { lat: Number(center.lat), lng: Number(center.lng) }
        : KANDY_CENTER;
      mapRef.current = new google.maps.Map(hostRef.current, {
        center: start,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
      setReady(true);
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [center?.lat, center?.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !window.google?.maps) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    venues.forEach((venue) => {
      const lat = Number(venue.latitude);
      const lng = Number(venue.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const marker = new window.google.maps.Marker({
        map,
        position: { lat, lng },
        title: venue.name,
        animation: String(venue.id) === String(selectedId) ? window.google.maps.Animation.BOUNCE : null,
      });
      marker.addListener('click', () => {
        onSelect?.(venue);
        const info = new window.google.maps.InfoWindow({
          content: `<strong>${venue.name || 'Venue'}</strong><br/>${venue.sportName || ''}<br/>${venue.availableCourtCount != null ? `${venue.availableCourtCount} courts` : ''}`,
        });
        info.open({ map, anchor: marker });
      });
      markersRef.current.push(marker);
      bounds.extend({ lat, lng });
    });
    if (userLocation?.lat != null && userLocation?.lng != null) {
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = new window.google.maps.Marker({
        map,
        position: { lat: Number(userLocation.lat), lng: Number(userLocation.lng) },
        title: 'You',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      bounds.extend({ lat: Number(userLocation.lat), lng: Number(userLocation.lng) });
    }
    if (venues.some((venue) => Number.isFinite(Number(venue.latitude)))) {
      map.fitBounds(bounds, 48);
    } else if (center?.lat != null) {
      map.setCenter({ lat: Number(center.lat), lng: Number(center.lng) });
    }
  }, [ready, venues, selectedId, onSelect, userLocation?.lat, userLocation?.lng, center?.lat, center?.lng]);

  if (!hasMapsJsKey()) {
    return (
      <div className={`flex items-center justify-center bg-canvas text-sm text-muted ${className}`}>
        Map is unavailable until Google Maps is configured.
      </div>
    );
  }

  return <div ref={hostRef} className={className} role="presentation" />;
}
