/**
 * BookNPlay API Constants & JSDoc type definitions
 * Mirrors the Spring Boot backend DTOs exactly.
 */

/* ── Enums ── */

/** @readonly */
export const BookingStatus = /** @type {const} */ ({
  PENDING:   'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW:   'NO_SHOW',
});

/** @readonly */
export const PaymentStatus = /** @type {const} */ ({
  PENDING:   'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  REFUNDED:  'REFUNDED',
  PARTIAL:   'PARTIAL',
});

/** @readonly */
export const CourtStatus = /** @type {const} */ ({
  ACTIVE:      'ACTIVE',
  INACTIVE:    'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
});

/** @readonly */
export const VenueStatus = /** @type {const} */ ({
  ACTIVE:   'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING:  'PENDING',
});

/* ── JSDoc Types (used as documentation; no runtime cost) ── */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {string}  message
 * @property {*}       data
 */

/**
 * @typedef {Object} PageResponse
 * @property {Array}   content
 * @property {number}  totalElements
 * @property {number}  totalPages
 * @property {number}  number        - current page (0-indexed)
 * @property {number}  size
 * @property {boolean} last
 */

/**
 * @typedef {Object} SportResponse
 * @property {string}  id
 * @property {string}  name
 */

/**
 * @typedef {Object} CourtResponse
 * @property {string}     id
 * @property {string}     venueId
 * @property {string}     venueName
 * @property {string}     sportId
 * @property {string}     sportName
 * @property {string}     name
 * @property {number}     hourlyRate
 * @property {CourtStatus} status
 */

/**
 * @typedef {Object} VenueResponse
 * @property {string}         id
 * @property {string}         name
 * @property {string}         address
 * @property {string}         city
 * @property {number}         latitude
 * @property {number}         longitude
 * @property {string}         description
 * @property {VenueStatus}    status
 * @property {CourtResponse[]} courts
 */

/**
 * @typedef {Object} AvailabilitySlotResponse
 * @property {string}  startTime  - "HH:mm:ss"
 * @property {string}  endTime    - "HH:mm:ss"
 * @property {boolean} available
 * @property {number}  price
 * @property {string}  currency
 * @property {string}  reason     - "BOOKED" | "MAINTENANCE" | "CLOSED" | "BLOCKED"
 */

/**
 * @typedef {Object} AvailabilityResponse
 * @property {string}                   date       - "YYYY-MM-DD"
 * @property {string}                   courtId
 * @property {string}                   courtName
 * @property {string}                   venueId
 * @property {string}                   venueName
 * @property {string}                   sportName
 * @property {AvailabilitySlotResponse[]} slots
 */

/**
 * @typedef {Object} BookingResponse
 * @property {string}        id
 * @property {string}        bookingRef
 * @property {string}        customerId
 * @property {string}        customerName
 * @property {string}        venueId
 * @property {string}        venueName
 * @property {string}        courtId
 * @property {string}        courtName
 * @property {string}        sportId
 * @property {string}        sportName
 * @property {string}        date        - "YYYY-MM-DD"
 * @property {string}        startTime   - "HH:mm:ss"
 * @property {string}        endTime     - "HH:mm:ss"
 * @property {number}        totalAmount
 * @property {string}        currency
 * @property {BookingStatus} status
 * @property {PaymentStatus} paymentStatus
 * @property {string}        createdAt   - ISO datetime
 */

/**
 * @typedef {Object} BookingCreateRequest
 * @property {string} courtId
 * @property {string} sportId
 * @property {string} date        - "YYYY-MM-DD"
 * @property {string} startTime   - "HH:mm:ss"
 * @property {string} endTime     - "HH:mm:ss"
 */

/**
 * @typedef {Object} PaymentResponse
 * @property {string}        id
 * @property {string}        bookingId
 * @property {string}        bookingRef
 * @property {number}        amount
 * @property {string}        currency
 * @property {string}        paymentGateway
 * @property {string}        gatewayReference
 * @property {PaymentStatus} status
 * @property {string}        paymentUrl
 * @property {string}        createdAt
 */

/**
 * @typedef {Object} InvoiceResponse
 * @property {string} id
 * @property {string} invoiceNumber
 * @property {string} bookingId
 * @property {string} bookingRef
 * @property {string} customerName
 * @property {string} customerEmail
 * @property {string} venueName
 * @property {string} courtName
 * @property {number} totalAmount
 * @property {string} status
 * @property {string} issuedAt
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {string} tokenType
 */

/**
 * @typedef {Object} CustomerResponse
 * @property {string} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 */

/**
 * @typedef {Object} CustomerRegisterRequest
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} phone
 * @property {string} password
 */

/**
 * @typedef {Object} CustomerLoginRequest
 * @property {string} email
 * @property {string} password
 */
