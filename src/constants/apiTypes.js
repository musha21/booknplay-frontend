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
  FAILED:    'FAILED',
});

/** @readonly */
export const PaymentStatus = /** @type {const} */ ({
  INITIATED:          'INITIATED',
  PROCESSING:         'PROCESSING',
  SUCCESS:            'SUCCESS',
  FAILED:             'FAILED',
  REFUNDED:           'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  PAID:               'PAID',
});

/** @readonly */
export const CourtStatus = /** @type {const} */ ({
  ACTIVE:      'ACTIVE',
  INACTIVE:    'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
});

/** @readonly */
export const VenueStatus = /** @type {const} */ ({
  DRAFT:            'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED:         'APPROVED',
  ACTIVE:           'ACTIVE',
  REJECTED:         'REJECTED',
  SUSPENDED:        'SUSPENDED',
  INACTIVE:         'INACTIVE',
  DELETED:          'DELETED',
});

/**
 * Backend availability derivation rule:
 * An interval on a court is marked unavailable (available: false) if ANY of the following overlap:
 * - CONFIRMED / COMPLETED booking -> 'BOOKED'
 * - PENDING booking / active reservation hold -> 'HELD'
 * - Owner operational block -> 'BLOCKED'
 * - Scheduled maintenance window -> 'MAINTENANCE'
 * - Outside operating hours -> 'CLOSED'
 *
 * Sibling courts in the same venue are strictly isolated; a block or booking on Court A
 * never affects the availability of Court B.
 *
 * @readonly
 */
export const AvailabilitySlotReason = /** @type {const} */ ({
  AVAILABLE:   'AVAILABLE',
  BOOKED:      'BOOKED',
  HELD:        'HELD',
  BLOCKED:     'BLOCKED',
  MAINTENANCE: 'MAINTENANCE',
  CLOSED:      'CLOSED',
});

/**
 * Business-owner platform subscription plan codes.
 * TRIAL is auto-granted for 90 days on business registration.
 * STARTER / GROWTH / PRO are paid catalog plans with admin-editable limits.
 * @readonly
 */
export const PlanCode = /** @type {const} */ ({
  TRIAL:   'TRIAL',
  STARTER: 'STARTER',
  GROWTH:  'GROWTH',
  PRO:     'PRO',
});

/**
 * API error code when a mutate is blocked by plan entitlements (HTTP 403).
 * @readonly
 */
export const ApiErrorCode = /** @type {const} */ ({
  PLAN_LIMIT: 'PLAN_LIMIT',
});

/**
 * Business-owner platform subscription lifecycle.
 * @readonly
 */
export const SubscriptionStatus = /** @type {const} */ ({
  TRIALING:  'TRIALING',
  ACTIVE:    'ACTIVE',
  PAST_DUE:  'PAST_DUE',
  EXPIRED:   'EXPIRED',
  CANCELED:  'CANCELED',
});

/**
 * Access reason surfaced by GET /owner/subscription.
 * @readonly
 */
