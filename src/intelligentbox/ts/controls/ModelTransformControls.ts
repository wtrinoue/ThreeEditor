import { Matrix3, Object3D, Quaternion, Vector2, Vector3 } from 'three';
import type { Camera } from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// TransformControls#_getPointer() が返す値（-1〜1 の NDC 座標とボタン）
type Pointer = { x: number; y: number; button: number };

// TransformControlsGizmo の gizmo / picker / helper（モード名 → 部品のまとまり）
type GizmoGroups = Object3D & Record<'gizmo' | 'picker' | 'helper', Record<string, Object3D>>;

// IntelligentBox 用に追加するモードの名前（Toolbar.js からも同じ文字列で切り替える）
const MODEL_MODE = 'intelligentbox';

// つかんだときの this.axis（オブジェクトの表面をつかんだことを表す）
const SURFACE_AXIS = 'SURFACE';

const _offset = new Vector3();
const _normalMatrix = new Matrix3();
const _inverseQuaternion = new Quaternion();

/**
 * ドラッグ中の値をまとめたもの（Controller から import して読むためのもの）。
 *
 * - ModelTransformControls の値のうち、ドラッグ量の計算に使うものだけを入れている。
 * - 中の Vector3 などは ModelTransformControls が持つ専用のもので、毎回上書きされる。
 *   読むだけにする（Readonly は x / y / z への代入は防ぐが、set() や copy() は防げない）。
 *   ドラッグが終わったあとも使いたい値は clone() して保存する。
 * - 値を足すのは自由。名前を変えたり消したりすると、使っている側がすべて型エラーになる。
 */
interface DragState {
    readonly object: Object3D;                  // 操作しているオブジェクト
    readonly axis: string;                      // つかんだもの（いまは表面なら 'SURFACE'）
    readonly camera: Camera;                    // 操作しているカメラ

    readonly hitPoint: Readonly<Vector3>;       // つかんだ点（ワールド座標）
    readonly hitNormal: Readonly<Vector3>;      // つかんだ面の向き（ワールド座標、長さ 1）
    readonly localHitPoint: Readonly<Vector3>;  // つかんだ点（ドラッグ開始時の object から見たローカル座標）

    readonly delta: Readonly<Vector3>;          // 3D でのドラッグ量（ワールド座標、開始時からの合計）
    readonly localDelta: Readonly<Vector3>;     // delta をドラッグ開始時の object の向きで見たもの（向きだけ戻す。大きさは戻さない）
    readonly screenDelta: Readonly<Vector2>;    // 画面上のドラッグ量（-1〜1 の座標の差、上が +y。VR の操作では 0 のまま）

    readonly positionStart: Readonly<Vector3>;          // 開始時のローカルの位置
    readonly quaternionStart: Readonly<Quaternion>;     // 開始時のローカルの向き
    readonly scaleStart: Readonly<Vector3>;             // 開始時のローカルの大きさ
    readonly worldPositionStart: Readonly<Vector3>;     // 開始時のワールドの位置
    readonly worldQuaternionStart: Readonly<Quaternion>;// 開始時のワールドの向き
}

// DragState の中身を書き換えるための型（ModelTransformControls の中だけで使う）
type Writable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * TransformControls に IntelligentBox 用のモード（'intelligentbox'）を追加したクラス。
 *
 * - translate / rotate / scale はこれまでどおり TransformControls の処理を使う。
 * - 'intelligentbox' モードではギズモを表示せず、オブジェクトの表面そのものをつかんでドラッグする。
 * - 動きは、「ここに書いてください!」のコメントの場所で変更する。
 *   いまはサンプルとして、つかんだ面の向き（法線）にだけ modelStep 刻みで動かしている。
 *
 * カスタムする場所（どれも 'intelligentbox' モードのときだけ動く）
 *   [カスタム1] pointerHover  : どこをつかめるか（いまはオブジェクトの表面全体）
 *   [カスタム2] pointerDown   : ドラッグを始めたときに覚えておく値
 *   [カスタム3] pointerMove   : ドラッグ量をどう変化させるか（メイン）
 *   [カスタム4] pointerUp     : 離したときに確定させる処理
 */
