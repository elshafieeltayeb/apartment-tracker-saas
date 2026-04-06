const dashboardInput = document.getElementById('dashboardUrl');
const apiBaseInput = document.getElementById('apiBaseUrl');
const apiTokenInput = document.getElementById('apiToken');
const form = document.getElementById('form');
const saved = document.getElementById('saved');

async function load() {
  const data = await chrome.storage.local.get([
    'dashboardUrl',
    'apiBaseUrl',
    'apiToken',
  ]);
  dashboardInput.value = String(data.dashboardUrl ?? '');
  apiBaseInput.value = String(data.apiBaseUrl ?? '');
  apiTokenInput.value = String(data.apiToken ?? '');
}

load();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await chrome.storage.local.set({
    dashboardUrl: dashboardInput.value.trim(),
    apiBaseUrl: apiBaseInput.value.trim(),
    apiToken: apiTokenInput.value.trim(),
  });
  saved.hidden = false;
  setTimeout(() => {
    saved.hidden = true;
  }, 2000);
});
