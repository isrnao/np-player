# np-player

This repository contains a Chrome extension that detects `contentUrl` fields ending with `.m3u8` on any webpage and provides a button to play the stream in a new tab. The player page is built with React and TypeScript using Vite and `hls.js`.

## Development

```
cd extension
npm install
npm run build
```

Load the `extension/dist` directory as an unpacked extension in Chrome.
