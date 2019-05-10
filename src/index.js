import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    Color,
    DirectionalLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera, Quaternion,
    Scene, Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import Plotter from './lib/Plot';
import Slider from "./lib/Slider";

let container, stats;
// let gui;
let camera, scene, renderer;
let mouseHelper;
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
var surface2D;
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
    container.appendChild(stats.dom);

    // Scene, Camera, Controls, Lights
    scene = new Scene();
    scene.background = new Color(0xffffff);
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 50;
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    window.addEventListener('resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    slider = new Slider(scene, camera, controls);
    window.addEventListener('keydown', slider.onKeyDown.bind(slider), false);
    plotter = new Plotter();

    // Transitions
    let stretchIn = function(t, s, m, mx, mesh) {
        return plotter.stretchIn('y', mesh, t, s, m, mx);
    };
    let stretchOut = function(t, s, m, mx, mesh) {
        return plotter.stretchOut('y', mesh, t, s, m, mx);
        // return true; //
    };
    let fadeIn = function(t, s, m, mx, mesh) {
        return plotter.fadeIn(mesh, t, s, m, mx);
    };
    let fadeOut = function(t, s, m, mx, mesh) {
        return plotter.fadeOut(mesh, t, s, m, mx);
    };
    let linearCamera = function(t, s, m, mx, camera, target, backwards) {
        return plotter.interpolateCamera(camera, target, t, s, m, mx, plotter.linear, backwards);
    };
    let smoothCamera = function(t, s, m, mx, camera, target, backwards) {
        return plotter.interpolateCamera(camera, target, t, s, m, mx, plotter.smoothstep, backwards);
    };
    let smootherCamera = function(t, s, m, mx, camera, target, backwards) {
        return plotter.interpolateCamera(camera, target, t, s, m, mx, plotter.perlinstep, backwards);
    };


    let xyHelper = plotter.makeAxisHelperXY();
    let xzHelper = plotter.makeAxisHelperXZ();
    let xHelper = plotter.makeAxisHelperX();
    let yHelper = plotter.makeAxisHelperY();
    let zHelper = plotter.makeAxisHelperZ();
    slider.addSlide(
        [{
            mesh: xHelper,
            animateIn: stretchIn,
            animateOut: stretchOut
        }]
    );
    slider.addSlide(
        [{
            mesh: yHelper,
            animateIn: stretchIn,
            animateOut: stretchOut
        }]
    );
    slider.addSlide(
        [{
            mesh: zHelper,
            animateIn: stretchIn,
            animateOut: stretchOut
        }]
    );

    let lookAt1 = new Quaternion();
    lookAt1.setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI/8);
    let lookAt2 = new Quaternion();
    lookAt2.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI/8);

    slider.addSlide(
        [{
            mesh: xyHelper,
            animateIn: fadeIn,
        },
        // {
        //     camera: camera,
        //     target: {
        //         position1: new Vector3(0, 0, 0), // Unimportant
        //         position2: new Vector3(0, 0, 40),
        //         quaternion1: new Quaternion(), // Unimportant
        //         quaternion2: lookAt1
        //     },
        //     transition: smoothCamera,
        //     duration: 50,
        // },
        // {
        //     camera: camera,
        //     target: {
        //         position1: new Vector3(0, 0, 0), // Unimportant
        //         position2: new Vector3(0, 0, 20),
        //         quaternion1: new Quaternion(), // Unimportant
        //         quaternion2: lookAt2
        //     },
        //     transition: smootherCamera,
        //     duration: 50,
        // },
        {
            mesh: xzHelper,
        }]
    );


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

    let swipeInRight = function(t, s, m, mx, mesh) {
        return plotter.swipeIn('x', mesh, t, s, m, mx, extent);
    };

    let swipeInUp = function(extent) {
        return function(t, s, m, mx, mesh) {
            return plotter.swipeIn('y', mesh, t, s, m, mx, extent);
        };
    };
    let swipeOutUp = function(extent) {
        return function(t, s, m, mx, mesh) {
            return plotter.swipeOut('y', mesh, t, s, m, mx, extent);
        }
    };

    let curve1d = plotter.make1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    slider.addSlide(
        {
            mesh: curve1d,
            animateIn: swipeInRight,
            duration: 45
        }
    );

    let largeCurve1d = plotter.makeLarge1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    slider.addSlide(
        [{
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-15, 15]}),
            animateOut: swipeOutUp({y: [-15, 15]}),
            duration: 90
        }]
    );
    slider.addSlide(
        [{
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-15, -5]}),
            duration: 90
        }]
    );
    slider.addSlide(
        [{
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-5, 0]}),
            duration: 90
        }]
    );

    let sampling2d = 64;
    let curve2d = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    slider.addSlide(
        [{
            mesh: curve2d
        }]
    );

    let curve2dt = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    surface2D = curve2dt;
    slider.addSlide(
        {
            mesh: curve2dt,
            animate:
                function(time, maxTime, mesh) {
                    plotter.updateCurve2dt(mesh, time, maxTime, plotter.generatorCurve2d.bind(plotter), sampling2d)
                }
        }
    );

    // for (let i = 0; i < 9; ++i)
    // {
    //     console.log(slider.computeBounds(slider.slides, i));
    // }

    // for (let i = 0; i < 16; ++i)
    // {
    //     console.log(slider.computeBounds(
    //         [[[
    //             1, 2, [0, 1, 2], [2, 1, [3, 4, 5, 6], 3, 4, 5], 4, 5
    //         ]]],
    //         i));
    // }
}

init();
animate();
