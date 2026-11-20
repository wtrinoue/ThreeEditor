import type { Object3D } from 'three';
import type { Model } from './Model.js';

class View {
    object: Object3D;
    updateFunc: (object: Object3D, model: Model) => void;

    constructor(object: Object3D, updateFunc: (object: Object3D, model: Model) => void = (object, model) => { }) {
        this.object = object;
        this.updateFunc = updateFunc;
    }

    update(model: Model): void {
        if (this.object === undefined) {
            throw new Error(`View: object not found for UUID "${this.objectUuid}"`);
        }

        this.updateFunc(this.object, model);
    }
}

export { View };

// Viewはモデルに対するobjectへの操作を委託する。
