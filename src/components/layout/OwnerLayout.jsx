import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, MenuItem, Select, Toolbar, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { AccountCircle, CalendarMonth, Dashboard, Logout, Menu, Payments } from '@mui/icons-material';
import useAuthStore from '../../stores/authStore';
import { useOwnerVenues } from '../../hooks/useOwner';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';

const drawerWidth = 264;

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { owner, logout } = useAuthStore();
  const { data: venues = [] } = useOwnerVenues();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [open, setOpen] = useState(false);
  const activeVenueId = location.pathname.match(/\/owner\/venues\/([^/]+)/)?.[1] || '';
  const selectableVenueId = venues.some((venue) => venue.id === activeVenueId) ? activeVenueId : '';

  const links = [
    { to: '/owner', label: 'Overview', icon: Dashboard, end: true },
    ...(activeVenueId && activeVenueId !== 'new'
      ? [{ to: `/owner/venues/${activeVenueId}/calendar`, label: 'Calendar', icon: CalendarMonth }]
      : []),
    { to: '/owner/earnings', label: 'Earnings', icon: Payments },
    { to: '/owner/profile', label: 'Business profile', icon: AccountCircle },
  ];

  const drawer = (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="px-2"><BrandLogo to="/owner" /></div>
      <div className="mx-1 mt-7 rounded-2xl bg-navy-900 p-4 text-white shadow-lg shadow-navy-900/10">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-lime-300">Partner workspace</p>
        <p className="mt-2 truncate text-sm font-extrabold">{owner?.businessName || 'Your business'}</p>
        <p className="mt-1 text-xs text-slate-400">Venue operations</p>
      </div>
      <List className="!mt-5 !space-y-1" aria-label="Owner navigation">
        {links.map(({ to, label, icon: Icon, end }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            sx={{
              minHeight: 46,
              borderRadius: 2.5,
              color: 'text.secondary',
              '& .MuiListItemIcon-root': { minWidth: 38, color: 'inherit' },
              '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
              '&.active': {
                bgcolor: 'secondary.main', color: '#061032',
                '& .MuiListItemIcon-root': { color: '#061032' },
              },
            }}
          >
            <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
            <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>
      <button
        onClick={() => { logout(); navigate('/owner/login'); }}
        className="mt-auto flex min-h-11 items-center gap-3 rounded-xl px-4 text-sm font-bold text-red-500 transition hover:bg-red-500/10"
      >
        <Logout fontSize="small" /> Sign out
      </button>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: '1px solid', borderColor: 'divider',
          ml: desktop ? `${drawerWidth}px` : 0,
          width: desktop ? `calc(100% - ${drawerWidth}px)` : '100%',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar className="gap-3 !min-h-[72px]">
          {!desktop && <IconButton edge="start" aria-label="Open owner navigation" onClick={() => setOpen(true)}><Menu /></IconButton>}
          <div className="hidden min-w-0 flex-1 sm:block">
            <Typography variant="caption" color="text.secondary">Operations workspace</Typography>
            <Typography fontWeight={850} noWrap>{owner?.businessName || 'BooknPlay partner'}</Typography>
          </div>
          <Select
            size="small"
            displayEmpty
            value={selectableVenueId}
            onChange={(event) => navigate(`/owner/venues/${event.target.value}/calendar`)}
            inputProps={{ 'aria-label': 'Select venue' }}
            sx={{ minWidth: { xs: 150, sm: 210 }, maxWidth: { xs: 190, sm: 260 }, '& .MuiSelect-select': { py: 1.1 } }}
          >
            <MenuItem value="" disabled>{venues.length ? 'Select venue' : 'No venues yet'}</MenuItem>
            {venues.map((venue) => <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>)}
          </Select>
          <ThemeToggle />
          <Avatar className="!h-9 !w-9 !bg-lime-400 !text-sm !font-black !text-navy-900">{owner?.ownerName?.[0] || 'O'}</Avatar>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, borderRightColor: 'divider', bgcolor: 'background.paper' } }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3, xl: 4 }, pt: { xs: 12, lg: 13 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
