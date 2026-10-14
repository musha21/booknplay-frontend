import { LocalOffer } from '@mui/icons-material';
import { usePublicPromotions } from '../../hooks/useVenues';

export default function PublicPromotionsStrip() {
  const query = usePublicPromotions();
  const promotions = query.data || [];
  if (!promotions.length) return null;

  return (
    <section className="hp-section promo-strip" aria-label="Current deals">
      <div className="hp-section-head">
        <div>
          <p className="hp-kicker">Deals on now</p>
          <h2>Play more for less</h2>
        </div>
      </div>
      <div className="promo-strip-row">
        {promotions.slice(0, 6).map((promo) => (
          <article key={promo.id} className="promo-chip">
            <LocalOffer fontSize="small" />
            <div>
              <strong>{promo.name}</strong>
              <p>{promo.code} · until {promo.endDate}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
