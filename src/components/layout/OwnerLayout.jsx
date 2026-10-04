import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  Menu as MuiMenu, MenuItem, Select, Toolbar, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import {
  AccountCircle, Add, Assessment, CalendarMonth, ChevronLeft, ChevronRight, Close, CreditCard,
  Dashboard, Groups, Logout, Menu as MenuIcon, Payments, Policy, Stadium,
} from '@mui/icons-material';
import { revokeAndClearSession } from '../../lib/signOut';
import useAuthStore from '../../stores/authStore';
import { useOwnerProfile, useOwnerSubscription, useOwnerVenues } from '../../hooks/useOwner';
import {
  buildOwnerNavLinks,
  ownerNavHint,
  ownerPageTitle,
  readSidebarCollapsed,
  writeSidebarCollapsed,
} from '../../utils/ownerOverview';
import {
  canMutateOwner,
  isOwnerMutatePath,
  isOwnerSubscriptionsEnabled,
} from '../../utils/subscription';
import { businessInitials } from '../../utils/venueMedia';
import { mediaUrl } from '../../utils/mediaUrl';
import BrandLogo from '../ui/BrandLogo';
import ThemeToggle from '../ui/ThemeToggle';
import SubscriptionAccessBanner from '../owner/SubscriptionAccessBanner';
import SubscriptionRequiredPanel from '../owner/SubscriptionRequiredPanel';

const drawerExpanded = 264;
const drawerCollapsed = 72;
const workspaceLabels = new Set(['Venues', 'Earnings', 'Reports', 'Team', 'Billing', 'Business profile', 'Create venue']);
const venueLabels = new Set(['Calendar', 'Bookable spaces', 'Booking policy']);

function VenueSelect({ venues, value, onChange, fullWidth = false }) {
  return (
    <Select
      size="small"
      displayEmpty
      fullWidth={fullWidth}
      value={value}
      onChange={onChange}
      inputProps={{ 'aria-label': 'Select venue' }}
      sx={{
        minWidth: fullWidth ? 0 : 220,
        maxWidth: fullWidth ? 'none' : 280,
        bgcolor: 'background.paper',
        '& .MuiSelect-select': { py: 1.1 },
      }}
    >
      <MenuItem value="" disabled>{venues.length ? 'Select venue' : 'No venues yet'}</MenuItem>
      {venues.map((venue) => <MenuItem key={venue.id} value={venue.id}>{venue.name}</MenuItem>)}
    </Select>
  );
}

function NavIndex({ title, items, onNavigate, collapsed }) {
  if (!items.length) return null;
  return (
    <div className={collapsed ? 'mt-4' : 'mt-6'}>
      {!collapsed && (
        <p className="px-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">{title}</p>
      )}
      <List className="!mt-1" disablePadding>
        {items.map(({ to, label, icon: Icon, end }) => {
          const button = (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              end={end}
              onClick={onNavigate}
              sx={{
                minHeight: 44,
                borderRadius: 2.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 2,
                color: 'text.secondary',
                '& .MuiListItemIcon-root': {
                  minWidth: collapsed ? 0 : 36,
                  color: 'inherit',
                  justifyContent: 'center',
                },
                '& .nav-label': { transition: 'transform 200ms' },
                '&:hover': { color: 'text.primary', bgcolor: 'transparent' },
                '&:hover .nav-label': { transform: collapsed ? 'none' : 'translateX(4px)' },
                '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'secondary.main', outlineOffset: 2 },
                '&.active': {
                  bgcolor: 'secondary.main', color: '#061032',
                  '& .MuiListItemIcon-root': { color: '#061032' },
                },
              }}
            >
              <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
              {!collapsed && <span className="nav-label text-sm font-extrabold">{label}</span>}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={to} title={label} placement="right">
              {button}
            </Tooltip>
          ) : button;
        })}
      </List>
    </div>
  );
}

function BusinessMark({ name, logoUrl }) {
  const src = mediaUrl(logoUrl);
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-navy-900 text-xs font-black text-lime-300">
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : businessInitials(name)}
    </span>
  );
}

