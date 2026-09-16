import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, CircularProgress, Button, Typography
} from '@mui/material';
import {
  CheckCircleOutlined, CancelOutlined, HelpOutlined
} from '@mui/icons-material';
import {
  usePaymentStatus
} from '../hooks/useBookings';

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId') || '';

  const { data: paymentData, isLoading, refetch } = usePaymentStatus(bookingId, {
    refetchInterval: 3000,
  });

  const status = paymentData?.data?.status || 'PENDING';


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <Container maxWidth="sm">
        <Paper elevation={3} className="p-8 text-center !rounded-2xl !bg-white">
          {status === 'PENDING' || isLoading ? (
            <div className="py-8">
              <CircularProgress className="!text-lime-500 mb-4" size={60} />
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Verifying Payment...</h2>
              <p className="text-slate-500">Please wait while we confirm your transaction with the bank.</p>
            </div>
          ) : status === 'COMPLETED' ? (
            <div className="py-6">
              <CheckCircleOutlined className="!text-6xl !text-lime-500 mb-4" />
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Payment Successful!</h2>
              <p className="text-slate-500 mb-6">Your booking has been confirmed. An email receipt has been sent.</p>
              <Button
                variant="contained"
                onClick={() => navigate(`/bookings/${bookingId}`)}
                className="!bg-navy-700 !text-white !font-bold !py-3 !px-6 !rounded-xl">
                View Booking Details
              </Button>
            </div>
          ) : (
            <div className="py-6">
              <CancelOutlined className="!text-6xl !text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Payment Failed</h2>
              <p className="text-slate-500 mb-6">We could not process your payment. Please try again.</p>
              <Button
                variant="contained"
                onClick={() => navigate(`/checkout/${bookingId}`)}
                className="!bg-lime-500 !text-navy-900 !font-bold !py-3 !px-6 !rounded-xl">
                Try Again
              </Button>
            </div>
          )}
        </Paper>
      </Container>
    </div>
  );
}