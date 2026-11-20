import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Quaternion, Vector3 } from 'three';
import type { Camera } from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// TransformControls#_getPointer() が返す値（-1〜1 の NDC 座標とボタン）
type Pointer = { x: number; y: number; button: number };

// TransformControlsGizmo の gizmo / picker / helper（モード名 → 部品のまとまり）
type GizmoGroups = Object3D & Record<'gizmo' | 'picker' | 'helper', Record<string, Object3D>>;

// IntelligentBox 用に追加するモードの名前（Toolbar.js からも同じ文字列で切り替える）
const MODEL_MODE = 'intelligentbox';

const _axis = new Vector3();
const _offset = new Vector3();

/**
 * TransformControls に IntelligentBox 用のモード（'intelligentbox'）を追加したクラス。
 *
 * - translate / rotate / scale はこれまでどおり TransformControls の処理を使う。
 * - 'intelligentbox' モードの動きは、「ここに書いてください!」のコメントの場所で変更する。
 *   いまはサンプルとして、オブジェクトをローカルの X 軸方向にだけ modelStep 刻みで動かしている。
 *
 * カスタムする場所（どれも 'intelligentbox' モードのときだけ動く）
 *   [カスタム1] constructor   : ギズモの形（見た目と当たり判定）
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

    constructor(camera: Camera, domElement?: HTMLElement | null) {

        super(camera, domElement);

        this.modelStep = 0.5;

        const gizmo = (this as any)._gizmo as GizmoGroups;

        const visible = new Object3D();   // 見た目のギズモを入れる
        const picker = new Object3D();    // 当たり判定（picker）を入れる

        // ---------------------------------------------------------------------------
        // [カスタム1] ギズモの形
        //
        // - visible に見た目の Mesh、picker に当たり判定の Mesh を add する。
        // - Mesh の name が、つかんだときの this.axis になる（'X' / 'Y' / 'Z' など）。
        //   name に X / Y / Z の文字が入っていると、showX / showY / showZ で表示を切り替えられる。
        // - 大きさは 1 を基準に作る（カメラからの距離に合わせて自動で拡大縮小される）。
        // - picker は BoxGeometry がおすすめ。4角柱の CylinderGeometry だと断面がひし形になり、
        //   角の線に当たるレイを取りこぼすことがある。
        // ---------------------------------------------------------------------------
        /*
        ここに書いてください!
        */

        // サンプル：X 方向のオレンジの棒（書き換えてよい）
        const handle = new Mesh(
            new BoxGeometry(1, 0.05, 0.05),
            new MeshBasicMaterial({ color: 0xffaa00, depthTest: false, depthWrite: false, fog: false, toneMapped: false, transparent: true })
        );
        handle.name = 'X';
        handle.geometry.translate(0.5, 0, 0);
        handle.renderOrder = Infinity;
        visible.add(handle);

        const hit = new Mesh(new BoxGeometry(1, 0.4, 0.4), new MeshBasicMaterial({ visible: false }));
        hit.name = 'X';
        hit.geometry.translate(0.5, 0, 0);
        picker.add(hit);

        // ---------------------------------------------------------------------------
        // ここから下は変更しない（ギズモの登録と表示の切り替え）
        // ---------------------------------------------------------------------------

        picker.visible = false;

        // gizmo / picker / helper の3か所すべてに登録する（どれかがないと updateMatrixWorld でエラーになる）
        gizmo.gizmo[MODEL_MODE] = visible;
        gizmo.picker[MODEL_MODE] = picker;
        gizmo.helper[MODEL_MODE] = new Object3D();
        gizmo.add(visible, picker, gizmo.helper[MODEL_MODE]);

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

    pointerDown(pointer: Pointer | null): void {

        // 元の処理：position / quaternion / scale の開始時の値と pointStart を保存し、
        // ドラッグを始めたら dragging = true にして 'mouseDown' を発行する（Viewport が Undo 用に状態を保存する）
        super.pointerDown(pointer as any);

        if ((this.mode as string) !== MODEL_MODE || this.dragging === false) return;

        // ---------------------------------------------------------------------------
        // [カスタム2] ドラッグを始めたときに覚えておく値
        //
        // - ここに来るのは、'intelligentbox' モードでギズモをつかんだときだけ。
        // - this.axis      : つかんだ部品の name
        // - this.object    : 操作しているオブジェクト
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

        // ---------------------------------------------------------------------------
        // [カスタム3] ドラッグ量をどう変化させるか（メイン）
        //
        // 使える値（どれもワールド座標）：
        // - this.pointStart          : ドラッグ開始時に押した点（オブジェクトの位置からの相対）
        // - this.pointEnd            : 今のポインターの点（同じく相対）
        //   → this.pointEnd - this.pointStart がドラッグした量
        // - this.worldQuaternionStart: ドラッグ開始時のオブジェクトの向き
        // - this.axis                : つかんだ部品の name（[カスタム1] で付けたもの）
        // - (this as any)._positionStart / _quaternionStart / _scaleStart : 開始時のローカルの値
        //
        // 注意：
        // - 毎回「開始時の値 + 開始からの変化量」で計算する（前のフレームからの差分を足していくと誤差がたまる）。
        // - Model の値を変える場合も、ここで model.setValue(...) を呼べばよい。
        // ---------------------------------------------------------------------------
        /*
        ここに書いてください!
        */

        // サンプル：ローカルの X 軸方向にだけ、modelStep 刻みで動かす（書き換えてよい）
        _axis.set(1, 0, 0).applyQuaternion(this.worldQuaternionStart);
        _offset.copy(this.pointEnd).sub(this.pointStart);

        const distance = _offset.dot(_axis);
        const snapped = Math.round(distance / this.modelStep) * this.modelStep;

        object.position.copy((this as any)._positionStart);
        object.translateX(snapped);

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

    }

}

export { ModelTransformControls, MODEL_MODE };
