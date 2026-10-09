import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MenuItem, Skeleton, TextField } from '@mui/material';
import { Paid } from '@mui/icons-material';
import { toast } from 'sonner';
import {
  OwnerEmptyState, OwnerPage, OwnerPageHeader, OwnerSection,
} from '../../components/owner/OwnerDashboardUi';
import {
  useOwnerCourtPricing,
  useOwnerCourts,
  useOwnerVenues,
} from '../../hooks/useOwner';
import ownerVenuesApi from '../../api/ownerVenues';
import { useQueryClient } from '@tanstack/react-query';
import {
  ALL_DAYS,
  buildDayPreview,
  peakBandRules,
  toApiRule,
  upsertRulesByType,
  weekendBandRules,
} from '../../utils/courtPricing';

export default function OwnerPricingPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: venues = [] } = useOwnerVenues(false);
  const [venueId, setVenueId] = useState(searchParams.get('venueId') || '');
  const [courtId, setCourtId] = useState(searchParams.get('courtId') || '');
  const courtsQuery = useOwnerCourts(venueId || undefined);
  const pricingQuery = useOwnerCourtPricing(courtId || undefined);
  const courts = courtsQuery.data || [];
  const selectedCourt = courts.find((c) => String(c.id) === String(courtId));
  const apiRules = Array.isArray(pricingQuery.data)
    ? pricingQuery.data
    : (pricingQuery.data?.rules || []);

  const [saving, setSaving] = useState(false);
  const [savingBase, setSavingBase] = useState(false);
  const [draft, setDraft] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [peakStart, setPeakStart] = useState('18:00');
  const [peakEnd, setPeakEnd] = useState('22:00');
  const [peakPrice, setPeakPrice] = useState('4000');
  const [weekendStart, setWeekendStart] = useState('08:00');
  const [weekendEnd, setWeekendEnd] = useState('22:00');
  const [weekendPrice, setWeekendPrice] = useState('4500');
  const [previewDay, setPreviewDay] = useState('MONDAY');

  useEffect(() => {
    const qVenue = searchParams.get('venueId');
    const qCourt = searchParams.get('courtId');
    if (qVenue) setVenueId(qVenue);
    if (qCourt) setCourtId(qCourt);
  }, [searchParams]);

  useEffect(() => {
    if (!venueId && venues[0]) setVenueId(venues[0].id);
  }, [venues, venueId]);

  useEffect(() => {
    if (!venueId) return;
    const courtStillInVenue = courts.some((c) => String(c.id) === String(courtId));
    if (!courtId || (!courtsQuery.isLoading && courts.length && !courtStillInVenue)) {
      if (courts[0]) setCourtId(courts[0].id);
    }
  }, [venueId, courts, courtId, courtsQuery.isLoading]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (venueId) next.set('venueId', venueId);
    if (courtId) next.set('courtId', courtId);
    setSearchParams(next, { replace: true });
  }, [venueId, courtId, setSearchParams]);

  useEffect(() => {
    if (selectedCourt?.hourlyRate != null) {
      setHourlyRate(String(selectedCourt.hourlyRate));
    }
  }, [selectedCourt?.id, selectedCourt?.hourlyRate]);

  useEffect(() => {
    if (!courtId || pricingQuery.isLoading) return;
    setDraft(apiRules.map((rule) => ({
      dayOfWeek: rule.dayOfWeek ?? rule.day ?? 'MONDAY',
      startTime: String(rule.startTime || '').slice(0, 5),
      endTime: String(rule.endTime || '').slice(0, 5),
      price: rule.price ?? rule.amount ?? '',
      ruleType: rule.ruleType || undefined,
      priority: rule.priority,
      label: rule.label || '',
    })));
  }, [courtId, pricingQuery.isLoading, pricingQuery.dataUpdatedAt]);

  const preview = useMemo(
    () => buildDayPreview(hourlyRate, draft, previewDay),
    [hourlyRate, draft, previewDay],
  );

  const applyPeakHelper = () => {
    if (!peakPrice) {
      toast.error('Enter a peak price');
      return;
    }
    setDraft((prev) => upsertRulesByType(prev, 'PEAK', peakBandRules({
      startTime: peakStart,
      endTime: peakEnd,
      price: peakPrice,
    })));
    toast.success('Peak bands applied (Mon–Fri). Save to persist.');
  };

  const applyWeekendHelper = () => {
    if (!weekendPrice) {
      toast.error('Enter a weekend price');
      return;
    }
    setDraft((prev) => upsertRulesByType(prev, 'WEEKEND', weekendBandRules({
      startTime: weekendStart,
      endTime: weekendEnd,
      price: weekendPrice,
    })));
    toast.success('Weekend bands applied (Sat–Sun). Save to persist.');
  };

  const addRule = () => {
    setDraft((prev) => [...prev, {
      dayOfWeek: 'MONDAY',
      startTime: '08:00',
      endTime: '22:00',
      price: hourlyRate || '2000',
      ruleType: 'CUSTOM',
      priority: 10,
      label: '',
    }]);
  };

  const removeRule = (index) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const saveBaseRate = async () => {
    if (!selectedCourt) return;
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate < 0) {
      toast.error('Enter a valid normal hourly rate');
      return;
    }
    setSavingBase(true);
    try {
      await ownerVenuesApi.updateCourt(selectedCourt.id, {
        name: selectedCourt.name,
        sportId: selectedCourt.sportId,
        hourlyRate: rate,
      });
      await queryClient.invalidateQueries({ queryKey: ['owner', 'courts'] });
      toast.success('Normal rate saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save normal rate');
    } finally {
      setSavingBase(false);
    }
  };

  const save = async () => {
    if (!courtId) return;
    setSaving(true);
    try {
      await ownerVenuesApi.replacePricing(courtId, draft.map(toApiRule));
      await queryClient.invalidateQueries({ queryKey: ['owner', 'courts', courtId, 'pricing'] });
      toast.success('Pricing bands saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <OwnerPage>
      <OwnerPageHeader
        eyebrow="Commerce"
        title="Pricing"
        description="Set Normal, Peak, and Weekend rates for each bookable space. Matching bands use Weekend over Peak over Custom, then Normal."
      />

      <OwnerSection className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl">
        <TextField select size="small" label="Venue" value={venueId} onChange={(e) => {
          setVenueId(e.target.value);
          setCourtId('');
        }} fullWidth>
          {venues.map((v) => <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Space" value={courtId} onChange={(e) => setCourtId(e.target.value)} fullWidth disabled={!venueId}>
          {courts.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}{c.sportName ? ` · ${c.sportName}` : ''}
            </MenuItem>
          ))}
        </TextField>
      </OwnerSection>

      <OwnerSection className="mt-6">
        {!courtId ? (
          <OwnerEmptyState icon={Paid} title="Select a space" description="Choose a venue and bookable space to edit pricing." />
        ) : pricingQuery.isLoading || courtsQuery.isLoading ? (
          <Skeleton variant="rounded" height={320} className="!rounded-[20px]" />
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-line p-4 sm:p-5 space-y-3">
              <div>
                <h3 className="text-base font-bold text-ink">Normal rate</h3>
                <p className="text-sm text-muted">Default / off-peak hourly price when no Peak or Weekend band matches.</p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <TextField
                  size="small"
                  label="Hourly rate (LKR)"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  sx={{ minWidth: 180 }}
                />
                <button type="button" className="btn-primary" disabled={savingBase} onClick={saveBaseRate}>
                  {savingBase ? 'Saving…' : 'Save normal rate'}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-line p-4 sm:p-5 space-y-3">
              <div>
                <h3 className="text-base font-bold text-ink">Peak pricing</h3>
                <p className="text-sm text-muted">Applies Mon–Fri for the window below (e.g. 6–10 PM → LKR 4,000).</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <TextField size="small" label="Start" type="time" value={peakStart} onChange={(e) => setPeakStart(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="End" type="time" value={peakEnd} onChange={(e) => setPeakEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="Price (LKR)" type="number" value={peakPrice} onChange={(e) => setPeakPrice(e.target.value)} />
                <button type="button" className="btn-outline" onClick={applyPeakHelper}>Apply peak bands</button>
              </div>
            </section>

            <section className="rounded-2xl border border-line p-4 sm:p-5 space-y-3">
              <div>
                <h3 className="text-base font-bold text-ink">Weekend pricing</h3>
                <p className="text-sm text-muted">Applies Sat–Sun for the window below (e.g. LKR 4,500).</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <TextField size="small" label="Start" type="time" value={weekendStart} onChange={(e) => setWeekendStart(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="End" type="time" value={weekendEnd} onChange={(e) => setWeekendEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="Price (LKR)" type="number" value={weekendPrice} onChange={(e) => setWeekendPrice(e.target.value)} />
                <button type="button" className="btn-outline" onClick={applyWeekendHelper}>Apply weekend bands</button>
              </div>
            </section>

            <section className="rounded-2xl border border-line p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-ink">Day preview</h3>
                  <p className="text-sm text-muted">Resolved LKR per hour (unsaved draft included).</p>
                </div>
                <TextField select size="small" label="Day" value={previewDay} onChange={(e) => setPreviewDay(e.target.value)} sx={{ minWidth: 160 }}>
                  {ALL_DAYS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </TextField>
              </div>
              <div className="flex flex-wrap gap-2">
                {preview.map((slot) => (
                  <div key={slot.startTime} className="rounded-xl border border-line bg-canvas/40 px-3 py-2 text-sm">
                    <span className="text-muted">{slot.startTime}</span>
                    <strong className="ml-2 text-ink">LKR {slot.price}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-ink">All bands</h3>
                <p className="text-sm text-muted">Fine-tune individual day/time rules. Save pricing to persist bands.</p>
              </div>
              {draft.length === 0 ? (
                <p className="text-sm text-muted">No peak/weekend bands yet. Normal rate still applies to every hour.</p>
              ) : (
                <div className="space-y-3">
                  {draft.map((rule, index) => (
                    <div key={index} className="grid gap-2 rounded-2xl border border-line p-3 sm:grid-cols-6">
                      <TextField select size="small" label="Day" value={rule.dayOfWeek} onChange={(e) => {
                        const value = e.target.value;
                        setDraft((prev) => prev.map((r, i) => (i === index ? { ...r, dayOfWeek: value } : r)));
                      }}>
                        {ALL_DAYS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                      </TextField>
                      <TextField size="small" label="Start" type="time" value={rule.startTime} onChange={(e) => {
                        const value = e.target.value;
                        setDraft((prev) => prev.map((r, i) => (i === index ? { ...r, startTime: value } : r)));
                      }} InputLabelProps={{ shrink: true }} />
                      <TextField size="small" label="End" type="time" value={rule.endTime} onChange={(e) => {
                        const value = e.target.value;
                        setDraft((prev) => prev.map((r, i) => (i === index ? { ...r, endTime: value } : r)));
                      }} InputLabelProps={{ shrink: true }} />
                      <TextField size="small" label="Price (LKR)" type="number" value={rule.price} onChange={(e) => {
                        const value = e.target.value;
                        setDraft((prev) => prev.map((r, i) => (i === index ? { ...r, price: value } : r)));
                      }} />
                      <TextField select size="small" label="Type" value={rule.ruleType || 'CUSTOM'} onChange={(e) => {
                        const value = e.target.value;
                        setDraft((prev) => prev.map((r, i) => (i === index ? {
                          ...r,
                          ruleType: value,
                          priority: value === 'WEEKEND' ? 30 : value === 'PEAK' ? 20 : 10,
                        } : r)));
                      }}>
                        {['PEAK', 'WEEKEND', 'CUSTOM'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                      </TextField>
                      <button type="button" className="btn-outline" onClick={() => removeRule(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline" onClick={addRule}>Add custom rule</button>
                <button type="button" className="btn-primary" disabled={saving} onClick={save}>
                  {saving ? 'Saving…' : 'Save pricing bands'}
                </button>
              </div>
            </section>
          </div>
        )}
      </OwnerSection>
    </OwnerPage>
  );
}
