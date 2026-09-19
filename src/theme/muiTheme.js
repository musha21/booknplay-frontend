import { createTheme } from '@mui/material/styles';

const light = {
  background: { default: '#F7F9FC', paper: '#FFFFFF' },
  text: { primary: '#0F172A', secondary: '#64748B', disabled: '#94A3B8' },
  divider: '#E2E8F0',
};

const dark = {
  background: { default: '#050B16', paper: '#0D1726' },
  text: { primary: '#F8FAFC', secondary: '#94A3B8', disabled: '#64748B' },
  divider: '#25324A',
};

export const createAppTheme = (mode = 'light') => {
  const semantic = mode === 'dark' ? dark : light;
  return createTheme({
    palette: {
      mode,
      primary: { light: '#5471BE', main: '#152C6E', dark: '#061032', contrastText: '#FFFFFF' },
      secondary: { light: '#BEF264', main: '#A3E635', dark: '#84CC16', contrastText: '#061032' },
      success: { main: '#22C55E' }, warning: { main: '#F59E0B' },
      error: { main: '#EF4444' }, info: { main: '#38BDF8' },
      ...semantic,
    },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      h1: { fontSize: 'clamp(2.5rem, 6vw, 4.75rem)', fontWeight: 900, lineHeight: .98, letterSpacing: '-.045em' },
      h2: { fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 850, lineHeight: 1.05, letterSpacing: '-.035em' },
      h3: { fontSize: '1.875rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-.02em' },
      h4: { fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 },
      h5: { fontSize: '1.25rem', fontWeight: 750 }, h6: { fontSize: '1rem', fontWeight: 750 },
      body1: { lineHeight: 1.65 }, body2: { lineHeight: 1.55 },
      button: { fontWeight: 750, textTransform: 'none', letterSpacing: 0 },
      overline: { fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { transition: 'background-color .2s ease, color .2s ease' } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { minHeight: 44, borderRadius: 12, paddingInline: 20 },
          containedSecondary: { color: '#061032', '&:hover': { backgroundColor: '#84CC16' } },
        },
      },
      MuiCard: { styleOverrides: { root: { border: `1px solid ${semantic.divider}`, boxShadow: mode === 'dark' ? '0 16px 40px rgba(0,0,0,.22)' : '0 14px 36px rgba(6,16,50,.07)', backgroundImage: 'none' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' }, rounded: { borderRadius: 18 } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: { styleOverrides: { root: { minHeight: 50, borderRadius: 12, background: mode === 'dark' ? '#101C2E' : '#FFFFFF' } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 750 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: 'none' } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontWeight: 650 } } },
    },
  });
};

export default createAppTheme('light');
