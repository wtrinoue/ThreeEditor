import { Controls } from 'three';
import type { Camera, Object3D } from 'three';

class BoxControls extends Controls {

    // Controls#domElement は HTMLElement | SVGElement だが、BoxControls は canvas（HTMLElement）にだけ接続する。
    // HTMLElement | SVGElement のままだと addEventListener('pointerdown', ...) の型が PointerEvent にならないため、ここで絞る。
    declare domElement: HTMLElement | null;

    dragging: boolean;

    constructor(camera: Camera, domElement: HTMLElement | SVGElement) {

        super(camera, domElement);

        // Controls#object の型は Object3D（null 不可）のため、型の上だけ null を許可している
        this.object = null!;
        this.dragging = false;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerUp = this._onPointerUp.bind(this);

        this.connect(domElement);

    }

    attach(object: Object3D): this {

        this.object = object;
        return this;

    }

    detach(): this {

        this.object = null!;
        return this;

    }

    // 引数の型は基底クラス Controls#connect に合わせる（HTMLElement | SVGElement）
    connect(domElement: HTMLElement | SVGElement = this.domElement!): void {

        super.connect(domElement);

        (domElement as HTMLElement).addEventListener('pointerdown', this._onPointerDown);
        (domElement as HTMLElement).addEventListener('pointermove', this._onPointerMove);
        (domElement as HTMLElement).addEventListener('pointerup', this._onPointerUp);

    }

    disconnect(): void {

        this.domElement?.removeEventListener('pointerdown', this._onPointerDown);
        this.domElement?.removeEventListener('pointermove', this._onPointerMove);
        this.domElement?.removeEventListener('pointerup', this._onPointerUp);

        super.disconnect();

    }

    _onPointerDown(event: PointerEvent): void {

        if (this.object === null) return;

        this.dragging = true;
        // ドラッグ開始時の位置やポインター座標を保存

    }

    _onPointerMove(event: PointerEvent): void {

        if (!this.dragging) return;

        // Raycasterで指す方向を計算し、
        // this.object.positionやquaternionを変更する

    }

    _onPointerUp(event: PointerEvent): void {

        this.dragging = false;

    }

    dispose(): void {

        this.disconnect();

    }

}

export { BoxControls };
