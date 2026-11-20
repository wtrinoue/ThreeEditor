# IntelligentBoxのTypeScript開発環境

このページでは、IntelligentBoxのコードをTypeScriptで書き、JavaScriptに変換してThreeEditorで動かすための環境について説明します。

- [1. これまでの流れ](#1-これまでの流れ)
- [2. フォルダ構成](#2-フォルダ構成)
- [3. 別のデバイスでこのプロジェクトを開いたときの操作](#3-別のデバイスでこのプロジェクトを開いたときの操作)
- [4. TypeScriptからJavaScriptへ変換する方法（汎用）](#4-typescriptからjavascriptへ変換する方法汎用)
- [5. このプロジェクト固有の注意点](#5-このプロジェクト固有の注意点)

## 1. これまでの流れ

1. **ThreeEditorの仕組みを調べた**
   選択（`intersectionsDetected`、`Selector`）、移動（`TransformControls`）、Undo（Command / History）、再生（`APP.Player`）の流れを調べ、次のドキュメントにまとめた。
   - [intelligentbox-object-manipulation.md](intelligentbox-object-manipulation.md)：編集中の選択・移動・Undo
   - [intelligentbox-player-control.md](intelligentbox-player-control.md)：再生中の操作
2. **MVCの基本クラスを作った**
   `Model` / `Slot` / `View` / `Controller` / `BoxControls` をJavaScriptで作った。
3. **TypeScriptを導入した**
   JavaScriptのままでは書きづらかったため、次のように変更した。
   - `core/`、`controls/` の `.js` を `ts/` に移し、`.ts` にリネームした（`git mv` を使ったので履歴をたどれる）。
   - 処理の中身は変えずに型の注釈を付け、ほかのファイルから import できるように `export` を追加した。
   - エディタ本体（JavaScript）の型として、使う部分だけを [ts/types/editor.d.ts](../ts/types/editor.d.ts) に書いた。
   - 変換の設定として [tsconfig.json](../tsconfig.json) を作った。
   - 生成物の `js/` を `.gitignore` に追加した。
   - devDependencies に `typescript` と `@types/three` を追加した。
4. **`three` の型が見つからない問題を直した**
   リポジトリ自身のpackage.jsonの名前が `"three"` なので、`import ... from 'three'` が型のない `build/three.module.js` に解決されていた。そこで `tsconfig.json` の `paths` を使い、型を `@types/three` から読むようにした（詳しくは[5章](#5-このプロジェクト固有の注意点)）。

## 2. フォルダ構成

```text
src/intelligentbox/
├── tsconfig.json          ← 変換の設定
├── ts/                    ← TypeScript（ここだけ編集する）
│   ├── core/
│   │   ├── Controller.ts
│   │   ├── Model.ts
│   │   ├── ModelConnector.ts
│   │   ├── Slot.ts
│   │   └── View.ts
│   ├── controls/
│   │   └── BoxControls.ts
│   └── types/
│       └── editor.d.ts    ← エディタ本体の型（JSは出力されない）
├── js/                    ← tscが生成するJavaScript（Gitの管理外・編集しない）
└── docs/                  ← ドキュメント
```

- `ts/` の中のフォルダ構成は、そのまま `js/` に再現されます（例：`ts/core/Model.ts` → `js/core/Model.js`）。
- `js/` は `.gitignore` に入っているので、**リポジトリには含まれません**。デバイスごとに生成する必要があります。

## 3. 別のデバイスでこのプロジェクトを開いたときの操作

### 必要なもの

| もの | 確認するコマンド | 備考 |
| --- | --- | --- |
| Git | `git --version` | |
| Node.js（npmも一緒に入る） | `node -v` / `npm -v` | 作成時の環境はNode.js v24、npm 11 |
| VS Code | | 推奨 |

### 手順

**1. リポジトリを取得する**

```bash
# 初めてのデバイス
git clone <リポジトリのURL>
cd ThreeEditor

# すでにクローンしてあるデバイス
git pull
```

**2. 依存パッケージをインストールする**

```bash
npm install
```

package.jsonの `devDependencies` にある `typescript` と `@types/three` もここで入ります。`git pull` でpackage.jsonが変わったときも、もう一度実行してください。

**3. TypeScriptをJavaScriptに変換する**

```bash
npx tsc -p src/intelligentbox
```

`src/intelligentbox/js/` が生成されます。`js/` はGitで管理していないので、**新しいデバイスでは必ず1回実行してください**。`git pull` で `.ts` が更新されたときも実行が必要です。

**4. エディタを起動する**

```bash
npm start
```

ブラウザで `http://localhost:8080/editor/` を開きます（8080番ポートが使われていると、別の番号になります。ターミナルに表示されたURLを使ってください）。

**5. 開発中は自動で変換する（任意）**

ターミナルをもう1つ開いて、次のコマンドを実行したままにしておきます。

```bash
npx tsc -p src/intelligentbox --watch
```

VS Codeでは、`Ctrl + Shift + B` →「tsc: ウォッチ - src/intelligentbox/tsconfig.json」でも同じことができます。

### うまくいかないとき

| 症状 | 対処 |
| --- | --- |
| `tsc` が見つからない | `npm install` を実行していない。手順2を行う |
| VS Codeで `Could not find a declaration file for module 'three'` が出る | `npm install` 後、コマンドパレット（`Ctrl + Shift + P`）で「TypeScript: Restart TS Server」を実行する |
| エディタで `js/...` の読み込みが404エラーになる | 手順3の変換をしていない |
| `.ts` を直したのに動きが変わらない | 変換し直す。または `--watch` を動かしておく。ブラウザのキャッシュも疑う |

## 4. TypeScriptからJavaScriptへ変換する方法（汎用）

このプロジェクトに限らず使える手順です。

### 準備するもの

1. **Node.js**：npmとnpxが一緒に入ります。
2. **TypeScript本体**：`tsc`（TypeScriptのコンパイラ）が入っています。

   ```bash
   npm install -D typescript
   ```

   `-D`（`--save-dev`）は開発時だけ使うパッケージとして登録するオプションです。プロジェクトごとに入れておくと、ほかのデバイスでも `npm install` だけで同じバージョンがそろいます。
3. **使うライブラリの型定義**：ライブラリ自身が型を持っていない場合は、`@types/<ライブラリ名>` を入れます。

   ```bash
   npm install -D @types/three@<ライブラリと同じバージョン>
   ```

   型定義のバージョンはライブラリ本体に合わせてください。違うと、型と実際のAPIが食い違うことがあります。
4. **tsconfig.json**：変換の設定ファイルです。`npx tsc --init` で雛形を作れます。必要な項目だけを手で書いてもかまいません。

### tsconfig.jsonの主な項目

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",            // 出力するJSの文法のバージョン
    "module": "ESNext",            // import / export をそのまま残す（ブラウザのESモジュール向け）
    "moduleResolution": "bundler", // import先の探し方
    "rootDir": "./ts",             // 入力フォルダ
    "outDir": "./js",              // 出力フォルダ
    "strict": true,                // 厳しい型チェック（null チェックなど）
    "sourceMap": true,             // .js.map を出力し、ブラウザのデバッガで .ts を見られるようにする
    "skipLibCheck": true           // ライブラリの .d.ts の検査を省略して速くする
  },
  "include": [ "ts/**/*" ]         // 変換対象のファイル
}
```

| 項目 | 意味 |
| --- | --- |
| `target` | 出力するJSの文法の新しさ。古いブラウザに対応するなら下げる |
| `module` | 出力するモジュールの形式。ブラウザでそのまま読み込むなら `ESNext` |
| `rootDir` / `outDir` | 入力と出力のフォルダ。中のフォルダ構成は保たれる |
| `strict` | まとめて厳しいチェックを有効にする。新しく始めるなら `true` がおすすめ |
| `sourceMap` | デバッグ用の対応表を出力する |
| `paths` | import名を別の場所に読み替える（型チェック時だけ。出力されるJSは変わらない） |
| `allowJs` | `.js` も変換対象にする。少しずつ `.ts` に移行するときに便利 |
| `noEmit` | JSを出力せず、型チェックだけ行う |

### よく使うコマンド

| コマンド | 内容 |
| --- | --- |
| `npx tsc -p <tsconfig.jsonがあるフォルダ>` | 1回だけ変換する |
| `npx tsc -p <フォルダ> --watch` | ファイルを保存するたびに自動で変換する（`Ctrl + C` で終了） |
| `npx tsc -p <フォルダ> --noEmit` | JSを出力せず、型エラーがないかだけ確かめる |
| `npx tsc -p <フォルダ> --traceResolution` | import先がどのファイルに解決されたかを表示する（型が見つからないときの調査用） |
| `npx tsc -v` | 使われているTypeScriptのバージョンを表示する |
| `npx tsc --init` | tsconfig.jsonの雛形を作る |

`npx` は、プロジェクトの `node_modules` に入っているコマンドを実行するためのものです。

package.jsonの `scripts` に登録しておくと、短いコマンドで実行できます。

```json
"scripts": {
  "build-ib": "tsc -p src/intelligentbox",
  "watch-ib": "tsc -p src/intelligentbox --watch"
}
```

```bash
npm run build-ib
npm run watch-ib
```

### TypeScriptを書くときの注意

- **importのパスは `.js` で書く**：`import { Model } from './Model.js';` のように書きます。tscはパスを書き換えないため、ブラウザで読み込むときに正しいパスになるよう、変換後の拡張子で書いておきます。
- **型だけのimportは `import type` にする**：`import type { Model } from './Model.js';` と書くと、変換後のJSからは消えます。循環importも起きにくくなります。
- **型エラーがあってもJSは出力される**：エラーのあるJSを出力したくない場合は、`"noEmitOnError": true` を設定します。
- **生成されたJSは編集しない**：次の変換で上書きされます。修正は必ず `.ts` 側で行います。
- **JavaScriptのライブラリに型を付ける**：型定義がないものは、使う部分だけを `.d.ts` に書けば型チェックができます（例：[ts/types/editor.d.ts](../ts/types/editor.d.ts)）。`.d.ts` からJSは出力されません。

## 5. このプロジェクト固有の注意点

### `three` の型は `paths` で指定している

このリポジトリはthree.js本体なので、ルートのpackage.jsonの名前が `"three"` です。何も設定しないと、TypeScriptは `import ... from 'three'` を**このパッケージ自身**として解決し、型のない `build/three.module.js` を見に行きます。その結果、次のエラーになります。

```text
Could not find a declaration file for module 'three'.
'.../build/three.module.js' implicitly has an 'any' type.
```

そのため、[tsconfig.json](../tsconfig.json) で型の参照先を `@types/three` に指定しています。

```jsonc
"paths": {
  "three": [ "../../node_modules/@types/three" ]
}
```

出力されるJSの `import ... from 'three'` はそのまま残ります。実行時は [editor/index.html](../../../editor/index.html) のimport mapによって、`build/three.module.js` が読み込まれます。

### `useDefineForClassFields` を `false` にしている

TypeScriptでは、クラスのプロパティの型を `values: Record<string, unknown>;` のようにクラスの先頭で宣言します。この設定が `true`（`target: ES2022` での既定値）のままだと、宣言もJSのクラスフィールドとして出力されます。元のJSと同じく「コンストラクタで代入するだけ」の形にするため、`false` にしています。

### `build/` に出力してはいけない

`npm start` が実行する `utils/build/dev.js` は、起動のたびにルートの `./build` フォルダを丸ごと削除します。そのため、出力先は `src/intelligentbox/js/` にしています。

### エディタから読み込むときのパス

開発用サーバーはリポジトリのルートを配信しています。そのため、`editor/js/` の中のファイルからは、次の相対パスで読み込めます。

```javascript
import { Model } from '../../src/intelligentbox/js/core/Model.js';
```

### eslint

`npm run lint` は `src/` 全体をチェックするので、生成された `js/` も対象になります。three.jsのコーディングスタイルに合わないと警告が出る場合は、`eslint.config.js` の `ignores` に `'src/intelligentbox/js/**'` を追加してください（現在は未設定です）。
