import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CityDestinationCard from './CityDestinationCard';

describe('CityDestinationCard', () => {
  it('keeps Kandy selectable', async () => {
    const onSelect = vi.fn();
    render(<CityDestinationCard city="Kandy" onSelect={onSelect} />);

    const button = screen.getByRole('button', { name: /Kandy/i });
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('marks every other city as coming soon and disables selection', () => {
    const onSelect = vi.fn();
    render(<CityDestinationCard city="Colombo" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /Colombo/i })).toBeDisabled();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });
});
