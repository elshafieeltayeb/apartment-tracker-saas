/** @param {string} url */
export function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('immobilienscout24') || host === 'immoscout24.de')
      return 'immoscout24';
    if (host.includes('wg-gesucht') || host === 'wggesucht.de') return 'wggesucht';
    if (host.includes('kleinanzeigen') || host.includes('ebay-kleinanzeigen'))
      return 'kleinanzeigen';
    return 'other';
  } catch {
    return 'other';
  }
}

/** @param {string} key */
export function platformLabel(key) {
  const map = {
    immoscout24: 'ImmoScout24',
    wggesucht: 'WG-Gesucht',
    kleinanzeigen: 'Kleinanzeigen',
    other: 'Sonstige',
  };
  return map[key] ?? key;
}
