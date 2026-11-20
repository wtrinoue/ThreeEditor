import type { Object3D } from 'three';
import type { Editor } from '../types/editor.js';
import type { Model } from './Model.js';

class View {
    editor: Editor;
    objectUuid: string;
    updateFunc: (object: Object3D, model: Model) => void;

    constructor(editor: Editor, objectUuid: string, updateFunc: (object: Object3D, model: Model) => void = (object, model) => { }) {
        this.editor = editor;
        this.objectUuid = objectUuid;
        this.updateFunc = updateFunc;
    }

    update(model: Model): void {
        const object = this.editor.objectByUuid(this.objectUuid);

        if (object === undefined) {
            throw new Error(`View: object not found for UUID "${this.objectUuid}"`);
        }

        this.updateFunc(object, model);
    }
}

export { View };

// Viewはモデルに対するobjectへの操作を委託する。
