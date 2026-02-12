---
title: 開発環境改善
sidebar_position: 2
---

## 開発プラットフォーム改善

- バージョン管理: Git
- OS:
  - フロントエンド: Windows
  - バックエンド: Wind River Linux
  - ビルド環境: Ubuntu（VirtualBox, Docker）
- 言語:
  - C++17
  - Python3（効率化）
  - Shell Script
- コンパイラ:
  - フロントエンド: VS2019
  - バックエンド: GCC
- 仮想化: VirtualBox / WSL2 / Docker

### 規模

- 1人で実施

### 問題と対応

#### 問題1

ビルド環境がISOイメージ配布 + VirtualBox前提で、環境ドキュメント不足と動作の重さが課題。

#### 対応1

WSL2上のDocker Engineでビルドコンテナを稼働させ、Dockerfileで環境をドキュメント化。編集環境とビルド環境を統合して軽量化。

#### 問題2

モジュール間依存が強く、単体デバッグが困難。

#### 対応2

POSIXメッセージキューや共有メモリの依存を最小再現し、GDB Pythonスクリプトで簡易スタブ化。特定実行ファイルのみを単体で実行できる環境を構築。

#### 問題3

実機レス環境が他案件と競合し、結合テストタイミングに影響。

#### 対応3

WSL2 + Dockerで再現を検討したが、Windows/Linux混在 + ハード模擬部分の制約で完全再現は未達。

## 開発支援ツールの導入・改善

- バージョン管理: Git
- OS: Ubuntu
- 仮想化: WSL2 / Docker / Docker Compose
- その他: MkDocs / GitLab / GitLab Runner / GitLab Pages

### 作業内容

チーム内で情報が属人化していたため、Markdownベースのドキュメント基盤を整備。

- Docker Composeでワンアクション起動構成を作成
- MkDocs拡張の追加
- CI/CDパイプラインを構築
