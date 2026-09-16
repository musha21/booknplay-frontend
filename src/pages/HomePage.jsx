import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Chip, Rating, Skeleton, Divider, Paper, Typography, InputAdornment
} from '@mui/material';
import {
  Search, LocationOn, EventNote, AccessTime, SportsSoccer, SportsTennis,
  LocalOffer, HelpOutlined, ArrowForward, CheckCircleOutlined, SportsCricket
} from '@mui/icons-material';
import { useSports, useVenues } from '../hooks/useVenues';
import { mediaUrl } from '../utils/mediaUrl';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: sportsData, isLoading: isSportsLoading } = useSports();
  const { data: venuesData, isLoading: isVenuesLoading } = useVenues({ size: 6 });

  const sports = sportsData?.data || [
    { id: '1', name: 'Badminton' },
    { id: '2', name: 'Futsal' },
    { id: '3', name: 'Cricket' },
    { id: '4', name: 'Tennis' },
  ];
  const venues = venuesData?.data?.content || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSport) params.append('sportId', selectedSport);
    if (city) params.append('city', city);
    if (date) params.append('date', date);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="font-sans">
      {/* HERO SECTION */}
      <section className="relative bg-navy-900 text-white py-16 lg:py-24 bi-hero-pattern overflow-hidden">
        <Container maxWidth="xl" className="relative z-10">
          <Grid container spacing={6} className="items-center">
            <Grid xs={12} md={7}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-semibold mb-6">
                <SportsSoccer className="!text-sm" />
                <span>Sri Lanka's #1 Sports Venue Booking Platform</span>
              </div>
              <Typography variant="h1" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
                Book Your Court. <br /><span className="text-lime-400">Play Your Game.</span>
              </Typography>
              <p className="text-slate-300 text-lg sm:text-xl font-normal mb-8 max-w-2xl">
                Instantly search and book badminton courts, futsal pitches, indoor cricket, and tennis venues with real-time availability and instant confirmation.
              </p>
            </Grid>
          </Grid>

          {/* SEARCH BAR */}
          <Paper elevation={6} className="mt-8 px-6 py-6 !bg-white !rounded-2xl shadow-2xl">
            <form onSubmit={handleSearch}>
              <Grid container spacing={2} className="items-center">
                <Grid xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Select Sport</InputLabel>
                    <Select
                      value={selectedSport}
                      label="Select Sport"
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="!rounded-xl"
                    >
                      <MenuItem value="">All Sports</MenuItem>
                      {sports.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="City / Area"
                    placeholder="e.g. Colombo, Kandy"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start"><LocationOn className="!text-navy-500" /></InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start"><EventNote className="!text-navy-500" /></InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    startIcon={<Search />}
                    className="!bg-lime-500 hover:!bg-lime-600 !text-navy-900 !font-bold !h-14 !rounded-xl shadow-lime"
                  >
                    Find Courts
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </section>

      {/* FEATURED VENUES SECTION */}
      <section className="py-16 bg-slate-50">
        <Container maxWidth="xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-lime-600 font-bold text-sm uppercase tracking-wider">Top Rated Venues</span>
              <h2 className="text-3xl font-extrabold text-navy-900 mt-1">Popular Sports Arenas</h2>
            </div>
            <Button
              onClick={() => navigate('/search')}
              endIcon={<ArrowForward />}
              className="!text-navy-900 !font-bold hover:!text-lime-600 !mt-4 md:!mt-0"
            >
              Explore All Venues
            </Button>
          </div>

          {isVenuesLoading ? (
            <Grid container spacing={4}>
              {[1, 2, 3].map((n) => (
                <Grid xs={12} sm={6} md={4} key={n}>
                  <Skeleton variant="rectangle" height={220} className="rounded-2xl mb-2" />
                  <Skeleton variant="text" height={28} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {venues.map((venue) => (
                <Grid xs={12} sm={6} md={4} key={venue.id}>
                  <Card className="!rounded-2xl !shadow-md hover:!shadow-xl transition-shadow border border-slate-100 flex flex-col h-full">
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      <img
                        src={mediaUrl(venue.businessImageUrl || venue.coverImageUrl) || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop'}
                        alt={venue.name}
                        className="w-full h-full object-cover"
                      />
                      <Chip
                        label={venue.venueType || venue.city || 'Colombo'}
                        className="!absolute !top-3 !right-3 !bg-white/90 !text-navy-900 !font-bold !text-xs"
                      />
                    </div>
                    <CardContent className="flex-1 flex flex-col justify-between p-5">
                      <div>
                        <h3 className="text-lg font-bold text-navy-900 mb-1">{venue.name}</h3>
                        <p className="text-slate-500 text-sm flex items-center gap-1 mb-1">
                          {venue.venueType || 'Sports venue'}
                        </p>
                        <p className="text-slate-500 text-sm flex items-center gap-1 mb-3">
                          <LocationOn className="!text-base text-slate-400" /> {venue.formattedAddress || venue.address || venue.city}
                        </p>
                        <Rating value={venue.rating || 0} precision={0.1} readOnly size="small" />
                        {!venue.rating && <span className="text-xs text-slate-400 ml-1">New Venue</span>}
                      </div>
                      <div>
                        <Divider className="!my-3" />
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block">Starting from</span>
                            <span className="text-base font-extrabold text-navy-900">
                              LKR {(venue.startingPrice || venue.minPrice || 1500).toLocaleString()} <span className="text-xs font-normal text-slate-500">/ hr</span>
                            </span>
                          </div>
                          <Button
                            variant="contained"
                            onClick={() => navigate(`/venues/${venue.id}`)}
                            className="!bg-navy-900 !text-white !font-bold !rounded-xl !text-xs !py-2"
                          >
                            View & Book
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </section>
    </div>
  );
}