import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeModeProvider, useThemeMode } from './ThemeModeContext';

function Consumer() {
  const { preference, resolvedMode, toggleMode } = useThemeMode();
  return <button onClick={toggleMode}>{preference}:{resolvedMode}</button>;
}

describe('ThemeModeProvider', () => {
  beforeEach(() => { localStorage.clear(); delete document.documentElement.dataset.theme; });

  it('follows the system preference initially', () => {
    render(<ThemeModeProvider><Consumer /></ThemeModeProvider>);
    expect(screen.getByRole('button')).toHaveTextContent('system:light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('persists a manual theme choice', async () => {
    render(<ThemeModeProvider><Consumer /></ThemeModeProvider>);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveTextContent('dark:dark');
    expect(localStorage.getItem('booknplay-theme')).toBe('dark');
  });
});

