class Controller {
    constructor(editor, model, objectUuid, onChanged = (object, model) => { }) {
        if (new.target === Controller) {
            throw new Error('Controller must be subclassed');
        }

        this.editor = editor;
        this.model = model;// Viewに保持しているモデルを参照する
        this.objectUuid = objectUuid;// 変更対称のオブジェクト識別用
        this.onChanged = onChanged;// objectの変更に対するmodelの変更を記述

        this.initialize(this.editor, this.model, this.objectUuid);
    }

    dispose() {
        this.editor.signals.objectChanged.remove(this.onObjectChanged);
    }

    onObjectChanged(object) {
        if (object.uuid !== this.objectUuid) return;
        this.onChanged(object, this.model);
    }

    initialize(editor, model, objectUuid) {
        this.onObjectChanged = this.onObjectChanged.bind(this);
        editor.signals.objectChanged.add(this.onObjectChanged);
    }
}

// 今回のControllerは、ThreeEditorを前提とした作りにする。
// editorのSignalを用いたやり方をする。

// 入力に関しては制限したいので、ちょっと考えたほうがいい。

// ゲーム再生中と編集中でどちらもインテリジェントボックスとして動くようにしたらいいと思った。