# Product specification: Germany apartment application tracker (SaaS)

Web dashboard + browser extension. Aligned with the archived conversation in [CONVERSATION.md](./CONVERSATION.md).

---

## 1. Product vision

**Working name:** TBD (e.g. *WohnungsRadar DE*, *FlatApply DE*).

**One-liner:** Track flat applications across German listing sites, with status, follow-ups, and localized message templates—**synced between a browser extension and a web dashboard**.

**Principles**

- **Trust:** clear data use (GDPR), export/delete.
- **Reliability:** manual save always works; automation is best-effort.
- **Local:** DE portals, DE copy, € pricing.

---

## 2. Realism note (summary)

| Area | Assessment |
|------|------------|
| Pain & willingness to pay | Strong in DE cities. |
| Web + auth + billing | Standard SaaS; very feasible. |
| Extension (manual save, popup, sync) | Feasible in weeks for MVP. |
| Auto-detect “application sent” on ImmoScout24 / WG-Gesucht / Kleinanzeigen | Harder: DOM churn, ToS, false positives. Treat as phased, user-confirmed. |
| “Complete” product | Realistic over months in slices, not one release. |

---

## 3. Target users & jobs-to-be-done

- **Expat / newcomer:** many applications, language barrier → templates + reminders.
- **Power applicant:** high volume → pipeline, follow-ups, notes.
- **WG seeker:** WG-Gesucht-heavy → quick logging from extension.

**Jobs:** remember what was sent, know next action, follow-up nudges, reuse good German text.

---

## 4. Web application

### 4.1 Accounts & access

- Sign up / login: email (magic link or password), optional Google.
- Single-user focus for v1 (no orgs).
- Secure session handling documented.

### 4.2 Dashboard

- **Applications:** list/table or Kanban—*Interested → Applied → Viewing → Offer → Rejected / Ghosted → Withdrawn*.
- **Detail:** listing URL, title, rent, rooms, location, platform, date applied, channel, notes.
- **Timeline / activity:** status changes, reminders (light audit).
- **Reminders:** per-application follow-up; optional email digest.
- **Templates:** first message, follow-up, viewing confirmation; variables e.g. `{{address}}`, `{{anzeige}}`, `{{name}}`.
- **Settings:** profile, locale (DE/EN), timezone, notifications, extension connection status.
- **Billing:** plan, invoices, cancel; EU VAT as needed for DE B2C.

### 4.3 Marketing site

- Landing, pricing, privacy, **Impressum**, changelog.

---

## 5. Browser extension

### 5.1 Platforms (phased)

- **MVP:** “Add to tracker” for current tab + open dashboard; works on any URL.
- **v1.5:** One portal with “prefill from page” + **user confirms** before save.
- **v2:** More portals; optional send-detection only where reliable and compliant.

### 5.2 Extension UX

- **Popup:** recent applications, quick status, “+ Add current tab,” snooze reminder.
- **Optional:** Chrome side panel for richer list.
- **On supported listing pages:** small bar—*Save listing* / *Mark as applied* (user gesture).

### 5.3 Permissions

- Narrow host permissions where possible; document in privacy policy.
- No sale of browsing data; minimal telemetry, consent where required.

### 5.4 Sync with web

- **Connect flow:** web login → device link or short-lived token to extension.
- **API:** HTTPS from service worker/background to backend.
- **Optional:** offline queue + sync.

---

## 6. Backend & data model (high level)

**Entities:** `User`, `Subscription`, `Application`, `ApplicationEvent`, `Reminder`, `Template`, `Device` (extension instance).

**Application (minimum fields):** `id`, `userId`, `sourcePlatform`, `listingUrl`, `title`, `coldRent`, `utilities`, `rooms`, `locationLabel`, `appliedAt`, `status`, `notes`, `nextFollowUpAt`, timestamps.

**GDPR:** lawful basis documented, JSON export, account deletion, retention, subprocessors (hosting, email, payments).

---

## 7. Monetization

- **Free:** cap (e.g. 20 active applications or limited history—pick one).
- **Pro:** ~€5–€8/mo or promotional one-time (~€15); unlimited applications, reminders, template packs, multi-device sync.
- **Payments:** Stripe + Customer Portal; EU VAT for DE-focused B2C.

---

## 8. Non-functional requirements

- HTTPS only, rate limits, no secrets in extension bundle.
- Error logging (e.g. Sentry); product analytics with consent.
- Extension versioned; feature flags for per-site parsers.

---

## 9. Phased delivery

| Phase | Deliverable |
|-------|-------------|
| P0 | Landing / waitlist or Notion-Sheet paid beta (validate before build). |
| P1 | Web: auth + CRUD applications + statuses + manual reminders. |
| P2 | Stripe + plan limits. |
| P3 | Extension: auth bridge + save current tab + popup. |
| P4 | Templates + email reminders. |
| P5 | One portal assist/prefill with explicit user click. |
| P6 | More portals; Firefox/Safari if desired. |

---

## 10. Risks & mitigations

- **Portal ToS / automation:** user-initiated actions; legal review; fallback manual save.
- **Broken selectors:** versioned parsers; manual path always available.
- **Trust:** DE privacy copy + Impressum; EU hosting if marketed.
- **Chrome Web Store:** minimal permissions, clear single purpose.
