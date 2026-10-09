import { useEffect, useRef } from 'react';
import { loadGoogleMaps, KANDY_CENTER, hasMapsJsKey } from '../../lib/googleMaps';

export default function PinMap({ lat, lng, onPick, className = '' }) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!hasMapsJsKey() || !hostRef.current) return undefined;
    let cancelled = false;
    loadGoogleMaps().then((google) => {
      if (cancelled || !hostRef.current) return;
      const position = {
        lat: Number.isFinite(Number(lat)) ? Number(lat) : KANDY_CENTER.lat,
        lng: Number.isFinite(Number(lng)) ? Number(lng) : KANDY_CENTER.lng,
      };
      const map = new google.maps.Map(hostRef.current, {
        center: position,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
      });
      mapRef.current = map;
      const marker = new google.maps.Marker({
        map,
        position,
        draggable: true,
      });
      markerRef.current = marker;
      map.addListener('click', (event) => {
        onPickRef.current?.(event.latLng.lat(), event.latLng.lng());
      });
      marker.addListener('dragend', () => {
        const p = marker.getPosition();
        if (p) onPickRef.current?.(p.lat(), p.lng());
      });
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const position = {
      lat: Number.isFinite(Number(lat)) ? Number(lat) : KANDY_CENTER.lat,
      lng: Number.isFinite(Number(lng)) ? Number(lng) : KANDY_CENTER.lng,
    };
    mapRef.current?.panTo(position);
    markerRef.current?.setPosition(position);
  }, [lat, lng]);

  if (!hasMapsJsKey()) {
    return (
      <div className={`flex items-center justify-center bg-canvas text-sm text-muted ${className}`}>
        Map is unavailable until Google Maps is configured.
      </div>
    );
  }

  return <div ref={hostRef} className={className} />;
}
