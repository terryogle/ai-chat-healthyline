# HealthyLine 24/7 AI Wellness Concierge Chat Widget

Production-ready, embeddable Vue 3 + TypeScript AI chat widget for [HealthyLine](https://healthyline.com). Connects securely to the HealthyLine AI backend webhook (`https://app.healthyline.com/webhook/ai-chat`) with support for customer order lookups, PEMF/Infrared mat series comparisons, and product recommendations.

---

# Website Installation

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
        subtitle: "24/7 AI Wellness Concierge",
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
