import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light:       '#5471be',
      main:        '#152c6e',   // navy-700
      dark:        '#0d1e50',   // navy-800
      contrastText: '#ffffff',
    },
    secondary: {
      light:       '#a3e635',   // lime-400
      main:        '#84cc16',   // lime-500
      dark:        '#65a30d',   // lime-600
      contrastText: '#ffffff',
    },
    error:   { main: '#dc2626' },
    warning: { main: '#f59e0b' },
    success: { main: '#16a34a' },
    info:    { main: '#0ea5e9' },
    background: {
      default: '#ffffff',
      paper:   '#f8fafc',
    },
    text: {
      primary:   '#1e293b',
      secondary: '#64748b',
      disabled:  '#94a3b8',
    },
    divider: '#e2e8f0',
  },

  typography: {
    fontFamily: "'Inter', system-ui, sans-serif",
    h1: { fontSize: '3rem',    fontWeight: 800, lineHeight: 1.1 },
    h2: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontSize: '1.875rem',fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem',  fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: '1rem',    fontWeight: 600, lineHeight: 1.5 },
    subtitle1: { fontSize: '1rem',    fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem',fontWeight: 500 },
    body1: { fontSize: '1rem',     lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
    overline: { fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
    button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
  },

  shape: {
    borderRadius: 12,
  },

  shadows: [
    'none',
    '0 1px 3px rgba(21,44,110,0.08)',
    '0 4px 24px rgba(21,44,110,0.10)',
    '0 8px 40px rgba(21,44,110,0.14)',
    '0 12px 48px rgba(21,44,110,0.18)',
    ...Array(20).fill('0 16px 56px rgba(21,44,110,0.20)'),
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-1px)' },
          '&:active': { transform: 'translateY(0)' },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #152c6e 0%, #1e3a8a 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0d1e50 0%, #152c6e 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #65a30d 0%, #84cc16 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': { borderWidth: '2px' },
        },
        sizeLarge: { padding: '14px 32px', fontSize: '1rem' },
        sizeSmall: { padding: '6px 16px', fontSize: '0.8125rem', borderRadius: '8px' },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(21,44,110,0.10)',
          border: '1px solid #e2e8f0',
          '&:hover': {
            boxShadow: '0 8px 40px rgba(21,44,110,0.18)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#152c6e',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#152c6e',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#152c6e',
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        outlined: { borderRadius: '12px' },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: '#eef1f8',
          color: '#152c6e',
          '&:hover': { backgroundColor: '#d5dcef' },
        },
        colorSecondary: {
          backgroundColor: '#ecfccb',
          color: '#65a30d',
          '&:hover': { backgroundColor: '#d9f99d' },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: '16px' },
        elevation1: { boxShadow: '0 4px 24px rgba(21,44,110,0.10)' },
        elevation2: { boxShadow: '0 8px 40px rgba(21,44,110,0.14)' },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 8px rgba(21,44,110,0.10)',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: '20px', padding: '8px' },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: '12px' },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: '999px', height: '6px' },
        bar: { borderRadius: '999px' },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.9375rem',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;
