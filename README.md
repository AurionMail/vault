# 🛡️ Aurion Vault - Management & Onboarding Client

**Aurion Vault** is a standalone Single Page Application (SPA) designed for user onboarding and keyring administration within the **Aurion** ecosystem.

## 🚀 Technical Stack

* **Framework:** [Svelte 5](https://svelte.dev/) (Runes)
* **Build Tool:** [Vite](https://vitejs.dev/) (Pure SPA Mode)
* **Language:** TypeScript (Strict Mode)
* **Cryptography:** [aurion-crypto-sdk](https://www.npmjs.com/package/aurion-crypto-sdk) (OpenPGP ECC / Argon2)
* **Deployment:** Static Hosting (No Node.js runtime required in production)

## 🛠️ Getting Started

### Prerequisites

* **Node.js** (v20 or higher)
* **NPM Access** for the `aurion-crypto-sdk` package.

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

```

### Project Structure

```text
src/
├── main.ts           # Entry point (Handles config fetching + bootstrapping)
├── App.svelte        # Manual Router & Global Layout
├── lib/
│   ├── config.svelte.ts  # Runtime Config Loader (public/config.json)
│   ├── api.ts            # SDK Client instance (AurionApiClient)
│   └── auth.svelte.ts    # Global Cryptographic Session state
└── components/       # Application Pages (Svelte Components)
    ├── Onboarding.svelte
    ├── Dashboard.svelte
    └── Recovery.svelte

```

## ⚙️ Modular Configuration

To achieve total portability without re-compiling the code for each instance, the application fetches its configuration from a static JSON file at runtime.

### The `config.json` file

Located in `public/config.json` (or at the root of your deployment).

```json
{
  "AURION_API_BASE": "https://api.your-aurion-instance.com"
}

```

### Runtime Logic

1. The `main.ts` script initiates a `fetch('/config.json')`.
2. Once the URL is retrieved, the `AurionApiClient` is initialized.
3. The Svelte application is then mounted to the DOM.


## 📦 Production & Deployment

### Build

Generate a purely static production bundle in the `dist/` folder:

```bash
npm run build

```

Here is the updated **Production & Deployment** section for your README, adding the Apache configuration block alongside the Nginx example.

### Static Hosting

Since this is a pure SPA, the `dist/` folder can be served by any web server (Nginx, Apache, S3, etc.).

#### Nginx Configuration (Example)

Ensure all routes are redirected to `index.html` to support client-side routing.

```nginx
server {
    listen 80;
    server_name vault.aurion.internal;

    location / {
        root /var/www/aurion-vault;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}

```

#### Apache Configuration (Example)

For Apache, ensure `mod_rewrite` is enabled. You can place this configuration in your virtual host setup or directly inside a `.htaccess` file located at the root of your `dist/` folder.

```apache
<VirtualHost *:80>
    ServerName vault.aurion.internal
    DocumentRoot /var/www/aurion-vault

    <Directory /var/www/aurion-vault>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Fallback all traffic to index.html for SPA client-side routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>

```

### Deployment Checklist

1. Copy the `dist/` content to your server.
2. Edit `config.json` to point to the correct Aurion API instance.
3. **Crucial:** Serve the application over **HTTPS** with certbot for example, otherwise, the `WebCrypto API` and SDK will fail.