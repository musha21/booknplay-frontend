import { Download } from 'lucide-react';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import usePwaInstall from '../../hooks/usePwaInstall';

/**
 * Optional thin wrapper for MUI menus. Prefer calling usePwaInstall in the parent
 * when the parent already needs other install flags.
 */
export default function PwaInstallMenuItem({ onAfterClick, className = '' }) {
  const { shouldOfferInstall, promptInstall } = usePwaInstall();
  if (!shouldOfferInstall) return null;

  return (
    <MenuItem
      className={className}
      onClick={async () => {
        await promptInstall();
        onAfterClick?.();
      }}
    >
      <ListItemIcon>
        <Download size={18} />
      </ListItemIcon>
      <ListItemText>Install App</ListItemText>
    </MenuItem>
  );
}
