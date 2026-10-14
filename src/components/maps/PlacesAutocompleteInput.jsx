import React, { useEffect, useId, useRef, useState } from 'react';
import {
  createPlacesSessionToken,
  fetchPlaceSuggestions,
  isPlacesPermissionError,
  PLACES_PERMISSION_HINT,
  resolvePlacePrediction,
} from '../../lib/googleMaps';

const DEBOUNCE_MS = 250;

export default function PlacesAutocompleteInput({
  value = '',
  onChange,
  onPlace,
  placeholder = 'Kandy, Peradeniya…',
  className = '',
  id,
  disabled = false,
  'aria-label': ariaLabel,
}) {
  const reactId = useId();
  const listboxId = `${reactId}-suggestions`;
  const rootRef = useRef(null);
  const onPlaceRef = useRef(onPlace);
  const sessionTokenRef = useRef(null);
  const requestIdRef = useRef(0);

  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [permissionHint, setPermissionHint] = useState('');

  onPlaceRef.current = onPlace;

  useEffect(() => {
    const query = String(value || '').trim();
    if (!query || disabled) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setActiveIndex(-1);
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = await createPlacesSessionToken();
        }
        const next = await fetchPlaceSuggestions(query, {
          sessionToken: sessionTokenRef.current,
        });
        if (cancelled || requestId !== requestIdRef.current) return;
        setPermissionHint('');
        setSuggestions(next);
        setOpen(next.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        if (cancelled || requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setOpen(false);
        setPermissionHint(isPlacesPermissionError(error) ? PLACES_PERMISSION_HINT : '');
      } finally {
        if (!cancelled && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value, disabled]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const selectSuggestion = async (item) => {
    if (!item?.prediction) return;
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    onChange?.(item.label);

    try {
      const location = await resolvePlacePrediction(item.prediction);
      sessionTokenRef.current = null;
      setPermissionHint('');
      if (location) {
        onPlaceRef.current?.(location);
        onChange?.(location.formattedAddress || item.label);
      }
    } catch (error) {
      sessionTokenRef.current = null;
      setPermissionHint(isPlacesPermissionError(error) ? PLACES_PERMISSION_HINT : '');
    }
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
      return;
    }
    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        autoComplete="off"
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {permissionHint && (
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300" role="status">
          {permissionHint}
        </p>
      )}

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-slate-500 dark:text-slate-400" role="presentation">
              Searching…
            </li>
          ) : (
            suggestions.map((item, index) => (
              <li
                key={item.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`cursor-pointer px-3 py-2 text-slate-800 dark:text-slate-100 ${
                  index === activeIndex
                    ? 'bg-lime-100 dark:bg-slate-800'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(item);
                }}
              >
                {item.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
