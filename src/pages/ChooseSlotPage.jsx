import { createElement, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useVenue, useVenueAvailability, useVenueReviews } from '../hooks/useVenues';
import { formatCurrency, formatTime, formatDate } from '../utils/formatters';
import { saveBookingIntent } from '../utils/bookingIntent';
import { resourceLabelForCourt } from '../utils/courtResource';
import { sportIcon, venueDisplayAddress, venueGoogleMapsUrl } from '../utils/venue';
import { formatSlotReasonLabel, resolveSlotReason } from '../utils/availability';
import { AvailabilitySlotReason } from '../constants/apiTypes';
import { rememberVenue } from '../utils/recentlyViewed';
import useAuthStore from '../stores/authStore';
import useFavoritesStore from '../stores/favoritesStore';
import VenueMap from '../components/maps/VenueMap';
import SlingButton from '../components/ui/SlingButton';
import { buttonPress, fadeUp, reducedFade, staggerContainer } from '../motion/variants';
import dayjs from 'dayjs';
import {
  CalendarMonth,
  AccessTime,
  Favorite,
  FavoriteBorder,
  LocationOn,
  Schedule,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const BOOKABLE_DAYS = 30;
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function buildMonthCalendar(days) {
  if (!days.length) return { leadingBlanks: 0, cells: [], monthLabels: [] };

  const leadingBlanks = dayjs(days[0].fullDate).day();
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...days,
  ];

  const monthLabels = [];
  days.forEach((day) => {
    const label = dayjs(day.fullDate).format('MMMM YYYY');
    if (!monthLabels.includes(label)) monthLabels.push(label);
  });

  return { leadingBlanks, cells, monthLabels };
}

