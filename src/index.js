import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    Color,
    DirectionalLight, Euler,
    Font,
    Group, HemisphereLight,
    PerspectiveCamera, Plane, Quaternion,
    Scene,
    Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import Plotter from './lib/Plot';
import Slider from "./lib/Slider";
import Helvetiker from './lib/helvetiker.js';
import Content1 from "./lib/Content1";
import Content2 from "./lib/Content2";

let container, stats;
// let gui;
let camera, scene, renderer;
let slider;

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
function render() {
    slider.update();
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
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Stats, GUI
    // gui = new dat.GUI();
    stats = new Stats();
    // container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(
        45, window.innerWidth / window.innerHeight,
        1, 2000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 100;
    let controls = new OrbitControls(camera, renderer.domElement);
    // controls.enablePan = false;
    controls.target.copy(new Vector3(0, 0, -15));
    window.addEventListener(
        'resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    var light = new HemisphereLight(0xffffff, 0xffffff, 1);
    scene.add(light);

    // AXES RED GREEN BLUE
    let axesHelper = new AxesHelper(5);
    axesHelper.position.y = -15;
    axesHelper.position.x = 16;
    axesHelper.position.z = 0;
    // scene.add(axesHelper);

    // Slides
    slider = new Slider(scene, camera, controls);
    window.addEventListener(
        'keydown', slider.onKeyDown.bind(slider), false
    );
    document
        .getElementById('rightbutton')
        .addEventListener('click',
        () => slider.onKeyDown({keyCode: 39}), false);
    document
        .getElementById('leftbutton')
        .addEventListener('click',
        () => slider.onKeyDown({keyCode: 37}), false);

    let explainerElement = document.getElementById('explainer-text');

    plotter = new Plotter();

    // for (let i = 0; i < 9; ++i)
    // {
    //     console.log(slider.computeBounds(slider.slides, i));
    // }

    // for (let i = 0; i < 16; ++i)
    // {
    //     console.log(slider.computeBounds(
    //         [[[
    //             1, 2, [0, 1, 2], [2, 1, [3, 4, 5, 6], 3, 4, 5],
    //             4, 5
    //         ]]],
    //         i));
    // }

    let persistentHomology1D = new Content1();
    let persistentHomology2D = new Content2();
    let slides1D = persistentHomology1D
        .getSlides(plotter, camera, fontGenerator);
    let slides2D = persistentHomology2D
        .getSlides(plotter, camera, fontGenerator);

    slider.addSlides(slides1D);
    slider.clearSlides();
    slider.addSlides(slides2D);
}

let fontGenerator = null;
function loadFont()
{
    fontGenerator = new Font(Helvetiker);
    init();
    animate();
}

loadFont();
