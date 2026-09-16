import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { useOwnerVenues } from '../../hooks/useOwner';
import useAuthStore from '../../stores/authStore';

const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

export default function OwnerVenuesPage() {
  const owner = useAuthStore((s) => s.owner);
  const { data: venues = [], isLoading } = useOwnerVenues();
  const setup = venues[0]?.setupPercent ?? 0;

  return (
    <div>
      <Typography variant="h4" className="!mb-1">{greeting}, {owner?.ownerName || owner?.businessName || 'Owner'}</Typography>
      <Typography color="text.secondary" className="!mb-6">Your venues</Typography>

      {venues[0] && setup < 100 && (
        <Card className="!mb-6 p-4">
          <Typography fontWeight={700}>Venue setup</Typography>
          <LinearProgress variant="determinate" value={setup} className="!my-2" />
          <Typography variant="body2">{setup}% complete — finish optional details anytime.</Typography>
          <Button component={Link} to={`/owner/venues/${venues[0].id}/courts`} className="!mt-2">Finish setup</Button>
        </Card>
      )}

      <Stack direction="row" justifyContent="space-between" className="mb-4">
        <Typography variant="h5">Your Venues</Typography>
        <Button component={Link} to="/owner/venues/new" variant="contained">Create venue</Button>
      </Stack>

      {isLoading && <Typography>Loading…</Typography>}
      {!isLoading && venues.length === 0 && (
        <Typography color="text.secondary">No venues yet. Create your first venue to start taking bookings.</Typography>
      )}
      <Stack spacing={2}>
        {venues.map((venue) => (
          <Card key={venue.id}>
            <CardContent>
              <Typography variant="h6">{venue.name}</Typography>
              <Chip size="small" label={venue.status} className="!mr-2" />
              <Typography variant="body2" color="text.secondary">
                {(venue.courts?.length || 0)} facilities · {venue.city}
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={Link} to={`/owner/venues/${venue.id}/courts`}>Manage venue</Button>
              <Button component={Link} to={`/owner/venues/${venue.id}/calendar`}>Calendar</Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
