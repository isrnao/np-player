// content.ts - content script to find m3u8 URL and insert a play button

function findM3u8Url(): string | null {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
  for (const script of Array.from(scripts)) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (typeof data === 'object' && data && data.contentUrl && typeof data.contentUrl === 'string' && data.contentUrl.endsWith('.m3u8')) {
        return data.contentUrl;
      }
    } catch (err) {
      // ignore parse errors
    }
  }
  return null;
}

function insertPlayButton(url: string) {
  if (document.getElementById('__m3u8play_btn')) return;
  const btn = document.createElement('button');
  btn.id = '__m3u8play_btn';
  btn.textContent = 'm3u8を別タブで再生';
  btn.style.cssText = 'z-index:10000;position:fixed;top:10px;right:10px;padding:8px 16px;background:orange;color:#222;font-size:16px;border-radius:6px;';
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ m3u8Url: url });
  });
  document.body.appendChild(btn);
}

const url = findM3u8Url();
if (url) {
  insertPlayButton(url);
}

export {}; // ensure this file is a module
