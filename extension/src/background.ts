chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'open_player' && msg.url) {
    const playerUrl = chrome.runtime.getURL(`player.html?url=${encodeURIComponent(msg.url)}`);
    chrome.tabs.create({ url: playerUrl });
  }
});
