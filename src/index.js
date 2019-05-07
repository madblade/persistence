import './styles.css';

import {
    AmbientLight, ArrowHelper,
    AxesHelper,
    BoxBufferGeometry,
    Color,
    DirectionalLight, DoubleSide, Geometry,
    GridHelper, Line, LineBasicMaterial,
    Mesh,
    MeshBasicMaterial, MeshLambertMaterial, MeshPhongMaterial,
    PerspectiveCamera, PlaneBufferGeometry,
    Scene, Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import {MeshLine, MeshLineMaterial} from "./lib/MeshLine";
import Plotter from './lib/Plot';

let container, stats;
// let gui;
let camera, scene, renderer;
let mouseHelper;


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    render();
    stats.end();
}

var plotter;
var surface2D;
var ttt = 0;
function render() {
    ttt += 1;
    ttt %= 100;
    if (ttt >= 0 && surface2D !== null) {
        plotter.updateCurve2dt(surface2D, ttt, 100, plotter.generatorCurve2d.bind(plotter));
    }
    renderer.render(scene, camera);
}


var slides;

function init() {
    // HTML
    container = document.createElement('div');
    document.body.appendChild(container);

    // Renderer
    renderer = new WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Stats, GUI
    // gui = new dat.GUI();
    stats = new Stats();
    container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 50;
    camera.position.x = 0;
    camera.position.y = 0;
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    window.addEventListener('resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Helpers
    // var gridHelper = new PolarGridHelper(30, 10);
    // addXYHelper(scene);
    plotter = new Plotter();
    slides = [];
    console.log(plotter);
    let xyHelper = plotter.makeAxisHelperXY();
    let xzHelper = plotter.makeAxisHelperXZ();
    let xHelper = plotter.makeAxisHelperX();
    let yHelper = plotter.makeAxisHelperY();
    let zHelper = plotter.makeAxisHelperZ();
    slides.push(xyHelper, xzHelper, xHelper, yHelper, zHelper);

    // addXZHelper(scene);
    // addXHelper(scene);
    // addYHelper(scene);
    // addZHelper(scene);

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

    let sampling1d = 200;
    let redX = 0.5;
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {x: [-15, 15], y: [0, 60 * redY], z: [-15 * redZ, 15 * redZ]};

    let curve1d = plotter.make1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    // add1dCurve(f, sampling1d, extent, scene);
    slides.push(curve1d);

    let largeCurve1d = plotter.makeLarge1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    // addLarge1dCurve(f, sampling1d, extent, scene);
    slides.push(largeCurve1d);

    let sampling2d = 128;
    let curve2d = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    // add2dCurve(g, sampling2d, extent, scene);
    surface2D = curve2d;
    slides.push(curve2d);

    for (let i = 0; i < slides.length; ++i) {
        scene.add(slides[i]);
    }
}

init();
animate();
