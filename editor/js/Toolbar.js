import { UIPanel, UIButton } from './libs/ui.js';

function Toolbar( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'toolbar' );

	// translate / rotate / scale

	const translateIcon = document.createElement( 'img' );
	translateIcon.title = strings.getKey( 'toolbar/translate' );
	translateIcon.src = 'images/translate.svg';

	const translate = new UIButton();
	translate.dom.className = 'Button selected';
	translate.dom.appendChild( translateIcon );
	translate.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( translate );

	const rotateIcon = document.createElement( 'img' );
	rotateIcon.title = strings.getKey( 'toolbar/rotate' );
	rotateIcon.src = 'images/rotate.svg';

	const rotate = new UIButton();
	rotate.dom.appendChild( rotateIcon );
	rotate.onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	container.add( rotate );

	const scaleIcon = document.createElement( 'img' );
	scaleIcon.title = strings.getKey( 'toolbar/scale' );
	scaleIcon.src = 'images/scale.svg';

	const scale = new UIButton();
	scale.dom.appendChild( scaleIcon );
	scale.onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	container.add( scale );

	// IntelligentBox: 特別に追加した部分（IB モードのボタン）ここから

	const intelligentBoxIcon = document.createElement( 'img' );
	intelligentBoxIcon.title = 'IntelligentBox';
	intelligentBoxIcon.src = 'images/ib.svg';

	const intelligentBox = new UIButton();
	intelligentBox.dom.appendChild( intelligentBoxIcon );
	intelligentBox.onClick( function () {

		signals.transformModeChanged.dispatch( 'intelligentbox' ); // ModelTransformControls の MODEL_MODE と同じ文字列

	} );
	container.add( intelligentBox );

	// IntelligentBox: 特別に追加した部分 ここまで

	//

	signals.transformModeChanged.add( function ( mode ) {

		translate.dom.classList.remove( 'selected' );
		rotate.dom.classList.remove( 'selected' );
		scale.dom.classList.remove( 'selected' );
		intelligentBox.dom.classList.remove( 'selected' ); // IntelligentBox: 特別に追加した部分

		switch ( mode ) {

			case 'translate': translate.dom.classList.add( 'selected' ); break;
			case 'rotate': rotate.dom.classList.add( 'selected' ); break;
			case 'scale': scale.dom.classList.add( 'selected' ); break;
			case 'intelligentbox': intelligentBox.dom.classList.add( 'selected' ); break; // IntelligentBox: 特別に追加した部分

		}

	} );

	return container;

}

export { Toolbar };
