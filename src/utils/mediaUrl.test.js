import { describe, expect, it } from 'vitest';
import { mediaUrl } from './mediaUrl';

describe('mediaUrl', () => {
  it('leaves Vite-bundled asset paths on the frontend origin', () => {
    expect(mediaUrl('/assets/midnight-multisport-arena.png')).toBe('/assets/midnight-multisport-arena.png');
    expect(mediaUrl('/src/assets/brand/midnight-multisport-arena.png')).toBe('/src/assets/brand/midnight-multisport-arena.png');
  });

  it('prefixes API origin for upload paths', () => {
    expect(mediaUrl('/uploads/homepage/x.jpg')).toMatch(/\/uploads\/homepage\/x\.jpg$/);
    expect(mediaUrl('/uploads/homepage/x.jpg')).not.toMatch(/^\/uploads\//);
  });

  it('passes through absolute and data URLs', () => {
    expect(mediaUrl('https://cdn.example/a.jpg')).toBe('https://cdn.example/a.jpg');
    expect(mediaUrl('blob:http://localhost/1')).toBe('blob:http://localhost/1');
  });
});
