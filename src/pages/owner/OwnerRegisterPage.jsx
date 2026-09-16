import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { AddPhotoAlternate } from '@mui/icons-material';
import { toast } from 'sonner';
import { useOwnerRegister } from '../../hooks/useOwner';
import { uploadBusinessImages } from '../../api/ownerBusiness';

function ImageTile({ label, preview, onPick }) {
  return (
    <Button
      component="label"
      variant="outlined"
      sx={{ height: 120, borderStyle: 'dashed', flexDirection: 'column', gap: 1 }}
    >
      {preview ? <img src={preview} alt={label} className="h-full w-full object-cover rounded-lg" /> : (
        <>
          <AddPhotoAlternate />
          <span className="text-xs">{label}</span>
        </>
      )}
      <input type="file" accept="image/*" hidden onChange={(e) => onPick(e.target.files?.[0])} />
    </Button>
  );
}

export default function OwnerRegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useOwnerRegister();
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    contactPhone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [logo, setLogo] = useState(null);
  const [gallery, setGallery] = useState([null, null, null]);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        businessName: form.businessName,
        ownerName: form.ownerName,
        email: form.email,
        contactEmail: form.email,
        contactPhone: form.contactPhone,
        address: form.address,
        password: form.password,
      });
      const images = gallery.filter(Boolean);
      if (logo || images.length) {
        await uploadBusinessImages({ logo, images });
      }
      navigate('/owner/venues/new');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <Container maxWidth="sm">
        <Paper className="p-8 !rounded-3xl">
          <Typography variant="h5" fontWeight={800}>Business Registration</Typography>
          <Typography variant="body2" color="text.secondary" className="!mb-6">Register your business, then add venues.</Typography>
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle2" className="!mb-2">Business Information</Typography>
            <Stack spacing={2}>
              <TextField required label="Business Name" value={form.businessName} onChange={set('businessName')} />
              <TextField required label="Owner Name" value={form.ownerName} onChange={set('ownerName')} />
              <TextField required type="email" label="Email" value={form.email} onChange={set('email')} />
              <TextField required label="Phone" value={form.contactPhone} onChange={set('contactPhone')} helperText="Include country code, e.g. +9477..." />
              <TextField required label="Address" value={form.address} onChange={set('address')} />
              <TextField required type="password" label="Password" value={form.password} onChange={set('password')} />
              <TextField required type="password" label="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            </Stack>
            <Typography variant="subtitle2" className="!mt-6 !mb-2">Business Images</Typography>
            <Typography variant="caption" color="text.secondary">Maximum: 4 images (logo + 3)</Typography>
            <Box className="grid grid-cols-2 gap-2 mt-2">
              <ImageTile label="Business Logo" preview={logo && URL.createObjectURL(logo)} onPick={setLogo} />
              {gallery.map((file, i) => (
                <ImageTile
                  key={i}
                  label={`Business Image ${i + 1}`}
                  preview={file && URL.createObjectURL(file)}
                  onPick={(f) => {
                    const next = [...gallery];
                    next[i] = f;
                    setGallery(next);
                  }}
                />
              ))}
            </Box>
            <Button type="submit" fullWidth variant="contained" className="!mt-6" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? 'Registering…' : 'Register Business'}
            </Button>
          </form>
          <Typography variant="body2" className="!mt-4 !text-center">
            Already registered? <Link to="/owner/login">Sign in</Link>
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}
