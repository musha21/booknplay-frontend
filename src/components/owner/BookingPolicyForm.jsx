import { Alert, Box, Card, CardContent, Stack, Switch, Typography } from '@mui/material';
import { Policy } from '@mui/icons-material';
import { FIXED_CANCEL_HOURS_AFTER_BOOKING, validateBookingPolicy } from '../../utils/bookingPolicy';

export default function BookingPolicyForm({ value, onChange, showErrors = false }) {
  const errors = validateBookingPolicy(value);

  return (
    <Stack spacing={3}>
      {showErrors && errors.length > 0 && <Alert severity="error">{errors.join(' ')}</Alert>}
      <Alert severity="info">
        This is one business-level policy shared by all venues. New bookings snapshot these terms; existing bookings keep their original terms.
      </Alert>
      <Card variant="outlined" className="!rounded-[18px]">
        <CardContent className="!p-5 sm:!p-6">
          <Box className="flex items-start justify-between gap-4">
            <Box>
              <Typography variant="h6" fontWeight={900} className="flex items-center gap-2">
                <Policy color="secondary" /> Customer cancellation
              </Typography>
              <Typography variant="body2" color="text.secondary" className="!mt-1">
                PayHere only supports a full refund of the amount paid. Partial refunds are not available.
              </Typography>
            </Box>
            <Switch
              checked={value.cancellationAllowed}
              onChange={(event) => onChange({ ...value, cancellationAllowed: event.target.checked })}
              inputProps={{ 'aria-label': 'Allow customer cancellation' }}
            />
          </Box>

          {!value.cancellationAllowed ? (
            <Alert severity="warning" className="!mt-5">Customer self-service cancellation is disabled.</Alert>
          ) : (
            <Alert severity="success" className="!mt-5">
              Customers can cancel within{' '}
              <strong>{FIXED_CANCEL_HOURS_AFTER_BOOKING} hour of booking</strong>
              {' '}for a <strong>full refund</strong> of the amount paid. After that hour, cancellation is not available.
              This window is measured from booking time, not from the play start time.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
