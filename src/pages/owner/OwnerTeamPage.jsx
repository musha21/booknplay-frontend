import { useState } from 'react';
import {
  Button, Checkbox, FormControlLabel, Skeleton, Switch, TextField,
} from '@mui/material';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inviteOwnerStaff, listOwnerStaff, updateOwnerStaff } from '../../api/ownerStaff';
import { OwnerPage, OwnerPageHeader, OwnerSection } from '../../components/owner/OwnerDashboardUi';
import { useOwnerSubscription } from '../../hooks/useOwner';
import {
  canAddStaff,
  formatLimitCount,
  planLimitMessage,
  resolvePlanLimits,
} from '../../utils/subscription';

const PERMISSIONS = [
  ['canCalendar', 'Calendar'],
  ['canWalkIns', 'Walk-ins'],
  ['canCourts', 'Bookable spaces'],
  ['canReports', 'Reports'],
  ['canEarnings', 'Earnings'],
  ['canVenues', 'Venues'],
  ['canBilling', 'Billing'],
];

const emptyInvite = {
  name: '',
  email: '',
  temporaryPassword: '',
  canCalendar: true,
  canWalkIns: true,
  canCourts: true,
  canReports: false,
  canEarnings: false,
  canVenues: false,
  canBilling: false,
};

export default function OwnerTeamPage() {
  const queryClient = useQueryClient();
  const [invite, setInvite] = useState(emptyInvite);
  const { data: subscription } = useOwnerSubscription();
  const staffQuery = useQuery({
    queryKey: ['owner', 'staff'],
    queryFn: listOwnerStaff,
  });
  const staff = staffQuery.data || [];
  const limits = resolvePlanLimits(subscription);
  const maxStaff = staff[0]?.maxStaff ?? limits.maxStaff;
  const activeCount = staff[0]?.activeStaffCount
    ?? Number(subscription?.usage?.staffCount)
    ?? staff.filter((row) => row.active).length;
  const seatsOpen = canAddStaff(subscription, activeCount);

  const inviteMutation = useMutation({
    mutationFn: inviteOwnerStaff,
    onSuccess: () => {
      toast.success('Staff member invited');
      setInvite(emptyInvite);
      queryClient.invalidateQueries({ queryKey: ['owner', 'staff'] });
    },
    onError: (error) => toast.error(planLimitMessage(error, 'Could not invite staff')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateOwnerStaff(id, payload),
    onSuccess: () => {
      toast.success('Staff updated');
      queryClient.invalidateQueries({ queryKey: ['owner', 'staff'] });
    },
    onError: (error) => toast.error(planLimitMessage(error, 'Could not update staff')),
  });

  return (
    <OwnerPage className="max-w-5xl">
      <OwnerPageHeader
        eyebrow="Workspace"
        title="Team"
        description={`Active seats ${activeCount} / ${formatLimitCount(maxStaff)}. Set custom permissions per staff member.`}
      />

      <OwnerSection className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-black text-ink">Invite staff</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TextField label="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} fullWidth />
          <TextField label="Email" type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} fullWidth />
          <TextField
            className="sm:col-span-2"
            label="Temporary password"
            type="password"
            value={invite.temporaryPassword}
            onChange={(e) => setInvite({ ...invite, temporaryPassword: e.target.value })}
            fullWidth
            helperText="They can change this after first sign-in."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
          {PERMISSIONS.map(([key, label]) => (
            <FormControlLabel
              key={key}
              control={(
                <Checkbox
                  checked={Boolean(invite[key])}
                  onChange={(e) => setInvite({ ...invite, [key]: e.target.checked })}
                />
              )}
              label={<span className="text-sm font-bold">{label}</span>}
            />
          ))}
        </div>
        <Button
          className="!mt-4"
          variant="contained"
          color="secondary"
          disabled={
            inviteMutation.isPending
            || !seatsOpen
            || !invite.name
            || !invite.email
            || invite.temporaryPassword.length < 8
          }
          onClick={() => inviteMutation.mutate(invite)}
        >
          {inviteMutation.isPending ? 'Inviting…' : seatsOpen ? 'Invite staff' : 'Staff seat limit reached'}
        </Button>
      </OwnerSection>

      <OwnerSection className="mt-8">
        <h2 className="text-lg font-black text-ink">Members</h2>
        {staffQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2].map((item) => <Skeleton key={item} variant="rounded" height={96} />)}
          </div>
        ) : staff.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No staff yet. Invite a receptionist or manager to help with the calendar.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {staff.map((member) => (
              <article key={member.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-ink">{member.name}</p>
                    <p className="text-sm text-muted">{member.email}</p>
                  </div>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={member.active}
                        onChange={(e) => updateMutation.mutate({
                          id: member.id,
                          payload: { active: e.target.checked },
                        })}
                      />
                    )}
                    label={<span className="text-sm font-bold">{member.active ? 'Active' : 'Inactive'}</span>}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  {PERMISSIONS.map(([key, label]) => (
                    <FormControlLabel
                      key={key}
                      control={(
                        <Checkbox
                          checked={Boolean(member[key])}
                          onChange={(e) => updateMutation.mutate({
                            id: member.id,
                            payload: { [key]: e.target.checked },
                          })}
                        />
                      )}
                      label={<span className="text-sm font-bold">{label}</span>}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
