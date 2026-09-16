import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Card, CardContent, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Chip, Skeleton, Divider, Paper
} from '@mui/material';
import {
  Search, LocationOn, FilterList, Map, SportsSoccer
} from '@mui/icons-material';
import {
  useVenues, useSports
} from '../hooks/useVenues';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const sportIdParam = searchParams.get('sportId') || '';
  const cityParam = searchParams.get('city') || '';
  const nameParam = searchParams.get('name') || '';

  const [selectedSport, setSelectedSport] = useState(sportIdParam);
  const [city, setCity] = useState(cityParam);
  const [searchName, setSearchName] = useState(nameParam);

  const { data: sportsData } = useSports();
  const {
    data: venuesData,
    isLoading,
    refetch
  } = useVenues({
    sportId: selectedSport || undefined,
    city: city || undefined,
    name: searchName || undefined,
  });

  const sports = sportsData?.data || [];
  const venues = venuesData?.data?.content || [];

  const handleFilterApply = () => {
    const p = new URLSearchParams();
    if (selectedSport) p.set('sportId', selectedSport);
    if (city) p.set('city', city);
    if (searchName) p.set('name', searchName);
    setSearchParams(p);
    refetch();
  };

  const handleClearFilters = () => {
    setSelectedSport('');
    setCity('');
    setSearchName('');
    setSearchParams({});
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen font-sans">
      <Container maxWidth="xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900">Search Sports Venues</h1>
            <p className="text-slate-500 text-sm mt-1">
              Found {venues.length} venues available for booking
            </p>
          </div>
        </div>

        <Grid container spacing={4}>
          {/* FILTER SIDEBAR */}
          <Grid xs={12} md={3}>
            <Paper elevation={1} className="p-6 !rounded-2xl !bg-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy-900 flex items-center gap-2">
                  <FilterList /> Filters
                </h3>
                <Button size="small" onClick={handleClearFilters} className="!text-slate-400">
                  Clear All
                </Button>
              </div>

              <TextField
                fullWidth
                label="Venue Name"
                size="small"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Sport</InputLabel>
                <Select
                  value={selectedSport}
                  label="Sport"
                  onChange={(e) => setSelectedSport(e.target.value)}
                >
                  <MenuItem value="">All Sports</MenuItem>
                  {sports.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="City"
                size="small"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleFilterApply}
                className="!bg-navy-700 !h-11 !font-bold !rounded-xl"
              >
                Apply Filters
              </Button>
            </Paper>
          </Grid>

          {/* VENUE RESULTS LIST */}
          <Grid xs={12} md={9}>
            {isLoading ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((n) => (
                  <Grid xs={12} sm={6} key={n}>
                    <Skeleton variant="rectangle" height={200} className="rounded-2xl mb-2" />
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" width="60%" />
                  </Grid>
                ))}
              </Grid>
            ) : venues.length === 0 ? (
              <Paper className="p-12 text-center !rounded-2xl !bg-white">
                <SportsSoccer className="!text-6xl !text-slate-300 mb-3" />
                <h3 className="text-xl font-bold text-navy-900 mb-1">No Venues Found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your filters or searching for another city.</p>
                <Button variant="outlined" onClick={handleClearFilters} className="!rounded-xl">
                  Reset Search
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {venues.map((venue) => (
                  <Grid xs={12} sm={6} key={venue.id}>
                    <Card className="!rounded-2xl !shadow-md hover:!shadow-xl transition-shadow border border-slate-100 flex flex-col h-full">
                      <div className="relative h-48 bg-slate-200 overflow-hidden">
                        <img
                          src={venue.imageUrl || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop'}
                          alt={venue.name}
                          className="w-full h-full object-cover"
                        />
                        <Chip
                          label={venue.city || 'Colombo'}
                          className="!absolute !top-3 !right-3 !bg-white/90 !text-navy-900 !font-bold !text-xs"
                        />
                      </div>
                      <CardContent className="flex-1 flex flex-col justify-between p-5">
                        <div>
                          <h3 className="text-lg font-bold text-navy-900 mb-1">{venue.name}</h3>
                          <p className="text-slate-500 text-sm flex items-center gap-1 mb-3">
                            <LocationOn className="!text-base text-slate-400" /> {venue.address || venue.city}
                          </p>
                        </div>
                        <div>
                          <Divider className="!my-3" />
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs text-slate-400 block">Starting from</span>
                              <span className="text-base font-extrabold text-navy-900">
                                LKR {venue.minPrice || '1,500'} <span className="text-xs font-normal text-slate-500">/ hr</span>
                              </span>
                            </div>
                            <Button
                              variant="contained"
                              onClick={() => navigate(`/venues/${venue.id}`)}
                              className="!bg-navy-900 !text-white !font-bold !rounded-xl !text-xs !py-2"
                            >
                              Book Slot
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}