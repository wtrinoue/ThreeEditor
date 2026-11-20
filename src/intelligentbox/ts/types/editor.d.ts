// ThreeEditor（editor/js/Editor.js）のうち、IntelligentBox から使う部分だけの型定義。
// エディタ本体は JavaScript なので、必要になったものをここへ追記していく。

import type { Object3D } from 'three';

// editor/js/libs/signals.min.js の Signal
export interface EditorSignal<TArgs extends unknown[] = unknown[]> {
    add(listener: (...args: TArgs) => void): void;
    remove(listener: (...args: TArgs) => void): void;
    dispatch(...args: TArgs): void;
}

export interface EditorSignals {
    objectChanged: EditorSignal<[Object3D]>;
}

export interface Editor {
    signals: EditorSignals;
    objectByUuid(uuid: string): Object3D | undefined;
}
