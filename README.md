# m3u8 Player Launcher

Chrome拡張機能でm3u8ストリーミングファイルを検出し、専用プレイヤーで再生できるツールです。

## インストール方法

### リリース版を使用する場合（推奨）

1. [Releases](https://github.com/USERNAME/REPOSITORY/releases) から最新の `extension-for-chrome.zip` をダウンロード
2. zipファイルを解凍
3. Chromeの拡張機能管理画面（`chrome://extensions/`）を開く
4. 「デベロッパーモード」を有効にする
5. 「パッケージ化されていない拡張機能を読み込む」をクリック
6. 解凍したフォルダを選択

### ソースから直接ビルドする場合

```bash
cd extension
pnpm install
pnpm run build
```

`extension/dist` ディレクトリをChromeに読み込んでください。

## 使い方

1. m3u8ファイルが含まれるページで拡張機能アイコンをクリック
2. ポップアップでm3u8ファイルの検出状況を確認
3. 「m3u8を別タブで再生」ボタンをクリック
4. 新しいタブでHLS.jsベースのプレイヤーが開きます

## 開発

### セットアップ

```bash
cd extension
pnpm install
```

### 開発サーバー

```bash
pnpm run dev
```

### ビルド

```bash
pnpm run build
```

### リリースパッケージ作成

```bash
pnpm run build-zip
```

## 技術スタック

- **Frontend**: React + TypeScript + Vite
- **Video Player**: HLS.js
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Manifest**: Chrome Extension Manifest V3

## プロジェクト構造

```
extension/
├── src/
│   ├── App.tsx          # メインプレイヤーコンポーネント
│   ├── background.ts    # バックグラウンドスクリプト
│   └── main.tsx         # Reactエントリーポイント
├── popup.html           # ポップアップUI
├── popup.js             # ポップアップロジック
├── player.html          # プレイヤーページ
├── manifest.json        # 拡張機能設定
└── package.json         # 依存関係・スクリプト
```
