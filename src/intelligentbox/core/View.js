class View {
    constructor(editor, objectUuid, updateFunc = (object, model) => { }) {
        this.editor = editor;
        this.objectUuid = objectUuid;
        this.updateFunc = updateFunc;
    }

    update(model) {
        const object = this.editor.objectByUuid(this.objectUuid);

        if (object === undefined) {
            throw new Error(`View: object not found for UUID "${this.objectUuid}"`);
        }

        this.updateFunc(object, model);
    }
}

// Viewはモデルに対するobjectへの操作を委託する。