import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import VenueImage from './VenueImage';

describe('VenueImage', () => {
  it('renders an API image when supplied', () => {
    render(<VenueImage src="/media/court.jpg" alt="Central court" className="photo" />);
    expect(screen.getByRole('img', { name: 'Central court' })).toHaveAttribute('src', 'http://localhost:8080/media/court.jpg');
  });

  it('renders the branded fallback without a remote stock image', () => {
    render(<VenueImage alt="Venue without a photo" />);
    const fallback = screen.getByRole('img', { name: 'Venue without a photo' });
    expect(fallback).toHaveClass('image-placeholder');
    expect(fallback.tagName).toBe('DIV');
  });
});