class ModelTransformControls extends TransformControls {

    // 実装にはあるが @types/three に型がない内部プロパティ
    declare pointStart: Vector3;
    declare pointEnd: Vector3;
    declare worldPositionStart: Vector3;
    declare worldQuaternionStart: Quaternion;

    // 'intelligentbox' モードで動かす刻み幅（サンプルの処理で使用）
    modelStep: number;

    // 表面をつかんだ点と、その面の向き（どちらもワールド座標。pointerHover で更新される）
    hitPoint: Vector3;
    hitNormal: Vector3;

    // ドラッグ中の値（'intelligentbox' モードでドラッグしている間だけ入る。それ以外は null）
    dragState: DragState | null;

    // dragState の中身（使い回す）と、ドラッグ開始時の画面上の位置
    private _dragState: Writable<DragState> | null;
    private _screenStart: Vector2;

    constructor(camera: Camera, domElement?: HTMLElement | null) {

        super(camera, domElement);

        this.modelStep = 0.5;
        this.hitPoint = new Vector3();
        this.hitNormal = new Vector3();
        this.dragState = null;
        this._dragState = null;
        this._screenStart = new Vector2();

        // ギズモは表示しないので中身は空にする。
        // ただし gizmo / picker / helper の3か所すべてに登録は必要（どれかがないと updateMatrixWorld でエラーになる）
        const gizmo = (this as any)._gizmo as GizmoGroups;
        gizmo.gizmo[MODEL_MODE] = new Object3D();
        gizmo.picker[MODEL_MODE] = new Object3D();
        gizmo.helper[MODEL_MODE] = new Object3D();
        gizmo.picker[MODEL_MODE].visible = false;
        gizmo.add(gizmo.gizmo[MODEL_MODE], gizmo.picker[MODEL_MODE], gizmo.helper[MODEL_MODE]);

        // 元の updateMatrixWorld は translate / rotate / scale しか表示を切り替えないので、追加したモードの分をここで切り替える
        const updateMatrixWorld = gizmo.updateMatrixWorld;
        gizmo.updateMatrixWorld = function (this: GizmoGroups & { mode: string }, force?: boolean) {

            const active = this.mode === MODEL_MODE;
            this.gizmo[MODEL_MODE].visible = active;
            this.helper[MODEL_MODE].visible = active;

            updateMatrixWorld.call(this, force);

        };

    }

    // 型定義では 'translate' | 'rotate' | 'scale' しか受け付けないので広げる
    setMode(mode: string): void {

        super.setMode(mode as any);

    }

    pointerHover(pointer: Pointer | null): void {

        // 追加したモード以外は TransformControls の処理に任せる（ギズモの picker との当たり判定）
        if ((this.mode as string) !== MODEL_MODE) {

            super.pointerHover(pointer as any);
            return;

        }

        if (this.object === undefined || this.dragging === true) return;

        const raycaster = this.getRaycaster();
        if (pointer !== null) raycaster.setFromCamera(pointer as any, this.camera);

        // ---------------------------------------------------------------------------
        // [カスタム1] どこをつかめるか
        //
        // - picker の代わりに、オブジェクトそのもの（子も含む）にレイを当てる。
        // - this.axis に null 以外を入れると、そこでクリックしたときにドラッグが始まる。
        //   面ごとに動きを変えたいなら、hit.face や hit.object を見て this.axis を変える。
        // ---------------------------------------------------------------------------
        const hit = raycaster.intersectObject(this.object, true).find((intersection) => intersection.face != null);

        if (hit === undefined) {

            this.axis = null;
            return;

        }

        this.axis = SURFACE_AXIS as any;   // 型定義では 'X' などしか受け付けないので広げる
        this.hitPoint.copy(hit.point);

        // 面の向きをワールド座標にする（拡大率が軸ごとに違っても正しい向きになるように normal matrix を使う）
        _normalMatrix.getNormalMatrix(hit.object.matrixWorld);
        this.hitNormal.copy(hit.face!.normal).applyMatrix3(_normalMatrix).normalize();

    }

