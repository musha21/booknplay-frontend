import { describe, expect, it } from 'vitest';
import { cleanQueryParams, unwrapApiData, unwrapList } from './apiData';

describe('unwrapApiData', () => {
  it('unwraps ApiResponse envelopes including paged venue lists', () => {
    const venues = [{ id: 'v1', name: 'Arena' }];
    expect(unwrapApiData({ success: true, data: { content: venues, page: 0 } })).toEqual({
      content: venues,
      page: 0,
    });
    expect(unwrapList({ success: true, data: { content: venues } })).toEqual(venues);
    expect(unwrapList({ success: true, data: venues })).toEqual(venues);
  });
});

describe('cleanQueryParams', () => {
  it('drops empty search filters so the public API does not exact-match blanks', () => {
    expect(cleanQueryParams({ city: ' ', sportId: '', size: 6, name: 'Kandy' })).toEqual({ size: 6, name: 'Kandy' });
  });
});
