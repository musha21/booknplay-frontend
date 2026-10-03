import { Navigate, useLocation } from 'react-router-dom';
import { buildLegacySearchRedirect } from '../../utils/searchParams';

export default function LegacySearchRedirect() {
  const { search } = useLocation();
  return <Navigate replace to={buildLegacySearchRedirect(search)} />;
}
