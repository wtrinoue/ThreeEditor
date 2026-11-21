import type { Model } from './Model.js';
import type { DragState } from '../controls/ModelTransformControls.js';

class Controller {
    pointerDownFunc: (dragState: DragState, model: Model) => void;
    pointerMoveFunc: (dragState: DragState, model: Model) => void;
    pointerUpFunc: (dragState: DragState, model: Model) => void;

    constructor(
        pointerDownFunc: (dragState: DragState, model: Model) => void,
        pointerMoveFunc: (dragState: DragState, model: Model) => void,
        pointerUpFunc: (dragState: DragState, model: Model) => void,
    ) {
        this.pointerDownFunc = pointerDownFunc;
        this.pointerMoveFunc = pointerMoveFunc;
        this.pointerUpFunc = pointerUpFunc;
    }

    pointerDown(dragState: DragState, model: Model) {
        this.pointerDownFunc(dragState, model);
    }

    pointerMove(dragState: DragState, model: Model) {
        this.pointerMoveFunc(dragState, model);
    }

    pointerUp(dragState: DragState, model: Model) {
        this.pointerUpFunc(dragState, model);
    }

}

export { Controller };

// 今回のControllerは、ThreeEditorを前提とした作りにする。
// editorのSignalを用いたやり方をする。

// 入力に関しては制限したいので、ちょっと考えたほうがいい。

// ゲーム再生中と編集中でどちらもインテリジェントボックスとして動くようにしたらいいと思った。
