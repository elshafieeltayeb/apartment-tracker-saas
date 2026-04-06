import { getApplications, getDashboardUrl } from '../lib/storage.js';
import { platformLabel } from '../lib/platform.js';

const STATUS_OPTIONS = [
  { value: 'interested', label: 'Interessiert' },
  { value: 'applied', label: 'Beworben' },
  { value: 'viewing', label: 'Besichtigung' },
  { value: 'offer', label: 'Angebot' },
  { value: 'rejected', label: 'Absage' },
  { value: 'ghosted', label: 'Keine Antwort' },
  { value: 'withdrawn', label: 'Zurückgezogen' },
];

function showToast(text, isError = false) {
  const el = document.getElementById('toast');
  el.hidden = false;
  el.textContent = text;
  el.classList.toggle('error', isError);
}

function followUpIso(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function send(type, payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...payload }, resolve);
  });
}

async function renderList() {
  const listEl = document.getElementById('app-list');
  const emptyEl = document.getElementById('empty');
  const apps = await getApplications();
  listEl.innerHTML = '';

  if (apps.length === 0) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  for (const app of apps.slice(0, 15)) {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = app.id;

    const title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = app.title;

    const meta = document.createElement('p');
    meta.className = 'card-meta';
    const link = document.createElement('a');
    link.href = app.listingUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent =
      app.listingUrl.length > 48
        ? app.listingUrl.slice(0, 45) + '…'
        : app.listingUrl;
    meta.append(
      platformLabel(app.sourcePlatform),
      document.createTextNode(' · '),
      link,
    );

    const row1 = document.createElement('div');
    row1.className = 'row';
    const select = document.createElement('select');
    select.className = 'status-select';
    select.setAttribute('aria-label', 'Status');
    for (const o of STATUS_OPTIONS) {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === app.status) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener('change', async () => {
      const res = await send('UPDATE_APPLICATION', {
        payload: { id: app.id, status: select.value },
      });
      if (!res?.ok) showToast('Status konnte nicht gespeichert werden.', true);
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.textContent = 'Löschen';
    removeBtn.addEventListener('click', async () => {
      const res = await send('DELETE_APPLICATION', { id: app.id });
      if (res?.ok) renderList();
      else showToast('Löschen fehlgeschlagen.', true);
    });

    row1.append(select, removeBtn);

    const snoozeLabel = document.createElement('span');
    snoozeLabel.className = 'snooze-label';
    snoozeLabel.textContent = 'Erinnerung';

    const snoozeRow = document.createElement('div');
    snoozeRow.className = 'snooze-btns';
    for (const days of [1, 3, 7]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `${days} T`;
      b.addEventListener('click', async () => {
        const iso = followUpIso(days);
        const res = await send('UPDATE_APPLICATION', {
          payload: { id: app.id, nextFollowUpAt: iso },
        });
        if (res?.ok)
          showToast(`Erinnerung in ${days} Tag(en), ca. 9:00 Uhr.`);
        else showToast('Erinnerung konnte nicht gesetzt werden.', true);
      });
      snoozeRow.appendChild(b);
    }

    const clearSnooze = document.createElement('button');
    clearSnooze.type = 'button';
    clearSnooze.textContent = 'Entfernen';
    clearSnooze.addEventListener('click', async () => {
      const res = await send('UPDATE_APPLICATION', {
        payload: { id: app.id, nextFollowUpAt: null },
      });
      if (res?.ok) showToast('Erinnerung entfernt.');
    });
    snoozeRow.appendChild(clearSnooze);

    li.append(title, meta, row1, snoozeLabel, snoozeRow);
    listEl.appendChild(li);
  }
}

document.getElementById('btn-add-tab').addEventListener('click', async () => {
  const btn = document.getElementById('btn-add-tab');
  btn.disabled = true;
  const res = await send('ADD_CURRENT_TAB', {});
  btn.disabled = false;
  if (res?.ok) {
    showToast('Gespeichert.');
    await renderList();
  } else {
    showToast(res?.error || 'Speichern fehlgeschlagen.', true);
  }
});

document.getElementById('btn-dashboard').addEventListener('click', async () => {
  const url = await getDashboardUrl();
  if (!url) {
    showToast('Bitte Dashboard-URL in den Einstellungen setzen.', true);
    return;
  }
  const res = await send('OPEN_DASHBOARD', {});
  if (!res?.ok && res?.error === 'NO_DASHBOARD_URL') {
    showToast('Bitte Dashboard-URL in den Einstellungen setzen.', true);
  }
});

document.getElementById('link-options').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

renderList();