    pointerDown(pointer: Pointer | null): void {

        // 元の処理：position / quaternion / scale の開始時の値と pointStart を保存し、
        // ドラッグを始めたら dragging = true にして 'mouseDown' を発行する（Viewport が Undo 用に状態を保存する）
        super.pointerDown(pointer as any);

        if ((this.mode as string) !== MODEL_MODE || this.dragging === false) return;

        this.startDragState(pointer);

        // ---------------------------------------------------------------------------
        // [カスタム2] ドラッグを始めたときに覚えておく値
        //
        // - ここに来るのは、'intelligentbox' モードでギズモをつかんだときだけ。
        // - this.axis      : つかんだもの（いまは表面なら 'SURFACE'）
        // - this.hitPoint / this.hitNormal : つかんだ点と面の向き（ドラッグ中は変わらない）
        // - this.object    : 操作しているオブジェクト
        // - this.dragState : ドラッグ中の値（開始時の値はもう入っている。delta / screenDelta は 0）
        // - 例：Model の値など、pointerMove で「開始時の値」として使いたいものを保存する。
        //   （position / quaternion / scale の開始時の値は、元の処理がすでに保存している）
        // ---------------------------------------------------------------------------
        /*
        ここに書いてください!
        */

    }

    pointerMove(pointer: Pointer | null): void {

        // 追加したモード以外は TransformControls の処理に任せる
        if ((this.mode as string) !== MODEL_MODE) {

            super.pointerMove(pointer as any);
            return;

        }

        const object = this.object;

        if (object === undefined || this.axis === null || this.dragging === false || (pointer !== null && pointer.button !== - 1)) return;

        // ドラッグ用の平面とポインターの交点を求める（変更しない）
        const raycaster = this.getRaycaster();
        if (pointer !== null) raycaster.setFromCamera(pointer as any, this.camera);

        const planeIntersect = raycaster.intersectObject((this as any)._plane, true)[0];
        if (planeIntersect === undefined) return;

        this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);

        this.updateDragState(pointer);

        // ---------------------------------------------------------------------------
        // [カスタム3] ドラッグ量をどう変化させるか（メイン）
        //
        // this.dragState にドラッグ中の値がまとまっている（DragState を参照）。
        //
        // 使える値（どれもワールド座標）：
        // - this.pointStart          : ドラッグ開始時に押した点（オブジェクトの位置からの相対）
        // - this.pointEnd            : 今のポインターの点（同じく相対）
        //   → this.pointEnd - this.pointStart がドラッグした量
        // - this.worldQuaternionStart: ドラッグ開始時のオブジェクトの向き
        // - this.axis                : つかんだもの（[カスタム1] で入れた値）
        // - this.hitPoint / hitNormal: つかんだ点と面の向き（ドラッグ開始時の値のまま）
        // - (this as any)._positionStart / _quaternionStart / _scaleStart : 開始時のローカルの値
        //
        // 注意：
        // - 毎回「開始時の値 + 開始からの変化量」で計算する（前のフレームからの差分を足していくと誤差がたまる）。
        // - Model の値を変える場合も、ここで model.setValue(...) を呼べばよい。
        // ---------------------------------------------------------------------------
        /*
        ここに書いてください!
        */

        // サンプル：つかんだ面の向き（法線）にだけ、modelStep 刻みで動かす（書き換えてよい）
        const drag = this.dragState!;

        const distance = drag.delta.dot(drag.hitNormal);
        const snapped = Math.round(distance / this.modelStep) * this.modelStep;

        // 法線はワールド座標なので、移動先をワールド座標で求めてから親の座標系に直す
        _offset.copy(drag.hitNormal).multiplyScalar(snapped).add(drag.worldPositionStart);
        if (object.parent !== null) object.parent.worldToLocal(_offset);

        object.position.copy(_offset);

