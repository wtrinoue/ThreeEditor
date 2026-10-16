import * as THREE from 'three';

import { UIPanel, UIRow } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { MultiCmdsCommand } from './commands/MultiCmdsCommand.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

function MenubarAdd(editor) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/add'));
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Group

	let option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/group'));
	option.onClick(function () {

		const mesh = new THREE.Group();
		mesh.name = 'Group';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);

	// Mesh

	const meshSubmenuTitle = new UIRow().setTextContent(strings.getKey('menubar/add/mesh')).addClass('option').addClass('submenu-title');
	meshSubmenuTitle.onMouseOver(function () {

		const { top, right } = meshSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle(this.dom);
		meshSubmenu.setLeft(right + 'px');
		meshSubmenu.setTop(top - parseFloat(paddingTop) + 'px');
		meshSubmenu.setStyle('max-height', [`calc( 100vh - ${top}px )`]);
		meshSubmenu.setDisplay('block');

	});
	meshSubmenuTitle.onMouseOut(function () {

		meshSubmenu.setDisplay('none');

	});
	options.add(meshSubmenuTitle);

	const meshSubmenu = new UIPanel().setPosition('fixed').addClass('options').setDisplay('none');
	meshSubmenuTitle.add(meshSubmenu);

	// Mesh / Box

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/box'));
	option.onClick(function () {

		const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Box';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Capsule

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/capsule'));
	option.onClick(function () {

		const geometry = new THREE.CapsuleGeometry(1, 1, 4, 8, 1);
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Capsule';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Circle

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/circle'));
	option.onClick(function () {

		const geometry = new THREE.CircleGeometry(1, 32, 0, Math.PI * 2);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Circle';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Cylinder

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/cylinder'));
	option.onClick(function () {

		const geometry = new THREE.CylinderGeometry(1, 1, 1, 32, 1, false, 0, Math.PI * 2);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Cylinder';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Dodecahedron

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/dodecahedron'));
	option.onClick(function () {

		const geometry = new THREE.DodecahedronGeometry(1, 0);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Dodecahedron';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Icosahedron

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/icosahedron'));
	option.onClick(function () {

		const geometry = new THREE.IcosahedronGeometry(1, 0);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Icosahedron';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Lathe

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/lathe'));
	option.onClick(function () {

		const geometry = new THREE.LatheGeometry();
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }));
		mesh.name = 'Lathe';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Octahedron

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/octahedron'));
	option.onClick(function () {

		const geometry = new THREE.OctahedronGeometry(1, 0);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Octahedron';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Plane

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/plane'));
	option.onClick(function () {

		const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
		const material = new THREE.MeshStandardMaterial();
		const mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Plane';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Ring

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/ring'));
	option.onClick(function () {

		const geometry = new THREE.RingGeometry(0.5, 1, 32, 1, 0, Math.PI * 2);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Ring';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Sphere

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/sphere'));
	option.onClick(function () {

		const geometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Sphere';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Sprite

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/sprite'));
	option.onClick(function () {

		const sprite = new THREE.Sprite(new THREE.SpriteMaterial());
		sprite.name = 'Sprite';

		editor.execute(new AddObjectCommand(editor, sprite));

	});
	meshSubmenu.add(option);

	// Mesh / Tetrahedron

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/tetrahedron'));
	option.onClick(function () {

		const geometry = new THREE.TetrahedronGeometry(1, 0);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Tetrahedron';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Text

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/text'));
	option.onClick(function () {

		const loader = new FontLoader();
		loader.load('../examples/fonts/helvetiker_bold.typeface.json', function (font) {

			const text = 'THREE.JS';

			const geometry = new TextGeometry(text, {
				text: text,
				font,
				size: 1,
				depth: 0.5,
				curveSegments: 4,

				bevelEnabled: false,
				bevelThickness: 0.1,
				bevelSize: 0.01,
				bevelOffset: 0,
				bevelSegments: 3

			});

			const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
			mesh.name = 'Text';

			editor.execute(new AddObjectCommand(editor, mesh));

		});

	});
	meshSubmenu.add(option);

	// Mesh / Torus

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/torus'));
	option.onClick(function () {

		const geometry = new THREE.TorusGeometry(1, 0.4, 12, 48, Math.PI * 2);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Torus';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / TorusKnot

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/torusknot'));
	option.onClick(function () {

		const geometry = new THREE.TorusKnotGeometry(1, 0.4, 64, 8, 2, 3);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'TorusKnot';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Mesh / Tube

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/tube'));
	option.onClick(function () {

		const path = new THREE.CatmullRomCurve3([
			new THREE.Vector3(2, 2, - 2),
			new THREE.Vector3(2, - 2, - 0.6666666666666667),
			new THREE.Vector3(- 2, - 2, 0.6666666666666667),
			new THREE.Vector3(- 2, 2, 2)
		]);

		const geometry = new THREE.TubeGeometry(path, 64, 1, 8, false);
		const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
		mesh.name = 'Tube';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	meshSubmenu.add(option);

	// Light

	const lightSubmenuTitle = new UIRow().setTextContent(strings.getKey('menubar/add/light')).addClass('option').addClass('submenu-title');
	lightSubmenuTitle.onMouseOver(function () {

		const { top, right } = lightSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle(this.dom);

		lightSubmenu.setLeft(right + 'px');
		lightSubmenu.setTop(top - parseFloat(paddingTop) + 'px');
		lightSubmenu.setStyle('max-height', [`calc( 100vh - ${top}px )`]);
		lightSubmenu.setDisplay('block');

	});
	lightSubmenuTitle.onMouseOut(function () {

		lightSubmenu.setDisplay('none');

	});
	options.add(lightSubmenuTitle);

	const lightSubmenu = new UIPanel().setPosition('fixed').addClass('options').setDisplay('none');
	lightSubmenuTitle.add(lightSubmenu);

	// Light / Ambient

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/light/ambient'));
	option.onClick(function () {

		const color = 0x222222;

		const light = new THREE.AmbientLight(color);
		light.name = 'AmbientLight';

		editor.execute(new AddObjectCommand(editor, light));

	});
	lightSubmenu.add(option);

	// Light / Directional

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/light/directional'));
	option.onClick(function () {

		const color = 0xffffff;
		const intensity = 1;

		const light = new THREE.DirectionalLight(color, intensity);
		light.name = 'DirectionalLight';
		light.target.name = 'DirectionalLight Target';

		light.position.set(5, 10, 7.5);

		editor.execute(new MultiCmdsCommand(editor, [
			new AddObjectCommand(editor, light.target),
			new AddObjectCommand(editor, light)
		]));

	});
	lightSubmenu.add(option);

	// Light / Hemisphere

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/light/hemisphere'));
	option.onClick(function () {

		const skyColor = 0x00aaff;
		const groundColor = 0xffaa00;
		const intensity = 1;

		const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		light.name = 'HemisphereLight';

		light.position.set(0, 10, 0);

		editor.execute(new AddObjectCommand(editor, light));

	});
	lightSubmenu.add(option);

	// Light / Point

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/light/point'));
	option.onClick(function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;

		const light = new THREE.PointLight(color, intensity, distance);
		light.name = 'PointLight';

		editor.execute(new AddObjectCommand(editor, light));

	});
	lightSubmenu.add(option);

	// Light / Spot

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/light/spot'));
	option.onClick(function () {

		const color = 0xffffff;
		const intensity = 1;
		const distance = 0;
		const angle = Math.PI * 0.1;
		const penumbra = 0;

		const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
		light.name = 'SpotLight';
		light.target.name = 'SpotLight Target';

		light.position.set(5, 10, 7.5);

		editor.execute(new MultiCmdsCommand(editor, [
			new AddObjectCommand(editor, light.target),
			new AddObjectCommand(editor, light)
		]));

	});
	lightSubmenu.add(option);

	// Camera

	const cameraSubmenuTitle = new UIRow().setTextContent(strings.getKey('menubar/add/camera')).addClass('option').addClass('submenu-title');
	cameraSubmenuTitle.onMouseOver(function () {

		const { top, right } = cameraSubmenuTitle.dom.getBoundingClientRect();
		const { paddingTop } = getComputedStyle(this.dom);

		cameraSubmenu.setLeft(right + 'px');
		cameraSubmenu.setTop(top - parseFloat(paddingTop) + 'px');
		cameraSubmenu.setStyle('max-height', [`calc( 100vh - ${top}px )`]);
		cameraSubmenu.setDisplay('block');

	});
	cameraSubmenuTitle.onMouseOut(function () {

		cameraSubmenu.setDisplay('none');

	});
	options.add(cameraSubmenuTitle);

	const cameraSubmenu = new UIPanel().setPosition('fixed').addClass('options').setDisplay('none');
	cameraSubmenuTitle.add(cameraSubmenu);

	// Camera / Orthographic

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/camera/orthographic'));
	option.onClick(function () {

		const aspect = editor.camera.isPerspectiveCamera
			? editor.camera.aspect
			: (editor.camera.right - editor.camera.left) / (editor.camera.top - editor.camera.bottom);
		const camera = new THREE.OrthographicCamera(- aspect, aspect);
		camera.name = 'OrthographicCamera';

		editor.execute(new AddObjectCommand(editor, camera));

	});
	cameraSubmenu.add(option);

	// Camera / Perspective

	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/camera/perspective'));
	option.onClick(function () {

		const camera = new THREE.PerspectiveCamera();
		camera.name = 'PerspectiveCamera';

		editor.execute(new AddObjectCommand(editor, camera));

	});
	cameraSubmenu.add(option);

	// POCOCHI
	option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/mesh/pocochi'));
	option.onClick(function () {

		// オレンジセーブルの犬（+Z 方向が正面）
		const pocochi = new THREE.Group();
		pocochi.name = 'POCOCHI';

		const orange = new THREE.MeshStandardMaterial({ color: 0xe8892b, roughness: 1 });
		const sable = new THREE.MeshStandardMaterial({ color: 0x9a5220, roughness: 1 });
		const cream = new THREE.MeshStandardMaterial({ color: 0xf6d9a8, roughness: 1 });
		const black = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });

		function addPart(name, geometry, material, position, scale) {

			const mesh = new THREE.Mesh(geometry, material);
			mesh.name = name;
			mesh.position.copy(position);
			if (scale !== undefined) mesh.scale.copy(scale);
			pocochi.add(mesh);
			return mesh;

		}

		// 胴体（ふわふわの丸い体）と、背中のセーブル（黒っぽい差し毛）
		addPart('Body', new THREE.SphereGeometry(0.5, 32, 16), orange, new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(1, 0.9, 1.2));
		addPart('Saddle', new THREE.SphereGeometry(0.45, 32, 16), sable, new THREE.Vector3(0, 0.82, -0.08), new THREE.Vector3(0.9, 0.6, 1.1));

		// 胸元のクリーム色の飾り毛
		addPart('Ruff', new THREE.SphereGeometry(0.42, 32, 16), cream, new THREE.Vector3(0, 0.72, 0.38), new THREE.Vector3(1.1, 1, 0.8));

		// 頭
		addPart('Head', new THREE.SphereGeometry(0.38, 32, 16), orange, new THREE.Vector3(0, 1.1, 0.6));
		addPart('Muzzle', new THREE.SphereGeometry(0.16, 24, 12), cream, new THREE.Vector3(0, 1.02, 0.92), new THREE.Vector3(1, 0.8, 1.3));
		addPart('Nose', new THREE.SphereGeometry(0.05, 16, 8), black, new THREE.Vector3(0, 1.06, 1.11));
		addPart('EyeLeft', new THREE.SphereGeometry(0.045, 16, 8), black, new THREE.Vector3(- 0.13, 1.18, 0.93));
		addPart('EyeRight', new THREE.SphereGeometry(0.045, 16, 8), black, new THREE.Vector3(0.13, 1.18, 0.93));

		// 三角の小さな耳（外側に少し傾ける）
		const earLeft = addPart('EarLeft', new THREE.ConeGeometry(0.1, 0.22, 16), sable, new THREE.Vector3(- 0.2, 1.45, 0.55));
		earLeft.rotation.z = 0.35;
		const earRight = addPart('EarRight', new THREE.ConeGeometry(0.1, 0.22, 16), sable, new THREE.Vector3(0.2, 1.45, 0.55));
		earRight.rotation.z = - 0.35;

		// 短い足
		const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
		addPart('LegFrontLeft', legGeometry, orange, new THREE.Vector3(- 0.2, 0.15, 0.3));
		addPart('LegFrontRight', legGeometry, orange, new THREE.Vector3(0.2, 0.15, 0.3));
		addPart('LegBackLeft', legGeometry, orange, new THREE.Vector3(- 0.2, 0.15, - 0.3));
		addPart('LegBackRight', legGeometry, orange, new THREE.Vector3(0.2, 0.15, - 0.3));

		// 背中に乗るふさふさの尻尾（先端はセーブル）
		addPart('Tail', new THREE.SphereGeometry(0.28, 32, 16), orange, new THREE.Vector3(0, 1.05, - 0.42), new THREE.Vector3(0.9, 0.75, 1.1));
		addPart('TailTip', new THREE.SphereGeometry(0.16, 24, 12), sable, new THREE.Vector3(0, 1.22, - 0.3));

		editor.execute(new AddObjectCommand(editor, pocochi));

	});
	meshSubmenu.add(option);
	return container;

}

export { MenubarAdd };
