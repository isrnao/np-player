// ポップアップのロジック
document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const playButton = document.getElementById('playButton');
  const urlInfoEl = document.getElementById('urlInfo');

  let m3u8Url = null;

  try {
    // chrome.scripting APIが利用可能かチェック
    if (!chrome.scripting) {
      updateStatus('error', 'scripting権限が不足しています');
      return;
    }

    // 現在のアクティブタブを取得
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      updateStatus('error', 'アクティブなタブが見つかりません');
      return;
    }

    // content scriptを注入してm3u8 URLを検索
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: findM3u8Url
    });

    if (results && results[0] && results[0].result) {
      m3u8Url = results[0].result;
      updateStatus('found', 'm3u8ファイルが見つかりました！');
      playButton.disabled = false;
      urlInfoEl.textContent = m3u8Url;
      urlInfoEl.style.display = 'block';
    } else {
      updateStatus('not-found', 'このページにはm3u8ファイルが見つかりませんでした');
    }
  } catch (error) {
    console.error('Error:', error);
    updateStatus('error', 'エラーが発生しました: ' + error.message);
  }

  // 再生ボタンのクリックイベント
  playButton.addEventListener('click', () => {
    if (m3u8Url) {
      chrome.runtime.sendMessage({ 
        type: 'open_player', 
        url: m3u8Url 
      });
      window.close(); // ポップアップを閉じる
    }
  });

  function updateStatus(type, message) {
    statusEl.className = `status ${type}`;
    statusEl.textContent = message;
  }
});

// content scriptで実行される関数（注入される）
function findM3u8Url() {
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
