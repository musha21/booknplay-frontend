export const PAYMENT_GATEWAY = String(import.meta.env.VITE_PAYMENT_GATEWAY || 'DUMMY').toUpperCase();

export const isDummyPayment = PAYMENT_GATEWAY === 'DUMMY';
