class View {
    constructor(model, controller) {
        this.model = model;
        this.controller = controller;
    }

    update(object, model) {
        throw new Error("This method must be overridden by subclass [View.update]");
    }

    get Model() {
        return this.model;
    }
}