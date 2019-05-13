import './styles.css';

import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    Color,
    DirectionalLight, DoubleSide, Font, FontLoader, Group, LineBasicMaterial,
    Mesh,
    MeshBasicMaterial, Object3D,
    PerspectiveCamera, Plane, Quaternion,
    Scene, ShapeBufferGeometry, Vector3,
    WebGLRenderer
} from "three";
// import dat from "dat.gui";
import OrbitControls from './lib/OrbitControls';
import Stats from 'stats.js/src/Stats'
import Plotter from './lib/Plot';
import Slider from "./lib/Slider";
import Helvetiker from './lib/helvetiker.js';

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
    camera.position.z = 100;
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.target.copy(new Vector3(0, 0, -15));
    window.addEventListener('resize', onWindowResize, false);

    let ambient = new AmbientLight(0x666666);
    scene.add(ambient);
    let directionalLight = new DirectionalLight(0x887766);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // AXES RED GREEN BLUE
    let axesHelper = new AxesHelper(5);
    axesHelper.position.y = -15;
    axesHelper.position.x = 16;
    axesHelper.position.z = 0;
    scene.add(axesHelper);

    // Slides
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
    let fadeIn = function(t, s, m, mx, mesh, opacityMax) {
        return plotter.fadeIn(mesh, t, s, m, mx, opacityMax);
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

    let sampling1d = 200;
    let redX = 0.5;
    let redY = 0.5;
    let redZ = 0.5;
    let extent = {x: [-15, 15], y: [0, 60 * redY], z: [-15 * redZ, 15 * redZ]};

    let swipeInBack =  function(t, s, m, mx, mesh) {
        return plotter.swipeIn('z', mesh, t, s, m, mx, {z: [0, 30]});
    };

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

    let xyHelper = plotter.makeAxisHelperXY();
    let xHelper = plotter.makeAxisHelperX();
    let yHelper = plotter.makeAxisHelperY();
    let zHelper = plotter.makeAxisHelperZ();

    let minimum1d1 = plotter.findGlobalMin1d(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    let spriteMinimum1 = plotter.makeSprite1d(minimum1d1);

    let curve1d = plotter.make1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    let largeCurve1d = plotter.makeLarge1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);

    let lookAt1 = new Quaternion();
    let upv1 = new Vector3(0, 1, 0);
    lookAt1.setFromAxisAngle(upv1.normalize(), 0);

    let lookAt2 = new Quaternion();
    let upv2 = new Vector3(0, 1, 0);
    lookAt2.setFromAxisAngle(upv2.normalize(), Math.PI/2);

    let lookAt3 = new Quaternion();
    let upv3 = new Vector3(1, 0, 0);
    lookAt3.setFromAxisAngle(upv3.normalize(), -Math.PI/8);

    lookAt2.multiply(lookAt3);

    let domainText = plotter.makeText('domain', fontGenerator, new Vector3(10, -19, 0), '#006699');
    let rangeText = plotter.makeText('range', fontGenerator, new Vector3(-20, 15, 0), '#006699');
    let dataText = plotter.makeText('data', fontGenerator, new Vector3(20, 0, -4), '#0011aa');

    slider.addSlides([
        {
            mesh: xyHelper,
            animateIn: fadeIn,
            opacityMax: 0.5
        },
        {
            camera: camera,
            target: {
                position1: new Vector3(0, 0, 0), // Unimportant
                position2: new Vector3(0, 0, 50),
                quaternion1: new Quaternion(), // Unimportant
                quaternion2: lookAt1
            },
            transition: smootherCamera,
            duration: 50,
        },
        {
            mesh: xHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut
        },
        {
            mesh: domainText
        },
        {
            mesh: yHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut
        },
        {
            mesh: rangeText
        },
        // {
        //     camera: camera,
        //     target: {
        //         position1: new Vector3(0, 0, 0), // Unimportant
        //         position2: new Vector3(0, 0, 40),
        //         quaternion1: new Quaternion(), // Unimportant
        //         quaternion2: lookAt2
        //     },
        //     transition: smoothCamera,
        //     duration: 50,
        // },
        {
            mesh: curve1d,
            animateIn: swipeInRight,
            duration: 45
        },
        {
            mesh: dataText
        },
        {
            mesh: spriteMinimum1
        },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-15, -5]}),
            duration: 90,
        },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-5, -4]}),
            duration: 20
        },
        {
            mesh: largeCurve1d,
            animateIn: swipeInUp({y: [-4, 0]}),
            duration: 50
        }
        // {
        //     mesh: largeCurve1d,
        //     animateIn: swipeInUp({y: [-15, 15]}),
        //     // animateOut: swipeOutUp({y: [-15, 15]}),
        //     duration: 90
        // }
    ]);

    let group = new Group();
    let xyHelper2 = plotter.makeAxisHelperXY();
    let curve1d2 = plotter.make1dCurve(plotter.generatorCurve1d.bind(plotter), sampling1d, extent);
    plotter.setOpacity(xyHelper2, 0.5);
    group.add(xyHelper2);
    group.add(curve1d2);

    let xzHelper = plotter.makeAxisHelperXZ();
    xzHelper.material.clippingPlanes = [
        new Plane(new Vector3(0, 0, 1), 15)
    ];

    let sampling2d = 128;
    let curve2d = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    curve2d.material.clippingPlanes = [
        new Plane(new Vector3(0, 0, 1), 15)
    ];
    let curve2d2 = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);
    curve2d2.material.clippingPlanes = [
        new Plane(new Vector3(0, -1, 0), 15)
    ];
    let curve2dt = plotter.make2dCurve(plotter.generatorCurve2d.bind(plotter), sampling2d, extent);

    slider.addSlide([
        {
            mesh: group
        },
        {
            camera: camera,
            target: {
                position1: new Vector3(0, 0, 0), // Unimportant
                position2: new Vector3(50, 20, -15),
                quaternion1: new Quaternion(), // Unimportant
                quaternion2: lookAt2
            },
            transition: smootherCamera,
            duration: 50,
        },
        {
            mesh: zHelper,
            animateIn: stretchIn,
            // animateOut: stretchOut
        },
        {
            mesh: xzHelper,
            animateIn: swipeInBack,
            opacityMax: 0.5 // TODO fix that
        },
        [{
            mesh: curve2d,
            animateIn: swipeInBack,
            duration: 50
        }],
        [{
            mesh: curve2d2,
            animateIn: swipeInUp({y: [-15, 0]}),
            duration: 90
        },
        {
            mesh: curve2d2,
            animateIn: swipeInUp({y: [0, 5]}),
            duration: 90
        },
        {
            mesh: curve2d2,
            animateIn: swipeInUp({y: [5, 15]}),
            duration: 90
        }],
        {
            mesh: curve2dt,
            animate:
                function(time, maxTime, mesh) {
                    plotter.updateCurve2dt(mesh, time, maxTime, plotter.generatorCurve2d.bind(plotter), sampling2d)
                }
        }
    ]);

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

let fontGenerator = null;
function loadFont()
{
    // try {
    //     json = JSON.parse( text );
    // } catch ( e ) {
    //     console.warn( 'THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.' );
    //     json = JSON.parse( text.substring( 65, text.length - 2 ) );
    // }

    fontGenerator = new Font(Helvetiker);
    init();
    animate();
}

loadFont();
