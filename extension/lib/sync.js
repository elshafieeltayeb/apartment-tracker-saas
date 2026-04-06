/**
 * Optional cloud sync: POST listings to the web app using a device API token.
 * Set API-Basis-URL (e.g. http://localhost:3000/api/extension) and token in options.
 */

export async function getSyncConfig() {
  const data = await chrome.storage.local.get(['apiBaseUrl', 'apiToken']);
  const apiBaseUrl = String(data.apiBaseUrl ?? '')
    .trim()
    .replace(/\/$/, '');
  const apiToken = String(data.apiToken ?? '').trim();
  return { apiBaseUrl, apiToken };
}

/** @param {object} row application row from storage */
export async function pushApplicationToCloud(row) {
  const { apiBaseUrl, apiToken } = await getSyncConfig();
  if (!apiBaseUrl || !apiToken) {
    return { ok: true, skipped: true };
  }
  const url = `${apiBaseUrl}/applications`;
  const body = {
    listingUrl: row.listingUrl,
    title: row.title,
    sourcePlatform: row.sourcePlatform,
    status: row.status,
    notes: row.notes || null,
    nextFollowUpAt: row.nextFollowUpAt || null,
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: t || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
