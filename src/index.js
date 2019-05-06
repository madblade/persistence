import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    Color,
    DirectionalLight, Geometry,
    GridHelper, Line, LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Scene, Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import {MeshLine, MeshLineMaterial} from "./lib/MeshLine";

let container, stats;
// let gui;
let camera, scene, renderer;
let mouseHelper;

init();
animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
}

function render() {
    renderer.render(scene, camera);
}

function init() {
    // HTML
    container = document.createElement('div');
    document.body.appendChild(container);

    // Renderer
    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Stats, GUI
    // gui = new dat.GUI();
    stats = new Stats();
    container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = 0;
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    window.addEventListener('resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(-1, 1, 1).normalize();
    scene.add(directionalLight);

    // Helpers
    // var gridHelper = new PolarGridHelper(30, 10);
    let gridHelper = new GridHelper(30, 10);
    gridHelper.position.y = 0;
    gridHelper.rotation.x = Math.PI/2;
    scene.add(gridHelper);

    // AXES RED GREEN BLUE
    let axesHelper = new AxesHelper(5);
    axesHelper.position.y = -15;
    axesHelper.position.x = 16;
    axesHelper.position.z = 0;
    scene.add(axesHelper);

    // Mouse helper
    let mouseGeometry = new BoxBufferGeometry(1, 1, 1);
    let mouseMaterial = new MeshBasicMaterial({color: 0xff6e2d, opacity: 0.5});
    mouseHelper = new Mesh(mouseGeometry, mouseMaterial);
    // scene.add(mouseHelper);

    let sampling = 50;
    let f = sineCurve;
    let extent = {x: [-15, 15], y: [-15, 15], z: [-15, 15]};
    add1dCurve(f, sampling, extent, scene);

    addLarge1dCurve(f, sampling, extent, scene);
}

function add1dCurve(f, sampling, extent, scene) {
    let material = new LineBasicMaterial({
        color: 0x0000ff,
        linewidth: 1,
        linecap: 'round', //ignored by WebGLRenderer
        linejoin:  'round' //ignored by WebGLRenderer
    });

    let geometry = new Geometry();
    let xMin = extent.x[0]; let yMin = extent.y[0];
    let xMax = extent.x[1]; let yMax = extent.y[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin;
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let y = yRan * f(x) / 2;
        geometry.vertices.push(
            new Vector3(x, y, 0)
        );
    }

    let line = new Line(geometry, material);
    scene.add(line);
}

function addLarge1dCurve(f, sampling, extent, scene) {

    let lineMaterial = new MeshLineMaterial({
        color: 0xff0000,
        lineWidth: 0.5,
    });

    let geometry = new Geometry();
    let xMin = extent.x[0]; let yMin = extent.y[0];
    let xMax = extent.x[1]; let yMax = extent.y[1];
    let xRan = xMax - xMin; let yRan = yMax - yMin;
    for (let i = 0; i < sampling; ++i) {
        let x = xMin + xRan * (i / sampling);
        let y = yRan * f(x) / 2;
        geometry.vertices.push(
            new Vector3(x, y, -0.01)
        );
    }

    let line = new MeshLine();
    line.setGeometry(geometry);
    var mesh = new Mesh(line.geometry, lineMaterial); // this syntax could definitely be improved!
    scene.add(mesh);
    // let line = new Line(geometry, material);
    // scene.add(line);
}

function sineCurve(x) {
    return Math.sin(0.25 * x);
}
