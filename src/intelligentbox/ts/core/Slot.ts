import type { Model } from './Model.js';

class Slot<T = any> {
    setter: (value: T, model: Model | null) => void;
    getter: (model: Model | null) => T;
    model: Model | null;

    constructor(setter: (value: T, model: Model | null) => void = (value, model) => { }, getter: (model: Model | null) => T = ((model) => { }) as (model: Model | null) => T) {
        this.setter = setter;
        this.getter = getter;
        this.model = null;
    }

    setModel(model: Model): void {
        this.model = model;
    }

    set(value: T): void {
        this.setter(value, this.model);
    }

    get(): T {
        return this.getter(this.model);
    }

}

export { Slot };

// Slot側は、modelについて知らなくてもいいようにする。
// setterはモデルに対して受け取った値をどう扱うか
// getterはモデルから値をどう取り出すか
// Model.slots["position"].set(Model, value)
// Model.setValue(valueName, value);は必ず呼び出さないといけない。
