import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import {
 ExpandMore
} from '@mui/icons-material';

export default function HelpPage() {
  return (
    <div className="customer-panel p-5 sm:p-7">
      <p className="eyebrow">Support centre</p>
      <h2 className="customer-card-title mt-2">Help &amp; support</h2>
      <p className="customer-body mt-2">Quick answers about bookings, cancellations, and payments.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
      <Accordion disableGutters elevation={0} className="!bg-surface !text-ink before:!hidden">
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="!font-extrabold !text-ink">How do I cancel a slot booking?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="!text-muted">
            Open the Booking Details page to request a cancellation. When the venue allows cancel, you have 1 hour from booking for a full refund of the amount paid. After that hour, online cancellation is not available. Contact the venue or support if you need help.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion disableGutters elevation={0} className="!border-t !border-line !bg-surface !text-ink before:!hidden">
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="!font-extrabold !text-ink">What payment methods are supported?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="!text-muted">
            Checkout uses PayHere sandbox for development payments. Complete checkout on PayHere’s sandbox page; the booking confirms after the server receives a signed notify callback.
          </Typography>
        </AccordionDetails>
      </Accordion>
      </div>
    </div>
  );
}
