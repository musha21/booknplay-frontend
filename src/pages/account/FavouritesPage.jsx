import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function FavouritesPage() {
  return (
    <Paper elevation={1} className="p-6 !rounded-2xl !bg-white">
      <h2 className="text-2xl font-bold text-navy-900 mb-4">Favourite Venues</h2>
      <p className="text-slate-500">No favourite venues saved yet. Browse venues and click the heart icon to add them here.</p>
    </Paper>
  );
}