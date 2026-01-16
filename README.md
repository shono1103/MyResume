# My Resume

このプロジェクトはmkdocsを使用して履歴書・職務経歴書の代わりになるResumeサイトをgithub pages上に公開するためのものです。



## ローカル起動手順

ローカルでの起動にはdockerを使用します。  
リポジトリルートで以下のコマンドを実行してください

```sh
cp .env.example .env
docker compose up --build -d

```

その後、webブラウザで[http://localhost:8000](http://localhost:8000/)を開くとサイトが起動できます。

## ディレクトリ構成

リポジトリルートには

* `mkdocs`ディレクトリ
* それ以外(隠しファイル・ディレクトリは除く)

がある。`mkdocs`ディレクトリ以外はdockerでのローカル起動のためのファイルである。  
`mkdocs`ディレクトリがmkdocsの本体である。  
その中には以下のものがある。

* docs/
* makeMkdocs.yml.py
* .env.example
* requirements.txt

`docs`ディレクトリには公開されるページになるmarkdownファイルを置く。  
`makeMkdocs.yml.py`は`.env`や`docs`ディレクトリの内部構造に合わせて`mkdocs.yml`を作成するためのスクリプトである。

