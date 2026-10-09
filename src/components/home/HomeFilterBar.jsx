import React, { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { LocationOff, MyLocation, Tune } from '@mui/icons-material';
import Search from '@mui/icons-material/Search';
import RestartAlt from '@mui/icons-material/RestartAlt';
import IconButton from '@mui/material/IconButton';
import { getActiveAreas } from '../../config/locationConfig';

export default function HomeFilterBar({
  sports = [],
  selectedSportId = '',
  onSelectSport,
  selectedArea = '',
  onSelectArea,
  filterDate = '',
  onChangeDate,
  filterTime = '',
  onChangeTime,
  distanceKm = '',
  onChangeDistance,
  sortBy = 'price_asc',
  onChangeSort,
  userLocation = null,
  locationStatus = 'idle',
  onFetchLocation,
  onResetFilters,
  isPanelOpen = false,
  onTogglePanel,
  resultCount = 0,
  onFindVenue,
}) {
  const reduced = useReducedMotion();
  const areas = useMemo(() => getActiveAreas(), []);

  // Compute active filter count (non-default selections)
  const activeCount = useMemo(() => {
    let count = 0;
    if (filterDate) count += 1;
    if (filterTime) count += 1;
    if (selectedArea && selectedArea !== 'all' && selectedArea !== '') count += 1;
    if (distanceKm && distanceKm !== 'all' && distanceKm !== '') count += 1;
    if (sortBy && sortBy !== 'nearest' && sortBy !== 'price_asc') count += 1;
    return count;
  }, [filterDate, filterTime, selectedArea, distanceKm, sortBy]);

  const hasLocation = Boolean(userLocation?.lat && userLocation?.lng);

  return (
    <div className="hp-filter-card-container">
      <div className="hp-filter-card shadow-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 md:p-5">
        {/* Main Row */}
        <div className="hp-filter-main-row gap-2 sm:gap-3 items-center">
          {/* 1. Date Picker */}
          <div className="hp-filter-field min-w-0">
            <label htmlFor="home-filter-date" className="sr-only">
              Date
            </label>
            <input
              type="date"
              id="home-filter-date"
              min={new Date().toISOString().split('T')[0]}
              value={filterDate}
              onChange={(e) => onChangeDate?.(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none cursor-pointer"
              aria-label="Select Date"
            />
          </div>

          {/* 2. Time Picker */}
          <div className="hp-filter-field min-w-0">
            <label htmlFor="home-filter-time" className="sr-only">
              Time
            </label>
            <input
              type="time"
              id="home-filter-time"
              step="1800"
              value={filterTime}
              onChange={(e) => onChangeTime?.(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none cursor-pointer"
              aria-label="Select Time"
            />
          </div>

          {/* 3. Sport Selector */}
          <div className="hp-filter-field min-w-0">
            <label htmlFor="home-sport-select" className="sr-only">
              Sport
            </label>
            <select
              id="home-sport-select"
              value={selectedSportId}
              onChange={(e) => onSelectSport(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none cursor-pointer"
              aria-label="Select Sport"
            >
              <option value="">All sports</option>
              {sports.map((sport) => (
                <option key={sport.id || sport.name} value={sport.id}>
                  {sport.displayName || sport.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Area Selector */}
          <div className="hp-filter-field min-w-0">
            <label htmlFor="home-area-select" className="sr-only">
              Area
            </label>
            <select
              id="home-area-select"
              value={selectedArea}
              onChange={(e) => onSelectArea(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none cursor-pointer"
              aria-label="Select Area"
            >
              {areas.map((area) => (
                <option key={area.id} value={area.value}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Find Venue CTA */}
          <div className="hp-filter-action">
            <button
              type="button"
              onClick={() => onFindVenue?.()}
              className="min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-600 text-gray-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition duration-200 shadow-sm"
            >
              <Search fontSize="small" />
              <span>Find Venue</span>
            </button>
          </div>

          {/* 6. Compact Filter Toggle Button */}
          <div className="hp-filter-action">
            <button
              type="button"
              id="home-filter-toggle"
              aria-expanded={isPanelOpen}
              aria-controls="advanced-filter-panel"
              aria-label="Advanced filters"
              title="Advanced filters"
              onClick={onTogglePanel}
              className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition duration-200 shadow-sm relative ${
                isPanelOpen || activeCount > 0
                  ? 'bg-lime-400 text-slate-900 hover:bg-lime-500 ring-2 ring-lime-400'
                  : 'bg-lime-400 text-slate-900 hover:bg-lime-500'
              }`}
            >
              <Tune fontSize="small" />
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center bg-slate-900 text-lime-400 text-[10px] font-black rounded-full h-4 min-w-[16px] px-0.5">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* 7. Reset Filters Button — icon-only */}
          <div className="hp-filter-action">
            <IconButton
              onClick={onResetFilters}
              title="Reset filters"
              aria-label="Reset filters"
              className="!w-11 !h-11 !rounded-xl !bg-slate-100 dark:!bg-slate-800 hover:!bg-slate-200 dark:hover:!bg-slate-700 !text-slate-700 dark:!text-slate-200 !border !border-slate-200 dark:!border-slate-700"
            >
              <RestartAlt fontSize="small" />
            </IconButton>
          </div>
        </div>

        {/* Helper announcement text */}
        <div className="hp-filter-helper-bar mt-2 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold">Results update instantly</span>
          <span aria-live="polite" className="font-bold text-slate-700 dark:text-slate-300">
            {resultCount} venue{resultCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Advanced Filter Panel */}
        <AnimatePresence initial={false}>
          {isPanelOpen && (
            <motion.div
              id="advanced-filter-panel"
              role="region"
              aria-label="Advanced Filters"
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={reduced ? { duration: 0.1 } : { duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-slate-200 dark:border-slate-800 mt-3 pt-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {/* Distance Filter */}
                <div className="space-y-1.5">
                  <label htmlFor="home-distance-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Distance
                  </label>
                  <select
                    id="home-distance-select"
                    value={distanceKm}
                    disabled={!hasLocation}
                    onChange={(e) => onChangeDistance(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  >
                    <option value="">All distances</option>
                    <option value="2">Within 2 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div className="space-y-1.5">
                  <label htmlFor="home-sort-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Sort By
                  </label>
                  <select
                    id="home-sort-select"
                    value={sortBy}
                    onChange={(e) => onChangeSort(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-lime-400 focus:outline-none"
                  >
                    <option value="nearest" disabled={!hasLocation}>
                      Nearest First {!hasLocation ? '(Location required)' : ''}
                    </option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                {/* Location Action */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nearby Courts
                  </span>
                  <button
                    type="button"
                    onClick={onFetchLocation}
                    disabled={locationStatus === 'loading'}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border transition duration-200 ${
                      hasLocation
                        ? 'bg-slate-900 text-lime-400 border-slate-900 dark:bg-slate-800 dark:border-slate-700'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-lime-500'
                    }`}
                  >
                    <MyLocation className={`text-base ${locationStatus === 'loading' ? 'animate-spin text-lime-400' : ''}`} fontSize="small" />
                    <span>
                      {locationStatus === 'loading'
                        ? 'Locating…'
                        : hasLocation
                          ? 'Location Active ✓'
                          : 'Use my location'}
                    </span>
                  </button>
                </div>
              </div>

              {!hasLocation && (
                <div className="mt-2.5 p-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs flex items-center gap-2">
                  <LocationOff className="text-base shrink-0" fontSize="small" />
                  <span>Enable location to filter by distance and view nearest venues.</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