export default function OwnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { owner, role } = useAuthStore();
  useOwnerProfile();
  const subscriptionQuery = useOwnerSubscription();
  const { data: venues = [] } = useOwnerVenues(false);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => readSidebarCollapsed());
  const [accountAnchor, setAccountAnchor] = useState(null);
  const rawVenueId = location.pathname.match(/\/owner\/venues\/([^/]+)/)?.[1] || '';
  const activeVenueId = rawVenueId && rawVenueId !== 'new' ? rawVenueId : '';
  const selectableVenueId = venues.some((venue) => venue.id === activeVenueId) ? activeVenueId : '';
  const drawerWidth = desktop && collapsed ? drawerCollapsed : drawerExpanded;

  useEffect(() => {
    writeSidebarCollapsed(collapsed);
  }, [collapsed]);

  const isStaff = role === 'STAFF';
  const subscription = subscriptionQuery.data;
  const subscriptionsEnabled = isOwnerSubscriptionsEnabled();
  const mutateAllowed = !subscriptionsEnabled || canMutateOwner(subscription);
  const lockMutateRoute = subscriptionsEnabled && !mutateAllowed && isOwnerMutatePath(location.pathname);
  const navIcons = {
    Venues: Dashboard,
    Calendar: CalendarMonth,
    'Bookable spaces': Stadium,
    'Booking policy': Policy,
    Earnings: Payments,
    Reports: Assessment,
    Team: Groups,
    Billing: CreditCard,
    'Business profile': AccountCircle,
    'Create venue': Add,
  };
  const links = buildOwnerNavLinks({ role, venueId: activeVenueId, venueCount: venues.length })
    .map((link) => ({ ...link, icon: navIcons[link.label] }));
  const venueHint = ownerNavHint({ role, venueId: activeVenueId, venueCount: venues.length });
  const closeNav = () => setOpen(false);
  const pageTitle = ownerPageTitle(location.pathname);
  const businessName = owner?.businessName || 'BooknPlay partner';
  const accountName = owner?.ownerName || businessName;
  const profilePhoto = mediaUrl(owner?.ownerProfileImageUrl);
  const workspaceLinks = links.filter((link) => workspaceLabels.has(link.label));
  const venueLinks = links.filter((link) => venueLabels.has(link.label));
  const rail = desktop && collapsed;

  const selectVenue = (event) => {
    const venueId = event.target.value;
    if (!venueId) return;
    closeNav();
    navigate(`/owner/venues/${venueId}/calendar`);
  };

  const signOut = async () => {
    setAccountAnchor(null);
    closeNav();
    const path = await revokeAndClearSession(role || 'BUSINESS_OWNER');
    navigate(path);
  };

  const toggleCollapsed = () => setCollapsed((value) => !value);

  const drawer = (
    <div className="flex h-full min-h-0 flex-col [padding-top:env(safe-area-inset-top)]">
      <div className={`owner-side-brand shrink-0 border-b border-line ${rail ? 'px-2 pb-3 pt-4' : 'px-5 pb-4 pt-5'}`}>
        <div className={`flex min-w-0 items-center ${rail ? 'flex-col gap-2' : 'justify-between gap-3'}`}>
          <div className="min-w-0" onClick={!desktop ? closeNav : undefined}>
            {rail ? (
              <BrandLogo to="/owner" compact className="min-w-0" />
            ) : (
              <BrandLogo to="/owner" className="min-w-0" />
            )}
          </div>
          {desktop ? (
            <Tooltip title={collapsed ? 'Expand navigation' : 'Minimize navigation'}>
              <IconButton
                aria-label={collapsed ? 'Expand owner navigation' : 'Minimize owner navigation'}
                onClick={toggleCollapsed}
                size="small"
                sx={{ minWidth: 40, minHeight: 40 }}
              >
                {collapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Tooltip>
          ) : (
            <IconButton aria-label="Close owner navigation" onClick={closeNav} sx={{ minWidth: 44, minHeight: 44, mr: -0.75 }}>
              <Close />
            </IconButton>
          )}
        </div>
        {!rail && (
          <div className="mt-4 flex min-w-0 items-center gap-3 rounded-xl bg-canvas px-3 py-2.5">
            <BusinessMark name={businessName} logoUrl={owner?.logoUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-ink">{businessName}</p>
              <p className="mt-0.5 text-xs font-bold text-muted">{isStaff ? 'Staff' : 'Partner'}</p>
            </div>
          </div>
        )}
        {rail && (
          <Tooltip title={businessName} placement="right">
            <div className="mt-3 flex justify-center">
              <BusinessMark name={businessName} logoUrl={owner?.logoUrl} />
            </div>
          </Tooltip>
        )}
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pb-5 ${rail ? 'px-2' : 'px-4'}`}>
        {!desktop && (
          <div className="mt-4 rounded-2xl border border-line bg-canvas/60 p-3">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">
              Active venue
            </p>
            <VenueSelect venues={venues} value={selectableVenueId} onChange={selectVenue} fullWidth />
          </div>
        )}
        <nav aria-label="Owner navigation">
          <NavIndex title="Workspace" items={workspaceLinks} onNavigate={closeNav} collapsed={rail} />
          <NavIndex title="This venue" items={venueLinks} onNavigate={closeNav} collapsed={rail} />
        </nav>
        {!rail && venueHint && <p className="mx-3 mt-3 px-1 text-xs leading-5 text-muted">{venueHint}</p>}
      </div>
      <div className={`shrink-0 border-t border-line bg-surface [padding-bottom:max(1rem,env(safe-area-inset-bottom))] ${rail ? 'p-2' : 'p-4'}`}>
        {rail ? (
          <Tooltip title="Sign out" placement="right">
            <button
              onClick={signOut}
              aria-label="Sign out"
              className="flex min-h-11 w-full items-center justify-center rounded-xl text-red-500 transition hover:bg-red-500/10"
            >
              <Logout fontSize="small" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={signOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-bold text-red-500 transition hover:bg-red-500/10"
          >
            <Logout fontSize="small" /> Sign out
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', overflowX: 'clip' }}>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          zIndex: (t) => desktop ? t.zIndex.drawer + 1 : t.zIndex.appBar,
          borderBottom: '1px solid', borderColor: 'divider',
          ml: desktop ? `${drawerWidth}px` : 0,
          width: desktop ? `calc(100% - ${drawerWidth}px)` : '100%',
          bgcolor: 'color-mix(in srgb, var(--surface) 94%, transparent)',
          backdropFilter: 'blur(16px)',
          transition: 'margin-left 200ms ease, width 200ms ease',
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important', gap: { xs: 0.5, sm: 1.5 }, px: { xs: 1.25, sm: 2.5 } }}>
          {!desktop && (
            <IconButton edge="start" aria-label="Open owner navigation" onClick={() => setOpen(true)} sx={{ minWidth: 44, minHeight: 44 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ minWidth: 0, flexGrow: 1, ml: { xs: 0.5, lg: 0 } }}>
            <Typography component="p" noWrap sx={{ color: 'text.primary', fontSize: { xs: 15, sm: 16 }, fontWeight: 850, lineHeight: 1.2 }}>
              {pageTitle}
            </Typography>
            <Typography component="p" noWrap sx={{ display: { xs: 'none', sm: 'block' }, mt: 0.25, color: 'text.secondary', fontSize: 11.5, fontWeight: 650 }}>
              {businessName}
            </Typography>
          </Box>
          {desktop && <VenueSelect venues={venues} value={selectableVenueId} onChange={selectVenue} />}
          <ThemeToggle />
          <Tooltip title="Account menu">
            <IconButton
              aria-label="Open account menu"
              aria-controls={accountAnchor ? 'owner-account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={accountAnchor ? 'true' : undefined}
              onClick={(event) => setAccountAnchor(event.currentTarget)}
              sx={{ minWidth: 44, minHeight: 44, p: 0.5 }}
            >
              <Avatar
                src={profilePhoto || undefined}
                className="!h-9 !w-9 !bg-lime-400 !text-sm !font-black !text-navy-900"
              >
                {accountName?.[0]?.toUpperCase() || 'O'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <MuiMenu
        id="owner-account-menu"
        anchorEl={accountAnchor}
        open={Boolean(accountAnchor)}
        onClose={() => setAccountAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220 } } }}
      >
        <Box sx={{ maxWidth: 280, px: 2, py: 1 }}>
          <Typography noWrap fontWeight={800}>{accountName}</Typography>
          <Typography noWrap variant="caption" color="text.secondary">{isStaff ? 'Staff account' : businessName}</Typography>
        </Box>
        <Divider />
        {!isStaff && (
          <MenuItem onClick={() => { setAccountAnchor(null); navigate('/owner/profile'); }} sx={{ minHeight: 44 }}>
            <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
            Business profile
          </MenuItem>
        )}
        {!isStaff && (
          <MenuItem onClick={() => { setAccountAnchor(null); navigate('/owner/billing'); }} sx={{ minHeight: 44 }}>
            <ListItemIcon><CreditCard fontSize="small" /></ListItemIcon>
            Billing
          </MenuItem>
        )}
        <MenuItem onClick={signOut} sx={{ minHeight: 44, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}><Logout fontSize="small" /></ListItemIcon>
          Sign out
        </MenuItem>
      </MuiMenu>
      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || open}
        onClose={closeNav}
        transitionDuration={desktop ? { enter: 200, exit: 200 } : { enter: 280, exit: 200 }}
        ModalProps={{
          keepMounted: true,
          container: () => document.getElementById('root') || document.body,
        }}
        sx={{
          width: desktop ? drawerWidth : 0,
          flexShrink: 0,
          zIndex: (t) => desktop ? t.zIndex.drawer : t.zIndex.drawer + 2,
          '& .MuiDrawer-paper': {
            width: desktop ? drawerWidth : { xs: 'min(88vw, 320px)', sm: 320 },
            maxWidth: 'calc(100vw - 24px)',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderRightColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: desktop ? 'none' : '16px 0 48px rgba(6, 16, 50, .2)',
            transition: 'width 200ms ease',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar aria-hidden="true" sx={{ minHeight: '72px !important', px: '0 !important' }} />
        <Box
          sx={{
            minWidth: 0,
            p: location.pathname.includes('/calendar')
              ? { xs: 1.5, sm: 2 }
              : { xs: 2, sm: 3, xl: 4 },
          }}
          className={location.pathname.includes('/calendar') ? 'owner-calendar-main' : undefined}
        >
          <SubscriptionAccessBanner subscription={subscription} />
          {lockMutateRoute ? <SubscriptionRequiredPanel /> : <Outlet />}
        </Box>
      </Box>
    </Box>
  );
}
