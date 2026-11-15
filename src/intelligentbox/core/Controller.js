class Controller {
    constructor() { }

    update(model) {
        throw new Error("This method must be overridden by subclass [Controller.update]");
    }
}