# HealthyLine 24/7 AI Wellness Concierge Chat Widget

> **Инструкция для пользователя (быстрый старт):**
> 
> Этот проект — автономный встраиваемый виджет онлайн-чата и AI-консьержа для HealthyLine.
> 
> **Как использовать:**
> 1. Скачайте проект через меню **Export to ZIP** в Google AI Studio.
> 2. Распакуйте архив в ваш репозиторий GitHub (`terryogle/ai-chat-healthyline`).
> 3. Сделайте `git push` в ветку `main`.
> 4. GitHub Actions автоматически запустит `npm install` -> `npm run typecheck` -> `npm run build` и создаст готовую папку `dist/` с файлами `widget.js` и `widget.css`.
> 5. На сайте HealthyLine уже подключен скрипт `chat.healthyline.com/widget.js`, поэтому все обновления появятся на сайте автоматически без правок в шаблонах сайта.
>
> **Вкладка Deals (акции):** все акции виджет читает напрямую из Google-таблицы — одна строка = одна акция, каждая ячейка показывается как есть. Чтобы изменить текст, цену, ссылку, картинку или дату запуска, достаточно поправить ячейку в таблице: пересобирать и выкладывать виджет не нужно. Строка появляется в виджете в день из колонки `Date` в 9:00 по Нью-Йорку; строка без даты не показывается. Объединённая ячейка относится ко всем строкам, которые она покрывает. Подробности — в разделе [Deals Tab](#deals-tab-google-sheet).
>
> **Как виджет попадает на сайт (проверено 11.11.2026).** Пункт 5 выше не соответствует тому, что стоит на сайте: адреса `chat.healthyline.com` в DNS нет. Сайт healthyline.com (проверена главная страница) подключает виджет через jsDelivr прямо из GitHub — ссылками вида `https://cdn.jsdelivr.net/gh/<аккаунт>/<репозиторий>@main/dist/widget.css` и `.../dist/widget.js`. Поэтому:
> - на сайте работает то, что лежит в папке `dist/` того репозитория, который указан в этих двух ссылках в теме Shopify;
> - ссылку с `@main` jsDelivr обновляет с задержкой до 12 часов, а браузер посетителя хранит её до 7 дней. Чтобы новая версия открылась у всех сразу, в теме ставят ссылку с полным хешем коммита вместо `main`: `https://cdn.jsdelivr.net/gh/<аккаунт>/<репозиторий>@<хеш коммита>/dist/widget.js` (и так же `widget.css`). Хеш — у последнего коммита ветки `main` после зелёной сборки GitHub Actions;
> - `widget.js` и `widget.css` всегда берутся из одного и того же коммита. Если стили окажутся старее скрипта, блоки Deals не показываются вовсе (остальной виджет работает как раньше).

---

## Website Installation

To install the HealthyLine AI Chat Widget on the website, add the following code snippet once into your website layout (for example, in Shopify's `theme.liquid` just before the closing `</body>` tag, or in your main HTML template).

```html
<!-- HealthyLine AI Chat Widget -->
<link rel="stylesheet" href="https://chat.healthyline.com/widget.css">
<script src="https://chat.healthyline.com/widget.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function () {
    if (window.SimpleChatN8N && window.SimpleChatN8N.createChat) {
      window.SimpleChatN8N.createChat({
        mode: "window",
        title: "HealthyLine",
        subtitle: "HealthyLine Support",
        placeholder: "Type your message...",
        tooltipText: "Got questions? We're here 24/7",
        webhookUrl: "https://app.healthyline.com/webhook/ai-chat",
        showTooltip: true,
        loadPreviousSession: true,
        icons: {
          headerLogo: "https://healthyline.com/images/logo.svg"
        }
      });
    }
  });
</script>
```

> **Important for Website Developers:**
> **Install this snippet once.** After installation, all future widget updates, bug fixes, and AI feature enhancements are deployed automatically from GitHub to `chat.healthyline.com` and **do not require any changes to the HealthyLine website**.

---

## Deals Tab (Google Sheet)

The sale block of the widget — the line and the dot on the launcher, the carousel on the Home screen and the **Deals** tab — is filled at runtime, in the visitor's browser, from a Google Sheet. **One row = one deal, and every cell is shown exactly as it stands in the sheet.** No deal content is stored or guessed in the code: edit the sheet and the widget follows, without a rebuild or a deploy.

- **Sheet:** <https://docs.google.com/spreadsheets/d/1S7ZNbLW8duM0KpBaHhW6S3uhAqTK2FRGemZeDBYhiLs/edit?gid=0> (default; see `dealsSheetUrl` below).
- **Sharing:** the sheet must stay shared as *Anyone with the link → Viewer*. The widget reads it without any key or login.

### Columns

Columns are found by their header name (row 1). If a header is renamed, the widget falls back to the position A–G.

| Column | Header | Shown as |
| :--- | :--- | :--- |
| A | `Date` | Launch day of the deal (required: a row without a date is not shown). |
| B | `Image` | Picture URL. Optional: without it a neutral tag icon is shown. |
| C | `Frontend` | Product page opened by **View Deal** and by a click on the row. Optional: without it the deal is shown, but is not clickable. |
| D | `Bundle name` | Title (required). |
| E | `Short line` | Description. Optional. |
| F | `Bundle regular total` | Crossed-out price. Hidden when it is empty or equal to the sale price. |
| G | `Bundle sale price` | Main price. |

### Rules

- **Launch:** a row goes live at **9:00 AM New York time** on the day in its `Date` cell. Pages that are already open pick the new deals up at that minute, without a reload.
- **End:** a deal stays visible through the last day of its month (New York time) and disappears after that. A different end can be set with `dealsEndDate`.
- **No date, no deal:** the `Date` cell alone decides when a row is shown. A row whose `Date` cell is empty (or cannot be read as a date), or a row without a `Bundle name`, is not shown.
- **Merged cells:** a merged cell belongs to every row it covers, exactly as it looks in the sheet. One `Date` cell merged over three rows launches all three on that day; a merged `Short line` or `Frontend` cell gives the same text or link to each of its rows. This works in every column.
- **Empty cells stay empty:** a cell that is empty and not merged is never filled from another row. No `Image` → a neutral tag icon; no `Frontend` → no **View Deal** button; no `Short line` → no description.
- **Hide or remove a deal:** clear its `Date` cell, or delete the row.
- **Order:** newest day first; inside a day, the order of the sheet.
- **"N new deals today":** the number of rows in the latest daily drop. The dot on the launcher stays until the visitor opens the chat after that drop.
- **Launcher tooltip during the sale:** the sale line on top, under it `dealsTooltipText` on the left and a very small green *Online* on the right. A click on the sale line opens the chat the usual way (Home screen, where the cards of the day are). Without live deals the tooltip is the usual one (*Online* + `tooltipText`).
- **Where things are:** the tab bar is Home · Messages · Deals · Best Sellers · Compare. A Home card shows the picture on the left and the name, description and prices on the right; the whole card is the link from `Frontend` (opened in a new tab), with the **View Deal** button under it.
- **Home slider:** every card carries its number (1, 2, 3 …) and the dots under the cards show which one is on screen. The cards slide by themselves every `dealsAutoSlideSeconds` and start again after the last one. They wait while the mouse rests on the block, and stop for good (until the page is reloaded) once the visitor presses an arrow or a dot or swipes the cards sideways (scrolling the chat up and down does not stop them). With a single deal there are no numbers, dots or sliding; visitors whose system asks for reduced motion get no automatic sliding.
- **Nothing live:** before the first date, after the end, or if the sheet cannot be read, every deals element is hidden and the widget looks exactly as it does without the feature.
- **Links:** only `http(s)` links are used. Shopify admin links (`admin.shopify.com/...`) are ignored, because customers cannot open them.
- **How fast edits appear:** a browser re-reads the sheet when the chat is opened, shortly after every daily launch, and otherwise at most once every 5 minutes (`dealsRefreshSeconds`). The last copy is kept in `localStorage` (24 hours at most), so the block shows up instantly on the next page.
- **What is requested:** three key-less Google exports of the tab — CSV (the texts exactly as displayed), JSON (real dates) and XLSX (only the list of merged cells is read from it). If the merged cells cannot be read, nothing is guessed: only the first row of a merged block keeps its value until the next successful reading.
- **Script and stylesheet go together:** `widget.js` shows the Deals blocks only when the loaded `widget.css` carries the mark of the same Deals styles (`--tt-chat-deals-styles`). With an older cached `widget.css` the blocks stay hidden and the rest of the widget works as before, so they can never appear unstyled.
- **Privacy:** the sheet is public. Every row, including deals that have not launched yet, can be read by anyone who has the sheet link — and that link is visible in the network requests of the widget. Keep nothing confidential in this spreadsheet.

### Options

All options are optional and are passed to `createChat({...})`. The website snippet does not need to change: the defaults already point to the sheet above.

| Option | Default | Purpose |
| :--- | :--- | :--- |
| `showDeals` | `true` | `false` switches the whole feature off. |
| `dealsSheetUrl` (or `dealsSheetId`) | sheet above | Another Google Sheet: full URL or just its ID. |
| `dealsSheetGid` | from the URL, else `0` | Tab of the sheet (`gid` in its URL). |
| `dealsTitle` | `"Holiday Sale"` | Sale name in the tooltip, the banner of the Deals tab and the Home block. |
| `dealsTabLabel` | `"Deals"` | Label of the tab. |
| `dealsTooltipText` | `"We're here 24/7"` | Short line under the sale line in the launcher tooltip while deals are live (it replaces `tooltipText` during the sale; `""` hides it). |
| `dealsAutoSlideSeconds` | `4` | Seconds between two automatic slides of the Home slider (minimum 2; `0` turns the automatic sliding off). |
| `dealsTimeZone` | `"America/New_York"` | Time zone of the launch time. |
| `dealsLaunchTime` | `"09:00"` | Daily launch time, 24h `HH:mm`. |
| `dealsEndDate` | last day of the deal's month | Hard end date, `YYYY-MM-DD`. |
| `dealsRefreshSeconds` | `300` | How often a browser re-reads the sheet (minimum 30; `0` = no periodic re-reading). |
| `dealsPreviewDate` | — | Testing: pretend it is this moment in the sale time zone. |
| `dealsAllowUrlPreview` | `true` | `false` disables the `?hl_deals_date=` preview parameter. |

### Previewing another day

- Add `?hl_deals_date=2026-11-18` to the address of any page with the widget (`2026-11-18` means noon; an exact New York time works too: `?hl_deals_date=2026-11-18T08:59`). Only the browser that opened this address is affected.
- In the browser console: `SimpleChatN8N.setDealsPreviewDate('2026-11-18')`, and `SimpleChatN8N.setDealsPreviewDate(null)` to return to the real time.
- The local test page (`npm run dev`) has a **Deals** card with a day picker.

---

## 1. Local Development

To run and preview the chat widget locally:

```bash
# Install dependencies
npm install

# Start local development server at http://localhost:3000
npm run dev
```

The local development environment includes a built-in mock webhook plugin for testing dialogues, customer verification (OTP), and catalog recommendations without needing external network access.

---

## 2. Build Command

To perform a complete production build:

```bash
npm run build
```

This command automatically:
1. Compiles the preview SPA application.
2. Compiles the standalone production library bundle (UMD & ES modules).
3. Generates the stable production root entrypoints:
   - `dist/widget.js`
   - `dist/widget.css`
4. Creates an immutable versioned snapshot in `dist/releases/<version>/` (e.g., `dist/releases/1.0.0/widget.js`).
5. Generates the Cloudflare Pages `_headers` file with CORS and optimized caching rules.
6. Emits `dist/version.json` with build and deployment metadata.

---

## 3. Production Deployment Architecture

```text
GitHub (terryogle/ai-chat-healthyline)
   ↓ (git push main / git tag)
GitHub Actions CI/CD (.github/workflows/build.yml)
   ↓ (npm install && npm run build)
Production Build (dist/widget.js, dist/widget.css)
   ↓
Cloudflare Pages (chat.healthyline.com)
   ↓
HealthyLine Website (Loads once, auto-updates)
```

The public production endpoints remain strictly stable across releases:
- **Production JS:** `https://chat.healthyline.com/widget.js`
- **Production CSS:** `https://chat.healthyline.com/widget.css`

### Caching Strategy
- **Root files (`/widget.js`, `/widget.css`):** Served with `Cache-Control: public, max-age=300, stale-while-revalidate=3600`. This ensures all browsers receive updates within 5 minutes while maintaining fast load times.
- **Versioned files (`/releases/*`):** Served with `Cache-Control: public, max-age=31536000, immutable`.
- **CORS:** All widget assets include `Access-Control-Allow-Origin: *` headers for unrestricted loading on `healthyline.com`.

---

## 4. Versioning Strategy

This project strictly follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`):
- `1.0.0` — Initial production baseline release.
- `1.0.1` — Patch (bug fixes, small styling corrections).
- `1.1.0` — Minor (new backwards-compatible features, e.g. new mat comparison filters).
- `2.0.0` — Major (breaking changes to initialization API, if any).

The current version is declared in `package.json`. Every build creates an immutable archive copy at `dist/releases/<version>/`, while `dist/widget.js` and `dist/widget.css` always serve the currently active production release.

---

## 5. Release Process

To deploy a new production version:

1. **Bump the version in `package.json`**:
   ```bash
   npm version patch   # For 1.0.0 -> 1.0.1
   # or: npm version minor   # For 1.0.0 -> 1.1.0
   ```
2. **Push to GitHub with tags**:
   ```bash
   git push origin main --tags
   ```
3. **Automated CI/CD takes over**:
   - GitHub Actions runs type checking (`npm run typecheck`).
   - Runs the production build (`npm run build`).
   - Pushes updated build artifacts in `dist/`.
   - Automatically deploys to Cloudflare Pages.
4. Within 5 minutes, visitors on `healthyline.com` automatically receive the updated widget.

---

## 6. Cloudflare Configuration

You can deploy to Cloudflare Pages using either of two methods:

### Method A: Direct Cloudflare Git Integration (Recommended — Zero secrets in GitHub)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select repository `terryogle/ai-chat-healthyline`.
3. Configure build settings:
   - **Framework preset:** None (or Vite)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Production branch:** `main`
4. Click **Save and Deploy**. Every push to `main` will now build and deploy automatically.

### Method B: GitHub Actions Deployment via Secrets
If deploying directly from the GitHub Actions workflow (`.github/workflows/build.yml`), add these two Repository Secrets in GitHub (**Settings** → **Secrets and variables** → **Actions**):
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with `Cloudflare Pages:Edit` permissions.
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID (found in Cloudflare Dashboard sidebar).

---

## 7. Custom Domain Configuration (`chat.healthyline.com`)

1. In Cloudflare Dashboard, go to your Pages project (`healthyline-chat`).
2. Navigate to **Custom domains** → click **Set up a custom domain**.
3. Enter `chat.healthyline.com`.
4. Cloudflare will automatically add the CNAME DNS record pointing `chat.healthyline.com` to your Pages project and issue an SSL certificate.
5. Verify access in your browser:
   - `https://chat.healthyline.com/widget.js`
   - `https://chat.healthyline.com/widget.css`

---

## 8. Rollback Procedure

If a deployed version has an unexpected issue, you can roll back to a previous stable release without touching the HealthyLine website code.

### Option 1: 1-Click Rollback in Cloudflare Dashboard (Fastest — < 30 seconds)
1. Go to Cloudflare Dashboard → **Workers & Pages** → `healthyline-chat` → **Deployments**.
2. Locate the previous stable deployment (e.g. `v1.0.0`).
3. Click the three dots `...` on that deployment and select **Rollback to this deployment**.
4. Cloudflare immediately points `chat.healthyline.com` back to that version.

### Option 2: GitHub Actions Automated Rollback Workflow
1. In your GitHub repository, click the **Actions** tab.
2. In the left sidebar, select **Rollback Production Version**.
3. Click **Run workflow**, enter the target version (e.g., `1.0.0`), and submit.
4. The workflow restores the release snapshot from `dist/releases/<target_version>/`, commits it, and publishes it to production.

### Option 3: Local CLI Rollback
```bash
# Roll back locally to version 1.0.0
npm run rollback 1.0.0

# Commit and push to main
git add dist/
git commit -m "rollback: revert production to v1.0.0"
git push origin main
```

---

## 9. Security Guidelines

- **No Secrets in Frontend:** The client-side widget contains only public configurations. Never hardcode backend API keys, Shopify admin tokens, or n8n credentials into frontend code.
- **Webhook Protection:** All sensitive processing (database queries, email verification codes, order lookup) is handled on the backend via the n8n webhook (`https://app.healthyline.com/webhook/ai-chat`).
- **CORS & Origin Security:** The backend webhook can restrict origins to `healthyline.com` and `chat.healthyline.com`.

---

## 10. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Cannot find module` or build error in CI | Missing dependency | Ensure all libraries are listed in `package.json` under `dependencies` or `devDependencies`. Run `npm install` and `npm run typecheck` locally. |
| Widget does not update on website | Browser cache | Wait 5 minutes for the `max-age=300` cache to expire, or hard-refresh (`Ctrl+F5` / `Cmd+Shift+R`). |
| CORS error in browser console | Missing headers | Ensure `dist/_headers` is deployed to Cloudflare Pages (included automatically by `npm run build`). |
| Styles not displaying | CSS not loaded | The widget JS includes auto-CSS injection, but for best performance also include `<link rel="stylesheet" href="https://chat.healthyline.com/widget.css">` in the HTML `<head>`. |
| `webhookUrl is required` error | Missing options | Ensure `createChat({ webhookUrl: "https://app.healthyline.com/webhook/ai-chat" })` is provided during initialization. |
| Deals tab, sale line and Home carousel are missing | No deal is live at the moment, or the sheet cannot be read | Check that it is past 9:00 AM New York time on the first `Date` of the sheet and before the end of that month, and that the sheet is shared as *Anyone with the link → Viewer*. Use `?hl_deals_date=YYYY-MM-DD` to preview a day. |
| Deals are missing on the website, but `?hl_deals_date=YYYY-MM-DD` shows them on the local test page | The website still serves an older `widget.js` and/or `widget.css` (jsDelivr keeps an `@main` link for up to 12 hours, browsers for up to 7 days) | In the browser console of the website run `getComputedStyle(document.documentElement).getPropertyValue('--tt-chat-deals-styles')`: it must print `3`. Empty means an old `widget.css`. `SimpleChatN8N.setDealsPreviewDate` must exist; `undefined` means an old `widget.js`. Point the two links of the website snippet to the commit of the new build (`...@<commit hash>/dist/widget.js` and `.../widget.css`). |
| **View Deal** does nothing in an embedded preview window | The link opens in a new tab, and a preview frame that does not allow new tabs blocks it (the browser console says *Blocked opening … in a sandboxed frame*) | Nothing to fix in the widget: open the page in a normal browser tab. On the website the link opens in a new tab. |
| A deal has no **View Deal** button | Its `Frontend` cell is empty, or holds something that is not an `http(s)` link (or a Shopify admin link) | Put the product page address into the `Frontend` cell of that row. |
| A row of the sheet is not shown | No name, an empty or unreadable `Date`, or a date in the future | Fill `Bundle name` and enter `Date` the same way as in the other rows (a real spreadsheet date). An empty `Date` cell hides the row, unless the cell is part of a merged block that has a date. |
| A row shows no description / link although the sheet shows one | The cell is merged and the merged cells could not be read at that moment | Reload the page. The local test page (`npm run dev`) reports whether merged cells were read. |
| A sheet edit is not visible yet | The browser re-reads the sheet at most every 5 minutes | Open the chat (this re-reads the sheet), or wait up to 5 minutes. |
