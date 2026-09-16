import React from 'react';
import dayjs from 'dayjs';
import {
  Card, CardContent, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';
import { useOwnerEarnings, useOwnerPayouts } from '../../hooks/useOwner';

const formatLkr = (value) => `LKR ${Number(value || 0).toLocaleString()}`;

export default function OwnerEarningsPage() {
  const from = dayjs().subtract(29, 'day').format('YYYY-MM-DD');
  const to = dayjs().format('YYYY-MM-DD');
  const { data: summary } = useOwnerEarnings(from, to);
  const { data: payouts = [] } = useOwnerPayouts();

  return (
    <div>
      <Typography variant="h4" className="!mb-4">Earnings</Typography>
      <Grid container spacing={2} className="!mb-6">
        {[
          ['Bookings', summary?.bookingCount ?? 0],
          ['Gross', formatLkr(summary?.gross)],
          ['Commission', formatLkr(summary?.commission)],
          ['Net', formatLkr(summary?.net)],
        ].map(([label, value]) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="h5">{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" className="!mb-2">Daily breakdown</Typography>
      <Table size="small" className="!mb-8">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Bookings</TableCell>
            <TableCell>Gross</TableCell>
            <TableCell>Commission</TableCell>
            <TableCell>Net</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(summary?.daily || []).map((row) => (
            <TableRow key={row.date}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.bookingCount}</TableCell>
              <TableCell>{formatLkr(row.gross)}</TableCell>
              <TableCell>{formatLkr(row.commission)}</TableCell>
              <TableCell>{formatLkr(row.net)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" className="!mb-2">Payout history</Typography>
      {payouts.length === 0 ? (
        <Typography color="text.secondary">No payouts recorded yet. Bank transfers land in Phase 3.</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Net</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>{payout.periodStart} → {payout.periodEnd}</TableCell>
                <TableCell>{formatLkr(payout.net)}</TableCell>
                <TableCell>{payout.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
