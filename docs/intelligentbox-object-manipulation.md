# ThreeEditorでオブジェクトを選択・移動する流れ

このページでは、ThreeEditorでオブジェクトを選択し、TransformControlsで移動したときに、選択・座標変更・Undo履歴への記録がどこで行われるかを説明します。

## 処理の流れ

1. `Viewport.js`がビューポート上のマウス入力を受け取ります。
2. クリック位置から交差したオブジェクトを調べ、選択します。
3. 選択されたオブジェクトを`TransformControls`に取り付けます。
4. ドラッグ中、`TransformControls.js`が`object.position`を更新します。
5. ドラッグ終了時に変更前後の値を比較し、`SetPositionCommand`などを履歴へ記録します。

## 1. ビューポートのクリックから選択へ

```javascript
// editor/js/Viewport.js
function handleClick( event ) {

	if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

		const intersects = selector.getPointerIntersects( onUpPosition, camera );
		signals.intersectionsDetected.dispatch( intersects, event.shiftKey );

		render();

	}

}
```

クリック位置に交差するオブジェクトを調べ、`intersectionsDetected`をdispatchします。

```javascript
// editor/js/Selector.js
signals.intersectionsDetected.add( ( intersects, shiftKey ) => {

	if ( intersects.length > 0 ) {

		const objects = [];

		for ( let i = 0; i < intersects.length; i ++ ) {

			let object = intersects[ i ].object;

			if ( object.userData.object !== undefined ) {

				object = object.userData.object;

			}

			if ( objects.indexOf( object ) === - 1 ) {

				objects.push( object );

			}

		}

		if ( shiftKey === true && this.selection.length > 0 && editor.selected !== editor.scene && editor.selected !== editor.camera ) {

			this.toggle( objects[ 0 ] );

		} else {

			const index = objects.indexOf( editor.selected );

			if ( index !== - 1 && index < objects.length - 1 ) {

				this.select( objects[ index + 1 ] );

			} else {

				this.select( objects[ 0 ] );

			}

		}

	} else {

		if ( shiftKey !== true ) this.select( null );

	}

} );
```

Selectorが交差結果から選択対象を決め、`select()`を通じて選択状態を更新します。

## 2. 選択オブジェクトをTransformControlsに接続

```javascript
// editor/js/Viewport.js
signals.objectSelected.add( function ( object ) {

	selectionBox.visible = false;
	transformControls.detach();

	if ( selector.selection.length > 1 ) {

		selector.getSelectionBox( box );

		selectionBox.visible = true;
		transformControls.attach( selector.group );

	} else if ( object !== null && object !== scene && object !== camera ) {

		box.setFromObject( object, true );

		if ( box.isEmpty() === false ) {

			selectionBox.visible = true;

		}

		transformControls.attach( object );

	}

	render();

} );
```

単一選択の場合、`transformControls.attach( object )`で選択対象を変形コントロールに接続します。

## 3. ドラッグ中の座標変更

ポインターイベントの登録と処理はThree.jsの`examples/jsm/controls/TransformControls.js`にあります。

```javascript
// examples/jsm/controls/TransformControls.js
this.domElement.addEventListener( 'pointerdown', this._onPointerDown );
this.domElement.addEventListener( 'pointermove', this._onPointerHover );
this.domElement.addEventListener( 'pointerup', this._onPointerUp );
```

ドラッグ中の座標計算は`pointerMove(pointer)`内で行われます。移動モードでは、ドラッグ量からオフセットを計算して`object.position`に反映します。

```javascript
// examples/jsm/controls/TransformControls.js
// pointerMove(pointer) 内の平行移動処理
if ( mode === 'translate' ) {

	// Apply translate

	this._offset.copy( this.pointEnd ).sub( this.pointStart );

	if ( space === 'local' && axis !== 'XYZ' ) {

		this._offset.applyQuaternion( this._worldQuaternionInv );

	}

	if ( axis.indexOf( 'X' ) === - 1 ) this._offset.x = 0;
	if ( axis.indexOf( 'Y' ) === - 1 ) this._offset.y = 0;
	if ( axis.indexOf( 'Z' ) === - 1 ) this._offset.z = 0;

	if ( space === 'local' && axis !== 'XYZ' ) {

		this._offset.applyQuaternion( this._quaternionStart ).divide( this._parentScale );

	} else {

		this._offset.applyQuaternion( this._parentQuaternionInv ).divide( this._parentScale );

	}

	object.position.copy( this._offset ).add( this._positionStart );

	// Apply translation snap and position limits here.

}
```

この抜粋は平行移動の主要部分です。同じ`pointerMove()`内で、スナップや移動制限、回転・スケールなどの処理も行われます。

## 4. 変更通知とUndo履歴

`Viewport.js`はTransformControlsの`objectChange`イベントを受け取り、Editorの`objectChanged` Signalを発行します。

```javascript
// editor/js/Viewport.js
transformControls.addEventListener( 'objectChange', function () {

	signals.objectChanged.dispatch( transformControls.object );

} );
```

ドラッグ開始時には位置・回転・スケールを記録します。ドラッグ終了時に変更前後を比較して、必要なコマンドを作ります。

```javascript
// editor/js/Viewport.js
transformControls.addEventListener( 'mouseDown', function () {

	const object = transformControls.object;
	const objects = ( object === selector.group ) ? selector.selection : [ object ];

	objectStatesOnDown = objects.map( ( object ) => ( {
		object: object,
		position: object.position.clone(),
		rotation: object.rotation.clone(),
		scale: object.scale.clone()
	} ) );

	controls.enabled = false;

} );
```

```javascript
// editor/js/Viewport.js
transformControls.addEventListener( 'mouseUp', function () {

	if ( transformControls.object !== undefined ) {

		const commands = [];

		for ( let i = 0; i < objectStatesOnDown.length; i ++ ) {

			const state = objectStatesOnDown[ i ];
			const object = state.object;

			if ( ! state.position.equals( object.position ) ) {

				commands.push( new SetPositionCommand( editor, object, object.position, state.position ) );

			}

			if ( ! state.rotation.equals( object.rotation ) ) {

				commands.push( new SetRotationCommand( editor, object, object.rotation, state.rotation ) );

			}

			if ( ! state.scale.equals( object.scale ) ) {

				commands.push( new SetScaleCommand( editor, object, object.scale, state.scale ) );

			}

		}

		if ( commands.length === 1 ) {

			editor.execute( commands[ 0 ] );

		} else if ( commands.length > 1 ) {

			editor.execute( new MultiCmdsCommand( editor, commands ) );

		}

	}

	controls.enabled = true;

} );
```

`SetPositionCommand`は変更前後の位置を保持します。Historyは実行したCommandをUndo/Redo用に管理します。TransformControlsがドラッグ中に座標を直接更新する一方、ドラッグ終了時にCommandとして履歴へ登録する流れです。

## IntelligentBoxとの連携で注意する点

- `objectChanged`は変更後に発行される通知です。変更の種類や入力内容までは引数に含まれず、変更されたObject3Dが渡されます。
- `object.position`を独自コードから直接変更しただけでは、EditorのSignalやUndo履歴は自動で処理されません。
- IntelligentBoxのオブジェクトに許可する操作を限定したい場合は、TransformControlsなどの標準編集UIから制限対象を切り離し、許可した操作だけをController等の専用経路から実行させます。