        // ---------------------------------------------------------------------------
        // 変更を通知する（変更しない）
        // Viewport が受け取り、objectChanged → Controller → Model と伝わる。
        // ---------------------------------------------------------------------------
        this.dispatchEvent({ type: 'change' } as any);
        this.dispatchEvent({ type: 'objectChange' } as any);

    }

    pointerUp(pointer: Pointer | null): void {

        // 元の処理は dragging を false に戻すので、その前にドラッグ中だったかを調べておく
        const wasDragging = (this.mode as string) === MODEL_MODE && this.dragging === true && this.axis !== null && (pointer === null || pointer.button === 0);

        if (wasDragging) {

            // -----------------------------------------------------------------------
            // [カスタム4] 離したときに確定させる処理
            //
            // - ここに来るのは、'intelligentbox' モードでドラッグを終えたときだけ。
            // - このあと元の処理が 'mouseUp' を発行し、Viewport がドラッグ前後の
            //   position / rotation / scale を比べて Undo に記録する。
            //   そのため、オブジェクトの値を最終的な値にそろえるならここで行う。
            // - オブジェクトの値を変えた場合は、this.dispatchEvent({ type: 'objectChange' } as any) で通知する。
            // -----------------------------------------------------------------------
            /*
            ここに書いてください!
            */

        }

        // 元の処理：'mouseUp' を発行し、dragging = false、axis = null に戻す
        super.pointerUp(pointer as any);

        // ドラッグが終わったら dragState を空にする（中身は次のドラッグで使い回す）
        if (this.dragging === false) this.dragState = null;

    }

    // ---------------------------------------------------------------------------
    // DragState の更新（変更しない）
    // ---------------------------------------------------------------------------

    // ドラッグ開始時：開始時の値を入れ、ドラッグ量を 0 にする
    private startDragState(pointer: Pointer | null): void {

        if (this._dragState === null) {

            this._dragState = {
                object: this.object!,
                axis: '',
                camera: this.camera,
                hitPoint: new Vector3(),
                hitNormal: new Vector3(),
                localHitPoint: new Vector3(),
                delta: new Vector3(),
                localDelta: new Vector3(),
                screenDelta: new Vector2(),
                positionStart: new Vector3(),
                quaternionStart: new Quaternion(),
                scaleStart: new Vector3(),
                worldPositionStart: new Vector3(),
                worldQuaternionStart: new Quaternion(),
            };

        }

        const state = this._dragState;

        state.object = this.object!;
        state.axis = this.axis as string;
        state.camera = this.camera;
        state.hitPoint.copy(this.hitPoint);
        state.hitNormal.copy(this.hitNormal);
        // 元の pointerDown が object.updateMatrixWorld() を呼んだあとなので、matrixWorld はドラッグ開始時のもの
        state.localHitPoint.copy(this.hitPoint);
        this.object!.worldToLocal(state.localHitPoint);
        state.delta.set(0, 0, 0);
        state.localDelta.set(0, 0, 0);
        state.screenDelta.set(0, 0);
        state.positionStart.copy((this as any)._positionStart);
        state.quaternionStart.copy((this as any)._quaternionStart);
        state.scaleStart.copy((this as any)._scaleStart);
        state.worldPositionStart.copy(this.worldPositionStart);
        state.worldQuaternionStart.copy(this.worldQuaternionStart);

        // VR のコントローラーでは pointer が null なので、画面上の位置は使わない
        if (pointer !== null) this._screenStart.set(pointer.x, pointer.y);

        this.dragState = state;

    }

    // ドラッグ中：ドラッグ量を更新する
    private updateDragState(pointer: Pointer | null): void {

        const state = this._dragState;
        if (state === null || this.dragState === null) return;

        state.delta.copy(this.pointEnd).sub(this.pointStart);

        // ドラッグ中は object が動くので、今の向きではなくドラッグ開始時の向きで戻す
        _inverseQuaternion.copy(state.worldQuaternionStart).invert();
        state.localDelta.copy(state.delta).applyQuaternion(_inverseQuaternion);

        if (pointer !== null) state.screenDelta.set(pointer.x, pointer.y).sub(this._screenStart);

    }

}

export { ModelTransformControls, MODEL_MODE };
export type { DragState };
