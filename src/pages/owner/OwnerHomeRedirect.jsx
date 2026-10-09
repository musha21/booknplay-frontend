import { Navigate } from 'react-router-dom';
import { resolveOwnerHomePath } from '../../utils/ownerOverview';

/** Legacy entry: always land on the owner dashboard. */
export default function OwnerHomeRedirect() {
  return <Navigate to={resolveOwnerHomePath()} replace />;
}
