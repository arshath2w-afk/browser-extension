# User-Agent Switcher (Browser Extension)

A simple cross-browser extension that lets you switch your browser User‑Agent quickly:
- Manual selection or random mode
- Profiles for Windows, macOS, Linux, Android, iOS
- Custom UA string support
- Stores your preference and can re‑apply on the current tab

This extension is built on top of a React + TypeScript web extension template.

## Quick Start

- Node.js 10 or later is required
- Install dependencies:
  - `npm install`
- Development (watch mode):
  - Chrome: `npm run dev:chrome`
  - Firefox: `npm run dev:firefox`
  - Opera: `npm run dev:opera`
- Production build:
  - `npm run build`
  - Or per browser:
    - Chrome: `npm run build:chrome`
    - Firefox: `npm run build:firefox`
    - Opera: `npm run build:opera`

### Load in the browser

- Chrome:
  - Visit `chrome://extensions`
  - Enable Developer Mode
  - Click “Load Unpacked” and select the folder `extension/chrome`
- Firefox:
  - Visit `about:debugging` → “This Firefox”
  - “Load Temporary Add-on” and select the generated `manifest.json` in `extension/firefox`
- Opera:
  - Visit `opera:extensions`
  - Enable Developer Mode
  - Load from `extension/opera`

## Usage

- Open the extension popup
- Choose Mode: Manual or Random
- Pick a Platform (Windows/macOS/Linux/Android/iOS) or “Custom”
- If Custom, paste a full UA string
- Optionally enable “Randomize on each page load”
- Click “Save” and “Apply on current tab”

Notes and limitations:
- In Chrome Manifest V3, extensions cannot modify the actual HTTP “User‑Agent” header for ordinary installations. This extension overrides the JS-level UA (navigator.userAgent, platform, and Client Hints) which many sites use. Server-side logs may still show the original UA.
- If you need header-level overrides in Firefox or special Chrome setups, open an issue.

## Credits

This project uses the excellent “web‑extension‑starter” template (MIT) by Abhijith Vijayan and includes modifications for the User‑Agent features.

## License

MIT

The original template’s license and attribution are preserved. See LICENCE for details.
