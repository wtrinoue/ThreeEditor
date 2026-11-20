import * as THREE from 'three';

import { UIPanel, UIRow } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

function MenubarIB(editor) {

    const strings = editor.strings;

    const container = new UIPanel();
    container.setClass('menu');

    const title = new UIPanel();
    title.setClass('title');
    title.setTextContent(strings.getKey('menubar/IB'));
    container.add(title);

    const options = new UIPanel();
    options.setClass('options');
    container.add(options);

    // IB / Box

    let option = new UIRow();
    option.setClass('option');
    option.setTextContent(strings.getKey('menubar/IB/box'));
    option.onClick(function () {

        const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
        mesh.name = 'IntelligentBox';

        editor.execute(new AddObjectCommand(editor, mesh));

        // Model / View / Controller を作るならここ（mesh.uuid で結び付ける）

    });
    options.add(option);

    // 項目を増やすときは「option = new UIRow(); ... options.add(option);」を繰り返す

    return container;

}

export { MenubarIB };
