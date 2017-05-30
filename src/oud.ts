import * as THREE from 'three';

import './controls/FirstPersonControls.js';

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: THREE.FirstPersonControls;
let clock = new THREE.Clock();

function getHeightData(img: HTMLImageElement, scale: number) {

    if (scale == undefined) scale = 1;

    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let context = (canvas.getContext('2d') as CanvasRenderingContext2D);

    let size = img.width * img.height;
    let data = new Float32Array(size);

    context.drawImage(img, 0, 0);

    for (let i = 0; i < size; i++) {
        data[i] = 0
    }

    let imgd = context.getImageData(0, 0, img.width, img.height);
    let pix = imgd.data;

    let j = 0;
    for (let i = 0; i < pix.length; i += 4) {
        let all = pix[i] + pix[i + 1] + pix[i + 2];
        data[j++] = all / (12 * scale);
    }

    return data;
}

function init(data: any) {

    let container = (document.getElementById('container') as HTMLElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);

    scene = new THREE.Scene();

    // let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // scene.add(directionalLight);

    // let ambientLight = new THREE.AmbientLight(0x000000);
    // scene.add(ambientLight);

    // let test = new THREE.DirectionalLight(0xffffff, 1);
    // test.target.position.set(10000, 0, 10000)
    // test.castShadow = true;
    // scene.add(test);
    // scene.add(ambientLight);

    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 5, 0);
    // lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    // lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(2000, 2000, 2000);
    // lights[0].castShadow = true;
    // lights[1].position.set(100, 200, 100);
    // lights[2].position.set(- 100, - 200, - 100);

    // scene.add(lights[0]);
    // scene.add(lights[1]);
    // scene.add(lights[2]);


    // let controls = new THREE.FirstPersonControls(camera);
    controls = new THREE.FirstPersonControls(camera);
    controls.movementSpeed = 100;
    controls.lookSpeed = 0.1;

    // let data = generateHeight(worldWidth, worldDepth);

    // camera.position.y = data[worldHalfWidth + worldHalfDepth * worldWidth] * 10 + 500;
    camera.position.set(0, 100, 0);

    let geometry = new THREE.PlaneBufferGeometry(1000, 1000, 2047, 2047);
    geometry.rotateX(- Math.PI / 2);

    let vertices = (geometry.attributes as any).position.array;


    for (let i = 0, j = 0, l = vertices.length; i < l; i++ , j += 3) {
        vertices[j + 1] = data[i] * 2;
    }

    // for (let i = 0, j = 0, l = vertices.length; i < l; i++ , j += 3) {

    //     vertices[j + 1] = data[i] * 10;

    // }

    // let texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
    // texture.wrapS = THREE.ClampToEdgeWrapping;
    // texture.wrapT = THREE.ClampToEdgeWrapping;

    let texture = THREE.ImageUtils.loadTexture( 'img/amelandlk.png' );

    // let mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
    //     color: 0xffffff,
    // }));
    let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        // color: 0x2194ce,
        map: texture,
        // opacity: 1,
        // reflectivity: 0,
    }));

    // mesh.castShadow = true;
    // mesh.receiveShadow = true;

    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.innerHTML = '';

    container.appendChild(renderer.domElement);

    // stats = new Stats();
    // container.appendChild(stats.dom);

    //

    // window.addEventListener('resize', onWindowResize, false);

    renderer.render(scene, camera);
}

function animate() {

    requestAnimationFrame(animate);

    render();
    // stats.update();

}

function render() {

    controls.update(clock.getDelta());
    renderer.render(scene, camera);

}


let img = new Image();

img.onload = () => {
    let data = getHeightData(img, 1);
    init(data);
    animate();
    // console.log(getHeightData(img, 1));
};

img.src = 'img/amelandr3.png';
