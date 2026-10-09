import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { FormControlLabel, Skeleton, Switch, TextField } from '@mui/material';
import {
  OwnerPage, OwnerPageHeader, OwnerSection, OwnerTabBar,
} from '../../components/owner/OwnerDashboardUi';
import {
  useOwnerPayouts,
  useOwnerSettings,
  useUpdateOwnerSettings,
} from '../../hooks/useOwner';
import useAuthStore from '../../stores/authStore';

export default function OwnerSettingsPage() {
  const role = useAuthStore((s) => s.role);
  const isStaff = role === 'STAFF';
  const tabs = [
    { value: 'business', label: 'Business' },
    { value: 'booking', label: 'Booking policy' },
    ...(!isStaff ? [{ value: 'bank', label: 'Bank / payouts' }] : []),
    { value: 'notifications', label: 'Notifications' },
  ];
  const [tab, setTab] = useState('business');
  const settingsQuery = useOwnerSettings({ enabled: !isStaff || tab !== 'bank' });
  const updateSettings = useUpdateOwnerSettings();
  const payoutsQuery = useOwnerPayouts();
  const settings = settingsQuery.data;
  const [form, setForm] = useState({
    contactEmail: '',
    contactPhone: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankBranch: '',
    notifyBookingEmail: true,
    notifyBookingSms: false,
    notifyPaymentEmail: true,
    notifyTrialEmail: true,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      contactEmail: settings.contactEmail || '',
      contactPhone: settings.contactPhone || '',
      bankName: settings.bankName || '',
      bankAccountName: settings.bankAccountName || '',
      bankAccountNumber: settings.bankAccountNumber || '',
      bankBranch: settings.bankBranch || '',
      notifyBookingEmail: settings.notifyBookingEmail !== false,
      notifyBookingSms: Boolean(settings.notifyBookingSms),
      notifyPaymentEmail: settings.notifyPaymentEmail !== false,
      notifyTrialEmail: settings.notifyTrialEmail !== false,
    });
  }, [settings]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setSwitch = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }));

  const save = () => {
    if (isStaff && tab === 'bank') return;
    updateSettings.mutate({
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      bankName: form.bankName || null,
      bankAccountName: form.bankAccountName || null,
      bankAccountNumber: form.bankAccountNumber || null,
      bankBranch: form.bankBranch || null,
      notifyBookingEmail: form.notifyBookingEmail,
      notifyBookingSms: form.notifyBookingSms,
      notifyPaymentEmail: form.notifyPaymentEmail,
      notifyTrialEmail: form.notifyTrialEmail,
    });
  };

  const payouts = Array.isArray(payoutsQuery.data) ? payoutsQuery.data : [];

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Business contact, payouts, and notification preferences."
        actions={(
          <RouterLink to="/owner/reviews" className="btn-outline">
            Reviews
          </RouterLink>
        )}
      />

      <OwnerSection className="mt-6 max-w-2xl">
        <OwnerTabBar tabs={tabs} value={tab} onChange={setTab} />
      </OwnerSection>

      {settingsQuery.isLoading && tab !== 'booking' ? (
        <Skeleton variant="rounded" height={240} className="mt-6 !rounded-[20px]" />
      ) : (
        <OwnerSection className="mt-6 max-w-2xl">
          {tab === 'business' && (
            <div className="surface-card space-y-4 p-5">
              <p className="text-sm text-muted">
                Business name: <strong className="text-ink">{settings?.businessName || '—'}</strong>
              </p>
              <TextField fullWidth size="small" label="Contact email" value={form.contactEmail} onChange={setField('contactEmail')} />
              <TextField fullWidth size="small" label="Contact phone" value={form.contactPhone} onChange={setField('contactPhone')} />
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" className="btn-primary" disabled={updateSettings.isPending || isStaff} onClick={save}>
                  Save contact
                </button>
                <RouterLink to="/owner/profile" className="btn-outline">Open business profile</RouterLink>
              </div>
            </div>
          )}

          {tab === 'booking' && (
            <div className="surface-card p-5">
              <p className="text-sm leading-6 text-muted">
                Cancellation and booking rules are managed per venue.
              </p>
              <RouterLink to="/owner/venues" className="btn-primary mt-4 inline-flex">
                Choose a venue policy
              </RouterLink>
            </div>
          )}

          {tab === 'bank' && !isStaff && (
            <div className="space-y-6">
              <div className="surface-card space-y-4 p-5">
                <TextField fullWidth size="small" label="Bank name" value={form.bankName} onChange={setField('bankName')} />
                <TextField fullWidth size="small" label="Account name" value={form.bankAccountName} onChange={setField('bankAccountName')} />
                <TextField fullWidth size="small" label="Account number" value={form.bankAccountNumber} onChange={setField('bankAccountNumber')} />
                <TextField fullWidth size="small" label="Branch" value={form.bankBranch} onChange={setField('bankBranch')} />
                <button type="button" className="btn-primary" disabled={updateSettings.isPending} onClick={save}>
                  Save payout details
                </button>
              </div>
              <div>
                <h3 className="text-lg font-black text-ink">Payout history</h3>
                {payouts.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">No payouts recorded yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                    {payouts.map((payout) => (
                      <li key={payout.id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="font-bold text-ink">{payout.periodStart} → {payout.periodEnd}</span>
                        <span className="font-black text-ink" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          LKR {Number(payout.net || 0).toLocaleString('en-LK')}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="surface-card space-y-2 p-5">
              <FormControlLabel control={<Switch checked={form.notifyBookingEmail} onChange={setSwitch('notifyBookingEmail')} />} label="Email on new booking" />
              <FormControlLabel control={<Switch checked={form.notifyBookingSms} onChange={setSwitch('notifyBookingSms')} />} label="SMS on new booking" />
              <FormControlLabel control={<Switch checked={form.notifyPaymentEmail} onChange={setSwitch('notifyPaymentEmail')} />} label="Email on payment" />
              <FormControlLabel control={<Switch checked={form.notifyTrialEmail} onChange={setSwitch('notifyTrialEmail')} />} label="Trial / billing emails" />
              <button type="button" className="btn-primary mt-3" disabled={updateSettings.isPending || isStaff} onClick={save}>
                Save notifications
              </button>
            </div>
          )}
        </OwnerSection>
      )}
    </OwnerPage>
  );
}
