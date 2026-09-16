import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Chip, Button, Skeleton, Card
} from '@mui/material';
import {
  LocationOn, ArrowForward
} from '@mui/icons-material';
import {
  useVenue
} from '../hooks/useVenues';

export default function VenueDetailPage() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { data: venueData, isLoading } = useVenue(venueId);

  const venue = venueData?.data;

  if (isLoading) {
    return (
      <Container maxWidth="xl" className="py-12">
        <Skeleton variant="rectangle" height={360} className="rounded-3xl mb-8" />
        <Skeleton variant="text" height={60} width="40%" />
      </Container>
    );
  }

  if (!venue) {
    return (
      <Container maxWidth="xl" className="py-20 text-center">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Venue not found</h2>
        <Button variant="contained" onClick={() => navigate('/search')} className="!bg-lime-500 !text-navy-900 !font-bold !rounded-xl">
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen font-sans">
      <Container maxWidth="xl">
        {/* IMAGE GALLERY */}
        <div className="relative h-96 bg-navy-900 rounded-3xl overflow-hidden mb-8 shadow-2xl">
          <img
            src={venue.imageUrl || 'https://images.unsplash.com/photo-1574629138756-c029f004b95c?q=80&w=1200&auto=format&fit=crop'}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-end justify-between gap-4">
            <div>
              <Chip label={venue.city || 'Colombo'} className="!bg-lime-500 !text-navy-900 !font-bold !mb-2" />
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{venue.name}</h1>
              <p className="text-slate-200 text-sm flex items-center gap-1 mt-1">
                <LocationOn className="!text-lime-400" />
                {venue.address}
              </p>
            </div>
          </div>
        </div>

        <Grid container spacing={4}>
          <Grid xs={12} md={8}>
            {/* Selectable Courts */}
            <Paper elevation={1} className="p-6 !rounded-2xl !bg-white mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Select a Court</h2>
              <Grid container spacing={3}>
                {venue.courts?.map((court) => (
                  <Grid xs={12} sm={6} key={court.id}>
                    <Card
                      className="p-5 border border-slate-200 hover:border-lime-500 rounded-2xl cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => navigate(`/venues/${venue.id}/slots?courtId=${court.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-navy-900 text-lg">{court.name}</h3>
                        <Chip label={court.sportName || 'Badminton'} className="!bg-navy-50 !text-navy-700 !font-semibold" />
                      </div>
                      <p className="text-slate-500 text-sm mb-4">Indoor Premium Court with Wooden Flooring</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-xs text-slate-400 block">Hourly Rate</span>
                          <span className="text-base font-bold text-navy-900">LKR {court.hourlyRate}/hr</span>
                        </div>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForward />}
                          className="!text-xs !bg-lime-500 !text-navy-900 !font-bold !rounded-xl"
                        >
                          Choose Slots
                        </Button>
                      </div>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}