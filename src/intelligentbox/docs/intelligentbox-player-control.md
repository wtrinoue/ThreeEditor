# ThreeEditorの再生中にオブジェクトを操作する仕組み

このページでは、ThreeEditorの「再生（Play）」中に、オブジェクトへの入力がどのように扱われるかを説明します。編集中の選択・移動の流れは[intelligentbox-object-manipulation.md](intelligentbox-object-manipulation.md)を参照してください。

## 要点

- 再生中は、編集用のViewport・Selector・TransformControlsは使われません。
- 再生は`APP.Player`（`editor/js/libs/app.js`）が担当し、エディタのシーンを**JSONで複製したシーン**を別のレンダラーで描画します。
- 再生中の操作は、オブジェクトに登録した**スクリプトのイベント関数**（`pointerdown`、`update`など）だけで行います。
- 再生中に変更した内容はエディタのシーンに反映されず、Undo履歴にも記録されません。

## 処理の流れ

1. Sidebar > Project > App の再生ボタンを押すと、`startPlayer` Signalがdispatchされます。
2. `Player.js`が`editor.toJSON()`でシーンを書き出し、`APP.Player`に読み込ませます。
3. `APP.Player`がシーンとカメラを複製し、各オブジェクトのスクリプトをイベント関数に変換します。
4. `play()`で`document`に入力イベントを登録し、毎フレーム`update`を呼び出して描画します。
5. 停止ボタンを押すと`stopPlayer`がdispatchされ、イベントの登録を解除してレンダラーを破棄します。

## 1. 再生の開始と停止

```javascript
// editor/js/Sidebar.Project.App.js
playButton.onClick( function () {

	if ( isPlaying === false ) {

		isPlaying = true;
		playButton.setTextContent( strings.getKey( 'sidebar/project/app/stop' ) );
		signals.startPlayer.dispatch();

	} else {

		isPlaying = false;
		playButton.setTextContent( strings.getKey( 'sidebar/project/app/play' ) );
		signals.stopPlayer.dispatch();

	}

} );
```

```javascript
// editor/js/Player.js
signals.startPlayer.add( async function () {

	container.setDisplay( '' );

	await player.load( editor.toJSON() );
	player.setSize( container.dom.clientWidth, container.dom.clientHeight );
	player.play();

} );

signals.stopPlayer.add( function () {

	container.setDisplay( 'none' );

	player.stop();
	player.dispose();

} );
```

`#player`パネルはビューポートの上に重ねて表示されます。`player.load()`には`editor.toJSON()`の結果を渡すため、再生中のオブジェクトはエディタのオブジェクトとは**別のインスタンス**です。

再生中はHistoryも無効になります。

```javascript
// editor/js/History.js
this.editor.signals.startPlayer.add( function () {

	scope.historyDisabled = true;

} );

this.editor.signals.stopPlayer.add( function () {

	scope.historyDisabled = false;

} );
```

## 2. スクリプトをイベント関数に変換する

`APP.Player.load()`は、`json.scripts`に保存されたスクリプトのソースを`new Function()`で関数に変換します。

```javascript
// editor/js/libs/app.js
events = {
	init: [],
	start: [],
	stop: [],
	keydown: [],
	keyup: [],
	pointerdown: [],
	pointerup: [],
	pointermove: [],
	update: []
};

let scriptWrapParams = 'player,renderer,scene,camera';
const scriptWrapResultObj = {};

for ( var eventKey in events ) {

	scriptWrapParams += ',' + eventKey;
	scriptWrapResultObj[ eventKey ] = eventKey;

}

const scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );
```

```javascript
// editor/js/libs/app.js
const functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );

for ( const name in functions ) {

	if ( functions[ name ] === undefined ) continue;

	if ( events[ name ] === undefined ) {

		console.warn( 'APP.Player: Event type not supported (', name, ')' );
		continue;

	}

	events[ name ].push( functions[ name ].bind( object ) );

}
```

スクリプトのソースは、おおよそ次のような関数で包まれて実行されます。

```javascript
function ( player, renderer, scene, camera, init, start, stop, keydown, keyup, pointerdown, pointerup, pointermove, update ) {

	// ---- スクリプトのソース ----
	function pointerdown( event ) { ... }
	function update( event ) { ... }
	// ---------------------------

	return { init: init, start: start, stop: stop, keydown: keydown, keyup: keyup,
		pointerdown: pointerdown, pointerup: pointerup, pointermove: pointermove, update: update };

}
```

