# My Resume

このリポジトリは、履歴書・職務経歴書サイトを Docusaurus で公開するためのものです。

## これまでの移行内容

- MkDocs 時代のコンテンツを Docusaurus の `docs/` へ移植
- `docusaurus.config.ts` / `sidebars.ts` を Resume サイト向けに更新
- Docker 構成を Docusaurus 用に更新

## 現在の構成

- 現行サイト本体: `docs/`, `src/`, `docusaurus.config.ts`
- 画像などの静的ファイル: `static/`
- Docker 起動で `docusaurus build` 済み静的サイトを `nginx` で配信

## ローカル起動手順

### Node.js で開発サーバー起動

```sh
npm ci
npm start
```

開発サーバー: `http://localhost:3000/MyResume/`

### Docker で確認

```sh
docker compose up --build -d
```

公開確認: `http://localhost:8000/`

## ディレクトリ構成

- `docs/`: Docusaurus のドキュメント本文（履歴書コンテンツ）
- `src/`: Docusaurus テーマ
- `static/`: 画像など静的ファイル
