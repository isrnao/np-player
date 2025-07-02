# m3u8 Player Chrome Extension

This extension detects `contentUrl` values ending with `.m3u8` inside `script[type="application/ld+json"]` elements on any page. When detected, a button is inserted that opens a new tab with a simple React-based player using **hls.js**.

## Development

Install dependencies and build the scripts:

```bash
npm install
npm run build
```

Load the `np-player` folder as an unpacked extension in Chrome.
