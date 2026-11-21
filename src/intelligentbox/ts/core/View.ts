import type { Object3D } from 'three';
import type { Model } from './Model.js';

class View {
    updateFunc: (object: Object3D, model: Model) => void;

    constructor(updateFunc: (object: Object3D, model: Model) => void = (object, model) => { }) {
        this.updateFunc = updateFunc;
    }

    update(object: Object3D, model: Model): void {
        this.updateFunc(object, model);
    }
}

export { View };

// Viewはモデルに対するobjectへの操作を委託する。
