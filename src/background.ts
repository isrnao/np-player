// background.ts - opens player tab on message
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.m3u8Url) {
    const url = chrome.runtime.getURL(`play.html?url=${encodeURIComponent(msg.m3u8Url)}`);
    chrome.tabs.create({ url });
  }
});