export const SubscriptionAccessReason = /** @type {const} */ ({
  TRIAL_ACTIVE:  'TRIAL_ACTIVE',
  TRIAL_ENDING:  'TRIAL_ENDING',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
  SUBSCRIBED:    'SUBSCRIBED',
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
 * @property {string}     [courtType] - Optional display label such as Court, Pitch, Table, or Lane
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
 * @typedef {Object} BookingSlotResponse
 * @property {string} startTime - "HH:mm:ss"
 * @property {string} endTime   - "HH:mm:ss"
 * @property {number} [price]
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
 * @property {BookingSlotResponse[]} [slots] - discrete hours (gaps allowed)
 * @property {number}        totalAmount
 * @property {string}        currency
 * @property {BookingStatus} status
 * @property {PaymentStatus} paymentStatus
 * @property {string}        createdAt   - ISO datetime
 */

/**
 * @typedef {Object} SlotSelectionRequest
 * @property {string} startTime - "HH:mm:ss"
 * @property {string} endTime   - "HH:mm:ss"
 */

/**
 * @typedef {Object} BookingCreateRequest
 * @property {string} courtId
 * @property {string} sportId
 * @property {string} date        - "YYYY-MM-DD"
 * @property {string} [startTime] - "HH:mm:ss" legacy continuous start
 * @property {string} [endTime]   - "HH:mm:ss" legacy continuous end
 * @property {SlotSelectionRequest[]} [slots] - discrete hours (gaps allowed)
 */

/**
 * @typedef {Object} BookingQuoteResponse
 * @property {number} totalAmount
 * @property {number} payNow
 * @property {number} balanceDue
 * @property {'AT_VENUE'|'ONLINE_BEFORE_START'} balanceCollection
 * @property {string} currency
 * @property {boolean} cancellationAllowed
 * @property {string|null} cancellationDeadline
 * @property {string} afterDeadlineSummary
 * @property {string} noShowSummary
 * @property {number} policyVersion
 */

/**
 * @typedef {Object} CancellationPreviewResponse
 * @property {boolean} eligible
 * @property {number} amountPaid
 * @property {number} cancellationFee
 * @property {number} refundAmount
 * @property {string} refundMethod
 * @property {string|null} deadline
 * @property {string} message
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
 * @property {string} verificationToken
 */

/**
 * @typedef {Object} CustomerLoginRequest
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} password
 */

/**
 * @typedef {Object} OtpRequestDto
 * @property {string} phone
 */

/**
 * @typedef {Object} OtpVerifyRequest
 * @property {string} phone
 * @property {string} otp
 */

/**
 * @typedef {Object} PhoneRegisterRequest
 * @property {string} verificationToken
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 */

/**
 * New-user branch of POST /auth/otp/verify (existing users get AuthResponse instead).
 * @typedef {Object} OtpVerifyResponse
 * @property {boolean} [verified]
 * @property {boolean} [registrationRequired]
 * @property {string} [verificationToken]
 */

/**
 * @typedef {Object} SubscriptionAccess
 * @property {boolean} canMutate
 * @property {'TRIAL_ACTIVE'|'TRIAL_ENDING'|'TRIAL_EXPIRED'|'SUBSCRIBED'} reason
 */

/**
 * @typedef {Object} PlanLimits
 * @property {number|null} [maxVenues] null = unlimited
 * @property {number|null} [maxCourtsPerVenue] null = unlimited
 * @property {boolean} [calendarEnabled]
 * @property {boolean} [walkInEnabled]
 * @property {boolean} [earningsEnabled]
 * @property {boolean} [reportsEnabled]
 * @property {boolean} [advancedReportsEnabled]
 */

/**
 * @typedef {Object} SubscriptionUsage
 * @property {number} [venueCount]
 */

/**
 * @typedef {Object} SubscriptionResponse
 * @property {string} businessId
 * @property {'TRIAL'|'STARTER'|'GROWTH'|'PRO'} planCode
 * @property {'TRIALING'|'ACTIVE'|'PAST_DUE'|'EXPIRED'|'CANCELED'} status
 * @property {string} [trialStartsAt]
 * @property {string} [trialEndsAt]
 * @property {string} [currentPeriodStart]
 * @property {string} [currentPeriodEnd]
 * @property {boolean} [cancelAtPeriodEnd]
 * @property {number} [daysRemaining]
 * @property {SubscriptionAccess} [access]
 * @property {PlanLimits} [limits]
 * @property {SubscriptionUsage} [usage]
 */

/**
 * @typedef {Object} SubscriptionPlanResponse
 * @property {'STARTER'|'GROWTH'|'PRO'|string} code
 * @property {string} name
 * @property {string} description
 * @property {number} priceMonthly
 * @property {number} [priceYearly]
 * @property {string} currency
 * @property {boolean} [highlighted]
 * @property {string[]} [features]
 * @property {number} [sortOrder]
 * @property {boolean} [active]
 * @property {number|null} [maxVenues]
 * @property {number|null} [maxCourtsPerVenue]
 * @property {boolean} [calendarEnabled]
 * @property {boolean} [walkInEnabled]
 * @property {boolean} [earningsEnabled]
 * @property {boolean} [reportsEnabled]
 * @property {boolean} [advancedReportsEnabled]
 */

/**
 * @typedef {Object} SubscriptionCheckoutRequest
 * @property {string} planCode
 * @property {'MONTHLY'|'YEARLY'} billingInterval
 */

/**
 * @typedef {Object} SubscriptionCheckoutResponse
 * @property {string} paymentId
 * @property {string} paymentUrl
 * @property {PaymentStatus|string} status
 * @property {string} [paymentGateway]
 */
