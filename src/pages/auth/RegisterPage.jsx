import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  SportsTennis,
  Person,
  Email,
  Phone,
  Lock,
} from '@mui/icons-material';
import BrandLogo from '../../components/ui/BrandLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const location = useLocation();
  const bookingRedirect = location.state?.reason === 'booking' || location.state?.from?.pathname === '/checkout';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const phoneClean = formData.phone.trim();
    if (!/^\+?[0-9]{9,15}$/.test(phoneClean)) {
      setError('Please enter a valid phone number (9-15 digits, e.g. +94771234567 or 0771234567)');
      return;
    }

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: phoneClean,
        password: formData.password,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Please check your details and try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 pb-12 pt-24 relative">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:px-8"><BrandLogo /><ThemeToggle /></div>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-400/20 text-navy-900 mb-3">
            <SportsTennis sx={{ fontSize: 32, color: '#061032' }} />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">{bookingRedirect ? 'Create an account to book' : 'Create your account'}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {bookingRedirect
              ? 'Your selected slot is saved. Create a customer account to confirm it.'
              : 'Join players booking courts across Sri Lanka'}
          </p>
        </div>

        {error && (
          <Alert severity="error" className="mb-6 rounded-xl text-sm" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            type="tel"
            label="Phone Number"
            name="phone"
            placeholder="+94771234567"
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
            helperText="Used for booking SMS confirmations"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isRegistering}
            sx={{
              backgroundColor: '#84cc16',
              color: '#061032',
              fontWeight: 'bold',
              py: 1.5,
              borderRadius: '12px',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: '#65a30d',
              },
            }}
          >
            {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/auth/login" state={location.state} className="font-semibold text-navy-900 hover:text-lime-600 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