export default function ChooseSlotPage() {
  const { venueId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();

  const initialCourt = searchParams.get('courtId') || '';
  const requestedDate = searchParams.get('date');
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourt);
  const [selectedDate, setSelectedDate] = useState(
    requestedDate && dayjs(requestedDate).isValid() ? dayjs(requestedDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [conflictNotice, setConflictNotice] = useState(location.state?.bookingConflict || '');
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [pulling, setPulling] = useState(false);

  const { data: venue, isLoading: venueLoading } = useVenue(venueId);
  const reviewsQuery = useVenueReviews(venueId);
  const isCustomer = useAuthStore((state) => state.isAuthenticated && state.role === 'CUSTOMER');
  const saved = useFavoritesStore((state) => state.isFavorite(venueId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const effectiveCourtId = selectedCourtId || String(venue?.courts?.[0]?.id || '');
  const selectedCourt = venue?.courts?.find((court) => String(court.id) === String(effectiveCourtId)) || venue?.courts?.[0];
  const selectedResourceLabel = resourceLabelForCourt(selectedCourt);
  const selectedSportName = selectedCourt?.sportName || selectedCourt?.sport?.name || venue?.sportName;

  useEffect(() => {
    if (venueId) rememberVenue(venueId);
  }, [venueId]);

  const {
    data: availability = [],
    isLoading: slotsLoading,
    error: slotsError,
  } = useVenueAvailability(venueId, selectedDate, effectiveCourtId);

  const dateOptions = useMemo(() => {
    const dates = [];
    for (let i = 0; i < BOOKABLE_DAYS; i++) {
      const d = dayjs().add(i, 'day');
      dates.push({
        fullDate: d.format('YYYY-MM-DD'),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.format('ddd'),
        dateNum: d.format('D'),
        monthShort: d.format('MMM'),
        isToday: i === 0,
      });
    }
    return dates;
  }, []);

  const calendar = useMemo(() => buildMonthCalendar(dateOptions), [dateOptions]);

  const handleSlotToggle = (slot) => {
    if (!slot.available) return;
    const slotCourtId = slot.courtId || effectiveCourtId;
    const isSelected = selectedSlots.some(
      (s) => s.courtId === slotCourtId && s.startTime === slot.startTime
    );
    setSelectedSlots(
      isSelected
        ? selectedSlots.filter((s) => !(s.courtId === slotCourtId && s.startTime === slot.startTime))
        : [...selectedSlots, { ...slot, courtId: slotCourtId }]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [selectedSlots]);

  const handleProceedToCheckout = () => {
    if (selectedSlots.length === 0) return;
    const intent = {
      venueId,
      venueName: venue?.name,
      date: selectedDate,
      courtId: effectiveCourtId,
      courtName: selectedCourt?.name,
      resourceLabel: selectedResourceLabel,
      sportId: selectedCourt?.sportId,
      sportName: selectedCourt?.sportName || venue?.sportName,
      slots: selectedSlots.map((slot) => ({
        ...slot,
        courtId: slot.courtId || effectiveCourtId,
        sportId: slot.sportId || selectedCourt?.sportId,
      })),
      totalPrice,
    };
    saveBookingIntent(intent);
    if (!isCustomer) {
      navigate('/auth/login', {
        state: { from: { pathname: '/checkout', state: intent }, reason: 'booking' },
      });
      return;
    }
    navigate('/checkout', { state: intent });
  };

  if (venueLoading) {
    return (
      <main className="page-shell py-5">
        <div className="section-container space-y-4">
          <Skeleton variant="rounded" height={72} className="!bg-surface" />
          <Skeleton variant="rounded" height={280} className="!bg-surface" />
        </div>
      </main>
    );
  }

  const enter = reduced ? reducedFade : fadeUp;
  const hasSelection = selectedSlots.length > 0;
  const address = venue ? venueDisplayAddress(venue) : '';
  const mapsUrl = venue ? venueGoogleMapsUrl(venue) : '';
  const hours = [...(venue?.operatingHours || [])].sort(
    (a, b) => DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek)
  );
  const reviews = reviewsQuery.data || [];
  const previewReviews = reviews.slice(0, 3);
  const hasMoreReviews = reviews.length > 3;
  const hasAmenities = venue?.amenities?.length > 0;
  const hasRules = Boolean(venue?.rules?.length || venue?.additionalRules);

  return (
    <main className={`page-shell py-5 ${hasSelection ? 'pb-32' : 'pb-8'}`}>
      <div className="section-container space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Link to="/#venues" className="transition-colors hover:text-ink">
            Venues
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">{venue?.name || 'Choose Slots'}</span>
        </div>

        <motion.div
          variants={enter}
          initial="hidden"
          animate="show"
          className="customer-panel flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center"
        >
          <div>
            <h1 className="customer-page-title !text-2xl">{venue?.name}</h1>
            <p className="customer-body mt-0.5 !text-sm">{address || `${venue?.address || ''}${venue?.city ? `, ${venue.city}` : ''}`}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip-lime">
              {venue?.sportName || venue?.venueType || 'Multi-Sport'}
            </span>
            <span className="chip-navy">
              {venue?.courts?.length || 0} Bookable Spaces Available
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-sm font-bold text-ink transition hover:border-navy-400"
              onClick={() => {
                if (!isCustomer) {
                  navigate('/auth/login', {
                    state: { from: { pathname: `/venues/${venueId}/slots` }, reason: 'favourite' },
                  });
                  return;
                }
                toggleFavorite(venueId, venue?.name);
              }}
            >
              {saved ? <Favorite className="text-lime-600" fontSize="small" /> : <FavoriteBorder fontSize="small" />}
              {saved ? 'Saved' : 'Save favourite'}
            </button>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] md:items-start">
          <div className="space-y-4">
            <motion.div
              variants={enter}
              initial="hidden"
              animate="show"
              className="customer-panel space-y-2.5 p-4"
            >
              <h2 className="customer-step-label !text-sm">
                {createElement(sportIcon(selectedSportName), { className: 'text-lime-600', fontSize: 'small' })}
                1. Select {selectedResourceLabel}
              </h2>
              <div className="flex flex-col gap-2">
                {venue?.courts?.map((court) => {
                  const isSelected = String(court.id) === String(effectiveCourtId);
                  const CourtIcon = sportIcon(court.sportName || court.sport?.name || venue?.sportName);
                  return (
                    <motion.button
                      key={court.id}
                      type="button"
                      whileTap={reduced ? undefined : buttonPress}
                      onClick={() => {
                        setSelectedCourtId(String(court.id));
                        setSelectedSlots([]);
                      }}
                      className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-all ${
                        isSelected
                          ? 'border-navy-900 bg-navy-900 text-white shadow-sm'
                          : 'border-line bg-canvas text-ink hover:border-navy-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CourtIcon fontSize="small" className={isSelected ? 'text-lime-400' : 'text-lime-600'} />
                        <span className="font-bold">{court.name}</span>
                      </div>
                      <div className={`mt-0.5 text-[11px] ${isSelected ? 'text-lime-400' : 'text-muted'}`}>
                        {resourceLabelForCourt(court)} • {court.sportName || court.surfaceType || 'Standard'}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              variants={enter}
              initial="hidden"
              animate="show"
              className="customer-panel space-y-2.5 p-4"
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="customer-step-label !text-sm">
                    <CalendarMonth className="text-lime-600" fontSize="small" />
                    2. Select Date
                  </h2>
                  <p className="mt-0.5 text-sm font-semibold text-ink">
                    {dayjs(selectedDate).format('ddd, D MMM')}
                  </p>
                </div>
                <p className="text-[11px] text-muted">
                  Next {BOOKABLE_DAYS} days
                </p>
              </div>

              <div
                className="grid max-w-[280px] grid-cols-7 gap-1"
                role="grid"
                aria-label="Bookable dates"
              >
                {WEEKDAY_LABELS.map((label, index) => (
                  <div
                    key={`${WEEKDAY_FULL[index]}-${index}`}
                    title={WEEKDAY_FULL[index]}
                    className="flex h-6 items-center justify-center text-[10px] font-semibold uppercase text-muted"
                  >
                    {label}
                  </div>
                ))}
                {calendar.cells.map((item, index) => {
                  if (!item) {
                    return <div key={`blank-${index}`} className="h-8 w-8" aria-hidden="true" />;
                  }
                  const isSelected = item.fullDate === selectedDate;
                  return (
                    <motion.button
                      key={item.fullDate}
                      type="button"
                      role="gridcell"
                      aria-selected={isSelected}
                      aria-label={`${item.dayName} ${item.dateNum} ${item.monthShort}`}
                      whileHover={reduced || isSelected ? undefined : { scale: 1.06 }}
                      whileTap={reduced ? undefined : buttonPress}
                      onClick={() => {
                        setSelectedDate(item.fullDate);
                        setSelectedSlots([]);
                      }}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors ${
                        isSelected
                          ? 'border-lime-500 bg-lime-400 font-bold text-navy-900 shadow-sm'
                          : item.isToday
                            ? 'border-lime-300 bg-canvas font-bold text-ink hover:border-navy-400 hover:bg-surface'
                            : 'border-transparent bg-canvas text-ink hover:border-navy-400 hover:bg-surface'
                      }`}
                    >
                      {item.dateNum}
                      {item.isToday && !isSelected && (
                        <span
                          className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-lime-500"
                          aria-hidden="true"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {calendar.monthLabels.length > 1 && (
                <p className="text-[11px] text-muted">{calendar.monthLabels.join(' / ')}</p>
              )}
            </motion.div>
          </div>

          <motion.div
            variants={enter}
            initial="hidden"
            animate="show"
            className="customer-panel space-y-3 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="customer-step-label !text-sm">
                  <AccessTime className="text-lime-600" fontSize="small" />
                  3. Choose Available Slots
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Select any available hours — gaps are fine.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded border border-lime-500 bg-lime-400" />
                  Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded border border-line bg-surface" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded border border-amber-400 bg-amber-100" />
                  Held
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded border border-line bg-canvas" />
                  Booked / Past
                </span>
              </div>
            </div>
            {conflictNotice && (
              <Alert
                severity="error"
                className="!rounded-2xl !border !border-line"
                onClose={() => setConflictNotice('')}
              >
                {conflictNotice}
              </Alert>
            )}

            {slotsLoading ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} className="!bg-canvas" />
                ))}
              </div>
            ) : slotsError ? (
              <Alert severity="error" className="!rounded-2xl !border !border-line">
                Failed to load time slots for this date. Please try another day.
              </Alert>
            ) : availability.length === 0 ? (
              <div className="py-10 text-center text-muted">
                <AccessTime sx={{ fontSize: 40, opacity: 0.3 }} />
                <p className="mt-2 text-sm font-medium">
                  No slots scheduled for this {selectedResourceLabel.toLowerCase()} on {formatDate(selectedDate)}.
                </p>
              </div>
            ) : (
              <motion.div
                key={`${effectiveCourtId}-${selectedDate}`}
                variants={reduced ? undefined : staggerContainer(0.03)}
                initial={reduced ? false : 'hidden'}
                animate={reduced ? undefined : 'show'}
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              >
                {availability.map((slot, idx) => {
                  const isSelected = selectedSlots.some(
                    (s) => s.courtId === slot.courtId && s.startTime === slot.startTime
                  );
                  const isAvailable = slot.available;
                  const reason = resolveSlotReason(slot);
                  const isHeld = !isAvailable && reason === AvailabilitySlotReason.HELD;
                  const unavailableLabel = isAvailable
                    ? formatCurrency(slot.price)
                    : formatSlotReasonLabel(reason);

                  return (
                    <motion.button
                      key={`${slot.courtId}-${slot.startTime}-${idx}`}
                      type="button"
                      variants={reduced ? undefined : fadeUp}
                      layout={!reduced}
                      disabled={!isAvailable}
                      whileHover={reduced || !isAvailable || isSelected ? undefined : { y: -2 }}
                      whileTap={reduced || !isAvailable ? undefined : buttonPress}
                      animate={
                        reduced
                          ? undefined
                          : isSelected
                            ? { scale: 1.02 }
                            : { scale: 1 }
                      }
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      onClick={() => handleSlotToggle(slot)}
                      className={`rounded-xl border p-3 text-center transition-colors ${
                        isSelected
                          ? 'border-lime-500 bg-lime-400 font-bold text-navy-900 shadow-sm'
                          : isAvailable
                            ? 'border-line bg-surface text-ink hover:border-navy-900 hover:shadow-sm'
                            : isHeld
                              ? 'cursor-not-allowed border-amber-300 bg-amber-50 text-amber-900 opacity-90'
                              : 'cursor-not-allowed border-line bg-canvas text-muted opacity-60'
                      }`}
                    >
                      <div className="text-sm font-bold">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      <div className="mt-0.5 text-xs font-semibold">
                        {unavailableLabel}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>

        {venue && (
          <motion.section
            variants={enter}
            initial="hidden"
            animate="show"
            className="grid gap-4 lg:grid-cols-[1fr_300px]"
            aria-label="Venue information"
          >
            <div className="customer-panel space-y-6 p-4 sm:p-5">
              {hasAmenities && (
                <div>
                  <h2 className="customer-card-title">Amenities</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {venue.amenities.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </div>
                </div>
              )}
              {hasRules && (
                <div>
                  <h2 className="customer-card-title">House rules</h2>
                  <ul className="customer-body mt-3 list-disc space-y-1 pl-5">
                    {(venue.rules || []).map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                  {venue.additionalRules && (
                    <p className="customer-body mt-3">{venue.additionalRules}</p>
                  )}
                </div>
              )}
              <div>
                <h2 className="customer-card-title">Reviews</h2>
                {reviews.length === 0 ? (
                  <p className="customer-body mt-3">No public reviews yet.</p>
                ) : (
                  <>
                    <ul className="mt-4 space-y-3">
                      {previewReviews.map((review) => (
                        <li key={review.id} className="rounded-2xl border border-line p-4">
                          <p className="font-bold">
                            {review.customerName} · {review.rating}/5
                          </p>
                          {review.comment ? (
                            <p className="customer-body mt-1">{review.comment}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                    {hasMoreReviews && (
                      <Button
                        type="button"
                        variant="text"
                        className="!mt-3 !font-bold !normal-case"
                        onClick={() => setReviewsOpen(true)}
                      >
                        View all reviews ({reviews.length})
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="customer-panel overflow-hidden p-0">
                <VenueMap
                  className="h-56 w-full"
                  venues={[venue]}
                  selectedId={venue.id}
                  center={{ lat: venue.latitude, lng: venue.longitude }}
                  zoom={15}
                />
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-5 py-3 text-sm font-bold text-lime-700"
                  >
                    Open in Google Maps
                  </a>
                )}
              </div>
              <div className="customer-panel p-5">
                <h2 className="customer-card-title">Venue details</h2>
                <dl className="customer-body mt-4 space-y-4 !text-sm">
                  <div className="flex gap-3">
                    <LocationOn className="shrink-0 text-lime-600" />
                    <div>
                      <dt className="font-bold text-ink">Location</dt>
                      <dd className="text-muted">{address || 'Address not published yet.'}</dd>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Schedule className="shrink-0 text-lime-600" />
                    <div>
                      <dt className="font-bold text-ink">Opening hours</dt>
                      <dd className="text-muted">
                        {hours.length
                          ? hours.map((row) => (
                              <div key={row.id || row.dayOfWeek}>
                                {String(row.dayOfWeek).slice(0, 3)}{' '}
                                {row.closed
                                  ? 'Closed'
                                  : `${formatTime(row.openTime)} – ${formatTime(row.closeTime)}`}
                              </div>
                            ))
                          : 'Hours not published yet.'}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </aside>
          </motion.section>
        )}
      </div>

      <Dialog
        open={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { className: '!rounded-[18px] !border !border-line !bg-surface' } }}
      >
        <DialogTitle className="customer-card-title">All reviews</DialogTitle>
        <DialogContent>
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-2xl border border-line p-4">
                <p className="font-bold">
                  {review.customerName} · {review.rating}/5
                </p>
                {review.comment ? (
                  <p className="customer-body mt-1">{review.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions className="!border-t !border-line !px-6 !py-4">
          <Button onClick={() => setReviewsOpen(false)} className="!font-bold !normal-case">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AnimatePresence>
        {hasSelection && (
          <motion.div
            key="checkout-bar"
            initial={reduced ? { opacity: 0 } : { y: 48, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="slot-checkout-bar fixed inset-x-0 bottom-0 z-40 border-t border-navy-800 bg-navy-900 p-4 text-white shadow-2xl"
          >
            <div className="section-container flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <motion.div
                  key={selectedSlots.length}
                  initial={reduced ? false : { scale: 0.85 }}
                  animate={{ scale: 1 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 font-black text-navy-900"
                >
                  {selectedSlots.length}
                </motion.div>
                <div>
                  <div className="text-xs text-muted">
                    {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected ({formatDate(selectedDate)})
                  </div>
                  <div className="text-xl font-extrabold text-lime-400">
                    Total: {formatCurrency(totalPrice)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-base font-extrabold text-lime-400">
                    {pulling ? 'Ready to play' : isCustomer ? 'Continue to checkout' : 'Sign in to book'}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Hold & pull</span>
                </div>
                <SlingButton
                  onSend={handleProceedToCheckout}
                  onPullStateChange={({ held }) => setPulling(held)}
                  padColor="#84cc16"
                  iconColor="#061032"
                  accentColor="#bef264"
                  wellColor="#0b1220"
                  bandColor="#334155"
                  size={56}
                  axis="horizontal"
                  tapSends
                  ariaLabel={
                    pulling ? 'Ready to play' : isCustomer ? 'Continue to checkout' : 'Sign in to book'
                  }
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
