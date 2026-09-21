import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useOwnerLogin } from '../../hooks/useOwner';
import BrandLogo from '../../components/ui/BrandLogo';
import ThemeToggle from '../../components/ui/ThemeToggle';

export default function OwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useOwnerLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 pt-24 relative">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 sm:px-8"><BrandLogo inverse /><ThemeToggle inverse /></div>
      <Container maxWidth="xs">
        <Paper className="p-8 !rounded-3xl">
          <Typography variant="h5" className="!font-bold !mb-1">Venue owner login</Typography>
          <Typography variant="body2" className="!text-slate-500 !mb-6">
            Manage courts, walk-ins, and earnings
          </Typography>
          {loginMutation.isError && (
            <Alert severity="error" className="mb-4">
              {loginMutation.error?.response?.data?.message || 'Login failed'}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" fullWidth variant="contained" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <Typography variant="body2" className="!mt-4 !text-center">
            New partner? <Link to="/owner/register">Create an account</Link>
          </Typography>
          <Typography variant="body2" className="!mt-2 !text-center">
            <Link to="/auth/login">Customer login</Link>
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}
