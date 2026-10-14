import dayjs from 'dayjs';

export const formatCurrency = (amount, currency = 'LKR') => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'LKR 0.00';
  return `${currency} ${Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatPrice = formatCurrency;

export const formatDate = (dateStr, formatStr = 'ddd, D MMM YYYY') => {
  if (!dateStr) return '';
  return dayjs(dateStr).format(formatStr);
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  if (Array.isArray(timeStr)) {
    const [h, m] = timeStr;
    return dayjs().hour(h).minute(m || 0).format('hh:mm A');
  }
  if (typeof timeStr === 'string') {
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      return dayjs().hour(Number(parts[0])).minute(Number(parts[1])).format('hh:mm A');
    }
  }
  return String(timeStr);
};

export const formatSlotDuration = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/** Parse "HH:mm" / "HH:mm:ss" / array into minutes since midnight. */
function toMinutes(timeStr) {
  if (timeStr == null) return null;
  if (Array.isArray(timeStr)) {
    return Number(timeStr[0]) * 60 + Number(timeStr[1] || 0);
  }
  if (typeof timeStr === 'string' && timeStr.includes(':')) {
    const [h, m] = timeStr.split(':');
    return Number(h) * 60 + Number(m || 0);
  }
  return null;
}

/**
 * Prefer discrete booking.slots (merging contiguous hours, listing gaps).
 * Fall back to envelope startTime–endTime for legacy bookings.
 */
export const formatBookingTimes = (booking) => {
  if (!booking) return '';
  const slots = Array.isArray(booking.slots) ? [...booking.slots] : [];
  const usable = slots
    .filter((s) => s && s.startTime != null && s.endTime != null)
    .sort((a, b) => (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0));

  if (usable.length > 0) {
    const runs = [];
    let runStart = usable[0].startTime;
    let runEnd = usable[0].endTime;
    for (let i = 1; i < usable.length; i += 1) {
      const next = usable[i];
      const runEndMin = toMinutes(runEnd);
      const nextStartMin = toMinutes(next.startTime);
      const nextEndMin = toMinutes(next.endTime);
      if (runEndMin != null && nextStartMin != null && nextStartMin <= runEndMin) {
        if (nextEndMin != null && nextEndMin > runEndMin) runEnd = next.endTime;
      } else {
        runs.push(formatSlotDuration(runStart, runEnd));
        runStart = next.startTime;
        runEnd = next.endTime;
      }
    }
    runs.push(formatSlotDuration(runStart, runEnd));
    return runs.join(', ');
  }

  if (booking.startTime || booking.endTime) {
    return formatSlotDuration(booking.startTime, booking.endTime);
  }
  return '';
};