- 引数名とイベント名が同じなので、スクリプト内で定義した関数だけが戻り値に入ります。定義していないイベントは`undefined`になり、登録されません。
- 各関数は`bind( object )`されるため、スクリプト内の`this`は**そのスクリプトを登録したオブジェクト**になります。
- スクリプト内では`player`、`renderer`、`scene`、`camera`を使えます。ここでの`scene`と`camera`は再生用に複製されたものです。
- `THREE`は`editor/index.html`で`window.THREE`として公開されているため、スクリプト内でも使えます。
- 定義した変数は、同じスクリプト内の関数どうしで共有されます（クロージャ）。オブジェクトごとの状態はここに持たせます。

すべてのスクリプトを変換し終えると、`init`が呼ばれます。

## 3. 入力イベントとフレーム更新

```javascript
// editor/js/libs/app.js
this.play = function () {

	startTime = prevTime = performance.now();

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );
	document.addEventListener( 'pointerdown', onPointerDown );
	document.addEventListener( 'pointerup', onPointerUp );
	document.addEventListener( 'pointermove', onPointerMove );

	dispatch( events.start, arguments );

	renderer.setAnimationLoop( animate );

};
```

```javascript
// editor/js/libs/app.js
function animate() {

	time = performance.now();

	try {

		dispatch( events.update, { time: time - startTime, delta: time - prevTime } );

	} catch ( e ) {

		console.error( ( e.message || e ), ( e.stack || '' ) );

	}

	renderer.render( scene, camera );

	prevTime = time;

}
```

| イベント | 呼ばれるタイミング | 引数 |
| --- | --- | --- |
| `init` | 読み込みが完了したとき | なし |
| `start` | `play()`したとき | なし |
| `stop` | `stop()`したとき | なし |
| `keydown` / `keyup` | `document`のキー入力 | `KeyboardEvent` |
| `pointerdown` / `pointerup` / `pointermove` | `document`のポインタ入力 | `PointerEvent` |
| `update` | 毎フレーム | `{ time, delta }`（ミリ秒） |

入力イベントの登録先は再生用のキャンバスではなく`document`です。そのため、サイドバーなどキャンバスの外での入力もすべてのスクリプトに届きます。クリックしたオブジェクトを判定する処理（Selectorの`intersectionsDetected`に当たる処理）はないため、必要ならスクリプト側でレイキャストを行います。

## 4. スクリプトでドラッグ操作を実装する例

再生中に、クリックしたオブジェクトをドラッグで動かすスクリプトの例です。

```javascript
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = false;

function toNDC( event ) {

	const rect = renderer.domElement.getBoundingClientRect();
	pointer.set(
		( event.clientX - rect.left ) / rect.width * 2 - 1,
		- ( event.clientY - rect.top ) / rect.height * 2 + 1
	);

}

function pointerdown( event ) {

	toNDC( event );
	raycaster.setFromCamera( pointer, camera );
	dragging = raycaster.intersectObject( this, true ).length > 0;

}

function pointermove( event ) {

	if ( dragging === false ) return;

	this.position.x += event.movementX * 0.01;
	this.position.y -= event.movementY * 0.01;

}

function pointerup() {

	dragging = false;

}
```

`this`はスクリプトを登録したオブジェクトなので、`intersectObject( this, true )`でそのオブジェクト（と子孫）がクリックされたかどうかを判定できます。

## 編集中と再生中の比較

| 項目 | 編集中 | 再生中 |
| --- | --- | --- |
| 担当するクラス | `Viewport` / `Selector` / `TransformControls` | `APP.Player` |
| 操作するシーン | エディタのシーン（`editor.scene`） | `editor.toJSON()`から複製したシーン |
| 入力の受け口 | ビューポートのDOM要素 | `document` |
| クリック判定 | `Selector.getPointerIntersects()` → `intersectionsDetected` | スクリプトでレイキャストを書く |
| 変更通知 | `objectChanged`などのSignal | なし |
| Undo履歴 | Commandで記録 | 無効（`historyDisabled = true`） |
| 変更の保存 | エディタのシーンに残る | 停止すると破棄される |

## IntelligentBoxとの連携で注意する点

- 再生中にTransformControlsのようなギズモを使う場合は、`APP.Player`の中で別にインスタンスを作り、再生用の`camera`と`renderer.domElement`に接続する必要があります。スクリプトの`init`で作るか、`app.js`を拡張する方法があります。
- BoxControlsを編集中と再生中の両方で使うなら、`camera`と`domElement`をコンストラクタで受け取る形にしておくと、どちらのレンダラーでも同じクラスを使えます。
- 再生中はEditorのSignalが使えないため、IntelligentBoxのModel・Slotの変更通知は、Editorに依存しない独自の仕組みで行う必要があります。
- 再生中の変更は停止すると失われます。再生中の操作結果を残したい場合は、停止時（`stop`イベント）にデータを書き出すなど、別の保存方法が必要です。
- 入力イベントは`document`全体から届くため、キャンバス外の入力を無視したい場合は`event.target === renderer.domElement`などで判定してください。
