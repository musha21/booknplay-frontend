export function unwrapApiData(payload) {
  if (payload == null) return payload;
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== 'object') return payload;
  if ('data' in payload && (payload.success === true || payload.success === false)) {
    return unwrapApiData(payload.data);
  }
  return payload;
}

export function unwrapList(payload) {
  const data = unwrapApiData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

export function cleanQueryParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );
}
