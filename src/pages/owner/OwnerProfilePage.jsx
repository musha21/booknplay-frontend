import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'sonner';
import ownerAuthApi from '../../api/ownerAuth';
import { changeOwnerPassword, updateBusiness, uploadBusinessImages } from '../../api/ownerBusiness';
import { mediaUrl } from '../../utils/mediaUrl';
import useAuthStore from '../../stores/authStore';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export default function OwnerProfilePage() {
  const persistLogin = useAuthStore((s) => s.login);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = unwrap(await ownerAuthApi.getOwnerMe());
      setProfile(data);
      setForm({
        ownerName: data.ownerName || '',
        businessName: data.businessName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const data = unwrap(await updateBusiness(form));
    setProfile(data);
    persistLogin(
      { ...data, role: 'BUSINESS_OWNER' },
      { accessToken, refreshToken },
      { role: 'BUSINESS_OWNER', owner: data }
    );
    toast.success('Profile saved');
  };

  const onFile = async (field, file) => {
    if (!file) return;
    const payload = field === 'logo' ? { logo: file } : field === 'profile' ? { profileImage: file } : { images: [file] };
    const data = unwrap(await uploadBusinessImages(payload));
    setProfile(data);
    toast.success('Image updated');
  };

  const changePass = async () => {
    await changeOwnerPassword(passwords);
    toast.success('Password changed');
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  if (loading) return <Typography>Loading profile…</Typography>;
  if (!profile) return <Typography>Could not load profile.</Typography>;

  return (
    <Stack spacing={3} maxWidth={720}>
      <Typography variant="h4">Owner profile</Typography>
      <Paper className="p-4">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={mediaUrl(profile.ownerProfileImageUrl)} sx={{ width: 72, height: 72 }} />
          <Button component="label">Change photo
            <input hidden type="file" accept="image/*" onChange={(e) => onFile('profile', e.target.files?.[0])} />
          </Button>
        </Stack>
        <Stack spacing={2} className="mt-4">
          <TextField label="Name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
          <TextField label="Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          <TextField label="Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        </Stack>
      </Paper>
      <Paper className="p-4">
        <Typography variant="h6">Business</Typography>
        {profile.logoUrl && <img src={mediaUrl(profile.logoUrl)} alt="logo" className="h-16 my-2" />}
        <Stack spacing={2} className="mt-2">
          <TextField label="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Button component="label">Upload logo<input hidden type="file" accept="image/*" onChange={(e) => onFile('logo', e.target.files?.[0])} /></Button>
          <Button component="label">Add gallery image<input hidden type="file" accept="image/*" onChange={(e) => onFile('gallery', e.target.files?.[0])} /></Button>
          <Box className="flex gap-2 flex-wrap">
            {(profile.imageUrls || []).map((url) => <img key={url} src={mediaUrl(url)} alt="" className="h-20 w-20 object-cover rounded-lg" />)}
          </Box>
        </Stack>
        <Button variant="contained" className="!mt-4" onClick={save}>Save changes</Button>
      </Paper>
      <Paper className="p-4">
        <Typography variant="h6">Change password</Typography>
        <Stack spacing={2} className="mt-2">
          <TextField type="password" label="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
          <TextField type="password" label="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
          <Button onClick={changePass}>Update password</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
