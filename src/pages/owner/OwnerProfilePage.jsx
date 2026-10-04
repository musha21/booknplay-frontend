import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, TextField } from '@mui/material';
import { toast } from 'sonner';
import ownerAuthApi from '../../api/ownerAuth';
import {
  changeOwnerPassword,
  deleteBusinessImage,
  reorderBusinessImages,
  updateBusiness,
  uploadBusinessImages,
} from '../../api/ownerBusiness';
import { OwnerPage, OwnerPageHeader, OwnerSection } from '../../components/owner/OwnerDashboardUi';
import { useOwnerSubscription } from '../../hooks/useOwner';
import { mediaUrl } from '../../utils/mediaUrl';
import useAuthStore from '../../stores/authStore';
import {
  daysRemaining,
  isOwnerSubscriptionsEnabled,
  isTrialing,
  planDisplayName,
  statusDisplayLabel,
} from '../../utils/subscription';

const unwrap = (res) => res?.data?.data ?? res?.data ?? res;

export default function OwnerProfilePage() {
  const queryClient = useQueryClient();
  const setOwner = useAuthStore((s) => s.setOwner);
  const persistLogin = useAuthStore((s) => s.login);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const { data: subscription } = useOwnerSubscription();

  const syncOwner = (data) => {
    setProfile(data);
    setOwner(data);
    persistLogin(
      { id: data.userId, email: data.email, name: data.businessName, role: 'BUSINESS_OWNER' },
      { accessToken, refreshToken },
      { role: 'BUSINESS_OWNER', owner: data },
    );
    queryClient.setQueryData(['owner', 'me'], data);
  };

  const load = async () => {
    try {
      const data = unwrap(await ownerAuthApi.getOwnerMe());
      syncOwner(data);
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
    // Profile is loaded once when the protected owner screen mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const save = async () => {
    try {
      const data = unwrap(await updateBusiness(form));
      syncOwner(data);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save profile');
    }
  };

  const onFile = async (field, file) => {
    if (!file) return;
    try {
      const payload = field === 'logo' ? { logo: file } : field === 'profile' ? { profileImage: file } : { images: [file] };
      const data = unwrap(await uploadBusinessImages(payload));
      syncOwner(data);
      toast.success('Image updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not upload image');
    }
  };

  const removeGallery = async (mediaId) => {
    try {
      const data = unwrap(await deleteBusinessImage(mediaId));
      syncOwner(data);
      toast.success('Gallery image removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove image');
    }
  };

  const moveGallery = async (index, delta) => {
    const rows = profile?.businessImages || [];
    const target = index + delta;
    if (!rows.length || target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    try {
      const data = unwrap(await reorderBusinessImages(next.map((item) => item.id)));
      syncOwner(data);
      toast.success('Gallery order updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reorder gallery');
    }
  };

  const changePass = async () => {
    try {
      await changeOwnerPassword(passwords);
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    }
  };

  if (loading) {
    return (
      <OwnerPage className="max-w-3xl">
        <p className="text-sm text-muted">Loading profile…</p>
      </OwnerPage>
    );
  }

  if (!profile) {
    return (
      <OwnerPage className="max-w-3xl">
        <OwnerPageHeader eyebrow="Account" title="Business profile" description="Could not load this profile." />
      </OwnerPage>
    );
  }

  const gallery = profile.businessImages?.length
    ? profile.businessImages
    : (profile.imageUrls || []).map((url, index) => ({ id: `legacy-${index}`, url, sortOrder: index }));

  return (
    <OwnerPage className="max-w-3xl">
      <OwnerPageHeader
        eyebrow="Account"
        title="Business profile"
        description="Keep your logo, contact details and gallery current for players and the owner shell."
      />

      {isOwnerSubscriptionsEnabled() && subscription && (
        <OwnerSection className="mt-6 rounded-2xl border border-line bg-canvas/50 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink">
              <span className="font-extrabold">Plan:</span>{' '}
              {planDisplayName(subscription.planCode)} · {statusDisplayLabel(subscription.status)}
              {isTrialing(subscription) && daysRemaining(subscription) != null
                ? ` · ${daysRemaining(subscription)} day${daysRemaining(subscription) === 1 ? '' : 's'} left`
                : ''}
            </p>
            <Button component={RouterLink} to="/owner/billing" size="small" className="!font-extrabold">
              Manage billing
            </Button>
          </div>
        </OwnerSection>
      )}

      <OwnerSection className="mt-8 surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={mediaUrl(profile.ownerProfileImageUrl)} sx={{ width: 72, height: 72 }} className="!bg-lime-400 !font-black !text-navy-900">
            {(profile.ownerName || 'O')[0]}
          </Avatar>
          <div>
            <h2 className="text-lg font-black text-ink">Owner photo</h2>
            <Button className="!mt-2" component="label" variant="outlined">
              Change photo
              <input hidden type="file" accept="image/*" onChange={(e) => onFile('profile', e.target.files?.[0])} />
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          <TextField label="Owner name" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} fullWidth />
          <TextField label="Contact email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} fullWidth />
          <TextField label="Phone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} fullWidth />
        </div>
      </OwnerSection>

      <OwnerSection className="mt-6 surface-card p-5 sm:p-6">
        <h2 className="text-lg font-black text-ink">Business</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-navy-900 text-sm font-black text-lime-300">
            {profile.logoUrl
              ? <img src={mediaUrl(profile.logoUrl)} alt="" className="h-full w-full object-cover" />
              : (profile.businessName || 'B').slice(0, 2).toUpperCase()}
          </span>
          <Button component="label" variant="outlined">
            Upload logo
            <input hidden type="file" accept="image/*" onChange={(e) => onFile('logo', e.target.files?.[0])} />
          </Button>
        </div>
        <div className="mt-5 grid gap-4">
          <TextField label="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} fullWidth />
          <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} fullWidth />
        </div>
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted">Gallery</h3>
            <Button component="label" size="small" variant="outlined" disabled={gallery.length >= 3}>
              Add image
              <input hidden type="file" accept="image/*" onChange={(e) => onFile('gallery', e.target.files?.[0])} />
            </Button>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {gallery.map((item, index) => (
              <li key={item.id || item.url} className="overflow-hidden rounded-2xl border border-line">
                <img src={mediaUrl(item.url)} alt="" className="h-28 w-full object-cover" />
                <div className="flex flex-wrap gap-1 p-2">
                  <Button size="small" disabled={index === 0 || String(item.id).startsWith('legacy-')} onClick={() => moveGallery(index, -1)}>Up</Button>
                  <Button size="small" disabled={index === gallery.length - 1 || String(item.id).startsWith('legacy-')} onClick={() => moveGallery(index, 1)}>Down</Button>
                  {!String(item.id).startsWith('legacy-') && (
                    <Button size="small" color="error" onClick={() => removeGallery(item.id)}>Remove</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <Button variant="contained" color="secondary" className="!mt-5" onClick={save}>Save changes</Button>
      </OwnerSection>

      <OwnerSection className="mt-6 surface-card p-5 sm:p-6">
        <h2 className="text-lg font-black text-ink">Change password</h2>
        <div className="mt-4 grid gap-4">
          <TextField type="password" label="Current password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} fullWidth />
          <TextField type="password" label="New password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} fullWidth />
          <Button variant="outlined" onClick={changePass}>Update password</Button>
        </div>
      </OwnerSection>
    </OwnerPage>
  );
}
