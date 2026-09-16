import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVenue, useVenueAvailability } from '../hooks/useVenues';
import { formatCurrency, formatTime, formatDate } from '../utils/formatters';
import dayjs from 'dayjs';
import {
  CalendarMonth,
  AccessTime,
  SportsTennis,
  ArrowForward,
} from '@mui/icons-material';
import {
  Button,
  Skeleton,
  Alert,
} from '@mui/material';

export default function ChooseSlotPage() {
  const { venueId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCourt = searchParams.get('courtId') || '';
  const [selectedCourtId, setSelectedCourtId] = useState(initialCourt);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [selectedSlots, setSelectedSlots] = useState([]);

  const { data: venue, isLoading: venueLoading } = useVenue(venueId);
  const {
    data: availability = [],
    isLoading: slotsLoading,
    error: slotsError,
  } = useVenueAvailability(venueId, selectedDate, selectedCourtId);

  // Auto-select first court if not set
  useEffect(() => {
    if (venue?.courts?.length > 0 && !selectedCourtId) {
      setSelectedCourtId(String(venue.courts[0].id));
    }
  }, [venue, selectedCourtId]);

  // Generate next 7 days for the date strip
  const dateStrip = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      dates.push({
        fullDate: d.format('YYYY-MM-DD'),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.format('ddd'),
        dateNum: d.format('D MMM'),
      });
    }
    return dates;
  }, []);

  const handleSlotToggle = (slot) => {
    if (!slot.available) return;
    const isSelected = selectedSlots.some(
      (s) => s.courtId === slot.courtId && s.startTime === slot.startTime
    );

    if (isSelected) {
      setSelectedSlots(
        selectedSlots.filter(
          (s) => !(s.courtId === slot.courtId && s.startTime === slot.startTime)
        )
      );
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  }, [selectedSlots]);

  const handleProceedToCheckout = () => {
    if (selectedSlots.length === 0) return;
    navigate('/checkout', {
      state: {
        venueId,
        venueName: venue?.name,
        date: selectedDate,
        courtId: selectedCourtId,
        courtName: venue?.courts?.find((c) => String(c.id) === String(selectedCourtId))?.name,
        slots: selectedSlots,
        totalPrice,
      },
    });
  };

  if (venueLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton variant="rectangular" height={100} className="rounded-2xl" />
        <Skeleton variant="rectangular" height={300} className="rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to={`/venues/${venueId}`} className="hover:text-navy-900 transition-colors">
            {venue?.name || 'Venue'}
          </Link>
          <span>/</span>
          <span className="text-navy-900 font-semibold">Choose Slots</span>
        </div>

        {/* Venue Quick Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-navy-900">{venue?.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{venue?.address}, {venue?.city}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-lime-100 text-lime-800">
              {venue?.sportType || 'Multi-Sport'}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
              {venue?.courts?.length || 0} Courts Available
            </span>
          </div>
        </div>

        {/* Step 1: Select Court */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <SportsTennis className="text-lime-600" />
            1. Select Court
          </h2>
          <div className="flex flex-wrap gap-3">
            {venue?.courts?.map((court) => {
              const isSelected = String(court.id) === String(selectedCourtId);
              return (
                <button
                  key={court.id}
                  onClick={() => {
                    setSelectedCourtId(String(court.id));
                    setSelectedSlots([]);
                  }}
                  className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all border text-left ${
                    isSelected
                      ? 'bg-navy-900 text-white border-navy-900 shadow-md scale-[1.02]'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold">{court.name}</div>
                  <div className={`text-xs ${isSelected ? 'text-lime-400' : 'text-slate-500'}`}>
                    {court.courtType || 'Standard'} • {court.surfaceType || 'Hard'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: 7-Day Date Strip */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <CalendarMonth className="text-lime-600" />
            2. Select Date
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {dateStrip.map((item) => {
              const isSelected = item.fullDate === selectedDate;
              return (
                <button
                  key={item.fullDate}
                  onClick={() => {
                    setSelectedDate(item.fullDate);
                    setSelectedSlots([]);
                  }}
                  className={`py-3 px-2 rounded-2xl text-center transition-all border ${
                    isSelected
                      ? 'bg-lime-400 text-navy-900 border-lime-500 font-bold shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs uppercase tracking-wider opacity-80">{item.dayName}</div>
                  <div className="text-base font-extrabold mt-0.5">{item.dateNum}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Available Time Slots */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <AccessTime className="text-lime-600" />
                3. Choose Available Slots
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any slot to select. You can select multiple consecutive hours.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-lime-400 border border-lime-500 inline-block"></span>
                Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-slate-300 inline-block"></span>
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block"></span>
                Booked / Past
              </span>
            </div>
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={64} className="rounded-2xl" />
              ))}
            </div>
          ) : slotsError ? (
            <Alert severity="error" className="rounded-2xl">
              Failed to load time slots for this date. Please try another day.
            </Alert>
          ) : availability.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AccessTime sx={{ fontSize: 48, opacity: 0.3 }} />
              <p className="mt-2 text-sm font-medium">No slots scheduled for this court on {formatDate(selectedDate)}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {availability.map((slot, idx) => {
                const isSelected = selectedSlots.some(
                  (s) => s.courtId === slot.courtId && s.startTime === slot.startTime
                );
                const isAvailable = slot.available;

                return (
                  <button
                    key={`${slot.courtId}-${slot.startTime}-${idx}`}
                    disabled={!isAvailable}
                    onClick={() => handleSlotToggle(slot)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-lime-400 border-lime-500 text-navy-900 shadow-md font-bold scale-[1.02]'
                        : isAvailable
                        ? 'bg-white border-slate-200 hover:border-navy-900 text-slate-800 hover:shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="text-sm font-bold">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div className="text-xs mt-1 font-semibold">
                      {isAvailable ? formatCurrency(slot.price) : 'Unavailable'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Bar when slots are selected */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy-900 text-white p-4 border-t border-navy-800 shadow-2xl z-40">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-lime-400 text-navy-900 flex items-center justify-center font-black">
                {selectedSlots.length}
              </div>
              <div>
                <div className="text-xs text-slate-400">
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected ({formatDate(selectedDate)})
                </div>
                <div className="text-xl font-extrabold text-lime-400">
                  Total: {formatCurrency(totalPrice)}
                </div>
              </div>
            </div>

            <Button
              variant="contained"
              onClick={handleProceedToCheckout}
              endIcon={<ArrowForward />}
              sx={{
                backgroundColor: '#84cc16',
                color: '#061032',
                fontWeight: '800',
                px: 4,
                py: 1.5,
                borderRadius: '16px',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#65a30d',
                },
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
