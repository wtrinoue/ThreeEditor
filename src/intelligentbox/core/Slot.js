class Slot {
    constructor(setter = (value, model) => { }, getter = (model) => { }) {
        this.setter = setter;
        this.getter = getter;
        this.model = null;
    }

    setModel(model) {
        this.model = model;
    }

    set(value) {
        this.setter(value, this.model);
    }

    get() {
        return this.getter(this.model);
    }

}

// Slot側は、modelについて知らなくてもいいようにする。
// setterはモデルに対して受け取った値をどう扱うか
// getterはモデルから値をどう取り出すか
// Model.slots["position"].set(Model, value)
// Model.setValue(valueName, value);は必ず呼び出さないといけない。