import React from 'react';
import { Paper, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import {
 ExpandMore
} from '@mui/icons-material';

export default function HelpPage() {
  return (
    <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">Help & Support</h2>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="!font-bold">How do I cancel a slot booking?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="!text-slate-600">
            You can cancel any confirmed booking from your Booking Details page up to 6 hours before the start time.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography className="!font-bold">What payment methods are supported?</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography className="!text-slate-600">
            We accept via PayHere all NKR/International Credit/Debit Cards, Visa, Mastercard, and Sri Lankan Online Banking.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}