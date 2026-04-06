/** @typedef {'interested'|'applied'|'viewing'|'offer'|'rejected'|'ghosted'|'withdrawn'} ApplicationStatus */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} listingUrl
 * @property {string} title
 * @property {string} sourcePlatform
 * @property {ApplicationStatus} status
 * @property {string} savedAt ISO 8601
 * @property {string} [notes]
 * @property {string|null} [nextFollowUpAt] ISO 8601
 */

const STORAGE_KEY = 'applications_v1';

/** @returns {Promise<Application[]>} */
export async function getApplications() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const list = data[STORAGE_KEY];
  return Array.isArray(list) ? list : [];
}

/** @param {Application[]} apps */
export async function setApplications(apps) {
  await chrome.storage.local.set({ [STORAGE_KEY]: apps });
}

/** @param {Partial<Application> & { id?: string }} partial */
export async function upsertApplication(partial) {
  const apps = await getApplications();
  const now = new Date().toISOString();
  const id = partial.id ?? crypto.randomUUID();
  const idx = apps.findIndex((a) => a.id === id);
  const prev = idx >= 0 ? apps[idx] : null;
  const row = {
    id,
    listingUrl: partial.listingUrl ?? prev?.listingUrl ?? '',
    title: partial.title ?? prev?.title ?? '(ohne Titel)',
    sourcePlatform: partial.sourcePlatform ?? prev?.sourcePlatform ?? 'other',
    status: partial.status ?? prev?.status ?? 'interested',
    savedAt: prev?.savedAt ?? now,
    notes: partial.notes !== undefined ? partial.notes : (prev?.notes ?? ''),
    nextFollowUpAt:
      partial.nextFollowUpAt !== undefined
        ? partial.nextFollowUpAt
        : prev?.nextFollowUpAt ?? null,
  };
  if (idx >= 0) apps[idx] = row;
  else apps.unshift(row);
  await setApplications(apps);
  return row;
}

/** @param {string} id */
export async function removeApplication(id) {
  const apps = (await getApplications()).filter((a) => a.id !== id);
  await setApplications(apps);
}

/** @returns {Promise<string>} */
export async function getDashboardUrl() {
  const { dashboardUrl } = await chrome.storage.local.get('dashboardUrl');
  return typeof dashboardUrl === 'string' ? dashboardUrl.trim() : '';
}

/** @param {string} url */
export async function setDashboardUrl(url) {
  await chrome.storage.local.set({ dashboardUrl: url.trim() });
}
