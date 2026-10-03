import { AvailabilitySlotReason } from '../constants/apiTypes';

export function resolveSlotReason(slot) {
  if (!slot) return AvailabilitySlotReason.CLOSED;
  if (slot.available) return AvailabilitySlotReason.AVAILABLE;
  const raw = String(slot.reason || '').trim().toUpperCase();
  if (raw === AvailabilitySlotReason.HELD || raw === 'HOLD' || raw === 'PENDING') {
    return AvailabilitySlotReason.HELD;
  }
  if (raw === AvailabilitySlotReason.BLOCKED || raw === 'BLOCK') {
    return AvailabilitySlotReason.BLOCKED;
  }
  if (raw === AvailabilitySlotReason.MAINTENANCE) {
    return AvailabilitySlotReason.MAINTENANCE;
  }
  if (raw === AvailabilitySlotReason.CLOSED) {
    return AvailabilitySlotReason.CLOSED;
  }
  return AvailabilitySlotReason.BOOKED;
}

export function formatSlotReasonLabel(reason) {
  switch (reason) {
    case AvailabilitySlotReason.AVAILABLE:
      return 'Available';
    case AvailabilitySlotReason.HELD:
      return 'Reserved / Held';
    case AvailabilitySlotReason.BLOCKED:
      return 'Blocked';
    case AvailabilitySlotReason.MAINTENANCE:
      return 'Under maintenance';
    case AvailabilitySlotReason.CLOSED:
      return 'Closed';
    case AvailabilitySlotReason.BOOKED:
    default:
      return 'Booked';
  }
}

export function isSlotAvailable(slot) {
  return Boolean(slot && slot.available);
}
