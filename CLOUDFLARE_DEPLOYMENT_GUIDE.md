# Cloudflare Deployment & Hosting Guide
**Project:** Atomy Withdrawal Form Assistant  
**Production URL:** [https://atomy-withdrawl.pages.dev](https://atomy-withdrawl.pages.dev)  
**Cloudflare Account:** `devopsankitsaikia@gmail.com`  
**GitHub Repository:** [Saikiasan/atomy_withdrawl](https://github.com/Saikiasan/atomy_withdrawl)

---

## 1. Architectural Overview

The application is built as a **Single Page Application (SPA) / Progressive Web App (PWA)** using **React 19, TypeScript, Tailwind CSS, and Vite**. 

All heavyweight logic runs **100% client-side** inside the user's web browser:
- **KYC Document Extraction:** Runs client-side using `@google/genai` (Google Gemini AI) via the user's or pre-configured API key.
- **PDF Form Filling & Merging:** Assembled on HTML5 canvas and generated with `pdf-lib`.
- **Email Drafter:** Handled client-side with pre-built templates and `mailto:` integration.

Because there is **no persistent Node.js/Express server requirement**, the application is hosted on **Cloudflare Pages** at zero infrastructure cost, benefiting from Cloudflare's global edge network, automated DDoS protection, and SSL certificates.

---

## 2. Prerequisites

Before deploying or redeploying, ensure you have:

1. **Node.js**: `v20.x` or higher installed.
2. **Git**: Installed and configured.
3. **Cloudflare Account**: Logged in via Wrangler CLI (`npx wrangler login`).
4. **Google Gemini API Key**: Acquired free from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 3. Deployment Methods

### Method A: Deploy from Local Machine using Wrangler CLI (What was performed)

This is the fastest method to deploy directly from your local terminal.

#### Step 1: Install Dependencies
Run with `--legacy-peer-deps` to handle Vite 8 peer resolution:
```bash
npm install --legacy-peer-deps
```

#### Step 2: Build the Application
Set your default `VITE_GEMINI_API_KEY` (if you want an out-of-the-box key for your users) and compile the static bundle:

**On Windows (PowerShell):**
```powershell
$env:VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
npm run build
```

**On Linux / macOS:**
```bash
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE" npm run build
```

This compiles the output into the `dist/` directory.

#### Step 3: Check Wrangler Authentication
Verify you are logged in to the correct Cloudflare account:
```bash
npx wrangler whoami
```

If not logged in, run:
```bash
npx wrangler login
```

#### Step 4: Deploy to Cloudflare Pages
Deploy the compiled `dist` directory to your Cloudflare Pages project:
```bash
npx wrangler pages deploy dist --project-name=atomy-withdrawl
```

Once uploaded, Wrangler outputs the active deployment link:
```
✨ Success! Uploaded 13 files (3.35 sec)
🌎 Deploying...
✨ Deployment complete! https://atomy-withdrawl.pages.dev
```

---

### Method B: Continuous Deployment via Cloudflare Dashboard (Automated Git Push)

If you want Cloudflare to automatically rebuild and deploy every time you run `git push origin main`:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left-hand navigation sidebar, select **Workers & Pages**.
3. Click **Create Application** and choose the **Pages** tab.
4. Click **Connect to Git** and authorize your GitHub account (`Saikiasan`).
5. Select the repository: `Saikiasan/atomy_withdrawl`.
6. Configure the **Build Settings**:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
7. Set **Environment Variables**:
   - Under **Environment variables (advanced)**, add:
     - **Variable name:** `VITE_GEMINI_API_KEY`
     - **Value:** `YOUR_GEMINI_API_KEY`
8. Click **Save and Deploy**. Cloudflare will handle automatic builds on every future git commit.

---

## 4. Custom Domain Setup (Optional)

To connect a custom domain (e.g. `withdraw.yourdomain.com` or `atomyhelper.com`):

1. Go to **Workers & Pages** in your Cloudflare dashboard.
2. Click on the project **`atomy-withdrawl`**.
3. Select the **Custom domains** tab.
4. Click **Set up a custom domain**.
5. Enter your domain or subdomain.
6. Cloudflare automatically sets up the DNS CNAME record and provisions a free universal SSL certificate within a few minutes.

---

## 5. Environment Variables & Secret Handling

| Variable | Description | Where to Configure |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Default fallback API key for Gemini OCR | Cloudflare Pages Dashboard (Environment Variables) or build script |
| `atomy_gemini_api_key` | User-supplied custom API key | Saved in end-user's browser `localStorage` (BYOK model) |

> [!IMPORTANT]
> Never hardcode API keys directly into committed source files. GitHub Secret Scanning actively blocks commits with raw GCP/Gemini keys. Always supply them via `VITE_GEMINI_API_KEY` at build time or let users enter their own keys in the app interface.

---

## 6. Verification Checklist

- [x] Production URL is reachable over HTTPS: [https://atomy-withdrawl.pages.dev](https://atomy-withdrawl.pages.dev)
- [x] Step 1 OCR file upload and scan functioning
- [x] Form fields validation and step progression functioning
- [x] Digital signature canvas working on touch and desktop devices
- [x] PDF form rendering and download working via `pdf-lib`
- [x] Email drafting and mailto integration working
