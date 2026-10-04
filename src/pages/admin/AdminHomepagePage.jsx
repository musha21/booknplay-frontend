import { useMemo, useState } from 'react';
import { Button, Checkbox, FormControlLabel, MenuItem, Select, TextField } from '@mui/material';
import { Add, ArrowDownward, ArrowUpward, Delete } from '@mui/icons-material';
import { toast } from 'sonner';
import { publishHomepage, saveHomepageDraft, uploadPremiumSlideImage } from '../../api/admin';
import { useAdminBusinesses, useAdminVenues, useHomepageDraft } from '../../hooks/useAdmin';
import { useSports } from '../../hooks/useVenues';
import mediaUrl from '../../utils/mediaUrl';

const SECTION_LABELS = { sports: 'Sports', businesses: 'Featured businesses', venues: 'Featured venues', cities: 'Cities', howItWorks: 'How it works', ownerPromotion: 'Owner promotion', trust: 'Trust indicators' };
const flagFor = { sports: 'showSports', businesses: 'showBusinesses', venues: 'showVenues', cities: 'showCities', howItWorks: 'showHowItWorks', ownerPromotion: 'showOwnerPromotion', trust: 'showTrust' };

const emptySlide = () => ({
  id: `slide-${Date.now()}`,
  businessId: '',
  enabled: true,
  sortOrder: 0,
  headline: '',
  description: '',
  badge: 'Premium court',
  imageUrl: '',
  primaryActionLabel: 'Explore venues',
  startsAt: '',
  expiresAt: '',
});

export default function AdminHomepagePage() {
  const { data, refetch } = useHomepageDraft();
  if (!data) return <div className="surface-card p-8">Loading homepage editor…</div>;
  return <HomepageEditor key={`${data.id}-${data.updatedAt}`} initial={data} refetch={refetch} />;
}

