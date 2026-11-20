# ThreeEditorにIntelligentBox用のメニューバーを追加する

このページでは、ThreeEditorのメニューバーに「IB」メニューを追加し、その中に「Box」の項目を作る手順を説明します。メニューは、エディタにもともとある「Add」メニュー（`editor/js/Menubar.Add.js`）と同じ仕組みで作ります。

- [要点](#要点)
- [関係するファイル](#関係するファイル)
- [1. メニューの仕組み](#1-メニューの仕組み)
- [2. メニューを追加する手順](#2-メニューを追加する手順)
- [3. Boxの項目](#3-boxの項目)
- [4. 注意点](#4-注意点)

## 要点

- メニュー1つは、`UIPanel`（メニュー全体）、タイトル、`options`（項目の一覧）でできています。
- 項目1つは`UIRow`です。クリックされたときの処理を`onClick`に書きます。
- オブジェクトを追加するときは、`editor.execute( new AddObjectCommand( editor, object ) )`を使います。こうすると、シーンへの追加と選択が行われ、Undoもできるようになります。
- 表示する文字は`Strings.js`にキーとして登録し、`strings.getKey( キー )`で取り出します。
- 作ったメニューは`Menubar.js`で`container.add()`しないと表示されません。

## 関係するファイル

| ファイル | 役割 | 変更内容 |
| --- | --- | --- |
| `editor/js/Menubar.IB.js` | IBメニューの中身 | 新規作成 |
| `editor/js/Strings.js` | 表示する文字（言語ごと） | キーを追加 |
| `editor/js/Menubar.js` | メニューバーにメニューを並べる | IBメニューを登録 |

## 1. メニューの仕組み

メニューバーは`Menubar.js`で作られ、各メニュー（File、Edit、Add、…）を順番に`add`しています。

```javascript
// editor/js/Menubar.js
function Menubar( editor ) {

	const container = new UIPanel();
	container.setId( 'menubar' );

	container.add( new MenubarFile( editor ) );
	container.add( new MenubarEdit( editor ) );
	container.add( new MenubarAdd( editor ) );
	// ...

	return container;

}
```

メニュー1つの中身は、次のような入れ子になっています。

```text
container（UIPanel, class="menu"）
├── title（UIPanel, class="title"）       ← メニューバーに出る文字（「IB」）
└── options（UIPanel, class="options"）   ← マウスを乗せると開く一覧
    ├── option（UIRow, class="option"）   ← 項目（「Box」）
    └── option ...
```

`options`の開閉は`editor/css/main.css`の`#menubar .menu:hover .options`で行われているので、JavaScriptで開閉を書く必要はありません。

## 2. メニューを追加する手順

### 手順1：Menubar.IB.jsを作る

`Menubar.Add.js`をコピーして`Menubar.IB.js`を作り、次のように書き換えます。

1. 関数名を`MenubarAdd`から`MenubarIB`に変え、`export`も合わせて変える。
2. タイトルのキーを`'menubar/add'`から`'menubar/IB'`に変える。
3. Group、Mesh、Light、CameraなどAddメニューの項目を消し、IB用の項目（[3章](#3-boxの項目)）だけにする。
4. 使わなくなったimport（`MultiCmdsCommand`、`FontLoader`、`TextGeometry`）を消す。

```javascript
// editor/js/Menubar.IB.js
import * as THREE from 'three';

import { UIPanel, UIRow } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

function MenubarIB(editor) {

    const strings = editor.strings;

    // メニュー全体
    const container = new UIPanel();
    container.setClass('menu');

    // メニューバーに出る文字
    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/IB'));
    container.add(title);

    // 項目の一覧
    const options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // ここに項目を書く（3章）

    return container;

}

export { MenubarIB };
```

### 手順2：Strings.jsに文字を登録する

`strings.getKey()`は、今の言語にキーが登録されていないと`???`を返します。メニューのタイトルと項目の両方のキーを、各言語の`'menubar/help/manual'`の下に追加します。

```javascript
// editor/js/Strings.js（en / fr / ja のブロック）
'menubar/IB': 'IB',
'menubar/IB/box': 'Box',
```

現在は英語（en）、フランス語（fr）、日本語（ja）に登録しています。ペルシャ語（fa）、中国語（zh）、韓国語（ko）には登録していないので、エディタの言語をそれらにすると`???`と表示されます。表示させたい場合は、それぞれのブロックにも同じキーを追加してください。

### 手順3：Menubar.jsに登録する

importを追加し、`container.add()`でメニューバーに並べます。

```javascript
// editor/js/Menubar.js
import { MenubarIB } from './Menubar.IB.js';

function Menubar(editor) {

	// ...
	container.add(new MenubarHelp(editor));

	container.add(new MenubarStatus(editor));

	container.add(new MenubarIB(editor));

	return container;

}
```

メニューは左から`add`した順に並びます。ただし`MenubarStatus`には`class="menu right"`が付いていて右端に寄せられるので、その後に`add`したIBメニューは、左側の「Help」の右隣に表示されます。

### 手順4：表示を確認する

エディタ（`editor/index.html`）を開き直し、メニューバーに「IB」が表示されること、マウスを乗せると「Box」が出ることを確認します。

## 3. Boxの項目

IBメニューの中に「Box」の項目を作り、クリックすると箱（`IntelligentBox`）がシーンに追加されるようにします。

### コード

```javascript
// editor/js/Menubar.IB.js
// IB / Box

let option = new UIRow();
option.setClass('option');
option.setTextContent(strings.getKey('menubar/IB/box'));
option.onClick(function () {

    const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
    mesh.name = 'IntelligentBox';

    editor.execute(new AddObjectCommand(editor, mesh));

    // Model / View / Controller を作るならここ（mesh.uuid で結び付ける）

});
options.add(option);
```

### 1行ずつの説明

| コード | 説明 |
| --- | --- |
| `new UIRow()` | 項目1行を作る。 |
| `setClass('option')` | 項目用の見た目（`main.css`の`#menubar .menu .options .option`）にする。 |
| `setTextContent(strings.getKey('menubar/IB/box'))` | 表示する文字を`Strings.js`から取り出す。 |
| `onClick(function () { ... })` | クリックされたときの処理。 |
| `new THREE.BoxGeometry(1, 1, 1, 1, 1, 1)` | 幅・高さ・奥行きが1、各面の分割数が1の箱の形。 |
| `new THREE.MeshStandardMaterial()` | 光の当たり方が反映される標準のマテリアル。 |
| `mesh.name = 'IntelligentBox'` | Sidebarのシーン一覧に出る名前。 |
| `editor.execute(new AddObjectCommand(editor, mesh))` | シーンに追加して選択し、Undo履歴に記録する。 |
| `options.add(option)` | 項目をIBメニューの一覧に入れる。 |

### AddObjectCommandを使う理由

`editor.scene.add(mesh)`のように直接追加すると、Sidebarの表示が更新されず、Undoもできません。`AddObjectCommand`を`editor.execute()`で実行すると、次の処理がまとめて行われます。

```javascript
// editor/js/commands/AddObjectCommand.js
execute() {

	this.editor.addObject( this.object );  // シーンに追加し、ジオメトリとマテリアルを登録する
	this.editor.select( this.object );     // 追加したオブジェクトを選択する

}

undo() {

	this.editor.removeObject( this.object );
	this.editor.deselect();

}
```

選択されると、Viewportが`ModelTransformControls`を追加したオブジェクトに`attach`するので、そのまま「intelligentbox」モードで操作できます（選択と移動の流れは[intelligentbox-object-manipulation.md](intelligentbox-object-manipulation.md)を参照）。

### 項目を増やすとき

同じ形を繰り返します。2つ目からは`let`を付けずに`option = new UIRow();`と書きます。キーは`'menubar/IB/○○'`の形にそろえ、`Strings.js`にも追加します。

```javascript
// IB / Sphere（例）

option = new UIRow();
option.setClass('option');
option.setTextContent(strings.getKey('menubar/IB/sphere'));
option.onClick(function () {

    // ...

});
options.add(option);
```

「IB ▸ ○○ ▸ △△」のように階層を作りたい場合は、`Menubar.Add.js`の`meshSubmenuTitle`と`meshSubmenu`の部分（Meshのサブメニュー）をそのまま使い、名前だけ変えます。

### MVCと結び付けるとき

`onClick`の中、`editor.execute()`の後に、Model / View / Controllerを作ります。ViewとControllerは`mesh.uuid`でオブジェクトを見分けます。

ただし、Undoで箱を消してもControllerは残ったままです（`AddObjectCommand`はMVCのことを知らないため）。Undo / RedoでもMVCを作り直したり解除したりしたい場合は、`AddObjectCommand`を継承した専用のコマンドを作り、`execute` / `undo`の中でMVCの作成と`dispose()`を行う必要があります。

## 4. 注意点

- **エディタ本体を変更した場所に印を付ける**
  Viewport.jsやToolbar.jsでは、変更した行に`// IntelligentBox: 特別に追加した部分`のコメントを付けています。Menubar.jsとStrings.jsにも同じように付けておくと、three.js本体を更新するときに差分を見つけやすくなります。
- **自動整形でエディタ本体のコードを書き換えない**
  エディタ本体は`foo( bar )`のように括弧の内側にスペースを入れる書き方です。保存時の自動整形が働くと、追加していない行まで`foo(bar)`に変わり、差分が大きくなります。エディタ本体のファイルでは自動整形を切るか、変更した行だけを整形してください。
- **`ts/`ではなくエディタ側のファイルである**
  `Menubar.IB.js`はエディタ本体（`editor/js/`）のJavaScriptなので、`tsc`での変換は必要ありません。IntelligentBoxのクラス（`Model`や`ModelTransformControls`など）を使うときは、Viewport.jsと同じように、変換後の`../../src/intelligentbox/js/...`からimportします。
