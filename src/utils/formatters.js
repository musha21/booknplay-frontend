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