function HomepageEditor({ initial, refetch }) {
  const { data: businesses = [] } = useAdminBusinesses();
  const { data: venues = [] } = useAdminVenues();
  const { data: sports = [] } = useSports();
  const [form, setForm] = useState({
    ...initial,
    premiumSlides: initial.premiumSlides?.length ? initial.premiumSlides : [],
    premiumSliderEnabled: initial.premiumSliderEnabled !== false,
    previewMode: 'desktop',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const eligibleBusinesses = useMemo(
    () => businesses.filter((business) => business.enabled && !business.locked && business.venueCount > 0),
    [businesses]
  );
  const move = (index, direction) => {
    const next = [...form.sectionOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set('sectionOrder', next);
  };
  const updateSlide = (index, patch) => {
    const next = form.premiumSlides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, ...patch } : slide));
    set('premiumSlides', next);
  };
  const moveSlide = (index, direction) => {
    const next = [...form.premiumSlides];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set('premiumSlides', next.map((slide, sortOrder) => ({ ...slide, sortOrder })));
    setSelectedSlide(target);
  };
  const payload = () => ({
    eyebrow: form.eyebrow,
    heading: form.heading,
    description: form.description,
    showSearch: form.showSearch,
    showSports: form.showSports,
    showBusinesses: form.showBusinesses,
    showVenues: form.showVenues,
    showCities: form.showCities,
    showHowItWorks: form.showHowItWorks,
    showOwnerPromotion: form.showOwnerPromotion,
    showTrust: form.showTrust,
    sectionOrder: form.sectionOrder,
    featuredBusinessIds: form.featuredBusinessIds,
    featuredVenueIds: form.featuredVenueIds,
    featuredSportIds: form.featuredSportIds,
    premiumSliderEnabled: form.premiumSliderEnabled !== false,
    premiumSliderAutoplay: true,
    premiumSliderSeconds: 6,
    premiumSliderArrows: true,
    premiumSliderIndicators: true,
    premiumSliderPauseOnHover: true,
    animationIntensity: 'SUBTLE',
    premiumSlides: form.premiumSlides,
  });
  const save = async () => {
    setSaving(true);
    try {
      await saveHomepageDraft(payload());
      toast.success('Homepage draft saved');
      await refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save draft');
    } finally {
      setSaving(false);
    }
  };
  const publish = async () => {
    setSaving(true);
    try {
      await saveHomepageDraft(payload());
      await publishHomepage('Published from homepage editor');
      toast.success('Homepage published');
      await refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not publish');
    } finally {
      setSaving(false);
    }
  };
  const slide = form.premiumSlides[selectedSlide];
  const slideBusiness = businesses.find((item) => item.id === slide?.businessId);
  const businessImageOptions = [slideBusiness?.logoUrl, ...(slideBusiness?.imageUrls || [])]
    .filter(Boolean)
    .filter((url, index, list) => list.indexOf(url) === index);
  const slideImageSelectValue = !slide?.imageUrl
    ? ''
    : businessImageOptions.includes(slide.imageUrl)
      ? slide.imageUrl
      : '__custom__';

  const uploadSlideImage = async (file) => {
    if (!file || selectedSlide < 0) return;
    setUploadingSlideImage(true);
    try {
      const uploaded = await uploadPremiumSlideImage(file);
      updateSlide(selectedSlide, { imageUrl: uploaded.imageUrl });
      toast.success('Slide image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload slide image');
    } finally {
      setUploadingSlideImage(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Customer experience</p>
          <h1 className="mt-2 text-3xl font-black">Homepage editor</h1>
          <p className="mt-2 text-sm text-muted">Draft changes stay private until you publish.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>Save draft</Button>
          <Button variant="contained" color="secondary" onClick={publish} disabled={saving}>Publish</Button>
        </div>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <div className="space-y-5">
          <section className="surface-card space-y-4 p-6">
            <h2 className="text-lg font-black">Hero</h2>
            <TextField fullWidth label="Eyebrow" value={form.eyebrow || ''} onChange={(e) => set('eyebrow', e.target.value)} />
            <TextField fullWidth required label="Heading" value={form.heading || ''} onChange={(e) => set('heading', e.target.value)} />
            <TextField fullWidth multiline minRows={3} label="Description" value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
            <FormControlLabel control={<Checkbox checked={form.showSearch} onChange={(e) => set('showSearch', e.target.checked)} />} label="Show search controls" />
          </section>

          <section className="surface-card space-y-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">Premium courts</h2>
              <Button size="small" startIcon={<Add />} disabled={form.premiumSlides.length >= 5} onClick={() => { set('premiumSlides', [...form.premiumSlides, emptySlide()]); setSelectedSlide(form.premiumSlides.length); }}>Add slide</Button>
            </div>
            <FormControlLabel control={<Checkbox checked={form.premiumSliderEnabled !== false} onChange={(e) => set('premiumSliderEnabled', e.target.checked)} />} label="Enable premium courts" />
            {form.premiumSlides.map((item, index) => (
              <button key={item.id || index} type="button" onClick={() => setSelectedSlide(index)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${selectedSlide === index ? 'border-lime-400' : 'border-line'}`}>
                <span className="text-sm font-bold">{item.name || businesses.find((b) => b.id === item.businessId)?.name || item.headline || `Slide ${index + 1}`}</span>
                <span className="text-xs text-muted">{item.enabled === false ? 'Off' : 'On'}</span>
              </button>
            ))}
            {slide && (
              <div className="space-y-3 rounded-2xl border border-line p-4">
                <div className="flex gap-2">
                  <Button size="small" onClick={() => moveSlide(selectedSlide, -1)}><ArrowUpward fontSize="small" /></Button>
                  <Button size="small" onClick={() => moveSlide(selectedSlide, 1)}><ArrowDownward fontSize="small" /></Button>
                  <Button size="small" color="error" startIcon={<Delete />} onClick={() => { set('premiumSlides', form.premiumSlides.filter((_, index) => index !== selectedSlide)); setSelectedSlide(0); }}>Remove</Button>
                </div>
                <TextField select fullWidth label="Business" value={slide.businessId || ''} onChange={(e) => updateSlide(selectedSlide, { businessId: e.target.value })}>
                  {eligibleBusinesses.map((business) => <MenuItem key={business.id} value={business.id}>{business.name}</MenuItem>)}
                </TextField>
                <FormControlLabel control={<Checkbox checked={slide.enabled !== false} onChange={(e) => updateSlide(selectedSlide, { enabled: e.target.checked })} />} label="Enable this slide" />
                <TextField fullWidth label="Promotional headline" value={slide.headline || ''} onChange={(e) => updateSlide(selectedSlide, { headline: e.target.value })} />
                <div className="space-y-2 rounded-xl border border-line p-3">
                  <p className="text-sm font-bold">Slide image</p>
                  {slide.imageUrl ? (
                    <img src={mediaUrl(slide.imageUrl)} alt="Slide preview" className="h-36 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-lg bg-canvas text-sm text-muted">Automatic business image</div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button component="label" size="small" disabled={uploadingSlideImage}>
                      {uploadingSlideImage ? 'Uploading…' : 'Upload slide image'}
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          uploadSlideImage(file);
                        }}
                      />
                    </Button>
                    {slide.imageUrl ? (
                      <Button size="small" color="inherit" disabled={uploadingSlideImage} onClick={() => updateSlide(selectedSlide, { imageUrl: '' })}>
                        Use automatic
                      </Button>
                    ) : null}
                  </div>
                  <TextField
                    select
                    fullWidth
                    label="Or pick business image"
                    value={slideImageSelectValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '__custom__') return;
                      updateSlide(selectedSlide, { imageUrl: value });
                    }}
                  >
                    <MenuItem value="">Automatic</MenuItem>
                    {slideImageSelectValue === '__custom__' && (
                      <MenuItem value="__custom__">Custom upload</MenuItem>
                    )}
                    {businessImageOptions.map((url) => (
                      <MenuItem key={url} value={url}>{url}</MenuItem>
                    ))}
                  </TextField>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField type="date" label="Start date" value={slide.startsAt || ''} onChange={(e) => updateSlide(selectedSlide, { startsAt: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                  <TextField type="date" label="Expiry date" value={slide.expiresAt || ''} onChange={(e) => updateSlide(selectedSlide, { expiresAt: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                </div>
              </div>
            )}
          </section>

          <section className="surface-card p-6">
            <h2 className="text-lg font-black">Sections and order</h2>
            <div className="mt-4 space-y-2">
              {form.sectionOrder.map((section, index) => (
                <div key={section} className="flex items-center gap-2 rounded-xl border border-line p-2">
                  <Checkbox checked={form[flagFor[section]]} onChange={(e) => set(flagFor[section], e.target.checked)} />
                  <span className="flex-1 text-sm font-bold">{SECTION_LABELS[section]}</span>
                  <Button size="small" aria-label="Move up" onClick={() => move(index, -1)}><ArrowUpward fontSize="small" /></Button>
                  <Button size="small" aria-label="Move down" onClick={() => move(index, 1)}><ArrowDownward fontSize="small" /></Button>
                </div>
              ))}
            </div>
          </section>
          <section className="surface-card space-y-5 p-6">
            <h2 className="text-lg font-black">Featured content</h2>
            <div><label className="field-label">Businesses</label><Select multiple fullWidth value={form.featuredBusinessIds || []} onChange={(e) => set('featuredBusinessIds', e.target.value)}>{businesses.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}</Select></div>
            <div><label className="field-label">Venues</label><Select multiple fullWidth value={form.featuredVenueIds || []} onChange={(e) => set('featuredVenueIds', e.target.value)}>{venues.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}</Select></div>
            <div><label className="field-label">Sports</label><Select multiple fullWidth value={form.featuredSportIds || []} onChange={(e) => set('featuredSportIds', e.target.value)}>{sports.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}</Select></div>
          </section>
        </div>
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-line bg-canvas px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-muted">
              <span>Customer preview · Draft v{form.version}</span>
              <div className="flex gap-2">
                <Button size="small" onClick={() => set('previewMode', 'mobile')}>Mobile</Button>
                <Button size="small" onClick={() => set('previewMode', 'desktop')}>Desktop</Button>
              </div>
            </div>
            <div className={`p-7 ${form.previewMode === 'mobile' ? 'max-w-sm' : ''}`}>
              <div>
                <p className="eyebrow">{form.eyebrow}</p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-[-.04em]">{form.heading}</h2>
                <p className="mt-4 leading-7 text-muted">{form.description}</p>
              </div>
              {form.showSearch && <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-line bg-canvas p-3"><span className="rounded-lg bg-surface p-3 text-xs">Sport</span><span className="rounded-lg bg-surface p-3 text-xs">Location</span><span className="rounded-lg bg-lime-400 p-3 text-center text-xs font-bold text-navy-900">Search</span></div>}
            </div>
            <div className="space-y-2 border-t border-line p-5">{form.sectionOrder.filter((s) => form[flagFor[s]]).map((s) => <div key={s} className="rounded-xl bg-canvas p-4 text-sm font-bold">{SECTION_LABELS[s]}</div>)}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
