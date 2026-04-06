import {
  getApplications,
  upsertApplication,
  removeApplication,
  getDashboardUrl,
} from '../lib/storage.js';
import { detectPlatform } from '../lib/platform.js';
import { pushApplicationToCloud } from '../lib/sync.js';

const ALARM_PREFIX = 'followup-';

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;
  const id = alarm.name.slice(ALARM_PREFIX.length);
  const apps = await getApplications();
  const app = apps.find((a) => a.id === id);
  if (!app) return;
  await chrome.notifications.create(`followup-${id}`, {
    type: 'basic',
    title: 'Wohnungs-Tracker',
    message: `Follow-up: ${app.title}`,
  });
});

/**
 * @param {string} applicationId
 * @param {string|null} isoOrNull
 */
async function syncFollowUpAlarm(applicationId, isoOrNull) {
  const name = ALARM_PREFIX + applicationId;
  await chrome.alarms.clear(name);
  if (!isoOrNull) return;
  const when = Date.parse(isoOrNull);
  if (Number.isNaN(when) || when <= Date.now()) return;
  await chrome.alarms.create(name, { when });
}

async function rescheduleAllFollowUpAlarms() {
  const apps = await getApplications();
  for (const app of apps) {
    await syncFollowUpAlarm(app.id, app.nextFollowUpAt ?? null);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  rescheduleAllFollowUpAlarms();
});
chrome.runtime.onStartup.addListener(() => {
  rescheduleAllFollowUpAlarms();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'ADD_CURRENT_TAB': {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (!tab?.id || !tab.url || tab.url.startsWith('chrome://')) {
          sendResponse({ ok: false, error: 'Kein gültiger Tab.' });
          return;
        }
        const platform = detectPlatform(tab.url);
        const apps = await getApplications();
        const existing = apps.find((a) => a.listingUrl === tab.url);
        const row = await upsertApplication({
          id: existing?.id,
          listingUrl: tab.url,
          title: tab.title || tab.url,
          sourcePlatform: platform,
          status: existing?.status ?? 'interested',
        });
        await syncFollowUpAlarm(row.id, row.nextFollowUpAt ?? null);
        const cloud = await pushApplicationToCloud(row);
        sendResponse({
          ok: true,
          application: row,
          cloud: cloud.skipped ? undefined : { ok: cloud.ok, error: cloud.error },
        });
        break;
      }
      case 'UPDATE_APPLICATION': {
        const row = await upsertApplication(message.payload);
        await syncFollowUpAlarm(row.id, row.nextFollowUpAt ?? null);
        const cloud = await pushApplicationToCloud(row);
        sendResponse({
          ok: true,
          application: row,
          cloud: cloud.skipped ? undefined : { ok: cloud.ok, error: cloud.error },
        });
        break;
      }
      case 'DELETE_APPLICATION': {
        await removeApplication(message.id);
        await chrome.alarms.clear(ALARM_PREFIX + message.id);
        sendResponse({ ok: true });
        break;
      }
      case 'OPEN_DASHBOARD': {
        const base = await getDashboardUrl();
        if (!base) {
          sendResponse({ ok: false, error: 'NO_DASHBOARD_URL' });
          return;
        }
        await chrome.tabs.create({ url: base });
        sendResponse({ ok: true });
        break;
      }
      default:
        sendResponse({ ok: false, error: 'Unknown message' });
    }
  })();
  return true;
});
