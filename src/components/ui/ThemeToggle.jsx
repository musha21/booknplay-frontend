import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useThemeMode } from '../../theme/ThemeModeContext';

export default function ThemeToggle({ inverse = false }) {
  const { resolvedMode, toggleMode } = useThemeMode();
  const next = resolvedMode === 'dark' ? 'light' : 'dark';
  return (
    <Tooltip title={`Use ${next} theme`}>
      <IconButton
        onClick={toggleMode}
        aria-label={`Use ${next} theme`}
        size="small"
        sx={{ color: inverse ? 'white' : 'text.primary', border: '1px solid', borderColor: inverse ? 'rgba(255,255,255,.2)' : 'divider' }}
      >
        {resolvedMode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
      </IconButton>
    </Tooltip>
  );
}

