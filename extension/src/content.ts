// Content script is no longer needed as we're using popup instead
// The functionality has been moved to popup.js

/*
function findM3u8Url(): string | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent || '');
      if (json && typeof json === 'object' && json.contentUrl && typeof json.contentUrl === 'string' && json.contentUrl.endsWith('.m3u8')) {
        return json.contentUrl;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function insertPlayButton(url: string) {
  if (document.getElementById('m3u8-play-button')) return;
  const btn = document.createElement('button');
  btn.id = 'm3u8-play-button';
  btn.textContent = 'm3u8を別タブで再生';
  btn.style.cssText = 'z-index:10000;position:fixed;top:10px;right:10px;padding:12px 20px;background:orange;color:#222;font-size:16px;border:none;border-radius:8px;cursor:pointer;';
  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'open_player', url });
  });
  document.body.appendChild(btn);
}

const url = findM3u8Url();
if (url) {
  insertPlayButton(url);
}
*/
