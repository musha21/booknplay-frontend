import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, KANDY_CENTER, hasMapsJsKey } from '../../lib/googleMaps';

const MAP_LOAD_ERROR =
  'Map could not load. Enable Maps JavaScript API on your browser key and allow this site in HTTP referrer restrictions.';

export default function PinMap({ lat, lng, onPick, onError, className = '' }) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  const onErrorRef = useRef(onError);
  const [loadError, setLoadError] = useState('');
  onPickRef.current = onPick;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!hasMapsJsKey()) return undefined;
    let cancelled = false;
    let retryId = 0;

    const init = () => {
      if (cancelled || !hostRef.current) return;
      setLoadError('');
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
          fullscreenControl: false,
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
        window.setTimeout(() => {
          if (cancelled || !mapRef.current || !hostRef.current) return;
          google.maps.event.trigger(mapRef.current, 'resize');
          mapRef.current.setCenter(position);
        }, 80);
        onErrorRef.current?.('');
      }).catch(() => {
        if (cancelled) return;
        setLoadError(MAP_LOAD_ERROR);
        onErrorRef.current?.(MAP_LOAD_ERROR);
      });
    };

    // Host may not be committed on the first paint when recovering from an error state.
    if (!hostRef.current) {
      retryId = window.setTimeout(init, 0);
    } else {
      init();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(retryId);
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
      <div className={`flex items-center justify-center bg-slate-50 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300 ${className}`}>
        Map is unavailable until Google Maps is configured.
      </div>
    );
  }

  return (
    <div className={`relative h-full min-h-[280px] w-full ${className}`} style={{ minHeight: 280 }}>
      <div ref={hostRef} className="h-full min-h-[280px] w-full" style={{ minHeight: 280 }} />
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/95 p-4 text-center text-sm text-slate-600 dark:bg-slate-900/95 dark:text-slate-300">
          {loadError}
        </div>
      )}
    </div>
  );
}
