import { Controls } from 'three';

class BoxControls extends Controls {

    constructor(camera, domElement) {

        super(camera, domElement);

        this.object = null;
        this.dragging = false;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        this.connect(domElement);

    }

    attach(object) {

        this.object = object;
        return this;

    }

    detach() {

        this.object = null;
        return this;

    }

    connect(domElement = this.domElement) {

        super.connect(domElement);

        domElement.addEventListener('pointerdown', this._onPointerDown);
        domElement.addEventListener('pointermove', this._onPointerMove);
        domElement.addEventListener('pointerup', this._onPointerUp);

    }

    disconnect() {

        this.domElement?.removeEventListener('pointerdown', this._onPointerDown);
        this.domElement?.removeEventListener('pointermove', this._onPointerMove);
        this.domElement?.removeEventListener('pointerup', this._onPointerUp);

        super.disconnect();

    }

    _onPointerDown(event) {

        if (this.object === null) return;

        this.dragging = true;
        // ドラッグ開始時の位置やポインター座標を保存

    }

    _onPointerMove(event) {

        if (!this.dragging) return;

        // Raycasterで指す方向を計算し、
        // this.object.positionやquaternionを変更する

    }

    _onPointerUp(event) {

        this.dragging = false;

    }

    dispose() {

        this.disconnect();

    }

}